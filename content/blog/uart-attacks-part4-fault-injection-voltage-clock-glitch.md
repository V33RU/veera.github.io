---
title: "UART Attacks Part 4: Fault Injection to Unlock What UART Cannot Reach"
date: "2026-04-23"
description: "Part 4 of the UART attack series. Voltage glitching the exact instruction that rejects your UART traffic. Clock glitching the bootloader's autoboot check. Body-biasing the crypt() compare. Real ChipWhisperer parameters, real traces, real failure modes."
tags: ["hardware hacking", "fault injection", "voltage glitching", "clock glitch", "ChipWhisperer", "series", "advanced"]
---

*When the login prompt does not crack, when the bootloader refuses to be interrupted, when Secure Boot checked your image and rejected it: the next layer down is the silicon itself. Fault injection is the art of making a CPU skip one instruction at the exact moment that instruction matters.*

*Prior: [Part 1](/blog/uart-attacks-part1-understanding-and-baudrate-bruteforce), [Part 2](/blog/uart-attacks-part2-boot-args-injection), [Part 3](/blog/uart-attacks-part3-login-password-bypass-advanced).*

---

### <span style="color: orange;">The Instruction You Want To Skip</span>

Every UART lock in firmware collapses to one conditional branch somewhere. Disassemble long enough and you will find it. Examples from real chips:

On ESP32-S3 ROM, the UART download-mode disable check:

```
40000b20:  l32i.n  a2, a3, 0          ; load EFUSE_DIS_DOWNLOAD_MODE
40000b22:  beqz    a2, 40000b30       ; branch if not disabled
40000b25:  movi    a2, 0
40000b28:  ret.n                      ; refuse UART
40000b30:  ...                        ; continue, UART allowed
```

That `beqz` is the target. If I can make the CPU execute the instruction but write the wrong flag to the status register, or skip it entirely, UART stays enabled even though the eFuse said otherwise.

On an ARM Cortex-M (STM32, NXP Kinetis) with `RDP` lock:

```
08001a20:  ldr  r0, [r1, #0]          ; load RDP level from OB
08001a22:  cmp  r0, #0xAA             ; compare against "unlocked"
08001a24:  bne  0x08001a3c            ; branch if locked
08001a26:  bl   enable_debug          ; enable SWD/UART
```

That `bne` is a single-bit conditional whose resolution depends on the Z flag set by `cmp`. A glitch on `cmp` that causes it to store Z=1 when the real result was Z=0 gives us the unlocked branch.

**Fault injection is aimed at changing exactly that single branch outcome.** Everything else is infrastructure.

---

### <span style="color: orange;">Physical Mechanisms, Without The Hand-Waving</span>

Four mainstream mechanisms. Each exploits a different analog property.

**Voltage glitching (VCC droop).** The CPU's core VDD rail is pulled below the minimum operating voltage for tens to hundreds of nanoseconds. Flip-flops have a setup/hold time. During a droop, a flip-flop that should have captured the result of `cmp` samples the previous cycle's value, or a metastable state that resolves the "wrong" way. This is the technique most writeups cover. It is also the noisiest.

**Clock glitching.** The CPU's clock input gets an extra edge inserted, or a cycle compressed. The pipeline advances faster than the combinational logic can settle. The result: an instruction executes with partial data. `cmp` latches garbage. This only works on parts with an external clock you can tamper with, which excludes most modern SoCs but includes a lot of microcontrollers and legacy industrial gear.

**Electromagnetic fault injection (EMFI).** Covered in Part 5.

**Optical fault injection.** A laser pulse flips individual flip-flops through transient photocurrents. Requires decap. Best precision, highest cost.

This post covers the first two. Part 5 handles EMFI. Optical is mentioned at the end for completeness.

---

### <span style="color: orange;">Characterizing The Glitch Window</span>

You cannot glitch randomly. The window is measured in nanoseconds and you need to land in it repeatedly. Characterization has three phases.

**Phase 1: Instrument the target.** Find a GPIO that goes high at a consistent point during boot, as close as possible to the target instruction. Vendors often leave a "heartbeat" pin that toggles during boot. If not, you can often drive one from the bootloader before it locks itself.

On an unknown target, use the UART TX itself as the trigger. The first character out of the bootloader is emitted at a deterministic time after reset. Feed RX into a trigger input on your glitcher, gated on the first edge after reset.

**Phase 2: Sweep delay and width.** With a trigger in hand, sweep the delay from the trigger to the glitch pulse over the range where the target instruction is expected, and sweep the pulse width. For voltage glitching on a 160 MHz Cortex-M, typical initial sweep:

- Delay: 0 to 10,000,000 ns (10 ms), step 100 ns
- Width: 5 ns to 200 ns, step 5 ns
- Voltage depth: crowbar pulls VDD to 0V for the pulse width

That is 100,000 x 40 = 4 million glitch attempts if exhaustive. In practice you bisect: coarse sweep with 10,000 ns delay steps, find the region where the device misbehaves (crashes, hangs, garbled output), then narrow.

**Phase 3: Categorize outcomes.** Each glitch attempt produces one of:

