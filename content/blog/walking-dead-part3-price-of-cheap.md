---
title: "The Walking Dead of IoT - Part 3: The Price of Cheap"
date: "2026-03-30"
description: "The $15 camera is a $15 attack vector. The supply chain that produced it has 14 layers of abstraction between a security vulnerability and anyone who can fix it."
tags: ["IoT security", "supply chain", "economics", "SCADA", "critical infrastructure", "botnet", "IOTSRG"]
---

*The $15 camera is a $15 attack vector. The supply chain that produced it has 14 layers of abstraction between a security vulnerability and anyone who can fix it. The industry is wiring critical infrastructure with components whose provenance cannot be verified and whose security cannot be audited.*

---

### <span class="accent-orange">The Real Bill of Materials</span>

Let's build a $15 IP camera. Not metaphorically - let's trace the actual economics.

#### Component Cost Breakdown (2024 prices, Shenzhen spot market)

| Component | Cost |
|---|---|
| HiSilicon Hi3518EV200 SoC | $1.80 |
| 64MB DDR2 SDRAM | $0.40 |
| 128MB NAND flash | $0.35 |
| 1/4" CMOS image sensor (OV9732 or clone) | $0.90 |
| IR LED array (8x) | $0.15 |
| PCB fabrication (4-layer) | $0.20 |
| Plastic housing + lens | $1.20 |
| Power supply module | $0.45 |
| RJ45 + cable | $0.18 |
| WiFi module (if applicable) | $0.60 |
| Assembly (Shenzhen) | $0.40 |
| **Total BOM** | **$6.63** |

The camera sells for $15 on Amazon. Margin exists for the OEM, the distributor, and Amazon's cut.

**Security budget: $0.00.**

There is no line item for:
- Security code review
- Penetration testing
- Secure boot implementation
- Certificate provisioning
- Update infrastructure
- Vulnerability response team

These are not oversights. They are deliberate exclusions. Adding a secure element chip (like an ATECC608A) would cost $0.55 - adding 8% to BOM cost. In a margin-compressed market, this is rejected.

#### The OEM Abstraction Stack

The camera you buy does not come from the company on the box. The actual chain:

```
[IP Camera Co. Ltd, Shenzhen] - "brand owner," no engineering staff
       | contract
[Module Maker, Dongguan] - integrates SoC + sensor + PCB
       | BSP from
[HiSilicon / MediaTek] - SoC vendor, firmware base
       | sold through
[Importer / Distributor, India/EU/US]
       | listed by
[Amazon / Flipkart / AliExpress]
       | bought by
[Consumer / Enterprise / Government]
```

When CVE-2023-XXXXX is discovered in the camera's RTSP stack, who is responsible?

- The brand owner has no engineers
- The module maker's contract has ended
- The SoC vendor says the BSP is the module maker's problem
- The importer points to the brand owner
- Amazon says they are a marketplace, not a manufacturer
- The consumer has no recourse

This is not an accident. This is a **liability diffusion architecture**, and it has been highly effective.

---

### <span class="accent-orange">The Chip Supply Chain and National Security</span>

#### The Backdoor You Cannot Rule Out

The HiSilicon Hi3518 series is manufactured by TSMC (Taiwan Semiconductor Manufacturing Company) on 28nm process nodes, fabbed in Taiwan, designed in Shenzhen, integrated in Dongguan, and deployed globally.

The datasheet is not public. The chip's peripherals - including the hardware entropy source (used for cryptographic key generation), the DMA controller (which can access all memory), and the debug interface - are not independently auditable.

In 2020, security researcher Vladislav Yarmak documented that certain HiSilicon-based DVRs contained an undocumented UDP service on port 9530 that accepted a hard-coded "magic packet" and returned a root shell. **This was not a bug. The code was intentional and obfuscated.** Whether it was a vendor backdoor, an OEM debug feature left in production, or a supply chain insertion is unknown, because the source code is not available for review.

This is the threat model that national security agencies discuss in classified settings and that industry bodies discuss in euphemistic language about "supply chain integrity." The plain-language version: **you cannot verify that the chip in your critical infrastructure does not contain hardware or firmware features that its manufacturer can trigger remotely.**

