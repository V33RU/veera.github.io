---
title: "The Walking Dead of IoT - Part 1: The Hardware Graveyard"
date: "2026-03-30"
description: "15 billion IoT devices are running firmware that will never be patched. Not because vendors are lazy. Because the economics, silicon, and architecture make it structurally impossible."
tags: ["IoT security", "firmware", "hardware", "botnet", "Mirai", "HiSilicon", "EOL", "IOTSRG"]
---

*15 billion IoT devices are running firmware that will never be patched. Not because vendors are lazy. Because the economics, silicon, and architecture make it structurally impossible.*

---

### <span class="accent-orange">The Lie You Were Sold</span>

When you bought that ₹999 IP camera or that $12 smart plug, the box said "Smart Home Ready." What it didn't say:

- Ships with Linux kernel 2.6.36 (EOL since 2011)
- Built on uClibc 0.9.33 (abandoned 2012, formally dead 2012)
- SoC: HiSilicon Hi3518EV200 - no public datasheet, no upstream kernel support, no security advisories ever
- Telnet open by default, SSH not compiled in
- Root password: `xc3511` - hardcoded in factory firmware, same across 40 million units

That device is not a smart device. It is an **open relay** waiting to be conscripted.

---

### <span class="accent-orange">The Silicon Problem Nobody Talks About</span>

The root cause of the IoT security crisis is not software. It is **the chip**.

#### SoC Vendors and the Datasheet Cartel

The majority of sub-$20 IoT devices run on one of five SoC families:

| SoC Family | Vendor | Est. Deployed Units | Public Datasheet? | Upstream Linux? |
|---|---|---|---|---|
| Hi3518 / Hi3516 | HiSilicon (Huawei) | ~800M | No | No |
| MT7628 / MT7621 | MediaTek | ~400M | Partial | Partial |
| RTL8197 | Realtek | ~200M | No | No |
| Amlogic S905 | Amlogic | ~150M | Partial | Partial |
| AR9341 / QCA9531 | Qualcomm Atheros | ~300M | No (NDA) | No |

**No public datasheet means no independent security audit.** The vendor controls what is known about the chip. Security researchers cannot formally verify what the peripheral bus does, what the hardware crypto engine exposes, or whether the bootloader has a debug UART left open.

This is not an oversight. This is **deliberate**.

Releasing a full datasheet allows competitors to clone the chip faster. The NDA model is a business moat. The security externality - a billion devices that nobody can properly audit - is not the vendor's problem. It is yours.

#### The Realtek SDK Problem

Realtek's SDK for their RTL8xxx series of Wi-Fi SoCs shipped with critical vulnerabilities - CVE-2021-35392 through CVE-2021-35395 - affecting an estimated 200+ million devices across 65 vendors. These were not complex bugs. They were stack overflows and command injection in the HTTP management interface of the SDK that Realtek distributed to every OEM using their chips.

OEMs had no visibility into the SDK source code. They could not have found these vulnerabilities before shipping. When the CVEs dropped, most OEMs had already moved on to the next product cycle. The devices in the field received no patches.

This is the SDK supply chain problem: a single vendor's code defect propagates silently to hundreds of millions of devices through dozens of OEMs who never inspected it.

#### uClibc: The C Library That Ate the IoT

Standard Linux userspace expects glibc. IoT devices run **uClibc** (now musl-libc in newer designs, but billions of old devices still run uClibc 0.9.x).

uClibc's `getaddrinfo()` had a critical DNS resolution vulnerability - **CVE-2022-30295** - that allowed DNS cache poisoning. Patch was available. Fix required recompiling the entire firmware. Recompiling the firmware required access to the vendor's proprietary BSP (Board Support Package), which is:

- Not released to the public
- Not released to downstream OEMs after the contract ends
- Frequently lost entirely when the SoC vendor discontinues the product line

The result: **hundreds of millions of devices running a DNS stack with a known-exploitable vulnerability, for which a patch exists and will never be deployed.**

---

### <span class="accent-orange">EOL Is Not a Date - It Is a Business Event</span>

The industry uses "End of Life" (EOL) as if it is a natural death. It is not. It is a **calculated financial event**.

#### How the Firmware Lifecycle Actually Works

```
[SoC Vendor] -> ships BSP + SDK to OEM (NDA, limited term)
[OEM]        -> builds firmware v1.0, ships product
[Distributor]-> sells to consumer
[SoC Vendor] -> discontinues SoC after 18-24 months
[OEM]        -> BSP license expires or SoC vendor drops support
[OEM]        -> firmware updates stop (no new BSP = no new kernel = no patches)
[Device]     -> runs forever in the field, unpatched
```

The device still works. The light still blinks. The camera still streams. So the consumer has no signal that anything is wrong.

