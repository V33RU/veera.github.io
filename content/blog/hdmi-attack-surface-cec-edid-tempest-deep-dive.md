---
title: "HDMI Is a Network: The Full Attack Surface of CEC, EDID, DDC, HDCP and TEMPEST"
date: "2026-04-25"
description: "HDMI is not a dumb video cable. It is a control bus, an I2C bus, an authenticated link, and a leaking antenna. A deep technical review of every documented HDMI attack class: CEC scanning and injection, EDID/DDC fuzzing, HDCP weaknesses, Deep-TEMPEST screen reconstruction, GPU power side channels, and the CVEs behind them."
tags: ["HDMI", "CEC", "EDID", "DDC", "HDCP", "TEMPEST", "side channel", "hardware hacking", "CVE"]
---

*If you think HDMI is just a video cable, look at the pin count again. Nineteen pins. Three of them are an I2C bus. Two of them are a single-wire control bus that can power-cycle every device in your living room. One of them is hot-plug detect. The rest are TMDS lanes that radiate enough RF for someone in the next room to read your screen. HDMI is a network. Networks have attack surface.*

---

### <span class="accent-orange">Why This Cable Deserves a Threat Model</span>

The HDMI specification bundles five protocols into one connector:

1. **TMDS** - the high-speed video and audio lanes
2. **DDC** - an I2C bus used to read EDID from the sink
3. **CEC** - a one-wire bidirectional control bus that can address every device on the chain
4. **HDCP** - the link-layer encryption layer that pretends to be DRM
5. **HEAC / ARC / eARC** - audio return and Ethernet over HDMI

Every one of these has been attacked publicly. Every one of these has at least one CVE attached to a real implementation. Most defenders treat HDMI as a passive video pipe and never review it. That is the gap this post is about.

---

### <span class="accent-orange">The Pinout, Because You Cannot Attack What You Cannot See</span>

Standard HDMI Type A connector, 19 pins:

```
Pin 1  TMDS Data2+         Pin 11 TMDS Clock Shield
Pin 2  TMDS Data2 Shield   Pin 12 TMDS Clock-
Pin 3  TMDS Data2-         Pin 13 CEC
Pin 4  TMDS Data1+         Pin 14 Utility / HEC Data-
Pin 5  TMDS Data1 Shield   Pin 15 SCL (DDC clock)
Pin 6  TMDS Data1-         Pin 16 SDA (DDC data)
Pin 7  TMDS Data0+         Pin 17 DDC/CEC Ground
Pin 8  TMDS Data0 Shield   Pin 18 +5V
Pin 9  TMDS Data0-         Pin 19 Hot Plug Detect
Pin 10 TMDS Clock+
```

Three things matter to an attacker. **Pin 13 is CEC.** A single wire that addresses up to 15 devices and can issue control commands. **Pins 15 and 16 are I2C.** Real I2C, addressable from any DDC-aware host. **Pin 18 is +5V** at up to 55 mA, enough to power small implants.

You can probe CEC and DDC with a Bus Pirate, an FT232H in I2C mode, a Raspberry Pi (which has CEC support built in), or a Pulseview-attached logic analyzer. None of this is exotic.

---

### <span class="accent-orange">Layer 1: CEC, the Control Bus Nobody Audited</span>

CEC (Consumer Electronics Control) is a 9600 baud one-wire AC'97-derived bus. Every HDMI device on the chain gets a logical address (0-15) and a physical address tied to the port topology (e.g., 1.0.0.0 means "first port on the root TV").

Frame format:

```
[Header byte: source<<4 | destination] [Opcode] [Operands ...]
```

A `<User Control Pressed>` (opcode `0x44`) sent from the TV (logical 0) to a recorder (logical 1) is just three bytes on the wire. A power-on broadcast (`<Image View On>`, opcode `0x04`) is two bytes. There is no authentication. There is no rate limiting. The spec assumes every device on the bus is honest.

The CEC line is shared. Anyone with electrical access to a single HDMI port can talk to every device.

#### What you can do over CEC, today

