---
title: "UART Attacks Part 5: EMFI to Unlock a UART That Was Never Supposed to Speak"
date: "2026-04-24"
description: "Part 5, the final part of the UART attack series. Electromagnetic fault injection against locked UART peripherals. Coil design math, pulse shaping, probe positioning over the die, ROM-window timing, and the mitigation lattice that makes EMFI expensive."
tags: ["hardware hacking", "EMFI", "electromagnetic fault injection", "UART", "side channel", "series", "advanced"]
---

*A UART disabled in silicon is not the end of the story. The die is still there. The transistors that would have driven the UART peripheral are still wired to their pads. A short, sharp magnetic pulse above the right region of the die can flip a flag, skip a check, and wake the peripheral that the eFuse said was dead.*

*Prior: [Part 1](/blog/uart-attacks-part1-understanding-and-baudrate-bruteforce), [Part 2](/blog/uart-attacks-part2-boot-args-injection), [Part 3](/blog/uart-attacks-part3-login-password-bypass-advanced), [Part 4](/blog/uart-attacks-part4-fault-injection-voltage-clock-glitch).*

---

### <span style="color: orange;">Why EMFI When Voltage Glitching Exists</span>

Voltage glitching affects the entire die. Every flip-flop sees the droop. That is why it has high collateral damage: crashes, resets, memory corruption. Modern SoCs include supply-noise detectors that halt the CPU on detected VCC transients, which neutralizes voltage glitching entirely.

EMFI changes two things:

1. **Locality.** A 1 mm coil at 1 mm standoff produces a strong field over a region smaller than a single IP block. Target the UART enable logic, leave the rest of the chip alone.
2. **No supply tampering.** VCC stays nominal. Supply-noise detectors do not trip. The fault is induced by transient eddy currents in the power rails and in signal traces near the coil.

The cost: harder to set up, harder to characterize, harder to reproduce. But against chips that have "voltage glitching mitigated" in the marketing, EMFI is often the opening.

---

### <span style="color: orange;">The Physics, Compressed</span>

A capacitor charged to V discharges through a small air-core coil. `V = L * di/dt`. For a 10 uH coil discharging 400 V, `di/dt` is on the order of 40 A/us. The resulting magnetic field at the coil face is given by `B ≈ μ0 * N * I / (2 * r)`, reaching 0.5 to 2 Tesla at the surface of a well-designed FI coil for the few nanoseconds the pulse lasts.

Inside the die, that changing B-field induces eddy currents in the power rails (they are the largest conductors in reach) and in individual signal lines. A flip-flop whose D-input trace runs perpendicular to the field sees an induced EMF. For a 1 um metal trace 100 um long under a 1 T/us dB/dt, the induced voltage is on the order of 100 mV. That is enough to tip a latch capturing a 1.2 V signal into the wrong state **if timing is aligned**.

The "if timing is aligned" is everything. You must fire the pulse at the clock edge where that specific flip-flop is latching the result of the specific conditional you want to flip.

---

### <span style="color: orange;">Coil Design You Can Actually Build</span>

The canonical EMFI coil for IC-level work:

- Enameled copper wire, AWG 32 (0.2 mm)
- Wound around a ferrite core 0.5 mm diameter (for focusing) or air core (for speed)
- 5 to 15 turns, depending on target
- Total inductance: 1 to 10 uH
- Coil outer diameter: 1 to 3 mm
- Standoff from die: 0.3 to 2 mm

The trade: ferrite core focuses the field (better locality) but saturates and slows edge rate. Air core is faster but spreads the field over a larger area. For initial characterization use air core. For refined targeting switch to ferrite.

Driver stage:

- Storage cap: 1 uF, 500 V rated ceramic or MLCC
- Switch: high-voltage MOSFET (IRFP460 class) or a purpose-built avalanche transistor
- Gate driver: dedicated HV driver, sub-5-ns rise time
- Decoupling: minimal, you want fast edges

Commercial options: Riscure's EM-FI Transient Probe, NewAE PicoEMP, NewAE ChipSHOUTER. The PicoEMP at around 500 USD is the realistic entry point for independent researchers. ChipSHOUTER at 5000+ USD is the lab-grade option.

DIY is viable but dangerous: 400 V rails, fast edges, and RF emissions. Build it in a metal box, wear eye protection, know what a defibrillator-class capacitor feels like and avoid the experience.

---

### <span style="color: orange;">Locating The Target Region On The Die</span>

EMFI needs you above the correct square millimeter of die. On a BGA package with no heatspreader you can usually aim through the substrate from the top, though field strength drops with distance. On a QFN or QFP you aim at the top surface. On packages with a metal lid you must decap (chemical or mechanical).

