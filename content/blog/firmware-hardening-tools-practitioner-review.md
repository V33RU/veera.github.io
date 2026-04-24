---
title: "Firmware Hardening Tools: What I Actually Reach For, What Auditors Actually Accept, and What Wastes Your Week"
date: "2026-04-26"
description: "After years of cracking open SOHO routers, industrial gateways, and IoT junk for a living, here is the honest field guide to the open-source firmware toolchain. The hacker view, the compliance view, and where they disagree."
tags: ["firmware", "hardening", "CRA", "tools", "embedded security", "SBOM", "reverse engineering", "opinion"]
---

*I have been in rooms where an auditor asks to see "your firmware security testing evidence" and I have been in rooms where a hacker friend asks "what do you run first when you crack one of these open." Same tools come up. Different things matter. This blog is me trying to stop repeating myself in Slack DMs.*

---

### <span style="color: orange;">Why I Am Writing This</span>

A friend sent me a tool-comparison dashboard last week. Fourteen tools, sortable columns, CRA relevance tags, GitHub star counts. It was clean. It was also missing the part where you tell someone what to actually do with the tools.

Star counts are not useful. "Category: binary hardening checker" is not useful. What is useful is knowing that checksec will finish in 30 seconds and tell you the vendor shipped a daemon with no NX bit set, and that finding that takes you directly to the question of whether the binary has a stack overflow, and whether you should spend the next four hours in Ghidra or the next ten minutes just running firmwalker for hardcoded credentials that make the overflow irrelevant.

So this is not a tool comparison. This is what I actually do when a firmware image lands on my laptop, in the order I do it, with the opinions I have formed after enough assessments to have scars.

---

### <span style="color: orange;">The Uncomfortable Truth About Firmware Security</span>

Before tools: vendors ship terrible firmware. The industry has not improved much in a decade. What has improved is that we are better at finding the same classes of bugs faster.

Here is what keeps being true across assessments:

There will be a hardcoded root password somewhere. Usually in `/etc/shadow`. Sometimes in a config file. Sometimes embedded as a literal string inside the main vendor binary because someone wanted to "protect" it by not putting it in `/etc/`. That last case is my favorite because `strings binary | grep -iE 'passw|admin|root'` finds it in 10 seconds.

The web interface will have command injection. Some vendor component, usually a CGI, will call `system()` with a user-controllable parameter. The interface might have login, but the login itself will have a default credential or a backdoor URL.

There will be a UART. It will drop to root if you hit enter at the right time. If not, it will leak enough of the boot log that you can pick apart the bootloader and find a way in.

The SDK was forked from OpenWRT in 2014 and never updated. So every CVE against busybox, dnsmasq, dropbear, and the Linux kernel between then and now applies.

These are not individual bugs. They are patterns. The tools in this post exist because these patterns exist. The reason the stack looks the way it does is because the bugs look the way they do.

---

### <span style="color: orange;">How I Actually Open a Firmware</span>

The first hour on any firmware looks the same. I am not running a pipeline. I am running specific tools in a specific order because each answer informs the next.

The flow is roughly:

Extract. Triage filesystem for obvious wins. Get the hardening profile of every binary. Skim the CVE exposure of extracted packages. Identify the two or three vendor binaries worth reverse engineering. Then go deep.

It takes discipline to not rush to Ghidra. Ghidra is the shiny tool, reverse engineering feels productive even when you are not finding anything. Resist. The boring tools find more bugs per hour. Ghidra is for confirming what the boring tools already told you is suspicious.

Let me walk through actually doing it.

---

### <span style="color: orange;">binwalk: The Tool Nobody Replaces</span>

`binwalk -Me firmware.bin` and wait.

binwalk is a magic-byte scanner that knows squashfs, cramfs, yaffs2, jffs2, ubi, lzma, xz, gzip, cpio, ar, and a couple hundred other signatures. It extracts them recursively until it cannot extract anything else. The new Rust rewrite is substantially faster than the old Python version and the output layout is the same.

