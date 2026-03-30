---
title: "The Walking Dead of IoT - Part 2: The Patent Wall and the Policy Vacuum"
date: "2026-03-30"
description: "The security community found the vulnerabilities. Lawyers prevented the fixes. Regulators arrived a decade late with frameworks that exempt the 15 billion devices already deployed."
tags: ["IoT security", "policy", "regulation", "DMCA", "ETSI", "CRA", "vulnerability disclosure", "IOTSRG"]
---

*The security community found the vulnerabilities. Lawyers prevented the fixes. Regulators arrived a decade late with frameworks that exempt the 15 billion devices already deployed.*

---

### <span style="color: orange;">The Research You Are Not Allowed to Do</span>

Before we talk about policy, understand the legal landscape that security researchers operate in.

#### DMCA Section 1201: The Anti-Circumvention Clause

The Digital Millennium Copyright Act (1998) made it a federal crime to circumvent "technological protection measures" - even for legitimate security research.

What this means in practice:

- Extracting firmware from a device via JTAG - potential DMCA violation
- Decrypting an encrypted firmware image - potential DMCA violation
- Reverse engineering a proprietary protocol to find vulnerabilities - potential DMCA violation

There is a security research exemption. It was added in 2015 and renewed in 2021. The exemption requires that:

1. The research be done "in good faith"
2. The researcher take steps to avoid harm
3. The research be in a "controlled environment"

What the exemption **does not** protect:

- Publishing a tool that others could use to perform the same research
- Demonstrating the vulnerability publicly before the vendor patches it
- Reverse engineering firmware that you do not own a copy of (i.e., extracted from a device you bought)

The result: a vulnerability researcher who reverse engineers a camera firmware, discovers a critical RCE, and publishes a PoC can face civil liability from the camera manufacturer. The manufacturer faces no liability for shipping the vulnerable firmware.

This is the legal architecture that governs IoT security research in the United States.

#### CFAA: The Other Legal Weapon Against Researchers

The Computer Fraud and Abuse Act (1986) criminalizes "unauthorized access" to computer systems. For IoT security researchers, this creates a parallel threat: scanning a device you own on your own network is defensible, but any interaction with a device you do not own - even to verify a vulnerability exists - can be prosecuted under CFAA.

The Supreme Court narrowed CFAA scope in Van Buren v. United States (2021), ruling that exceeding authorized access requires accessing information in areas of a computer one is not authorized to access - not merely using authorized access for unauthorized purposes. This helped, but the chilling effect on IoT research persists. Most researchers cannot afford to litigate the boundary.

The combined effect of DMCA Section 1201 and CFAA: the people most capable of finding IoT vulnerabilities face legal risk for doing so. The people shipping the vulnerabilities face none.

#### The Patent Minefield Around Security Fixes

Now consider what it takes to actually patch a vulnerable IoT device:

**Scenario:** HiSilicon Hi3518EV200 camera has a stack overflow in its RTSP server. You want to patch it.

To patch it, you need:
1. The BSP (Board Support Package) - proprietary, NDA'd, owned by HiSilicon
2. The toolchain - typically a proprietary GCC fork, license restrictions apply
3. The bootloader source - may be U-Boot (GPL), but vendor modifications may not be released
4. The kernel source - Linux (GPL), but HiSilicon is known for GPL violation (out-of-tree patches not released)

**GPL Violation as a Business Model**

HiSilicon's camera SoCs ship with modified Linux kernels. The GPL requires that source code be made available. HiSilicon and downstream OEMs routinely violate this. The Software Freedom Conservancy has documented dozens of cases.

Enforcement requires:
1. Filing a lawsuit in the jurisdiction where the violation occurs
2. Obtaining source code through legal compulsion
3. Applying the patch
4. Reflashing hundreds of millions of devices

Nobody does this. The legal cost exceeds the security benefit at any single company level. The collective security benefit is massive, but there is no mechanism to coordinate it.

**Result:** The GPL - the license specifically designed to ensure that users can modify and improve their software - is functionally unenforceable against hardware-embedded firmware at scale.

---

### <span style="color: orange;">The Standards Graveyard</span>

#### The Regulation Timeline vs. The Deployment Timeline