Two methods for finding the target region:

**Method 1: Die photo from decap.**
If you are willing to destroy a sample, decap with fuming nitric acid (or ship it to a decap lab). Photograph the die at 50x. Compare the floorplan against the known SoC die shot (many vendors publish approximate floorplans, and decap fans post photos on siliconpr0n.org). Locate the UART peripheral. Its X,Y coordinates on the die map to a physical position on the sealed package you can target without decap on a subsequent sample.

**Method 2: Spatial scan with a non-destructive probe.**
Mount the target on an XY stage. Boot it into a known state. Fire a weak EMFI pulse at a grid of positions with a fixed pulse width and voltage. At each position, classify the outcome (NORMAL / CRASH / MUTE / SUCCESS, same as Part 4). Build a heatmap. The region where CRASH rate peaks is usually the CPU core. Regions where a specific flag flips without full crash are the peripheral enable registers you want.

A 10 mm x 10 mm scan at 0.2 mm step with 100 attempts per position = 250,000 attempts. At 200 ms per attempt, 14 hours. Overnight campaign.

---

### <span style="color: orange;">The ROM Window: Where UART Lock Is Decided</span>

The crucial timing fact for UART bypass: the decision "should this UART peripheral be enabled" is usually made during mask-ROM execution, within the first few hundred microseconds of reset. The relevant sequence:

1. Reset release (t = 0).
2. Mask ROM begins executing from a fixed reset vector.
3. Mask ROM reads eFuses into an internal register bank (typically at t = 10 us to 100 us).
4. Mask ROM checks the "UART download disable" or "boot console disable" eFuse bit.
5. If not disabled, ROM configures the UART pads and enters download mode.
6. If disabled, ROM skips the UART setup and proceeds directly to second-stage boot from flash.

Step 4 is the target. Between the eFuse load (step 3) and the conditional branch (step 4), there is a window of nanoseconds where the eFuse value sits in a register. Glitching that register's subsequent read, or the branch instruction itself, makes the ROM take the "not disabled" path.

Characterizing that window on a new target:

1. Wire a very fast trigger to the reset-release edge.
2. Sweep EMFI pulse offset from 0 to 1 ms in 100 ns steps.
3. Use a weak pulse and multiple repeats to avoid damaging the chip.
4. Classify outcomes. The interesting region is usually 20 to 300 us post-reset.

For an ESP32-S3 class chip, published ROM analyses put the relevant check around 40 to 80 us post-reset depending on eFuse block, flash presence, and strapping. I am not giving precise numbers for S3 because I do not have authorization to publish a practical bypass.

---

### <span style="color: orange;">Pulse Shaping: What Actually Flips A Flop</span>

Not every pulse produces a usable fault. Shape parameters that matter:

- **Rise time.** Sub-5-ns edges are required for deep fault injection on modern (sub-100 nm) silicon. Slow edges (50 ns+) produce heating but not logic upsets.
- **Pulse width.** For single-edge upsets, 10 to 50 ns is typical. Wider pulses start to affect multiple clock cycles and produce resets instead of clean flips.
- **Polarity.** The coil produces a dipole. Reversing current direction changes which flip-flops are affected. Always try both polarities in characterization.
- **Standoff.** Field strength at the die scales roughly as 1/r^3 for a coil. Halving standoff gives 8x field. But below 0.3 mm you risk physically touching the package and injecting corona discharge into the pads, which is a different (less useful) fault.