- **Topology scan** by polling logical addresses 0-14 with a `<Polling Message>` (header-only frame). Devices that ACK exist.
- **Vendor fingerprinting** via `<Give Device Vendor ID>` (opcode `0x8C`). Returns a 24-bit IEEE OUI. Sony, Samsung, LG, and Panasonic each implement vendor-specific opcodes in the `0x00-0x1F` and `0xA0-0xFF` ranges that are mostly undocumented.
- **Power and input control** via `<Standby>` (`0x36`), `<Image View On>` (`0x04`), `<Active Source>` (`0x82`), `<Set Stream Path>` (`0x86`).
- **Routing manipulation** via `<Routing Change>` (`0x80`) to force a switch to flip its active input.
- **OSD message injection** via `<Set OSD String>` (`0x64`), which displays attacker-controlled text on the TV.
- **Remote button injection** via `<User Control Pressed>` (`0x44`) followed by a UI command code. From an attacker's perspective this is keystroke injection into the TV's smart-OS.

#### HDMI-Walk and the academic baseline

Puche Rondon, Saltaformaggio, and others published HDMI-Walk in 2019, formalizing six CEC-borne threat classes: scanning, eavesdropping, DoS, command injection, targeted device attacks, and using HDMI as a pivot to other networks. The toolchain they released is built on `libcec` and a USB-CEC adapter (Pulse-Eight). Every primitive maps directly to opcodes above.

The interesting part of HDMI-Walk is not the attacks. It is that the topology gives you a covert channel. CEC frames propagate across HDMI splitters and AV receivers. A malicious display in a conference room can talk to a laptop's GPU CEC stack three hops away through the projector and the matrix switch.

#### Real CVEs in CEC parsers

CEC implementations are written in C. They parse attacker-controlled length fields. You can guess what happens.

- **CVE-2017-9689** - memory corruption in the Qualcomm CEC driver in Android, reachable from a malicious HDMI peer.
- **CVE-2017-9719** - similar class of bug, separate code path.
- **CVE-2019-11479 / 11478** family - while these are TCP, equivalent integer-handling bugs have been demonstrated in `libcec` and vendor SoC CEC stacks. NCC Group's Troopers '19 talk on HackDMI walked through fuzzing CEC opcodes and finding crashes in production TVs.

The exploitation primitive is the same as any embedded parser bug: send a frame with a length field that disagrees with the actual frame length, watch the receiver mis-allocate, then either crash, leak memory, or get RIP control if the platform has no DEP/ASLR. Most TVs are still running ARM Linux with weak mitigations.

---

### <span class="accent-orange">Layer 2: EDID and DDC, the I2C Bus You Forgot About</span>

When a sink (monitor) is plugged into a source (GPU), the source reads a 128-byte EDID block from I2C address `0x50` on the DDC bus. Newer monitors extend this with E-EDID and DisplayID, going up to 32 KB across multiple addresses.

EDID is parsed by:

- The GPU driver in your kernel (nvidia, amdgpu, i915)
- The compositor (Xorg, Wayland, KWin)
- The TV's scaler firmware
- Monitoring tools (`read-edid`, `edid-decode`)

All four parse attacker-controlled bytes. None of them are hardened the way a network stack is.

#### How an EDID attack works

You build a malicious EDID by either:

1. Programming a 24LC256 EEPROM on the DDC pins of a custom HDMI dongle.
2. Using an HDMI emulator like the Lontium LT86102 or a Raspberry Pi acting as a sink.
3. Sitting in the middle on the DDC lines with an FT232H and presenting your own EDID while passing TMDS through.

Then you trigger a hot-plug detect pulse (raise pin 19 high), which forces the source to re-read EDID.

#### Documented EDID parser bugs

- **CVE-2017-9722** - EDID parser memory corruption in a major TV vendor's scaler firmware. Reachable purely by plugging in a malicious source.
- **CVE-2020-12888** - Linux kernel `vfio-pci` EDID handling, integer issue.
- Multiple Xorg `xf86-video-*` driver crashes from oversized DTD blocks (Detailed Timing Descriptors with bogus pixel clocks).
- NCC Group's "HDMI: Hacking Displays Made Interesting" demonstrated parser bugs in TVs and AV receivers via fuzzed E-EDID extension blocks. The bug class is almost always: vendor-specific data block with declared length larger than the buffer.