| Year | Security Event | Policy Response |
|---|---|---|
| 2008 | 1st major Telnet brute-force botnet | None |
| 2016 | Mirai takes down Dyn DNS, knocks Twitter/Netflix offline | FTC strongly worded letter |
| 2017 | Reaper botnet - 2M devices | NIST begins IoT guidance drafts |
| 2018 | VPNFilter - 500K routers, SCADA-targeting | FBI operation, no regulation |
| 2020 | Mozi botnet - 1.5M devices | EU starts ETSI EN 303 645 |
| 2021 | IoT Cybersecurity Improvement Act (US) - government devices only | 14 billion consumer devices: no change |
| 2022 | ETSI EN 303 645 becomes baseline for UK PSTI Act; EU CRA proposed (Sep 2022) | UK only, new devices only |
| 2023 | EU CRA in trilogues; Mirai variants continue expanding | Political agreement reached Dec 2023 |
| 2024 | EU CRA formally adopted (Regulation 2024/2847); FCC IoT Labeling voluntary | Application begins phased rollout |
| 2025 | Mirai.B Sora variant - 62 CVEs, SCADA-targeting | This research |
| 2026 | 15 billion legacy devices: no applicable regulation | Full CRA application: December 2027 |

**The critical gap:** Every regulation applies to **new devices at the point of sale**. Not one applies to devices already in the field.

The devices that Mirai.B targets - GPON routers (CVE-2018-10561), Huawei HG532 (CVE-2017-17215), Netgear (CVE-2016-6277) - were all deployed before these regulations existed. They will remain deployed for another 5-10 years. Every new regulation has a ~10 year lag before it affects the actual threat surface.

---

### <span style="color: orange;">ETSI EN 303 645: The Good Standard That Exempts Everything Dangerous</span>

ETSI EN 303 645 is genuinely one of the better IoT security standards. Its 13 baseline provisions include:

1. No universal default passwords
2. Implement a means to manage reports of vulnerabilities
3. Keep software updated
4. Securely store sensitive security parameters
5. Communicate securely
6. Minimize exposed attack surfaces
7. Ensure software integrity
8. Ensure that personal data is protected
9. Make systems resilient to outages
10. Examine system telemetry data
11. Make it easy for users to delete personal data
12. Make installation and maintenance of devices easy
13. Validate input data

**Read provision 3: "Keep software updated."** The standard requires a mechanism for updates. It does not specify:

- How long updates must be provided
- What happens when the vendor goes bankrupt
- What happens when the SoC vendor drops BSP support
- Whether OEM sub-contractors are bound
- Whether white-label rebrands of the same firmware are separately required to comply

A camera running HiSilicon firmware, white-labeled by 40 different OEMs, sold under 40 different brand names, through 40 different distributors, can have 40 separate compliance assessments - all passing - while sharing the same vulnerable firmware image.

#### The UK PSTI Act: Legislation With No Teeth for the Real Problem

The UK Product Security and Telecommunications Infrastructure Act (2022) is the first legally binding IoT security legislation in a major economy. It mandates compliance with ETSI EN 303 645 for consumer IoT.

What it covers: Consumer devices sold in the UK after April 2024.

What it does not cover:
- Industrial IoT
- Medical devices (separate regime)
- Devices sold before April 2024
- B2B devices
- Devices manufactured for export to the UK but categorized as "non-consumer"

The HiSilicon camera sitting in a UK home, bought in 2019 from Amazon, is not covered. The identical camera bought in 2025 from the same Amazon listing - if it passed through a compliant supply chain - is covered. They run the same firmware.

---

### <span style="color: orange;">The Vendor Liability Vacuum</span>

#### Software Is Not a Product

In most jurisdictions, **software is not classified as a product** under product liability law. It is a service or a license. This distinction has profound security implications.

If a car manufacturer ships a car with faulty brakes that kills someone, they face product liability. Decades of tort law apply. Insurance prices the risk. Engineers are incentivized to not ship faulty brakes.

If a firmware vendor ships firmware with a remotely exploitable root vulnerability that allows attackers to access your home network, they face:
- Civil liability: effectively zero (EULA disclaimers, "as is" licenses, no privity with downstream users)
- Regulatory liability: only if a data protection authority can establish a GDPR violation
- Criminal liability: zero