#### The TSMC Choke Point

Approximately 90% of advanced semiconductor manufacturing occurs at TSMC in Taiwan. This includes chips from Qualcomm, MediaTek, Apple, NVIDIA, AMD, and - until 2020 - HiSilicon.

A conflict in the Taiwan Strait would:
- Immediately halt production of virtually all advanced SoCs
- Create a 12-18 month global chip shortage (the 2021 shortage from COVID was caused by a much smaller supply shock)
- Force rapid adoption of alternative supply chains - which means chips from fabs with even less security transparency

The geopolitical risk to IoT security is not theoretical. The HiSilicon cutoff in 2020 already demonstrated that an entire product category (HiSilicon-based cameras) can lose its supply chain support due to non-security factors, instantly creating a permanent patch gap.

---

### <span class="accent-orange">The Race to the Bottom: How Markets Create Insecurity</span>

#### Why Better Security Cannot Win on Price

Consider two cameras at retail:

**Camera A** - $15 - HiSilicon, default credentials, no update mechanism, Telnet open, 3-year support life claim, manufacturer will be out of business in 18 months.

**Camera B** - $45 - ARM Cortex-A7, secure boot, TLS 1.3, automatic OTA updates, 5-year security support commitment, CVE response program, no default passwords.

For a consumer buying a home camera:
- Camera A looks identical to Camera B on the shelf
- Camera A has 4.2 stars on Amazon (reviews written before any security analysis)
- Camera A is Prime eligible and arrives tomorrow
- The $30 price difference is not justified by any feature the consumer can perceive

Camera A wins 80% of the market.

The security properties of Camera B are **invisible at the point of purchase**. The negative consequences of Camera A's insecurity are distributed across the entire internet (as botnet traffic) and arrive years after the purchase decision.

This is a **market for lemons** problem (Akerlof, 1970). In markets where buyers cannot assess quality before purchase, low-quality goods drive out high-quality goods on price. The IoT market is precisely this structure.

#### What Breaks the Race to the Bottom

Three mechanisms have historically broken race-to-bottom dynamics in other markets:

**1. Mandatory Minimum Standards (Regulation)**
Example: Automobile safety standards. You cannot sell a car without airbags in the US. This removes safety as a competitive variable - all cars must meet the floor, competition happens above it.

IoT equivalent: The EU CRA (full application December 2027) will establish this floor for new devices in Europe. It does not exist yet. It will not apply retroactively.

**2. Liability (Tort Law)**
Example: Product liability for physical goods. Ford Pinto case - when lawsuits became more expensive than fixes, safety improved.

IoT equivalent: Does not exist in any major jurisdiction. Software liability law would need to be fundamentally restructured. No jurisdiction has done this.

**3. Informed Consumers (Labeling)**
Example: Energy Star ratings for appliances - visible, standardized, trusted by consumers, created demand for efficiency.

IoT equivalent: US Cyber Trust Mark (2024) - voluntary, opt-in, no minimum technical requirements published at launch. UK PSTI compliance label - mandatory for new devices but not visible at retail. Neither has penetrated consumer awareness.

**None of the three mechanisms are fully operational in 2026.** The race to the bottom continues.

---

### <span class="accent-orange">Legacy Infrastructure: The Devices That Are Literally Running Power Grids</span>

The consumer camera problem is annoying. The industrial IoT problem is existential.

#### SCADA on the Public Internet

The Mirai.B sample analyzed for this research includes targeted exploits for:

- **Schneider Electric Modicon PLCs** (CVE-2018-9866) - used in power generation, water treatment, manufacturing
- **Siemens S7 protocol** (reconnaissance only in this sample, but documented in other variants)
- **Honeywell building automation systems**
- **D-Link industrial switches**

These are not home routers. These are **operational technology (OT) devices** managing physical processes - pumps, valves, generators, conveyors.

Shodan indexes approximately 14,000 Modbus-accessible devices on public IPs. Modbus is a 1979 protocol with **no authentication**. Any device that can connect to the TCP endpoint can send commands.