#### DDC is not just EDID

DDC carries SCDC (Status and Control Data Channel) on HDMI 2.0+, used for things like enabling scrambling at high pixel clocks. SCDC writes are at I2C address `0x54`. A malicious source can write SCDC registers on a sink and force it into modes the firmware did not expect. Several 4K TVs reboot when SCDC scrambler-enable is toggled rapidly.

DDC also carries HDCP key exchange writes. Which brings us to the next layer.

---

### <span class="accent-orange">Layer 3: HDCP, the DRM Layer That Was Never Real Security</span>

HDCP 1.x is fundamentally broken. The master key was published in 2010 (the famous 40x40 matrix leak). Anyone can derive valid device keys from any device's KSV. HDCP 1.x strippers and content key recovery have been off-the-shelf for over a decade.

HDCP 2.x switched to RSA-1024 + AES-128-CTR with a real handshake. It is harder, but not impervious:

- **Locality check timing** can be defeated with a high-end FPGA-based MITM (a "splitter that lies about RTT").
- **Downstream KSV revocation lists** are rarely updated by TV firmware. Devices that should be revoked are still trusted.
- **HDCP 2.2 to 1.4 downgrade** happens automatically when one downstream device is 1.x. A man-in-the-middle that pretends to be 1.x forces the source to use the broken version.

For an attacker, HDCP is mostly relevant in two scenarios:
1. Recording protected video (low-tier threat, well-covered by existing tools).
2. Bypassing handshake to get an HDMI implant accepted as a sink. This is where it gets interesting. If your implant cannot complete HDCP, you cannot see the video, but you can still talk CEC and DDC freely. HDCP only protects TMDS.

---

### <span class="accent-orange">Layer 4: TEMPEST and Deep-TEMPEST</span>

The TMDS lanes carry video as differential pairs at gigabit rates. Differential signaling is supposed to cancel emissions. In practice, every cable, connector, and PCB trace has imbalances that turn into common-mode currents, which radiate.

**Old-school TEMPEST** against analog VGA was demonstrated by Markus Kuhn in 2003 with a software radio and a CRT. The pixel clock and horizontal sync produce strong harmonics, and the screen content modulates them.

**Deep-TEMPEST** (2024 paper by Larroca et al., and subsequent reproductions) does the same against HDMI. Modern HDMI uses TMDS encoding which is 8b/10b plus DC balancing, and historically people assumed that destroyed enough structure to make image reconstruction infeasible. The Deep-TEMPEST work used a deep CNN trained on captured-emission to ground-truth pairs and showed that you can reconstruct readable text from HDMI emissions at 2 to 5 meters, through a wall, with a software-defined radio costing under $1000.

The capture chain:

1. SDR (HackRF, USRP B210, or BladeRF) tuned to a TMDS harmonic, typically in the 250 to 850 MHz range depending on resolution and pixel clock.
2. Wideband I/Q recording at 20 MS/s or more.
3. Pixel-clock recovery (the harmonic spacing tells you the pixel clock).
4. Frame alignment using HSYNC/VSYNC harmonics.
5. CNN-based deinterleaving to undo the 10b TMDS scrambling and reconstruct the luma channel.

Mitigations are physical. Ferrite chokes on the cable help by 10 to 20 dB. Shielded TEMPEST-rated cables (rare and expensive) help more. The fundamental problem is that the spec did not require shielded cables, so most consumer HDMI cables radiate.

#### Power side channel via HDMI

Recent work ("Exploiting HDMI and USB Ports for GPU Side-Channel Insights", 2024) shows a different angle. The HDMI port and the USB-C ports of a laptop or AIO desktop see voltage ripple correlated with GPU power draw. An attacker who can connect anything to those ports (a "charging dongle", a malicious display) can sample the voltage rail and recover GPU workload patterns. With a CNN classifier, you can fingerprint which website is being rendered, which video is playing, or which model is being inferred on the GPU.

