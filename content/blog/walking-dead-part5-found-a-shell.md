---
title: "The Walking Dead of IoT - Part 5: Found a Shell. Posted on LinkedIn. Fixed Nothing."
date: "2026-04-04"
description: "The IoT security discourse has a LinkedIn problem. Bugs get found, screenshots get posted, claps get collected, and the device runs for another three years unpatched. This is the conclusion."
tags: ["IoT security", "vulnerability research", "responsible disclosure", "IOTSRG", "conclusion", "CVE"]
---

*The bug was found in 2014. It was CVE'd in 2016. It was written up in 2019. It was "rediscovered" on LinkedIn in 2021, 2023, and again last month. The device is still deployed. The shell still opens. Nobody fixed anything.*

---

### <span style="color: orange;">Found a Shell. Posted on LinkedIn. Fixed Nothing.</span>

Let's talk about the thing nobody wants to say out loud in the IoT security community.

A significant portion of what gets called "vulnerability research" today is this workflow:

1. Run a Shodan query
2. Fire a public PoC from ExploitDB
3. Get a root shell
4. Take a screenshot
5. Write "Critical vulnerability found in [VENDOR] devices - THREAD"
6. Post on LinkedIn
7. Collect 847 reactions
8. Repeat next month with a different camera brand

This is not research. This is **vulnerability tourism**. And the IoT landscape - with its 15 billion unpatched, never-to-be-patched devices - is the perfect destination. The bugs are always there. The shells always open. The screenshots always look impressive. And nothing ever gets fixed.

---

### <span style="color: orange;">CVE-2014-8361: Still Trending After 12 Years</span>

CVE-2014-8361. Realtek UPnP SDK. SOAP injection. Root shell. Affects an estimated 200 million devices.

Filed in 2014. Documented. Patched by Realtek for devices that could receive patches. A significant portion of deployed devices never received the patch because the OEM's update cycle had ended, the vendor was bankrupt, or the device simply had no update mechanism.

In 2026, this CVE is still in active exploitation. The Mirai.B sample I analyzed for this series - compiled in 2020 - includes this exploit. It works. It will work in 2028. It will work until the hardware physically dies.

Every year, someone "discovers" that a 2015 IP camera from a brand that no longer exists is vulnerable to CVE-2014-8361. They write it up. They post it. They get the engagement. The CVE has a 2014 entry. The device is still in a warehouse, a hospital corridor, or a school hallway, doing exactly what it was doing before the post.

**The LinkedIn post changed nothing. The CVE changed nothing. The device does not know about either.**

---

### <span style="color: orange;">The Responsible Disclosure Ceremony</span>

Here is how responsible disclosure actually plays out on EOL devices in 2026:

1. Researcher finds vulnerability in Device X (running 2017 firmware)
2. Researcher emails vendor security contact
3. Email bounces. Vendor went out of business in 2021.
4. Researcher files CVE with MITRE
5. CVE assigned. Advisory published.
6. Researcher publishes writeup. Gets cited in three other blog posts.
7. Device continues to run 2017 firmware.
8. Six months later: same vulnerability, different researcher, different blog post.

The ceremony was observed. The paperwork was filed. The disclosure was "responsible." The device is still compromised if you point a scanner at it.

Responsible disclosure works when the vendor is alive, has engineers, can produce a patch, and has a mechanism to deliver it to users. For the majority of the legacy IoT fleet - which is what this entire series has been about - **none of those conditions hold**. Responsible disclosure in that context is a bookkeeping exercise that mostly helps the next threat actor who Googles the CVE number.

I am not saying stop filing CVEs. I am saying: be honest about what it accomplishes when the vendor is a ghost and the device has no update path.

---

### <span style="color: orange;">The Clout Economy vs. The Fix Economy</span>

IoT security has a fundamental misalignment between what generates attention and what generates improvement.

