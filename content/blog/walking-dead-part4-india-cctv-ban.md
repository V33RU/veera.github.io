---
title: "The Walking Dead of IoT - Part 4: India's CCTV Ban and the Overnight Game Changer"
date: "2026-04-04"
description: "On April 1, 2026, India banned uncertified Chinese CCTV equipment. Was this a security decision or a market play? And does it actually fix anything?"
tags: ["IoT security", "policy", "India", "Hikvision", "Dahua", "supply chain", "surveillance", "IOTSRG"]
---

*On April 1, 2026, India stopped allowing new Hikvision, Dahua, and TP-Link cameras to be sold or imported. The government called it a security measure. The industry called it a market correction. The security researcher in me asks: does banning the product fix the problem, or does it just move it?*

---

### <span class="accent-orange">What Actually Happened</span>

On April 1, 2026, a two-year regulatory clock ran out.

In April 2024, India's Ministry of Electronics and Information Technology (MeitY) issued Essential Requirements (ER) for CCTV cameras - a mandatory certification framework. Manufacturers were given two years to comply. On April 1, 2026, that window closed.

The mechanism: every CCTV camera sold or imported in India now requires **STQC certification** (Standardisation Testing and Quality Certification Directorate). The certification requires compliance with IS 13252-1, India's cybersecurity standard for internet-connected surveillance equipment. Critically, manufacturers must disclose the country of origin of two specific components: **System-on-Chip (SoC) and firmware**.

Hikvision, Dahua, and TP-Link could not get that certification. Because their SoCs are Chinese. Because their firmware runs on those SoCs. Because STQC is denying certification to products built on Chinese chipsets.

The result: those brands cannot legally sell new units in India as of April 1, 2026.

This is not a recall. Devices already deployed can continue operating. Nobody is breaking down doors to confiscate cameras. The ban is forward-looking - it applies to new sales and imports only.

---

### <span class="accent-orange">Why Now? The Trigger Nobody Talks About Enough</span>

The timing is not a coincidence.

In March 2026 - one month before the deadline - Indian authorities uncovered a **Pakistan-linked espionage network in Ghaziabad** that had exploited unsecured CCTV feeds and installed covert cameras at sensitive sites. Defence facilities. Government buildings. Railway stations.

That incident accelerated the policy enforcement timeline and hardened the government's position on certification denials. The two-year grace period was already expiring. The espionage case made sure nobody in the Ministry was inclined to grant extensions.

This is how surveillance policy actually changes. Not through white papers. Through incidents that produce political will.

---

### <span class="accent-orange">The Numbers Behind the Decision</span>

Indian players already control **over 80% of the CCTV market** as of February 2026. Chinese brands had previously commanded roughly one-third of total national sales. That means the shift has been happening for years - the ban is the legal formalization of a market trend that was already underway.

The domestic beneficiaries are real companies with real products: **CP Plus, Qubo, Prama, Matrix, Sparsh**. They have been gaining ground as Chinese brands faced increasing scrutiny. The ban eliminates competitive pressure from Hikvision and Dahua at the exact moment Indian manufacturers have reached scale.

Over 500 CCTV models are already certified under the new regime. That is not a broken market - that is a functioning domestic industry that built to the new standard.

---

### <span class="accent-orange">The Security Argument - Is It Real?</span>

Let me be precise here, because this matters.

The concerns cited are:
- Hidden backdoor access in Chinese CCTV equipment
- Potential transmission of surveillance data to foreign servers
- Unauthorized remote access vulnerabilities
- Deployment at sensitive national infrastructure sites

Are these concerns legitimate? **Yes, partially.**

In Part 3 of this series, I documented that the HiSilicon Hi3518 series - the SoC in a massive proportion of deployed Chinese cameras - contained an undocumented UDP service on port 9530 in certain DVR variants. Security researcher Vladislav Yarmak documented this in 2020. The code was intentional and obfuscated. The source code was never made available for review.

Hikvision's CVE history is not short. CVE-2021-36260 - an unauthenticated remote command execution vulnerability in Hikvision cameras - had a CVSS score of 9.8 and affected tens of millions of deployed devices. Exploitation was documented in the wild before patches were available. The patch existed; distribution to deployed devices was a separate, largely unsolved problem.

Dahua's record is similar. CVE-2021-33044, CVE-2021-33045 - authentication bypass vulnerabilities with trivial exploit chains.

The security argument for the ban is legitimate. The question is whether the mechanism addresses the actual threat.

---

### <span class="accent-orange">What the Ban Does Not Fix</span>

Here is the uncomfortable part.

**The 15 billion deployed globally are still running.** India's ban applies to new sales. Every Hikvision and Dahua camera already installed at an Indian railway station, government building, or private business is still there. Still running the same firmware. Still potentially vulnerable to CVE-2021-36260. The ban does not reach them.

**STQC certification tests products, not the supply chain.** Indian manufacturers are currently shifting away from Chinese SoCs toward Taiwanese chipsets and locally-developed firmware. That is the right direction. But chipset origin alone is not a security guarantee. A Taiwanese SoC running unchecked firmware from an unaudited vendor is not automatically more secure than a Chinese SoC. The security property being tested needs to be the firmware and update architecture, not just the chip's country of origin.