This is not TEMPEST. This is conducted-emission analysis on the power return path. It needs physical contact, but no software access.

---

### <span class="accent-orange">Layer 5: HDMI as a Pivot</span>

Smart TVs run Linux or Android. Set-top boxes run Linux. AV receivers run real-time OSes with TCP/IP stacks. Most of them have:

- A CEC stack that parses untrusted frames.
- A DDC/EDID parser.
- A vendor IPC layer over CEC vendor opcodes.
- A wireless interface (Wi-Fi, Bluetooth) on the same SoC.

A successful CEC or EDID parser exploit on a TV gets you code execution on a device that is on the home Wi-Fi. From there you scan the LAN, dump credentials, exfiltrate over HDMI's HEC (HDMI Ethernet Channel) or via Wi-Fi. The HDMI-Walk paper specifically called out using a compromised HDMI device as a Wi-Fi handshake-capture node, since the TV is already authenticated to the home network.

This is not theoretical for high-value targets. Casinos, conference centers, and stadiums all have HDMI matrices behind their digital signage, often connected to their corporate VLANs through a single misconfigured switch. The HDMI port at the front of the room is the unauthenticated port.

---

### <span class="accent-orange">Consolidated Attack Class Table</span>

| Class | Vector | Primitive | Real CVEs / Cases | Required Access |
|---|---|---|---|---|
| CEC scanning | Pin 13 | Logical address poll | HDMI-Walk | Any HDMI port on chain |
| CEC eavesdropping | Pin 13 | Passive frame sniff | HDMI-Walk | Any HDMI port |
| CEC command injection | Pin 13 | `<User Control Pressed>`, `<Set OSD>`, `<Standby>` | HDMI-Walk, FIU 2021 | Any HDMI port |
| CEC DoS | Pin 13 | Malformed frames, opcode flood | HDMI-Walk | Any HDMI port |
| CEC parser RCE | Pin 13 | Length-field overflow in opcode handler | CVE-2017-9689, CVE-2017-9719, NCC Troopers '19 | Any HDMI port |
| Vendor opcode abuse | Pin 13 | Undocumented `0xA0-0xFF` per-vendor | Sony, Samsung firmware-specific | Any HDMI port + vendor knowledge |
| EDID parser corruption | Pins 15-16 | Malformed E-EDID extension blocks | CVE-2017-9722, CVE-2020-12888, NCC Group | Source-side or MITM dongle |
| SCDC abuse | Pins 15-16 | Rapid scrambler toggling | Vendor-specific TV reboots | Source-side |
| HDCP downgrade | TMDS + DDC | Force 2.2 to 1.4 fallback via fake repeater | Multiple commercial strippers | MITM device |
| HDCP key strip | TMDS | Master-key decryption of 1.x stream | Public since 2010 | MITM device |
| Deep-TEMPEST screen reconstruction | TMDS emissions | Wideband SDR + CNN | Larroca et al. 2024, Kaspersky writeup | RF receiver within ~5 m |
| GPU power side channel | Pin 18 + grounds | Voltage ripple analysis | arXiv 2410.02539 | Physical port contact |
| HDMI Ethernet Channel abuse | Pin 14 + 19 (HEC) | TCP/IP over HDMI | Underexplored | Plugged-in device |
| Pivot to LAN | CEC RCE -> Wi-Fi | TV as authenticated jump host | HDMI-Walk attack-facilitation class | CEC RCE first |
| Public-display abuse | Pin 13 | Inject signage content | FIU 2021 reporting | Walk up with HDMI dongle |
| Rogue HDMI implant | All pins | Custom dongle with MCU + radio | NSA ANT-style "RAGEMASTER" historical | Physical access once |

---

### <span class="accent-orange">Building a CEC Attack Tool, the Short Version</span>

You need a Pulse-Eight USB-CEC adapter (or a Raspberry Pi with `cec-utils`). On Linux:

```
sudo apt install cec-utils libcec-dev
echo "scan" | cec-client -s -d 1
```