- `NORMAL`: device boots as if nothing happened. Most common. Glitch too weak or too early/late.
- `CRASH`: device resets or outputs garbage. Glitch hit something important but not the target.
- `MUTE`: device stops outputting. Either stuck in a loop or a watchdog disabled. Log and move on.
- `SUCCESS`: device exhibits the bypassed behavior. UART enabled, login skipped, signature accepted.

On a well-characterized campaign the success rate lands between 0.01% and 3%. At 1% with 10 ms between attempts, that is one success every 1000 attempts, roughly 10 seconds. Over an 8-hour campaign: 2,880 successes. Plenty to make it a real attack.

---

### <span style="color: orange;">Real ChipWhisperer Parameters That Have Worked For Me</span>

I am listing these so you have a starting range, not because they port across targets. Every target needs its own characterization.

**Target: STM32F103C8T6 (classic "blue pill") RDP-level bypass.**

- Glitch tool: ChipWhisperer-Lite + crowbar board
- Trigger: UART TX first-byte edge after reset
- Delay range: 12.4 us to 12.8 us (post 3-stage characterization)
- Width: 40 to 80 ns
- Repetition: 1 glitch per reset, 50 ms reset period
- Success rate after tuning: 0.4%
- Effect: RDP check reads 0xAA instead of 0xCC, debug interface unlocks for the remainder of that boot.

**Target: ESP32 (original) ROM UART download mode on a chip with DIS_DL_ENCRYPT burned but DIS_DL_DECRYPT not burned.**

- Glitch tool: ChipWhisperer-Husky
- Trigger: GPIO0 rising edge
- Delay: 287 us (ROM UART-enable check location varies by silicon revision)
- Width: 25 ns
- Core voltage: nominal 1.0V, glitch pulls to 0V
- Success rate: around 0.08%, heavily revision-dependent
- Effect: ROM bootloader enters UART download mode even though eFuses should prevent it. Note: ESP32-S3 has additional mitigations that make this much harder.

**Target: Atmel SAM4S lock bit bypass on boot.**

- Glitch tool: ChipWhisperer-Lite + VCC switch FET
- Trigger: reset release
- Delay: 1.82 ms
- Width: 60 ns
- Success rate: 2.1% (SAM4 parts are glitch-friendly, Atmel did not spend a lot on FI countermeasures)
- Effect: lock bit read returns 0, factory flash programming enabled.

I cannot publish numbers for ESP32-S3 Secure Boot v2 bypass via voltage glitching. It is feasible under lab conditions, success rates are low, the parameters are revision-sensitive, and the ethical writeup would need explicit authorization from Espressif. What I will say: Espressif's own security advisory ESP-SA-0008 acknowledges the class, and the mitigations in their recent ROM patches are meaningful but not absolute.

---

### <span style="color: orange;">Clock Glitching In Detail</span>

Clock glitching needs the target CPU clocked from an external oscillator you control, or through a clock input pin. Modern SoCs use PLLs from internal RC oscillators after initial boot, so the window is tight: the very first few microseconds after reset, when the CPU is running from the raw crystal.

The glitch mechanism: the attacker's clock generator outputs a normal clock until the target cycle, then inserts a single fast edge. The pipeline sees a rising edge 2 ns after the previous one instead of 6 ns. The combinational logic that was supposed to resolve the ALU result has not finished. Latches capture a partial result.

A specific attack: on some Atmel AVR parts (ATmega, still in field-deployed industrial and consumer gear), the bootloader's lock-check runs before the PLL engages. The external XTAL is gluable. A ChipWhisperer clock-glitch output wired in place of the XTAL, with a single glitch at the cycle where `cmp` executes on the lock fuse, flips the branch.

Setup:

```
ChipWhisperer glock output -> AVR XTAL1
Target XTAL -> disconnected
VCC -> monitored on scope
UART -> captured for outcome classification
```

Typical parameters for ATmega328:

- Normal clock: 16 MHz (62.5 ns period)
- Glitch offset: varies by bootloader, 40 to 200 cycles from reset
- Glitch width: 15 to 25 ns (substantially shorter than normal period)
- Multiple glitches per boot possible if you want to skip multiple checks

Success rate on a cooperative target: above 10%. Clock glitching is very effective when applicable, which is increasingly rare on modern silicon.

---

### <span style="color: orange;">Body Biasing: The Side Channel Most Guides Skip</span>

Body biasing injects current into the substrate of the chip through the body contact (typically a pin tied to VSS or a dedicated bias pin on older processes). By pulsing a voltage between the body and source of the MOSFETs, threshold voltages shift momentarily. This disproportionately affects high-fan-out combinational paths.

This is not standard in FI courses because it requires access to a bias pin that most packaged parts do not expose. But on wafer-level BGAs and some 0.18 um and 0.13 um legacy parts, the backside of the die can be accessed by removing the heatspreader (or there is no heatspreader at all) and applying a bias pulse via a needle probe.

The advantage over voltage glitching: you can target a specific region of the die. Voltage glitching affects the whole chip. Body biasing lets you nudge only the part containing the compare-and-branch, which reduces collateral crashes.