The EU Cyber Resilience Act, when it reaches full application in December 2027, will change this for products with "digital elements." Manufacturers will face mandatory security updates, vulnerability disclosure obligations, and CE marking requirements for cybersecurity.

**But the CRA has a carve-out for open source software, free software "provided outside the course of a commercial activity," and several industrial categories.** The carve-out is intended to protect independent open source developers, but it creates an ambiguity: firmware built from open source components, assembled by a commercial entity, distributed through a supply chain with 14 layers of abstraction - where exactly does the commercial activity boundary lie?

#### Vulnerability Disclosure: The 90-Day Standard vs. IoT Reality

The security research community norm - established by Google Project Zero - is 90-day coordinated disclosure. Disclose to vendor, wait 90 days, publish regardless.

For enterprise software vendors like Microsoft or Google, 90 days is often sufficient for a patch.

For IoT:

1. **Day 0:** Researcher discovers CVE in HiSilicon camera firmware
2. **Day 1:** Researcher attempts to identify vendor. Camera is white-labeled. WHOIS on the domain leads to a Shenzhen shell company.
3. **Day 14:** Actual OEM identified through FCC ID lookup. OEM contacted.
4. **Day 30:** OEM responds: "We do not manufacture this firmware. Contact the module supplier."
5. **Day 45:** Module supplier contacted. They source from HiSilicon BSP.
6. **Day 60:** HiSilicon contacted. No security@hisilicon.com. No HackerOne program. No response.
7. **Day 90:** Disclosure deadline reached. Patch: nonexistent.
8. **Day 91:** Researcher publishes. CVE assigned. 40 million devices are now publicly documented as permanently vulnerable.

The 90-day standard - designed to create patch pressure - has no mechanism to work when the entity responsible for the patch has no incentive to produce one and no way to distribute it if they did.

---

### <span style="color: orange;">The Insurance Angle: How Risk Pricing Could Fix What Regulation Cannot</span>

There is one market mechanism that has historically forced security improvements: **cyber insurance pricing**.

If cyber insurance underwriters price IoT-related incident risk accurately, then:
- Organizations running unpatched IoT devices pay higher premiums
- Organizations with modern, patchable devices pay lower premiums
- The price differential creates an economic incentive to upgrade

This is the mechanism that drove TLS adoption in enterprise. Insurers started requiring it. Compliance happened fast.

**Why it has not worked for consumer IoT:**

1. Consumers do not buy cyber insurance
2. Organizations that run IoT (factories, hospitals, utilities) often exclude IoT from their cyber coverage scope
3. IoT-related losses are frequently classified as operational technology (OT) losses, not cyber losses, and fall under different policy language
4. Loss attribution for DDoS attacks that originate from botnet-enlisted IoT devices is almost never traced back to the device owner, so the device owner never faces a loss event

The insurance signal is absent. The economic incentive is absent. The graveyard grows.

---

### <span style="color: orange;">The India-Specific Problem</span>

India has approximately 900 million IoT endpoints - the second largest deployment globally after China. The regulatory framework:

- **CERT-In**: Mandatory breach reporting since April 2022 (6-hour window for critical infrastructure). No IoT device security mandates.
- **BIS (Bureau of Indian Standards)**: IS 17789 (IoT security) published 2022 - voluntary, not mandated for import or sale
- **DoT**: No IoT device type approval requirement for security (unlike EMI/spectrum compliance)
- **TRAI**: No mandatory IoT security requirements for devices using cellular connectivity

A camera manufactured in Shenzhen, using a HiSilicon chipset, running firmware from 2016, with default credentials, with Telnet open, can be imported, sold, and deployed in India's critical infrastructure with **zero security checkpoints**.

The contrast is instructive: the same camera must pass BIS electromagnetic compatibility testing before sale in India. Its radio emissions are regulated. Its firmware security is not. The signal it emits must meet a standard. The backdoor it ships with has no standard to violate.

CERT-In VU#IOTSRG-2025-011 (filed as part of the research behind this presentation) documented this gap directly. The 90-day embargo was observed. The CVEs were filed with MITRE. The devices remain deployed.

---

*Next: The Walking Dead of IoT - Part 3: The Price of Cheap*