When binwalk works, you end up with `_firmware.bin.extracted/squashfs-root/` containing a full filesystem. That is the ideal case.

When binwalk does not work, it is usually one of three problems.

**Problem one: vendor-modified squashfs.** Broadcom and Qualcomm both ship custom squashfs with different magic bytes, different compression, or an extra header. `sasquatch` (a fork of `unsquashfs` with vendor patches) handles most of these. If sasquatch also fails, you are looking at entropy analysis to find the real compressed data and then manually feeding it to the right decompressor.

**Problem two: signed firmware envelope.** The firmware starts with a vendor signature block and a manifest, and the actual squashfs is 4KB or 128KB deep. `binwalk` will find the inner squashfs once you strip the header. `dd` off the first N bytes, try again.

**Problem three: encrypted firmware.** This is the real wall. If the vendor encrypts updates with a key burned into the chip, you cannot extract without getting that key. Now you are in hardware territory (UART, JTAG, fault injection, side channel) to recover the key. That is a different blog series.

What I always check after extraction:

```bash
ls -la _firmware.bin.extracted/squashfs-root/etc/
file _firmware.bin.extracted/squashfs-root/bin/busybox
find _firmware.bin.extracted/squashfs-root/ -name "*.pem" -o -name "*.key" -o -name "*.crt"
```

If busybox is statically linked and stripped, the vendor knows what they are doing. If it is a dynamic binary with symbols, they shipped a debug build by accident.

Either way, I move on to firmwalker before doing anything else.

---

### <span style="color: orange;">Firmwalker: The Script That Finds Half the Bugs in Half a Minute</span>

Firmwalker is a bash script. Look at its source. It is 200 lines of `grep` and `find` with a curated wordlist.

Here is why it works. The things vendors hide badly are predictable:

- `/etc/shadow` or `/etc/passwd` with weak hashes
- `.pem`, `.key`, `.crt` files that include private keys
- Config files with `password=`, `api_key=`, `secret=`
- SSH authorized_keys files with vendor support keys
- `/var/www/` with debug pages left in production
- Startup scripts that start telnetd or ssh as root with no auth

Firmwalker's wordlist covers all of these. The report format is plain text, easy to grep, and fast to scan visually.

A real finding from last year: a smart lock firmware had `wpa_supplicant.conf` in `/etc/` with the manufacturer's internal WiFi credentials for factory testing. The script left in production. Firmwalker found it in 12 seconds. No reverse engineering required. The "bug" was a config file.

This is the class of finding that makes compliance people uncomfortable because there is nothing to fuzz, nothing to exploit. It is just the vendor shipping a config file with the wrong contents. Which is also exactly what the CRA is trying to make stop happening.

---

### <span style="color: orange;">checksec: The Hardening Table Is Your Evidence</span>

checksec walks over an ELF binary, reads the program headers, reads the `.dynamic` section, and reports on which compiler-level security features were enabled. It runs in microseconds per binary.

Here is the quiet truth about the hardening flags:

**NX (no-execute) = on.** Every modern compiler sets this. If it is off, something is very wrong. In practice I see it off maybe once every twenty firmwares, always on a vendor binary compiled with a crufty toolchain that predates the default.

**PIE = often off.** Vendors compile with `-no-pie` for performance reasons, especially on MIPS where the GOT cost is real. This is the most common hardening gap in production firmware.

**Stack canary = inconsistent.** Present on distro-compiled stuff (busybox, openssl), absent on vendor-compiled daemons. The vendor daemons are the interesting ones, so the canaries being missing on exactly the binaries you want to exploit is a pattern.

**RELRO = usually partial.** Full RELRO is rare in firmware. Partial RELRO is common. Lack of full RELRO means GOT overwrites are back on the table if you can write anywhere in the right range.

**FORTIFY_SOURCE = rare.** Most firmware is compiled without it. Distros enable it. Vendors ignore it. It is the single hardening flag whose absence most reliably predicts memory corruption bugs in a binary.