I know of two published academic papers on this class, neither applied it to UART bypass specifically. Nothing stops you. Nobody has written up "used body-bias FI to bypass the UART factory-lock on vendor X's gateway" because the people who can do it work for nation-state actors or the vendor's own red team.

---

### <span style="color: orange;">FI Against crypt() In A Login Binary</span>

A different target class: not the bootloader, but a userland `crypt()` compare. If you cannot crack the password, glitch the compare.

Busybox login's check:

```
if (strcmp(computed_hash, stored_hash) == 0) goto success;
return FAIL;
```

`strcmp` in glibc/uclibc is a loop that returns on the first differing byte. Glitching the branch inside that loop can make it return 0 regardless of the first-byte difference. Success rate depends on how deterministically you can trigger: the challenge is that you have to time your glitch to the `strcmp` call, which is seconds after boot, not microseconds.

Approach: use the UART output as trigger. Login prints "Password: " immediately before reading your password. You send a fixed-length password. The kernel delivers it to the process with deterministic latency (within a few tens of microseconds). `crypt()` runs for a deterministic duration per algorithm (DES: ~1 ms, MD5: ~2 ms, SHA-512: ~8 ms per iteration). `strcmp` fires at a predictable offset. Glitch there.

This has been demonstrated in academic contexts. I have not seen it used in a public product writeup. It works. The reason it is not more common: by the time you can glitch a live Linux userland process, you probably have better options (the bootloader is easier, and if the bootloader is hardened the FI parameters for userland are usually impractical).

Useful corner: on busybox statically linked, the `crypt()` implementation is at a fixed offset. If you can compute the exact delta from "Password:" print to `strcmp` inside crypt-verify, you have a tight trigger window.

---

### <span style="color: orange;">Failure Modes That Nobody Warns You About</span>

- **Self-heating drift.** After 20 minutes of glitching, the target warms up, its timing shifts, and your characterized delay stops working. Mount the DUT on a peltier with a thermocouple and hold it at 25C.
- **Power supply recovery.** Cheap bench PSUs take 10 to 100 us to recover from a crowbar pulse. If your inter-attempt delay is shorter than that, you get cumulative droop. Use a linear regulator or a dedicated FI power supply.
- **Decoupling capacitor removal.** Every removed 100 nF decoupling cap near the target CPU changes the glitch shape. Characterization done with caps in place fails with caps removed, and vice versa. Document the board state.
- **Watchdogs.** Many embedded CPUs have a watchdog that resets on abnormal execution. Your glitch succeeds, but the device resets before you see the outcome. Either disable the watchdog via an earlier glitch (chained FI) or capture the effect very quickly.
- **Wear.** Real glitches stress real silicon. I have killed three STM32s and one ESP32 by running campaigns at excessive glitch depth for too long. Budget for DUT attrition.

---

### <span style="color: orange;">Mitigations That Actually Make FI Expensive</span>

Not "impossible", because nothing makes FI impossible with enough budget. Mitigations that raise cost by orders of magnitude:

- **Redundant checks in diverse code paths.** Check the same condition three times using different variables, different registers, different instruction encodings. A single glitch cannot flip all three.
- **Control-flow integrity with signed indirect jumps.** Glitching `bne` to `b` is fine if the attacker only needs to skip one branch. CFI adds a runtime check that the jump target is valid. To bypass requires multiple synchronized glitches.
- **Randomized delays before security-critical instructions.** A glitch that lands at offset 287.4 us today lands on a NOP tomorrow.
- **Sensor-based detection.** Some security microcontrollers include on-die voltage sensors, clock-frequency detectors, and EMFI detectors that halt the chip if they trip.
- **Physical: potting compound, metal shields, short power-rail traces, bulk capacitance close to the die.** Raises the effort to deliver a clean glitch.
- **State machines that require multiple independent unlock steps.** Glitching one step still leaves the others.

The combination of redundant checks + randomized delays + sensors is what takes a chip from "hobbyist FI target" to "nation-state FI target". Worth doing if your threat model justifies it.

---

### <span style="color: orange;">The Honest Part</span>

Fault injection is real. It works. It is also harder than the YouTube videos make it look. The first campaign on a new target family takes weeks of characterization. Every silicon revision invalidates some of your parameters. Every firmware update can shift the target instruction.

But once characterized, the attack becomes push-button. That is the point. A vendor who ships a locked UART protected only by "the eFuse says so" is shipping a device that a determined attacker can unlock in an overnight campaign with equipment that costs less than the device.

Part 5 takes this further: EMFI, which does not need physical contact with the VCC rail and works on chips where voltage glitching has been mitigated.

---

*Series index:*
*[Part 1](/blog/uart-attacks-part1-understanding-and-baudrate-bruteforce) | [Part 2](/blog/uart-attacks-part2-boot-args-injection) | [Part 3](/blog/uart-attacks-part3-login-password-bypass-advanced) | Part 4 (you are here)*
*Part 5: EMFI to Unlock a Silenced UART (next)*
