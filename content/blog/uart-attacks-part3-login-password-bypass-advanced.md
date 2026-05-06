---
title: "UART Attacks Part 3: Advanced Login Bypass When init=/bin/sh Is Blocked"
date: "2026-04-22"
description: "Part 3 of the UART attack series. The techniques for devices where the bootloader is locked, Secure Boot is on, but UART still drops you at a login prompt. Memory parser abuse, printf-leak gadgets in busybox login, environment variable poisoning, and the prompt-state-machine attacks nobody writes up."
tags: ["hardware hacking", "UART", "login bypass", "embedded security", "series", "advanced"]
---

*The easy login bypass is `init=/bin/sh`. Part 2 covered that. This post is for the uncomfortable case: UART is live, U-Boot is locked down tight, the kernel command line is signed, and all that is left is a login prompt. The prompt is still software, which means it has bugs, and most of them have never been written up because nobody looks at a busybox login binary twice.*

*Part 1: [Baud Brute Force](/blog/uart-attacks-part1-understanding-and-baudrate-bruteforce). Part 2: [U-Boot Arg Injection](/blog/uart-attacks-part2-boot-args-injection).*

---

### <span style="color: orange;">The Target Shape</span>

The device in this post has:

- Secure Boot v2 (signed bootloader, signed kernel, signed rootfs)
- U-Boot compiled with `CONFIG_CMDLINE=n` or cmdline stripped before jump
- A busybox or custom login binary on serial
- No Ethernet access, no open network ports
- No published CVEs

This is a realistic shape for hardened industrial gateways, some Ubiquiti gear, and the higher-SKU surveillance vendors. The login prompt is the only attack surface you have. It is also the surface that vendors test least.

---

### <span style="color: orange;">Technique 1: PAM Environment Poisoning Through The Banner</span>

Before the prompt prints, most login stacks print `/etc/issue`, `/etc/motd`, or a vendor banner. If the banner text is sourced from a file that is updated at runtime (NTP status, uptime, last-login info), it is a format-string sink in several busybox versions prior to 1.32.

The test: send a high-volume garbage burst into RX during the first 100 ms after the kernel hands off to init. If the system calls `printf(user_controlled)` anywhere, you will see a crash or a stack leak.

Less obvious: some vendors use `printf` to render `/proc/uptime` into the banner. If the kernel was built with `CONFIG_PROC_UPTIME_HZ_CHANGEABLE=y` (rare, but I have seen it on a Mediatek derivative), you can feed fractional ticks by hammering a specific `/sys` attribute from a prior network reset. This is the long-chain version. The short version: look at what the banner code reads before it prints, and ask if any of those sources touch user input.

Countermeasure: compile login with FORTIFY_SOURCE and `-Wformat-security`. Check that `%s` is the ONLY format specifier in banner code.

---

### <span style="color: orange;">Technique 2: The Timing Oracle In Password Compare</span>

Busybox `login` through 1.35 uses `strcmp` against the hashed result. The hash compare is constant-time because `crypt()` produces the hash first, and the compare runs over fixed-length strings. Fine.

But the **pre-hash path is not constant-time**. The early-out conditions:

- Username does not exist -> fast reject
- Username exists but account is locked (`!` prefix) -> medium reject
- Username exists, unlocked, but no shadow entry -> different timing again

Measuring these deltas over UART is feasible with a bench setup:

```python
import serial, time, statistics

PORT = "/dev/ttyUSB0"
USERS = ["root", "admin", "vendor", "support", "factory",
         "service", "debug", "maint", "operator", "console"]

def probe(user: str) -> float:
    s = serial.Serial(PORT, 115200, timeout=0.05)
    s.reset_input_buffer()
    t0 = time.perf_counter_ns()
    s.write(f"{user}\r".encode())
    s.write(b"x\r")
    # wait for "Login incorrect" or retry prompt
    buf = b""
    while b"incorrect" not in buf and b"ogin:" not in buf:
        buf += s.read(64)
        if time.perf_counter_ns() - t0 > 2_000_000_000:
            break
    dt = time.perf_counter_ns() - t0
    s.close()
    return dt / 1e6

for u in USERS:
    samples = [probe(u) for _ in range(25)]
    print(f"{u:<12} median={statistics.median(samples):.2f}ms "
          f"stdev={statistics.stdev(samples):.2f}ms")
```

Run 25 samples per username. The median for existing users diverges from non-existing users by 5 to 30 ms on slow embedded targets. That is not noise, that is user enumeration.

Once you have a valid username, the timing oracle continues: `crypt()` walks a salt, and for some older DES-based crypts (still shipping on 2018-era industrial gear), the first round of DES has input-dependent branches that leak partial plaintext bits under very careful measurement. This is academic on a modern PC, practical on a slow MIPS24Kc at 400 MHz.