The practical use is to run checksec over every ELF in the filesystem, dump the results, and sort by number of missing protections. The top of the sorted list is where you look first.

```bash
find . -type f -exec file {} + | awk -F: '/ELF/{print $1}' | \
  xargs -I{} checksec --file={} --output=csv 2>/dev/null > checksec.csv
```

Now open `checksec.csv`, sort by the combination of `PIE=No`, `Canary=No`, `RELRO=Partial`, and that is your target list.

**Compliance angle:** If you can produce this table for your own firmware and everything is green, you have strong evidence of secure-by-default build practices. The CRA does not require specific flags, but the "essential requirements" around "minimize the attack surface" and "limit the impact of incidents" are exactly what these flags do. An auditor who knows what they are looking at will accept a checksec matrix as partial evidence. An auditor who does not know will still take it because it looks official and comprehensive.

---

### <span style="color: orange;">BinSkim and the Windows Binary Question</span>

Most firmware assessments are Linux-flavored. ELF, squashfs, busybox, dropbear. If your firmware has no Windows binaries, BinSkim is not for you.

Where BinSkim becomes the right tool is industrial gateways that run Windows IoT or devices that ship a Windows-based management agent alongside the Linux firmware. I see this in healthcare and in some building-automation gear. Then you have PE files and BinSkim is the tool.

BinSkim's killer feature is SARIF output. SARIF is a JSON format that every mainstream CI pipeline can ingest. You get PR checks that fail if a shipped binary lost its Control Flow Guard flag. That is a real value beyond what checksec offers.

For ELF-only assessments, stick with checksec. For mixed or Windows-heavy, use BinSkim.

---

### <span style="color: orange;">cwe_checker: Where the Real Static Analysis Happens</span>

This one is underused. It should not be.

cwe_checker is built on top of Ghidra's P-Code intermediate representation. Ghidra lifts a binary (ARM, MIPS, x86, anything Ghidra supports) into P-Code, and cwe_checker runs rules against that IR to find patterns that map to CWE classes. The list of CWEs it covers is practical:

- **CWE-119 / CWE-125 / CWE-787**: Bounds-check flaws, read and write
- **CWE-134**: Format string flaws (`printf(buf)` where buf came from outside)
- **CWE-190 / CWE-191**: Integer over/underflow, especially before allocation
- **CWE-243**: chroot without chdir (classic jail escape)
- **CWE-332**: Weak entropy source in PRNG seeding
- **CWE-416**: Use after free
- **CWE-467**: Using sizeof on a pointer type
- **CWE-476**: NULL pointer dereference
- **CWE-560**: umask argument bugs
- **CWE-676**: Use of dangerous function (strcpy, strcat, gets, sprintf)
- **CWE-782**: Exposed IOCTL

This is the tool that catches the `strcpy` in the vendor httpd that you would have found manually after four hours in Ghidra. cwe_checker points you at function name and address.

Running it on every binary in an extracted firmware is cheap:

```bash
find . -type f -exec file {} + | awk -F: '/ELF/{print $1}' | \
  xargs -I{} sh -c 'cwe_checker "{}" --json > "{}.cwe.json" 2>/dev/null'
```

Then `jq` over the results to pull out the CWE-676 hits:

```bash
find . -name '*.cwe.json' -exec jq -r \
  'map(select(.name=="CWE676")) | .[] | "\(.name): \(.description)"' {} \;
```

A note on false positives. cwe_checker is static. It does not know if a `strcpy` call is reachable from user input. So you get a list of "places that use strcpy" and most of them are safe because the source buffer is bounded by the program logic. Your job is to triage. But the list is finite and sorted, and the handful that are exploitable are real bugs you would have missed manually.

**Compliance angle:** The CRA's Annex I talks about "protection from unauthorized access" and "security by design." CWE mapping is the direct industry-standard way to demonstrate you looked for known weakness classes. If you produce a report that says "we ran cwe_checker against all shipped binaries and here are the findings and here are the mitigations," that is an audit artifact. It is a strong one. I have never had an auditor reject a CWE-mapped report.