The reason these devices are on public IPs: a technician needed remote access. They opened a port. Nobody closed it. The device has been running for 15 years. Nobody knows the port is open.

#### The Purdue Model Collapse

Classical industrial security uses the **Purdue Enterprise Reference Architecture** - a layered model separating OT networks (Level 0-2) from IT networks (Level 3-4) with strict air gaps or controlled DMZ connections.

In practice:
- COVID-19 forced remote access requirements onto OT networks that were never designed for it
- Cloud connectivity for OT data analytics punched holes through the Purdue model
- OT devices were added to corporate IT networks by technicians who did not understand the security implications
- IT teams that inherited OT network management did not understand the 20-year device lifecycles and "never reboot" operational requirements

The air gap - the core security control of industrial IoT - has been functionally eliminated in the majority of industrial deployments. The devices behind it run firmware from 2008. The protocols they speak (Modbus, DNP3, BACnet) have no security properties whatsoever.

A Mirai variant with the Schneider Electric exploit chain from CVE-2018-9866 can:
1. Enter the network through a compromised home router (default credentials)
2. Pivot via an IT network connection to the OT DMZ
3. Enumerate Modbus devices
4. Send SET_POINT commands to PLCs controlling physical infrastructure

This is not a theoretical attack chain. It has been documented in incident reports from the 2021 Oldsmar water treatment plant incident, the 2022 Ukraine power grid attacks (Industroyer2), and multiple undisclosed industrial incidents.

---

### <span class="accent-orange">The Lifecycle Math: How Long Until This Fixes Itself?</span>

Let me be rigorous about the timeline if I rely purely on natural device retirement.

#### Installed Base Retirement Projections

Current estimate: 15 billion insecure IoT devices deployed globally.

Average IoT device MTTF (Mean Time to Failure):
- Consumer cameras: 4-7 years
- Home routers: 5-8 years
- Industrial IoT sensors: 10-25 years
- SCADA equipment: 15-30 years
- Smart meters: 10-15 years

Weighted average across the installed base: approximately **12 years**.

If the industry stopped deploying insecure devices today - which it has not - the legacy problem would persist until approximately **2038**.

New device deployment in 2025: approximately 3.5 billion new IoT devices shipped, of which (by industry estimates) approximately 60% still lack basic security hygiene (no automatic updates, default credentials, unnecessary open ports).

**Net insecure device count is growing, not shrinking.** The retirement rate of old devices is slower than the deployment rate of new insecure devices.

---

### <span class="accent-orange">The Disclosure Gap: What Responsible Disclosure Cannot Fix</span>

The research behind this presentation involved discovering 62 exploits targeting devices across 15 vendors in a single malware sample. The responsible disclosure process:

1. **CERT-In notification** - filed VU#IOTSRG-2025-011. CERT-In issued advisory. Four vendors received formal notification.
2. **MITRE CVE filing** - four novel CVEs filed and assigned. 58 of the 62 exploits targeted already-documented CVEs with no available patches.
3. **90-day embargo** - observed. Vendors contacted. Response rate: 2 of 4 responded. Patches produced: 0.
4. **Publication** - this presentation.

The 58 already-documented CVEs include vulnerabilities filed as early as 2014. **CVE-2014-8361 - Realtek UPnP SDK SOAP injection - is 12 years old. It is still in active exploitation by Mirai variants. Affected devices are still deployed.**

Responsible disclosure works when vendors can produce patches and distribute them to users. It does not work when:
- The vendor is bankrupt
- The SoC vendor dropped BSP support
- The device has no update mechanism
- The user does not know the device needs updating
- The patch, if produced, cannot reach the deployed devices

In those cases, responsible disclosure is a **bookkeeping exercise**. The CVE is filed. The advisory is published. The device remains vulnerable. The only observable effect is that the exploit is now documented for threat actors who had not previously known about it.

---

### <span class="accent-orange">What Actually Works: The Short List</span>

Given everything above, what actually reduces the attack surface?

#### For Defenders Right Now