Sample parameters that have worked (SAM4L devkit, decap'd, top-side EMFI):

- Coil: 1.2 mm OD air core, 8 turns AWG 32
- Driver: PicoEMP at 420 V
- Width: 22 ns
- Standoff: 0.6 mm
- Position: approximately over the internal SRAM region, 1.4 mm offset from package pin 1
- Effect: factory-lock check failed open approximately 0.08% of attempts

Every target needs its own numbers. Do not copy these and expect them to work on a different part.

---

### <span style="color: orange;">Chaining EMFI With UART Wake-Up</span>

The attack sequence for a locked UART:

1. Device reset with UART RX line pre-armed (attacker already listening).
2. Reset-release trigger fires EMFI campaign loop.
3. On each attempt: fire pulse at target offset; wait 2 ms; check UART for ROM download-mode banner.
4. If banner appears: attack succeeded. ROM is accepting UART commands despite eFuse lockout.
5. Upload a custom second-stage via the ROM's UART download protocol.
6. Custom second-stage exposes a full UART shell regardless of higher-level eFuses.

The ROM typically exposes a documented UART protocol for download mode (Espressif's is well-documented, Nordic's and NXP's for certain chips too). Once you are in ROM download mode, you have full memory read/write before any eFuse-enforced flash encryption engages in some stacks, or at least full control over what gets executed next.

Combined with Part 4's voltage glitching: use voltage glitching to fail one check, EMFI to fail the follow-up check that was added as a mitigation. Multi-glitch campaigns are the state of the art for attacking layered defenses.

---

### <span style="color: orange;">What The Vendor Cannot Fix With Firmware Alone</span>

Mitigations for EMFI that are actually effective:

- **Active mesh over the die.** A serpentine metal trace in the topmost metal layer carries a continuously-monitored signal. Any mesh break or severe eddy disturbance trips a hardware kill signal. Present on smart card chips, rare on consumer SoCs.
- **On-die magnetic field sensors.** Some automotive-grade and smart card-grade parts include this. Pulsed fields above threshold trigger a lock.
- **Redundant state machines with voting logic.** Three independent copies of the lock check, vote 2-of-3. A single EMFI pulse affects one copy. Requires that the copies are physically separated on the die so the coil field cannot hit all three.
- **Clock jitter.** If the clock has randomized sub-cycle jitter, a timed pulse lands at different phase offsets each attempt, reducing reproducibility. Not a cure, but a cost multiplier.
- **Per-instance secrets.** Even if EMFI unlocks one device's UART, the attacker gets that device's secrets only. No horizontal movement across fleet. Keep this in mind when reasoning about the economics.
- **Package-level: potting, metal shields grounded to VSS.** Good potting compound attenuates the field. Metal shields divert it. Neither is absolute but both raise effort substantially.

Firmware alone cannot stop EMFI. Anyone selling "EMFI mitigation firmware patch" is selling cope. The defense is silicon and package.

---

### <span style="color: orange;">Ethics, Authorization, Reality</span>

I will not publish end-to-end EMFI bypass parameters for any specific currently-shipping consumer device. Not because they do not exist in my notes but because publishing them directly enables harm against devices deployed in hospitals and utilities. The techniques are already known to the security research community. The parameters shift per chip revision anyway.

What is in scope for public discussion:

- The class of attack and its physics (this post).
- Mitigations that vendors should implement (the section above).
- Historical bypasses that are already patched or against EOL silicon.
- Authorized research against vendor-provided evaluation samples.

What is out of scope:

- Turnkey parameters for currently shipping critical-infrastructure devices.
- Automated tools packaged for non-authorized use.

If you want to do this work: pick a vendor, contact their PSIRT, sign an NDA, get evaluation samples. Most silicon vendors will engage with serious researchers. The ones that will not are the same ones whose products end up in the news for different reasons.

---

### <span style="color: orange;">Closing The Series</span>

Five parts. One attack surface. Every layer a little harder than the last.

- Part 1: baud brute force and pad finding. Anyone with a multimeter.
- Part 2: U-Boot arg injection. Anyone who knows what init= means.
- Part 3: login bypass techniques nobody documents. Requires reading the vendor's binaries.
- Part 4: voltage and clock glitching. Requires a ChipWhisperer and a week of characterization.
- Part 5: EMFI. Requires a pulse generator, a die map, and patience.

What should be obvious by the end: UART is a single-point-of-failure attack surface that most devices do not defend in depth. The defense in depth that works is the combination of:

- UART physically not populated on production boards, or routed to a test point that requires destructive access.
- Secure Boot end-to-end including signed bootloader with no user-controllable kernel command line.
- Redundant security checks at the silicon level.
- Per-device keys so compromising one device does not compromise the fleet.
- Active on-die countermeasures for FI on devices where the threat model includes it.

Anything less is theater. Most devices ship with less.

The walking dead of IoT keeps walking because the economics never forced the fix. That will stay true until liability lands on the vendor who shipped the fleet. I have written about this elsewhere; it applies here too.

Thank you for reading the series. The next research track I am writing up is flash encryption key provisioning pitfalls, then a tooling post on what goes into ICEBite's UART discovery module.

---

*Series index:*
*[Part 1](/blog/uart-attacks-part1-understanding-and-baudrate-bruteforce) | [Part 2](/blog/uart-attacks-part2-boot-args-injection) | [Part 3](/blog/uart-attacks-part3-login-password-bypass-advanced) | [Part 4](/blog/uart-attacks-part4-fault-injection-voltage-clock-glitch) | Part 5 (you are here)*

*All research conducted on personally-owned devices and vendor-provided evaluation samples under authorized engagements. Do not apply these techniques to devices you do not own or do not have explicit permission to test.*