---

### <span style="color: orange;">EMBA: The Full Pipeline I Use Even When I Do Not Want To</span>

EMBA is a large shell script. It wraps binwalk, firmwalker, checksec, and about thirty other things, runs them in sequence, does CVE matching against extracted packages, and produces an HTML report.

I have a love-hate relationship with EMBA. The hate is that it is slow, it prints too much, the HTML reports are huge, and the false-positive rate on some checks (especially the script-analysis module) is high enough to be annoying.

The love is that it produces an SBOM automatically and cross-references it against NVD. Doing this by hand is a day of work. EMBA does it in 40 minutes per firmware. Once you have the SBOM and the CVE hits, you have the bones of a real report.

My actual usage pattern:

1. Run EMBA with default profile against the firmware
2. Go do something else for 40 minutes
3. Come back, open the HTML report, jump to three sections: the SBOM, the CVE matches, and the cross-binary hardening matrix
4. Ignore everything else in the report
5. Cross-check the EMBA findings against my manual binwalk+firmwalker+checksec run (usually they match, occasionally EMBA finds something I missed)

The firmware-specific CVE matching is where EMBA earns its disk space. It knows that a busybox 1.21 in the rootfs means CVE-2022-28391 and a handful of others probably apply. It knows the openssl 1.0.2 shipped in the firmware has the heartbleed lineage. It produces a prioritized list.

**Compliance angle:** This is the CRA workhorse. If you have to demonstrate "vulnerability handling" in the CRA sense, an EMBA report is the best single artifact you can produce. It shows that you looked, that you generated an SBOM, that you cross-referenced against known vulnerabilities, and that you have a list of issues mapped to packages and versions. That is literally what the CRA Annex asks for.

---

### <span style="color: orange;">FACT Core: When You Have More Than One Firmware</span>

FACT Core (from Fraunhofer FKIE) is in the same job space as EMBA, different design. FACT is a containerized server with a web UI and a database. You upload firmwares, it analyzes them in parallel, and you can compare them.

The killer feature is diffing. When a vendor pushes firmware v2.0.1 and you have v2.0.0, FACT will tell you which binaries changed, which packages got updated, which CVE hits appeared or disappeared, and which config files are different. The entire security diff between two firmwares on a single page.

This matters when you are tracking a fleet over time. If you have three hundred IoT products in your organization and each one pushes firmware updates monthly, FACT is how you keep up. EMBA is a one-shot tool. FACT is a platform.

For a one-off assessment: EMBA.
For ongoing fleet tracking: FACT.
For both: set up FACT, export the analysis to EMBA reports for one-off auditor requests.

**Compliance angle:** FACT's diffing is directly useful for the CRA's "security update" process requirements. You can demonstrate that when v2.0.1 shipped, you ran a diff, identified the new attack surface, and signed off on the release. That is a paper trail an auditor will accept without further questions.

---

### <span style="color: orange;">Firmadyne and FAT: The Emulation Gamble</span>