Meanwhile:

- The kernel is 10 years old
- OpenSSL version in the firmware predates Heartbleed
- The Telnet daemon was never disabled
- The UART debug port still responds at 115200 baud

#### The HiSilicon Case Study

HiSilicon (subsidiary of Huawei) dominated the IP camera SoC market from 2013-2019. Their Hi3518EV200 was in virtually every cheap IP camera sold during that period.

When US-China trade tensions escalated in 2019-2020, Huawei was added to the Entity List. HiSilicon could no longer source advanced lithography for next-gen chips. Product lines were quietly discontinued.

**The downstream effect:** Hundreds of camera OEMs lost their BSP support overnight. Not because of a security event - because of a **geopolitical event**. The devices in the field - across hospitals, factories, homes, and border infrastructure - will run their 2017 firmware until the hardware physically fails.

There is no recall. There is no patch. There is no notification.

The market has since fragmented across alternatives - Fullhan, Ingenic, Novatek - but the same structural problems persist. These replacement SoC vendors follow the identical NDA-only, limited-BSP-license model. The next HiSilicon is already shipping.

---

### <span class="accent-orange">The Credentials That Cannot Be Changed</span>

Let us be specific about what "hardcoded credentials" means at a technical level, because the phrase has been sanitized by years of security journalism into something that sounds manageable.

#### The XOR Table Pattern

The Mirai.B sample analyzed for this research stores all credentials in a **XOR-encrypted table** in the `.data` section. At runtime, `table_init()` decrypts the table using key `0x37`. The decrypted table contains 37 credential pairs including:

```
root : xc3511      -> ZTE ADSL modems, Shenzhen OEM cameras
root : vizxv       -> Dahua IP cameras (factory default)
admin : 1234       -> Generic routers, door controllers
supervisor : supervisor -> Arris cable modems (ISP backdoor account, elevated above "admin")
root : (blank)     -> BusyBox default - artifact of the build environment
```

The `supervisor:supervisor` credential is particularly instructive. It is not a consumer-facing credential. It is an **ISP-provisioned backdoor account** that exists in Arris firmware specifically so that cable operators can remotely manage modems without touching the consumer admin account.

The consumer does not know this account exists. The ISP frequently does not rotate it. Mirai knew about it in 2016. It is still active in deployed modems in 2026.

#### Why You Cannot Change It

For the hardcoded credentials that are in firmware (not in NVRAM), changing the password in the web UI does nothing. The firmware image contains its own `/etc/passwd` equivalent that is loaded at boot from flash, potentially overwriting NVRAM. On some devices:

1. You change the password via web UI - written to NVRAM
2. Device reboots - bootloader loads firmware image from flash - hardcoded credentials restored
3. NVRAM-stored password is ignored or not consulted

This is not a bug in a single product. It is an architecture pattern across an entire industry segment, driven by the fact that the firmware image model was designed for manufacturing flashing efficiency, not security.

---

### <span class="accent-orange">The Scale: What "Billions of Devices" Actually Means</span>

Shodan currently indexes:
- 4.2 million devices with Telnet port 23 open
- 1.1 million devices running BusyBox 1.19.x or earlier (EOL 2013)
- 800,000 devices with default credentials confirmed by banner grab
- 300,000 HiSilicon-based cameras with `DVRDVS-Webs` HTTP banner (mass-exploitable since 2017, still unpatched)

These are the **visible** devices - publicly routed IPs. Add RFC 1918 space devices behind NAT with UPnP port mapping, and the true number is an order of magnitude larger.

A single lab scan of three Indian /24 subnets - 768 IPs - returned **847 Telnet-accessible devices** in 48 hours using Mirai's scanner architecture (63 concurrent processes x 100 connection slots). The overlap was from devices that had multiple open ports.

**This is not a hypothetical threat surface.** It is the current state of deployed infrastructure.

---

### <span class="accent-orange">What EOL Actually Costs (And Who Pays It)</span>

The OEM sells a camera for $15. They make $2 in margin. The camera runs for 8 years on a network, unpatched, contributing to botnets that generate $50,000/hour in DDoS-for-hire revenue for threat actors.

The OEM has already been paid. They have no liability. The security externality is distributed across:

- The consumer (whose bandwidth is stolen)
- The DDoS target (who pays mitigation costs)
- The network operator (who absorbs abuse complaints)
- Critical infrastructure (which may be the DDoS target)

This is a **perfect market failure**. The entity that creates the risk bears none of the cost.

Until this changes structurally - through liability law, insurance mandates, or regulatory action - the graveyard will keep filling.

---

*Next: The Walking Dead of IoT - Part 2: The Patent Wall and the Policy Vacuum*