**1. Network segmentation, not device trust**
Treat every IoT device as hostile. Put them on an isolated VLAN with no lateral movement capability. The device can still stream video. It cannot pivot to your corporate network.

**2. Passive asset discovery + firmware fingerprinting**
Know what is on your network. Tools like Nmap scripts, Censys, or commercial OT asset discovery can identify HiSilicon devices, BusyBox versions, and open Telnet/HTTP-Basic auth endpoints in your environment.

**3. Log DNS queries from IoT devices**
The Mirai.B C2 chain uses injected DNS (`46.239.223.80` as rogue resolver). An IoT device changing its DNS resolver - or making queries to `dotheneedfull.xyz`, `iotsecurity.xyz` - is a high-fidelity indicator of compromise. This detection costs $0 if you already run a DNS resolver.

**4. Block outbound Telnet (port 23) from IoT segments**
Mirai propagates via Telnet. An IoT device originating outbound Telnet connections is either compromised or scanning. Block it at the network boundary.

**5. Prioritize replacement over patching**
For devices running pre-2018 firmware on EOL chips, there is no patch path. The security decision is: accept the risk, isolate the device, or replace it. For critical infrastructure, "accept the risk" is not a valid answer.

**6. Firmware integrity verification**
Where devices support it, enable secure boot and firmware signature verification. For devices that do not support it - which is the majority of the legacy fleet - this becomes another argument for replacement. Any device that cannot verify the integrity of its own firmware can be permanently compromised by a single successful exploit.

#### For the Long Game: The Policy Levers That Matter

**1. Vendor liability for post-sale security failures**
This is the single highest-leverage change. If camera manufacturers faced civil liability for damages caused by botnet-enlisted cameras, BOM calculations would immediately include security line items. No other incentive is as direct.

**2. Minimum security update periods tied to product certification**
A device cannot be CE marked (or equivalent) without a committed security update period proportional to expected deployment life. 3 years for consumer. 10 years for industrial.

**3. SBOM (Software Bill of Materials) mandates**
Every device must ship with a machine-readable SBOM listing every software component. This allows downstream users to check if a deployed device contains a component with a known CVE. Currently, you cannot check this without full firmware extraction and analysis.

**4. ISP-level blocking of known C2 infrastructure**
BGP-level blocking of known Mirai C2 infrastructure (documented IPs: 79.124.8.24, 78.142.18.20, etc.) requires ISP cooperation but costs essentially nothing to implement once the blocklist is maintained. CERT-In could mandate this for Indian ISPs under the existing breach reporting framework.

**5. Secure-by-default import requirements**
Require that any IoT device sold in-country pass a machine-automated security baseline scan (no Telnet, no default passwords, HTTPS-only management) as a condition of import. This is enforceable at customs, requires no new enforcement bureaucracy, and can be implemented in 6 months.

---

### <span class="accent-orange">The Honest Conclusion</span>

We have built the nervous system of the physical world out of components that:

- Cannot be audited
- Cannot be patched
- Cannot be attributed when compromised
- Generate no liability when they fail
- Are subject to regulations that arrive a decade after deployment

The 283KB binary analyzed for this research - compiled in 2020 with Aboriginal Linux toolchain, XOR-encrypted credentials, 62 exploit functions, 12 DDoS methods, watchdog subversion, process masquerading - is not a sophisticated nation-state tool. It is a **commodity**, sold as a service, written by a mid-tier criminal actor, leveraging entirely publicly documented vulnerabilities.

The sophistication is not in the malware. The sophistication is in the **attack surface** - 15 billion devices, assembled over 20 years, by an industry that was never incentivized to do this correctly.

The fix is not a better antivirus. It is not a SIEM rule. It is not responsible disclosure.

The fix is: **liability, minimum standards, SBOM, and time**. In that order. The time part takes a decade even if the other three start today.

The devices currently deployed will be exploited until they physically fail. The only question is what they will be used to attack in the meantime.

---

*CVE Program: MITRE | CERT-In: VU#IOTSRG-2025-011 | null Security Conference 2026*