**The OEM abstraction problem survives the ban.** In Part 3 I described how a "$15 camera" passes through six layers of abstraction between a security vulnerability and anyone who can fix it. Indian brands building on non-Chinese chipsets with locally-developed firmware are better positioned. But if they adopt the same OEM abstraction model - no update mechanism, no CVE response program, no SBOM - they will reproduce the same problem with different components.

**The price problem is unchanged.** The race-to-bottom economics that made cheap, insecure Chinese cameras dominant in the first place have not been addressed. The domestic brands winning this market need to compete on price as well as certification. If that pressure leads to the same security shortcuts, the ban has accomplished a supply chain shuffle, not a security improvement.

---

### <span class="accent-orange">What the Ban Does Fix</span>

Despite the above, I do not think this is purely a market play dressed up as security policy. Some things are genuinely better after this decision.

**Sensitive site exposure is reduced, going forward.** The specific threat of new Hikvision or Dahua units being installed at defence facilities, government buildings, or critical infrastructure is now legally blocked. That is a meaningful reduction in the most acute threat vector - not the consumer botnet risk, but the targeted espionage risk.

**It creates supply chain pressure in the right direction.** Forcing manufacturers to disclose SoC and firmware origin is a precursor to SBOM mandates. If India follows this with a requirement for machine-readable software bills of materials - which is the logical next step - that would be genuinely significant. You cannot audit what you cannot see. Certification that requires component disclosure is step one.

**It gives domestic industry room to mature.** CP Plus and Qubo building to IS 13252-1 requirements today, and being competitive in a market that requires that standard, is how you develop a domestic security-conscious manufacturing base. This takes years. Starting that clock is not nothing.

**It establishes the enforcement model.** India has demonstrated that it will use import certification as a security control. That precedent matters for IoT more broadly. Routers. Smart meters. Industrial controllers. If the CCTV certification framework can be extended to these device classes with real technical requirements, the impact grows significantly.

---

### <span class="accent-orange">The Harder Question: Is This About Security or Competition?</span>

Both. And that is fine.

Policy decisions that are simultaneously good security and good industrial policy are not suspect because they serve two interests. The US ban on Huawei network equipment, the UK's 5G exclusion of Chinese vendors, Australia's CCTV removal from government buildings - these all combined security and competitive motivations. The security argument does not become invalid because it also benefits domestic industry.

The honest framing: **India chose to use security certification as a market access control, at a moment when its domestic industry was ready to fill the gap.** That is a rational policy choice. Whether it improves security depends on what happens next - specifically, whether the certification requirements get stronger, whether they extend to deployed legacy devices over time, and whether domestic manufacturers are held to the same scrutiny that Chinese manufacturers failed.

---

### <span class="accent-orange">What IOTSRG Thinks Should Happen Next</span>

The ban is a first step. Here is the rest of the staircase.

**1. Extend certification requirements to legacy devices at sensitive sites**
New sales are blocked. The cameras already at railway stations and government buildings are not. India should require active security audits and replacement programs for deployed Chinese cameras at defined sensitive site categories within a 24-month window.

**2. Require SBOM as part of STQC certification**
Component disclosure is step one. Step two is a machine-readable SBOM listing every software component and its version. This allows downstream checks against CVE databases. Without this, certification tells you the SoC is Taiwanese, not whether the firmware running on it has a 9.8 CVSS vulnerability.

**3. Mandatory update mechanisms and support windows**
IS 13252-1 compliance is a point-in-time test. Security is ongoing. Certified products should be required to demonstrate an update delivery mechanism and commit to a defined security support period (minimum 5 years for commercial, 10 years for any government/critical infrastructure procurement).

**4. CVE response program requirements**
Domestic manufacturers receiving the benefit of this market access change should be required to maintain a documented CVE response process - a contact for vulnerability reports, a defined response SLA, and a public disclosure policy. CERT-In should track compliance.

**5. Extend the framework to routers, smart meters, and industrial IoT**
The CCTV ban affects one device class. Indian homes and businesses also run Chinese routers, Chinese-chipset smart meters, and Chinese-origin industrial sensors. The security threat surface extends well beyond cameras. The STQC certification model should be systematically extended.

---

### <span class="accent-orange">The Overnight Game Changer Framing Is Wrong</span>

The headline framing - "overnight game changer" - does not survive scrutiny. What actually happened:

- Two years of regulatory build-up
- A domestic industry that spent those two years gaining share
- An espionage incident that hardened political will
- A certification denial that is forward-looking only

Nothing changed overnight. The clock ran out on a timeline that started in 2024. The security problems in deployed devices remain. The race-to-bottom economics are unchanged. The OEM abstraction stack persists.

What changed is: **the legal framework now excludes one set of vendors from new deployments.** That is meaningful. It is not transformative.

The game changer, if it comes, will be when India extends mandatory SBOMs to all IoT device classes, requires security update commitments as a market access condition, and builds a CERT-In enforcement mechanism with real teeth for non-compliance by domestic manufacturers.

Until then: the walking dead are still walking. They just aren't getting any new Chinese reinforcements.

---

*This is Part 4 of the Walking Dead of IoT series. [Part 1: The Hardware Graveyard](/blog/walking-dead-part1-hardware-graveyard) | [Part 2: The Patent Wall](/blog/walking-dead-part2-patent-wall-policy-vacuum) | [Part 3: The Price of Cheap](/blog/walking-dead-part3-price-of-cheap)*