**What generates attention:**
- Root shells on cameras (especially if it's a known brand)
- "I got into [GOVERNMENT AGENCY] cameras via default password" posts
- "Breaking: X million devices vulnerable" headlines
- Conference talks with live demos

**What generates improvement:**
- Vendor liability law (no clout, no demo, no conference slot)
- Mandatory SBOM requirements (extremely boring, extremely important)
- Security update period mandates tied to market access
- ISP-level C2 blocking
- Import certification frameworks (Part 4 of this series)

The people doing the LinkedIn posts are mostly good-faith researchers who have figured out - correctly - that the attention economy rewards the screenshot, not the policy brief. The attention economy is not wrong about what it rewards. The problem is that the attention does not translate into fixes.

A camera with CVE-2021-36260 (Hikvision, CVSS 9.8, unauthenticated RCE, tens of millions of devices) does not become more secure because 40,000 people read a LinkedIn post about it. It becomes more secure when Hikvision ships a patch AND there is a mechanism to deliver it AND users are notified AND non-compliant devices face some consequence. The post is step zero. Steps one through five are where the work is.

---

### <span style="color: orange;">What This Series Was Actually About</span>

Four parts. Let me compress them.

**Part 1 - The Hardware Graveyard:** The devices cannot be patched because the silicon vendors never released public datasheets, the BSP licenses expired, and the OEM moved on to the next product. The graveyard is not a failure of patching culture. It is a **structural outcome of how the supply chain was designed**.

**Part 2 - The Patent Wall and Policy Vacuum:** Open-source alternatives that could extend device lifetimes are blocked by patent encumbrances on proprietary drivers. Regulators are writing frameworks for devices that shipped 10 years ago. The policy vacuum is not laziness - it is that nobody with the power to change things bears the cost of the status quo.

**Part 3 - The Price of Cheap:** A $15 camera has a $0 security budget. The race-to-bottom economics are a textbook market-for-lemons failure. The fix - liability, standards, SBOM - does not emerge from the market. It has to be imposed on it.

**Part 4 - India's CCTV Ban:** A government finally used a real enforcement mechanism - import certification denial. It is forward-looking only, does not reach deployed devices, and conflates chip origin with security. But it established the enforcement model. That precedent is worth more than the specific ban.

The throughline: **the IoT security crisis is not a technical problem**. The technical problems are well understood. The exploits are documented. The fix architectures exist. The crisis is an **economic and governance problem**. The incentives are misaligned. The costs are externalized. The regulations arrive a decade late.

A better antivirus does not fix this. A SIEM rule does not fix this. A LinkedIn post definitely does not fix this.

---

### <span style="color: orange;">What Would Actually Fix It (The Short, Honest List)</span>

I have said versions of this across four posts. Here is the final, compressed version.

**Liability.** If a camera OEM faces civil liability when their device is enlisted into a botnet that takes down a hospital, BOM calculations immediately include a security line item. This is the single highest-leverage change. Nothing else on this list matters as much.

**Minimum standards with teeth.** The EU CRA (December 2027) and India's STQC framework are steps. They need mandatory SBOMs, mandatory update periods, and enforcement mechanisms that reach non-compliant products already in market - not just new imports.

**SBOM mandates.** You cannot audit what you cannot see. Every device sold should ship with a machine-readable software bill of materials. Without this, you cannot know if your deployed device contains a component with a 9.8 CVSS vulnerability without doing a full firmware extraction yourself.

**ISP-level C2 blocking.** Cheap, effective, scalable. Documented Mirai C2 infrastructure can be BGP-blocked. CERT-In has the authority to mandate this for Indian ISPs. This is not being done at the scale it should be.

**Stop buying the $15 camera for critical deployments.** This is the unsexy one. If you are a procurement manager putting cameras in a hospital or a water treatment facility, the $15 camera is not a cost saving. It is a deferred incident cost. The $45 camera with a documented update policy and a CVE response program is cheaper when you count the breach.

---

### <span style="color: orange;">The Honest Ending</span>

The devices are still walking. The 283KB binary that started this research - XOR-encrypted credentials, 62 exploit functions, 12 DDoS methods, watchdog subversion, credential table with `root:xc3511` and `supervisor:supervisor` - is not sophisticated. It does not need to be. The attack surface is so large, so static, and so permanently unmaintained that sophistication is unnecessary.

The threat actor renting botnet time on compromised cameras to DDoS a gaming server does not care about responsible disclosure. They care that port 23 is open and the password is `xc3511`.

The researcher posting the root shell screenshot on LinkedIn does not fix this. The CVE filing does not fix this. The conference talk does not fix this.

The fix is boring. It is liability law. It is mandatory update periods. It is import certification. It is SBOM. It is procurement policy. It is the kind of work that does not get 847 LinkedIn reactions.

But it is the only work that actually matters.

The walking dead of IoT will keep walking until the economics of deploying insecure devices change. That requires law, regulation, and liability - not better screenshots.

I will keep doing the research. I will keep filing the CVEs. I will keep writing the posts.

And I will keep being honest about what that does and does not accomplish.

---

*This is Part 5 (Final) of the Walking Dead of IoT series.*
*[Part 1: The Hardware Graveyard](/blog/walking-dead-part1-hardware-graveyard) | [Part 2: The Patent Wall](/blog/walking-dead-part2-patent-wall-policy-vacuum) | [Part 3: The Price of Cheap](/blog/walking-dead-part3-price-of-cheap) | [Part 4: India's CCTV Ban](/blog/walking-dead-part4-india-cctv-ban)*

*CVE Program: MITRE | CERT-In: VU#IOTSRG-2025-011 | null Security Conference 2026*
