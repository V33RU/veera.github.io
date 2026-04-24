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

### <span style="color: orange;">The Complete Toolchain at a Glance</span>

Before diving into each tool, here is the full list with where to get them and what you need to run them. Bookmark this section. You will come back to it.

| Tool | Repository | Language / Runtime | Install | Primary Use |
|---|---|---|---|---|
| **binwalk** | [github.com/ReFirmLabs/binwalk](https://github.com/ReFirmLabs/binwalk) | Rust | `cargo install binwalk` or prebuilt binary | Firmware extraction, magic-byte scanning |
| **firmwalker** | [github.com/craigz28/firmwalker](https://github.com/craigz28/firmwalker) | Bash | `git clone` and run the script | Extracted filesystem triage, secrets discovery |
| **checksec** | [github.com/slimm609/checksec](https://github.com/slimm609/checksec) | Go | prebuilt binary or `go install` | Binary hardening flag inspection |
| **BinSkim** | [github.com/microsoft/binskim](https://github.com/microsoft/binskim) | C# / .NET 8 | `dotnet tool install` | PE/ELF static security scanning, SARIF output |
| **cwe_checker** | [github.com/fkie-cad/cwe_checker](https://github.com/fkie-cad/cwe_checker) | Rust (needs Ghidra) | `cargo install`, requires Ghidra install | Binary weakness pattern matching |
| **EMBA** | [github.com/e-m-b-a/emba](https://github.com/e-m-b-a/emba) | Shell (heavy deps) | `./installer.sh`, needs root + Docker | End-to-end firmware analyzer |
| **FACT Core** | [github.com/fkie-cad/FACT_core](https://github.com/fkie-cad/FACT_core) | Python + Docker | `./install/pre_install.sh`, Docker required | Firmware analysis platform with diffing |
| **HardenCheck** | [github.com/V33RU/hardencheck](https://github.com/V33RU/hardencheck) | Python 3.10+ | `pip install -r requirements.txt` | Binary hardening, crypto audit, SBOM + VEX, SARIF |
| **Firmadyne** | [github.com/firmadyne/firmadyne](https://github.com/firmadyne/firmadyne) | Shell + Python + qemu | requires qemu-system, PostgreSQL | Full-system firmware emulation |
| **FAT** | [github.com/attify/firmware-analysis-toolkit](https://github.com/attify/firmware-analysis-toolkit) | Python (wraps Firmadyne) | Firmadyne prerequisites + FAT setup | Simplified firmware emulation wrapper |
| **Ghidra** | [github.com/NationalSecurityAgency/ghidra](https://github.com/NationalSecurityAgency/ghidra) | Java 21+ | JDK 21, download release ZIP | Reverse engineering, decompilation |
| **radare2** | [github.com/radareorg/radare2](https://github.com/radareorg/radare2) | C | `sys/install.sh` from source | CLI reverse engineering and patching |
| **LIEF** | [github.com/lief-project/LIEF](https://github.com/lief-project/LIEF) | C++ / Python / Rust | `pip install lief` | Executable format library for custom checks |
| **Trommel** | [github.com/CERTCC/trommel](https://github.com/CERTCC/trommel) | Python | `pip install`, archived but works | Alternate firmware filesystem scanner |
| **Binbloom** | [github.com/quarkslab/binbloom](https://github.com/quarkslab/binbloom) | C | `make` from source | Raw firmware base-address and endianness detection |

**System requirements by weight:**

- **Lightweight (runs on any Linux VM, < 1 GB RAM):** binwalk, firmwalker, checksec, LIEF, Binbloom, Trommel, radare2
- **Medium (needs 4-8 GB RAM, some dependencies):** cwe_checker (needs Ghidra), HardenCheck, BinSkim
- **Heavy (needs Docker, PostgreSQL, qemu, 16+ GB RAM recommended):** EMBA, FACT Core, Firmadyne, FAT

If you are setting up a dedicated analysis VM, allocate 32 GB RAM, 200 GB disk, Ubuntu 22.04 LTS, and install everything above. EMBA's installer alone pulls in several hundred packages. Give it room.

If you are on a laptop and want the minimum, the lightweight tier plus HardenCheck covers 70% of what you actually need on a given assessment.

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

### <span style="color: orange;">EMBA: The Firmware Analysis Tool I Donate To</span>

![EMBA sponsor](/blog/firmware-hardening/sponsor.png)

This one deserves a longer section because EMBA is genuinely the most complete open-source firmware analysis project out there and the team behind it has been shipping improvements for years. I am a donor to the project. That should tell you how much I rely on it.

EMBA is a large shell orchestration pipeline. Underneath it wraps binwalk, firmwalker, checksec, cwe_checker, radare2, a rebuilt unblob pipeline, yara, nikto, a vulnerability matcher that queries against NVD locally, a kernel config analyzer, a bootloader analyzer, and about thirty other focused tools. The job EMBA does is orchestration done right: every tool runs in the right order, every output feeds into the next stage, and everything consolidates into a single navigable HTML report at the end.

What you get out of an EMBA run is enormous:

- Full extraction tree (binwalk, unblob, custom unpackers for vendor formats)
- Filesystem triage (insecure permissions, setuid binaries, writable scripts on boot path)
- Binary hardening matrix across every ELF
- CWE-mapped static findings against vendor daemons
- Automatic SBOM generation in CycloneDX and SPDX
- Local CVE database matching against the SBOM components
- Kernel version and kconfig hardening analysis
- Credential discovery (weak shadow entries, plaintext tokens, SSH keys)
- Certificate analysis with expiration tracking
- Cryptography material inventory (which binaries use which libraries)
- Web application surface mapping when a webroot is present
- Optional emulation stage that boots the firmware in qemu for dynamic tests

The SBOM plus CVE matching alone would be worth the runtime. Doing this by hand is a full day per firmware. EMBA does it in the time it takes to drink a coffee and answer a few emails.

**My actual usage pattern:**

1. Kick off EMBA with the default profile against the firmware
2. Go work on something else for 40 to 90 minutes depending on firmware size and host CPU
3. Come back, open the HTML report, jump first to the SBOM, then to the CVE matches, then to the cross-binary hardening matrix
4. Pull every high/critical CVE into my findings spreadsheet
5. Pull every "no canary, no PIE, no RELRO" binary into the "review manually in Ghidra" queue
6. Check the credential discovery section for anything firmwalker might have missed
7. Cross-check against my manual run to make sure nothing slipped (occasionally EMBA finds something I missed, which is exactly why I run it)

Command for a first full run:

```bash
sudo ./emba -f firmware.bin -l ./logs/fw_assessment -p ./scan-profiles/default-scan.emba
```

Use `-p default-scan-no-notify.emba` if you want the complete run without the summary notifications. Use `-p quick-scan.emba` if you need a fast triage instead of full coverage. The profile files in the repo are worth reading because they tell you exactly which modules are gated on which options.

**Hardware warning: read this before you kick it off**

Here is something the EMBA documentation underplays. **EMBA is not laptop-friendly for real runs.** It will run on a laptop, but the experience is rough.

Why it is rough on a laptop:

- It pins multiple CPU cores at 100% for the entire run, often 40 to 90 minutes
- It generates tens of gigabytes of intermediate extraction data on disk
- It pulls large datasets (NVD mirror, kernel config fragments, YARA rule sets)
- The CVE matching stage is memory-heavy if the SBOM has hundreds of components
- The emulation stage pushes RAM into the 8+ GB range per emulated firmware

A laptop will thermal throttle within 10 minutes, the fan will sound like a hair dryer, the battery drops faster than it charges, and the whole run stretches to twice the duration because the CPU is being throttled to save the silicon. I have killed more than one laptop battery cycle to EMBA runs.

**Recommended setup:** a desktop or workstation with at least 8 physical cores, 32 GB RAM, an SSD with 200 GB free, and a decent cooler. If that sounds like overkill for "just running a script," remember EMBA is running 30 tools in parallel across every binary in a filesystem that might contain 500 ELFs. It is using every core you give it. Give it the cores.

**If you must use a laptop:** plug into wall power, make sure the thermals are cleaned out, run on a hard surface (not in bed or on a couch cushion), and start with the quick-scan profile first to gauge heat behavior before committing to a default-scan run. An external USB 3 SSD helps with the intermediate data.

If you assess firmware often, the one-time cost of a dedicated analysis PC pays for itself in the first month. Your laptop will thank you. Your eardrums will thank you.

**Why this tool deserves support:**

I want to be explicit about this. EMBA is maintained by a small team doing a disproportionate amount of work for the community. The project is GPL-3.0, actively developed, and they respond to issues. When a new firmware format or vendor quirk appears, they ship extractors. When a new CVE dataset changes format, they adapt the matcher. When the CRA requirements firmed up, they added the SBOM outputs in formats auditors ask for.

This is the kind of open-source project where donating or sponsoring is directly buying more maintenance time for a thing you use. I donate. If you use EMBA in your professional work and your company benefits from it, donating a fraction of one billable hour a month is reasonable math. The GitHub Sponsors page on the EMBA repo accepts contributions. The project has a GitHub Sponsors button and also accepts other forms of support listed in the repo.

**Compliance angle:** EMBA is the CRA workhorse. If you have to demonstrate "vulnerability handling" in the CRA sense, an EMBA report is the best single artifact you can produce. It shows that you looked, that you generated an SBOM, that you cross-referenced against known vulnerabilities, and that you have a list of issues mapped to packages and versions. That is literally what the CRA Annex asks for. Paired with HardenCheck's VEX output for per-CVE triage, you have the full "what did we ship, what are the knowns, how did we handle them" story that an auditor wants to see.

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

### <span style="color: orange;">HardenCheck: The Tool I Built Because Nothing Did Exactly What I Wanted</span>

Full disclosure: this is mine. [github.com/V33RU/hardencheck](https://github.com/V33RU/hardencheck). I am not going to pretend I am neutral about it.

The origin story is the honest one. I kept running the same sequence on every firmware assessment: binwalk, firmwalker, checksec, a handful of custom LIEF scripts, EMBA, manual CVE checks, manual SBOM export, manual VEX triage for the auditor. Same sequence, every time, with glue scripts held together by duct tape. At some point I wrote it down as a proper tool instead of rewriting the glue scripts every quarter.

HardenCheck is a 17-step Python pipeline. What it does that I could not get elsewhere in one tool:

**Deeper binary hardening than checksec.** Standard checksec reports NX, PIE, Canary, RELRO, Fortify. HardenCheck adds Control Flow Integrity detection, Stack Clash protection, and per-architecture ASLR entropy calculation. The ASLR entropy one matters because "PIE is on" is not the same as "ASLR is effective." On a 32-bit MIPS binary with PIE enabled, you might still only get 8 bits of entropy because of how the MIPS address space is laid out, which is brute-forceable. On x86_64 you get 28+ bits which is not. Reporting "PIE: yes" hides this. Reporting effective entropy in bits per architecture does not.

**Crypto binary audit with risk labeling.** Instead of just "this binary links libcrypto," the audit labels what the binary actually does with crypto (key storage, TLS termination, firmware signature verification, random number generation) and flags high-risk patterns. A binary doing firmware signing without secure element integration is labeled differently from a binary doing TLS termination. The labels drive different follow-up actions.

**Post-quantum crypto readiness evaluation.** This is the future-looking one. PQC is coming. The CRA is going to grow teeth on this over the next few years. Nothing else I use tells me "this firmware uses RSA-2048 for update signing and has no path to a PQC signature algorithm." HardenCheck does.

**VEX output alongside SBOM.** SBOM tells you what you shipped. VEX (Vulnerability Exploitability eXchange) tells you which of the CVE hits in your SBOM actually matter. Per-CVE triage states (`in_triage`, `not_affected`, `affected`, `fixed`) with justification text. This is the artifact an auditor wants next to the SBOM. EMBA does not emit VEX. grype and trivy do not generate it. Having SBOM and VEX come out of the same run, auto-populated with the evidence, saves hours of manual triage per firmware.

**SARIF output for GitHub code scanning.** Plug it into CI and failures show up as annotated findings on pull requests. This is the path to making firmware hardening checks part of the regular development loop instead of a quarterly ritual.

**Grade-based CI exit codes.** `--fail-on-grade B` will fail the build if the firmware scores worse than a B. You can tune the threshold per product. This is how you make "secure by default" an enforceable policy instead of an aspiration. The grade (A through F on a 100-point scale) is opinionated and that is intentional: the scoring forces a decision.

**YARA rule support for custom IOCs.** If your threat model includes specific bad patterns (internal backdoor signatures, known-bad strings from a past incident, vendor-specific malware), you can write YARA rules and HardenCheck runs them as part of the pipeline.

Typical usage:

```bash
# First pass
python3 hardencheck.py ./firmware -o report.html

# Full audit with every artifact
python3 hardencheck.py ./firmware --sbom all --json --sarif -t 8

# CI gate
python3 hardencheck.py ./firmware --fail-on-grade B -q
```

Does this replace EMBA? No. EMBA's coverage across kernel config, script analysis, and emulation is broader. HardenCheck's coverage on binary hardening, crypto audit, and SBOM/VEX output is deeper. I run both. They overlap on about 30% of checks and the rest is complementary.

Does this replace checksec? For my purposes, yes. Checksec is still a great fast tool when you want a 30-second table. HardenCheck subsumes it for real assessments because the per-architecture entropy analysis and CFI/Stack-Clash additions matter for findings I actually write into reports.

**Compliance angle:** This is where I designed for the CRA from day one. The SBOM+VEX pair, the SARIF output, the grade-based gating, the secure-boot verification checks, the post-quantum readiness evaluation. These are the artifacts I could not produce cleanly with the other tools stitched together. The format outputs (CycloneDX 1.5, SPDX 2.3, SARIF 2.1.0) are all standards-track so the auditor toolchain can ingest them directly.

If you are going to look at one tool from this blog and evaluate whether it fits your workflow, this is the one I am biased about but also the one that specifically addresses the CRA-aligned artifacts the other tools make you generate manually.

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
3. HardenCheck for binary hardening, crypto audit, SBOM, and grade
4. cwe_checker across the interesting ELFs (vendor daemons, custom httpd, anything not from a distro)
5. EMBA with default profile for the cross-check and kernel-config depth
6. Now open Ghidra for whatever looked bad in steps 2 through 5

For ongoing firmware security program:

1. Everything above, automated in CI
2. HardenCheck with `--fail-on-grade B --sarif` in the release pipeline
3. FACT Core as the fleet-tracking platform
4. Custom LIEF-based checks for policies HardenCheck does not cover
5. Incident response and disclosure process (not a tool)

For CRA compliance evidence:

1. HardenCheck SBOM + VEX per firmware
2. HardenCheck or EMBA report for the full analysis
3. cwe_checker CWE mapping per firmware
4. FACT diff per firmware release
5. SARIF output wired to the issue tracker for vulnerability handling paper trail
6. Documented process for handling any issues found above

The tools are not the hard part. The hard part is running them consistently, triaging the output, and fixing the actual problems they surface. The tools are cheap. The engineering time to act on what they find is expensive. Budget accordingly.

---

*Every firmware is the same, every firmware is different. The tools are a lens. What matters is whether you look.*