Firmware emulation is where everyone gets optimistic and then disappointed. Both Firmadyne and Firmware Analysis Toolkit (Attify's wrapper around Firmadyne) try to:

1. Detect the architecture of the extracted rootfs
2. Boot a qemu-system instance with a compatible kernel
3. Mount the rootfs into that instance
4. Bring up the network services so you can poke at them as if they were running on real hardware

When it works, it is magic. You get `192.168.0.1:80` serving the vendor's web interface inside qemu on your laptop. You can fuzz it, exploit it, instrument it, without ever having the device.

When it fails, it fails hard. The firmware tries to read `/proc/vendor/flash_config` which does not exist in qemu's stock kernel, the init script bails out, and you have a half-booted system that is not reachable. You can patch around it (stub the sysfs node, provide fake data) but every vendor has different quirks and the debugging is tedious.

My success rate is roughly 50%. On consumer SOHO routers (D-Link, TP-Link, Netgear) it tends to work because Firmadyne was developed against exactly that hardware class. On industrial gear, medical devices, and anything with a custom SoC, it often fails. On devices with heavy dependency on the specific hardware (BLE-connected locks, Bluetooth mesh nodes) it basically never works because the Bluetooth subsystem is never in the emulated environment.

When it works, the speedup is enormous. When it fails, the sunk cost trap is real. Budget maybe 90 minutes of trying before giving up and doing it statically.

**Compliance angle:** Emulation is not a compliance artifact on its own. You use it to find bugs, and then the bugs you find and the fixes you apply are the compliance artifacts. An auditor does not care whether you found the bug via qemu or via hardware.

---

### <span style="color: orange;">Ghidra vs radare2: This Is Not a Real Debate</span>

Use both. Stop agonizing.

Ghidra: 67k stars, NSA, Java, full project database, decompiler that produces readable C, headless mode for batch analysis. Use Ghidra when you are going to live in a binary for a day or more.

radare2: 23k stars, community, C, CLI-first, fast to open and close. Use r2 when you want to check three things and leave.

My split in practice:

- **First look at a binary:** radare2. `r2 -AA binary`, then `afl` to list functions, `s main`, `pdf` to print main. Takes 30 seconds.
- **Sustained analysis:** Ghidra. Import, auto-analyze, rename functions as I understand them, save the project.
- **Batch queries across many binaries:** Ghidra headless with a Python script.
- **Dynamic debugging:** radare2 attached to gdbstub on the running device or in qemu.
- **Patching:** radare2. `wx` to write hex, save.

Ghidra's decompiler is the reason I use it. radare2's is not as readable. For vendor MIPS binaries that have been through a crufty GCC 4.x toolchain, Ghidra's decompiler produces C that looks like something a human could have written. r2's output often requires more translation in your head.

**Compliance angle:** RE tools do not produce compliance artifacts directly. They help you find bugs. The bugs are the artifacts.

---

### <span style="color: orange;">LIEF: The Library I Tell Everyone to Learn</span>

LIEF is not a tool. It is a parser library for executable formats. You use it to write your own checks.

This is the tool that separates people who use the stack from people who extend it. Every company has one or two specific things they want to check in every shipped binary. A specific symbol present. A specific section absent. A specific compiler version in the build-id. Nothing off-the-shelf covers this because it is custom to your threat model.

LIEF gives you the object model and you write the check in 20 lines of Python. Example: making sure every binary in your firmware was built with GCC 13 or later, because your company audited GCC 13's stack protector implementation and approved only that version.

```python
import lief

def get_compiler(path):
    b = lief.parse(path)
    if not b:
        return None
    # GNU build-id note section often contains compiler version
    for note in getattr(b, "notes", []):
        if hasattr(note, "description_string"):
            ds = note.description_string
            if "GCC" in ds:
                return ds
    # Fallback: .comment section
    section = b.get_section(".comment")
    if section:
        data = bytes(section.content)
        return data.decode("utf-8", errors="ignore")
    return None

# Walk the firmware rootfs, flag binaries not built with approved toolchain
import os, sys
for root, dirs, files in os.walk(sys.argv[1]):
    for f in files:
        path = os.path.join(root, f)
        try:
            c = get_compiler(path)
            if c and "GCC) 13" not in c and "GCC) 14" not in c:
                print(f"{path}: {c.strip()}")
        except Exception:
            pass
```

That is a check that is directly CRA-relevant (toolchain provenance) and that no general-purpose tool does for you. LIEF lets you write it in 20 minutes.

**Compliance angle:** LIEF is the enabler for your bespoke policies. If your security standard says something specific that no tool enforces, LIEF is how you make that policy into a check that runs in CI. The compliance value comes from whatever policy you implement, not from LIEF itself.

---

### <span style="color: orange;">Binbloom and the Raw-Firmware Problem</span>

Binbloom is for a specific scenario. You have a flash dump. There is no filesystem. It is a raw microcontroller firmware, or a bootloader blob, or the contents of an SPI NOR chip you read with a flashrom pomona clip.

To load this in Ghidra, you need to know the architecture, the endianness, and the base load address. Binbloom does the last two for you by analyzing the binary structure, looking for function prologues at plausible addresses, and scoring against expected instruction patterns.

The architecture you still have to guess. For ARM Cortex-M, the first word at offset 0 is the initial stack pointer (RAM region) and the second word is the reset vector (flash region). Looking at those two values usually tells you where flash is and where RAM is. For other architectures, it is more involved.

Binbloom is a 10-minute tool that saves you two hours of manual memory layout guessing. It is old (2024 last push) but works fine on the binaries it targets.

---

### <span style="color: orange;">Trommel: The Archived Tool That Still Runs</span>

Trommel is firmwalker with different heuristics. CERT/CC wrote it, archived it in 2020, and it still works. The wordlist overlaps with firmwalker but is not identical, so running both occasionally catches things that running one would miss.

I keep it installed for no reason except that once every ten assessments it finds something firmwalker missed. Low cost to have, occasional benefit.

Do not rely on it as primary. Use firmwalker first, run Trommel as a belt-and-suspenders check.

---

### <span style="color: orange;">The Hacker View: What I Care About</span>

When I get a firmware for offensive assessment, the order of operations is ruthless:

1. Can I get root without touching crypto? (firmwalker for creds, checksec for obvious unhardened binaries, cwe_checker for obvious memory-corruption)
2. Can I get RCE in the web interface? (grep CGIs for `system(`, `popen(`, `eval(`)
3. Is there a backdoor URL, debug endpoint, or undocumented service? (port scan the emulated firmware, strings against httpd for URL patterns)
4. Can I extract the firmware update key and ship a malicious update? (look for public-key pinning absent, HTTPS cert validation disabled, update script that runs `/tmp/update.sh` without signature check)
5. Is there privilege separation, or does everything run as root? (`find -perm -4000` and `ps` during emulation)

Points 1 through 5 together cover maybe 80% of findings on consumer and small-business firmware. Tools that directly support those five questions:

- firmwalker: points 1, 4
- checksec + cwe_checker: points 1, 2
- grep / strings / binwalk: points 2, 3, 4
- Firmadyne/FAT for port scanning emulated device: point 3
- ls -la / find / ps during emulation: point 5

Notice what is missing from this list: Ghidra and radare2. I reach for RE tools after the above fails, not before. This is the biggest mistake I see newer researchers make. They open Ghidra first, spend hours reverse engineering the httpd, and miss the `admin:admin` hardcoded in the login page.

---

### <span style="color: orange;">The Compliance View: What Auditors Actually Ask</span>

Completely different set of priorities. The auditor is not trying to hack your device. They are trying to verify that you have a process. The questions are:

1. Do you have an SBOM for every shipped firmware? (EMBA generates this)
2. Can you map every component in the SBOM to a known-vulnerability database? (EMBA does this too)
3. Have you documented your process for handling discovered vulnerabilities? (process document, not a tool)
4. Can you show that shipped binaries were compiled with secure defaults? (checksec table)
5. Have you performed static analysis for common weakness classes? (cwe_checker CWE report)
6. Have you documented your firmware update mechanism and its security properties? (architecture doc)
7. Can you demonstrate continuous testing across firmware versions? (FACT Core diffs)
8. Have you handled any reported vulnerabilities, and how long did disclosure-to-patch take? (issue tracker + release notes)

The tools that produce audit artifacts in this list are EMBA, checksec, cwe_checker, and FACT Core. Everything else is a tool you use during investigation that may or may not contribute to the artifacts.

The CRA specifically calls out:

- "free from known exploitable vulnerabilities" (Annex I.1a): SBOM + CVE mapping = EMBA
- "delivered with a secure by default configuration" (Annex I.1b): hardening checks = checksec
- "process and resolve vulnerabilities without delay" (Annex I.2): issue tracker + disclosure policy, not a tool
- "appropriate mechanisms to securely distribute updates" (Annex I.2): code review + crypto audit, not a tool
- "information about vulnerabilities identified and exploited" (Annex II): SBOM + report, = EMBA report

The word "tool" does not appear in the CRA. The word "documentation" appears constantly. You are producing documentation. The tools help you produce it, but the compliance value is the document, not the tool run.

---

### <span style="color: orange;">Where Hacker and Compliance Views Disagree</span>

Most of the time they agree. The hacker wants to find bugs. The auditor wants evidence bugs were looked for. Finding bugs produces evidence of looking. Same tools, same outputs, different framing of the same activity.

They disagree on one thing: thoroughness versus depth.

A hacker stops when they have a working exploit. One cred, one RCE, one authentication bypass, and they are happy. The remaining 99 bugs are not their problem.

An auditor wants coverage. They want the full hardening matrix across every binary, not just the one that was exploited. They want the SBOM to be complete, not just the packages that had CVEs.

This is why EMBA and FACT Core exist. They are thorough where a hacker would be surgical. The hacker view uses them as first-pass filters. The compliance view uses them as the primary artifact.

Same tool, different use. The tool does not know the difference.

---

### <span style="color: orange;">What I Wish Existed and Does Not</span>

A few gaps in the open-source firmware toolchain that bug me:

**A real, working emulator for BLE-connected firmware.** Firmadyne does not handle Bluetooth because the Bluetooth stack assumes real hardware. Emulating an ESP32 firmware that talks BLE basically requires instrumenting the radio calls or running the device. There is no good open-source answer.

**A cross-firmware taint-tracking tool.** I want to say "this parameter in this HTTP request, trace it through the vendor httpd, tell me if it reaches a `system()` call." angr can do it for single binaries with enormous effort. Nothing does it automatically across a firmware. Commercial tools exist (Check Point's firmware analysis, GrammaTech's products) but no open-source equivalent.

**A standard SBOM format that is actually respected.** SPDX and CycloneDX both exist and both have their camps. Auditors want to see one, developers generate the other, nobody agrees. EMBA can emit both. The inconsistency is a community problem, not a tool problem.

**A unified vulnerability feed for embedded packages.** NVD is good for upstream projects but misses vendor-specific ports. CVE-2023-XXXXX might be fixed in upstream busybox 1.36 but not in the vendor's forked 1.21.1 that is actually shipping. Nobody tracks this well.

These are gaps I hit every assessment. Nobody has solved them yet. If you are looking for a project to start, any of these would have immediate users.

---

### <span style="color: orange;">The Short Version</span>

If you only read one section, read this one.

For a first-time firmware assessment:

1. `binwalk -Me firmware.bin`
2. `firmwalker.sh _firmware.bin.extracted/squashfs-root/`
3. Run checksec across all ELFs
4. Run cwe_checker across the interesting ELFs (vendor daemons, custom httpd, anything not from a distro)
5. Run EMBA with default profile for the SBOM and CVE matching
6. Now open Ghidra for whatever looked bad in steps 2 through 5

For ongoing firmware security program:

1. Everything above, automated in CI
2. FACT Core as the fleet-tracking platform
3. Custom LIEF-based checks for your policies
4. Incident response and disclosure process (not a tool)

For CRA compliance evidence:

1. EMBA report per firmware
2. checksec matrix per firmware
3. cwe_checker CWE mapping per firmware
4. FACT diff per firmware release
5. Documented process for handling any issues found above

The tools are not the hard part. The hard part is running them consistently, triaging the output, and fixing the actual problems they surface. The tools are cheap. The engineering time to act on what they find is expensive. Budget accordingly.

---

*Every firmware is the same, every firmware is different. The tools are a lens. What matters is whether you look.*