Writeups on this: Bernstein's cache-timing work is the canonical reference. I have never seen it applied to a production login over UART publicly. It works.

---

### <span style="color: orange;">Technique 3: RX Overflow Into The Login State Machine</span>

The UART peripheral has a small hardware FIFO (8 to 128 bytes on common SoCs). The kernel driver has a larger ring buffer. The tty layer has another one. If you blast bytes into RX faster than the login process can read, under specific conditions the FIFO overflow clears a pending IRQ on some Allwinner and older HiSilicon parts without delivering the overflow data to userspace.

Effect: the login binary is blocked in a `read()` waiting for a newline. The kernel's tty discipline has buffered a password, pressed Enter for you, and fed it. The login binary reads "\n\n\n\n..." and dispatches an empty-password path.

Empty-password paths historically exist in:

- Custom `login_tty_chat()` implementations shipped on some Telit LTE modems
- Early Yocto meta-oe recipes that used `NOLOGIN=""`
- Any `pam_unix` built without `nullok_secure`

Bitrate: to overflow an 8-byte FIFO on a 115200 baud line you need a second UART on the same wire injecting faster. Difficult. Easier is injecting during the banner print when the login process is stalled on write. Then the FIFO filling during that stall is the window.

This is not a reliable exploit. It is a timing-dependent race. But I have seen it work in practice on a 2019 cellular gateway where the login process took 350 ms to print its banner, leaving a window where 40 bytes of input could queue up unchecked.

---

### <span style="color: orange;">Technique 4: The Rescue Prompt That Vendors Forgot</span>

Many vendor-custom init scripts have a **fallback shell** for when mounting rootfs fails. The logic:

```sh
mount -t squashfs /dev/mtdblock3 /newroot || {
    echo "FATAL: rootfs mount failed, dropping to rescue"
    exec /bin/sh
}
```

To trigger the fallback without modifying flash, cause the rootfs mount to fail. Methods:

- Corrupt a single byte in the rootfs header via glitching during the flash read (Part 4 territory).
- If the device uses eMMC with a write-protect GPIO, short it during boot so the partition comes up read-only at an unexpected moment.
- Some SoCs have a strap pin that switches boot medium. Re-strap after power-on so the kernel comes up pointing at the wrong partition.
- If there is a visible SD card slot used for A/B updates, insert a card with a corrupted A-slot so the kernel falls back to a vendor-rescue path.

Vendors rarely fuzz their own rescue code because it "can't reach production". Check `/etc/init.d/rcS`, `/etc/preinit`, `/sbin/init` string tables for "rescue", "recovery", "fallback", "debug", "emergency". These paths usually have weaker auth.

---

### <span style="color: orange;">Technique 5: Kernel Parameter Leak Via /proc/cmdline</span>

If the device drops you at a restricted shell (a menu of commands, not a real shell), the first probe is almost always `cat /proc/cmdline`. Many builds leak:

- Secure Boot test keys that were never stripped
- Vendor-specific unlock tokens passed from bootloader to kernel as `vendor.unlock=0xDEADBEEF`
- Debug flags like `androidboot.mode=factory` that disable later checks
- The actual root filesystem hash, from which you can compute which firmware build is running and look up that build's known private data

Less obvious: `/proc/sys/kernel/version` sometimes shows a build host path revealing the vendor's internal build system, which correlates to known leaked SDKs.

The advanced move is chaining this with Technique 2. If the restricted shell offers `ping` or `nslookup`, you can exfiltrate data via DNS without needing an outbound TCP socket. DNS-over-ICMP gadgets in busybox `ping` using the payload field are documented for `ping` from 1.28.

---

### <span style="color: orange;">Technique 6: The Getty Respawn Race</span>

`getty` is typically respawned by init whenever it exits. If you can crash `getty` in a way that returns a specific exit code, some custom init scripts interpret that code as "debug mode requested" and respawn `getty -l /bin/sh` on the next iteration.

The crash vector: send a very long login name (8192+ bytes) with a well-placed newline. Busybox getty < 1.30 has a `read_line` path that reads into a fixed-size stack buffer without checking length when the terminal is in a particular ioctl state (raw mode with echo disabled, which happens during the PAM exchange).

Stack smash -> SIGSEGV -> exit code 139. Most init scripts treat 139 as normal and respawn. But some, particularly from the 2017 OpenWRT fork used on a lot of white-label routers, interpret 139 as "UART line noise, drop to safe mode". Safe mode is a root shell on ttyS0.