This dumps every device, vendor, OSD name, power state, and physical address. To send a `<Standby>` from logical 1 to logical 0:

```
echo "tx 10:36" | cec-client -s -d 1
```

To inject an OSD message:

```
echo "tx 10:64:00:48:65:6c:6c:6f" | cec-client -s -d 1
```

That writes "Hello" to the TV's OSD with display-control byte `0x00` (default). For fuzzing, generate frames with random opcode bytes and random length fields and watch what crashes. `python-cec` makes this easy. Most consumer TVs will reveal at least one parser hang within an hour of dumb fuzzing.

---

### <span class="accent-orange">Building an EDID Attack Dongle, the Short Version</span>

Cheapest option: a Raspberry Pi 4 with the official "HDMI-as-input" hat, or a CYP CDPS-31SQ EDID emulator. Cleanest option: a custom board with an STM32G0 driving the DDC pins as I2C-slave, holding a 256-byte EDID in flash, and pulsing pin 19 to force re-read.

The malicious EDID needs:
- A valid header (`00 FF FF FF FF FF FF 00`).
- A bogus DTD with pixel clock fields engineered to overflow the source's allocation.
- Optionally, a vendor-specific data block declaring a length of 0xFF when only 4 bytes follow.

Most kernel parsers will at minimum log a stack trace. A subset will panic. A smaller subset will give you something more interesting.

---

### <span class="accent-orange">Defensive Reality Check</span>

The defenses that actually work:

1. **Disable CEC** on TVs and AV receivers if you do not use it. The setting is buried under names like "Anynet+", "Bravia Sync", "Simplink", "Viera Link". Disabling it eliminates the entire CEC attack surface.
2. **Treat public HDMI ports as hostile.** Conference rooms, signage, kiosks: any system there must assume an attacker has plugged in a malicious source.
3. **Shielded HDMI cables with ferrite chokes** for any system displaying sensitive content. They do not stop Deep-TEMPEST entirely but they push the required SNR up by 15 to 25 dB.
4. **Isolate signage and AV networks** from the corporate LAN. Most HDMI-pivot attacks die at this boundary.
5. **Patch your GPU drivers and compositors.** EDID parser CVEs get fixed regularly, but only if you update.
6. **Keep TV firmware updated.** Yes, this is funny. No, most people do not.

The defenses that look good but do not work:

- "We use HDCP" stops content recording, not CEC, not EDID, not TEMPEST.
- "We use a KVM" most KVMs pass CEC and DDC straight through.
- "It is just a video cable" you read this far, you know better.

---

### <span class="accent-orange">Closing</span>

HDMI is the most-deployed unauthenticated bus in modern computing. There is one in every laptop, every TV, every projector, every AV receiver, every conference room. The protocols on it were designed in an era where the threat model was "the cable is short and the room is friendly". Neither assumption holds.

Treat the port the way you would treat an unauthenticated USB port on a server. Anything that plugs in is hostile until proven otherwise. Anything that radiates from the cable is observable. Anything the parser touches has been fuzzed less than your TCP stack.

The attack surface is huge. The mitigations are simple. The audit work is mostly undone.

---

### <span class="accent-orange">References</span>

- Puche Rondon, Saltaformaggio et al. "HDMI-Walk: Attacking HDMI Distribution Networks via Consumer Electronic Control Protocol". 2019.
- NCC Group, "HDMI: Hacking Displays Made Interesting". Troopers '19.
- Larroca et al. "Deep-TEMPEST: Reconstructing HDMI Display Content from Electromagnetic Emissions". 2024.
- arXiv 2410.02539, "Exploiting HDMI and USB Ports for GPU Side-Channel Insights". 2024.
- Kuhn, M. "Compromising emanations of LCD TV sets". IEEE 2003 / 2013 update.
- FIU, "Cyberstalkers can hack into HDMI ports". 2021.
- CVE-2017-9689, CVE-2017-9719, CVE-2017-9722, CVE-2020-12888.
- HDMI 2.1 specification, sections on CEC, DDC, SCDC, HDCP 2.3.