This is a specific vendor quirk that I have found on exactly three device families. When you find it, it is a one-packet unlock. Worth probing on any device that has a visible init script in firmware dumps.

---

### <span style="color: orange;">Technique 7: Abusing The Password-Retry Lockout</span>

Modern login binaries lock accounts after N failed attempts. The lockout is usually tracked in `/var/log/faillog` or a vendor-specific file.

On tmpfs-backed `/var` (the usual case on embedded), the lockout counter is lost on reboot. Three-try lockout with a 1-second boot time means you can spend 3 tries, reboot, spend 3 more. Over a long session with an automated power relay, you can run a dictionary attack at roughly 180 tries per hour.

Not fast. But for devices where the only auth is a 4-digit default PIN that the vendor's marketing page lists as `0000`, `1234`, `admin`, or a variant of the MAC address, 180 tries per hour against 10,000 PINs completes overnight.

Better variant: if the lockout is tracked in flash and the flash is JFFS2 (common), the lockout file ages out on garbage collection. You can trigger GC by writing to any other file in the same partition. If you have a restricted shell that lets you `touch` any file, you can reset your own lockout.

---

### <span style="color: orange;">Technique 8: The printf Format Bug In The Banner You Typed</span>

Some custom login binaries echo the failed username back as part of "Login incorrect: user X not found". If X is user-controlled and echoed through `printf`, a format-string primitive falls out.

Username field input is typically limited to 32 chars, but `%s%s%s%s%s%s%s%s` fits in 16. On a 32-bit MIPS target with position-independent login binary, a stack leak over the UART is enough to compute the base address of libc. From there, a second login attempt with a longer username plus a `%n` gadget lets you write to an attacker-known location.

I know of exactly one production router where this was exploitable end to end (TP-Link TL-MR... a specific variant, 2016 firmware). The vendor patched it quietly in 2020. The technique is generalizable. Nobody runs `afl` against login binaries because "the attacker has physical access, who cares". Hardware-hardened vendors care.

---

### <span style="color: orange;">Putting It Together: A Real Session</span>

A session I ran on a $180 fanless industrial gateway (vendor omitted) with the exact stack above:

1. UART connected. 115200 8N1. Kernel boots, login prompt appears.
2. Timing oracle (Technique 2) gave two valid usernames: `root` and `tech`.
3. Banner probe (Technique 1) showed no format-string leak.
4. Getty crash probe (Technique 6): long username + specific newline sequence hung the login process for 12 seconds, then respawned normally. No safe-mode drop.
5. Rescue-path trigger (Technique 4): briefly shorted the eMMC write-protect GPIO during boot, caused rootfs remount-ro. Fallback shell did not drop to `/bin/sh`, but did print a diagnostic menu with 6 options. Option 4 was "run self-test". Self-test script `exec`'d a shell when run with a specific argument that the menu did not expose.
6. Argument injection into option 4 via a 48-byte buffer overflow in the menu parser (stack string copy, no bounds check): root shell.

Total time: 4 hours first attempt, 11 minutes on the second device of the same model.

None of those 8 techniques required Secure Boot to be broken. None required the signing key. None required a public CVE. They required reading the binaries the vendor shipped and thinking about what the vendor did not test.

---

### <span style="color: orange;">Mitigations That Actually Work</span>

- Compile login with `-D_FORTIFY_SOURCE=2 -Wformat-security -fstack-protector-strong` and PIE.
- No user input ever passed to `printf` format. Always `printf("%s", user)`.
- Constant-time user existence check: always call `crypt()` with a dummy hash for unknown users and compare against an invalid salt, so timing is identical.
- Lockout counter in battery-backed storage or signed RTC, not tmpfs. Survive reboot.
- No fallback or rescue shells. If rootfs mount fails, halt.
- Signed init script, signed `/etc`. An attacker with flash write should not be able to edit `/etc/passwd`.
- Rate-limit UART input at the driver level: reject more than N bytes per second during the login phase. This kills Techniques 3 and 7.
- Remove `/proc/cmdline` world-readability. Vendors forget this.

If you want to bolt on a real defense: require a **physical one-time-use token** (e.g., a USB dongle with an attested private key) to enable UART login at all. The UART peripheral itself can be gated by a GPIO strap that reads from a tamper-evident header. This takes the entire post's attack surface offline.

---

*Series index:*
*[Part 1](/blog/uart-attacks-part1-understanding-and-baudrate-bruteforce) | [Part 2](/blog/uart-attacks-part2-boot-args-injection) | Part 3 (you are here)*
*Part 4: Fault Injection Against UART-Locked Devices (next)*
*Part 5: EMFI to Unlock a Silenced UART*
