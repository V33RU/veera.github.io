---
title: "Dumping Firmware with Bus Pirate v3.6 via SPI"
date: "2017-07-06"
tags: ["hardware", "firmware-extraction", "spi", "bus-pirate", "reverse-engineering", "router"]
---

This is a hands-on walkthrough of extracting firmware from a **Binatone DT 850W** ADSL router using the Bus Pirate v3.6 over SPI. The same technique applies to most consumer routers, IP cameras, and IoT devices that store firmware in external SPI NOR flash.

## Target Device: Binatone DT 850W

A budget ADSL router that ships to millions of homes. Like most consumer devices, its firmware lives in an external SPI flash chip soldered onto the main PCB — fully readable without any special lab equipment.

![Binatone DT 850W](/blog/spi-dumping/spi-connection-setup.jpg)

*The target device — an unmodified retail unit straight off the shelf.*

## Required Hardware

- **Bus Pirate v3.6** — SPI interface to your computer over USB
- **SOIC8 clip** — attaches directly to the flash chip without desoldering
- **Rainbow ribbon cable** — connects the clip to the Bus Pirate header

![Bus Pirate and SOIC8 clip](/blog/spi-dumping/buspirate-and-tools.png)

*The two tools you need: Bus Pirate on the left, SOIC8 IC clip on the right.*

## Step 1: Open the Router and Map the PCB

Remove the screws and expose the main board. Three components matter here:

![Router PCB internals](/blog/spi-dumping/spi-target-chip.jpg)

*Red boxes mark the EEPROM (top left), Realtek SoC (center), and the SPI flash (bottom center). The 8-pin SOIC package near the CPU is the target.*

## Step 2: Identify the Flash Chip

On this board the chip is a **Winbond W25Q16.V** — 16Mbit (2MB) SPI NOR flash. Look up the datasheet to confirm its pinout before wiring anything:

![Winbond W25Q16BV pinout diagram](/blog/spi-dumping/terminal-config.png)

*SOIC8 package pin assignments from the official Winbond datasheet. Pin 1 (/CS) has the dot marker; pins go counter-clockwise.*

Key connections:

| Pin | Name | Bus Pirate |
|-----|------|-----------|
| 1 | /CS | CS |
| 2 | DO | MISO |
| 4 | GND | GND |
| 5 | DI | MOSI |
| 6 | SCLK | CLK |
| 7 | /HOLD | Pull HIGH |
| 8 | VCC | 3.3V |

## Step 3: Bus Pirate Pin Colours

The v3.6 ribbon cable uses a fixed colour scheme. Match each wire to its function before connecting:

![Bus Pirate colour-coded pin guide](/blog/spi-dumping/chip-identification.png)

*Pin colour reference (left) alongside the Bus Pirate with rainbow cable seated in the header (right).*

## Step 4: Wiring

Connect Bus Pirate to flash chip using the diagram below:

![Wiring map Bus Pirate to SPI flash](/blog/spi-dumping/bus-pirate-spi-mode.png)

*Exact mapping — GND→pin 4, 3V3→pin 8, CLK→pin 6, MOSI→pin 5, CS→pin 1, MISO→pin 2.*

## Step 5: Attach the SOIC8 Clip

Use the breakout adapter to get stable connections to each pin:

![SOIC8 breakout adapter board](/blog/spi-dumping/flash-chip-closeup.png)

*The adapter converts the tight SOIC8 footprint to through-hole pads — much easier to clip onto.*

Then attach a hook clip to each pad:

![Hook clips on adapter pads](/blog/spi-dumping/spi-probe-connection.jpg)

*One clip per line — orange, green, yellow for data; white and black for power and ground.*

## Step 6: Full Setup

Clip onto the flash chip and plug the Bus Pirate into USB. The router stays **powered off** throughout — the Bus Pirate feeds 3.3V directly to the chip:

![Complete hardware setup](/blog/spi-dumping/dump-in-progress.jpg)

*Router opened flat, SOIC8 clip on flash chip, Bus Pirate connected via USB. PWR LED on the Bus Pirate confirms the supply rail is active.*

## Step 7: Detect the Chip

Install flashrom and run a probe first to confirm communication before reading:

```bash
sudo apt install flashrom
sudo flashrom -p buspirate_spi:dev=/dev/ttyUSB0
```

![Flashrom probe output](/blog/spi-dumping/read-data-output.png)

*Flashrom identifies the W25Q16.V (2048 kB). The speed warning is expected on firmware 6.1 — upgrade to 6.2 to remove the 2 MHz cap.*

Expected output:
```
Found Winbond flash chip "W25Q16.V" (2048 kB, SPI) on buspirate_spi.
```

## Step 8: Read the Firmware

Specify the chip model explicitly and write to a file:

```bash
sudo flashrom -p buspirate_spi:dev=/dev/ttyUSB0,spispeed=1M \
  -c W25Q16.V \
  -r W25Q16.V.eeprom
```

![Flashrom read complete](/blog/spi-dumping/dumped-firmware-file.png)

*"Reading flash... done." — the full 2MB image is saved to disk. At 1MHz this takes 2–3 minutes.*

## Step 9: Verify and Analyse

```bash
# Confirm file size (should be 2097152 bytes for W25Q16.V)
ls -lh W25Q16.V.eeprom

# Scan for embedded components
binwalk W25Q16.V.eeprom

# Extract filesystems, kernel, bootloader
binwalk -e W25Q16.V.eeprom

# Hunt for hardcoded credentials
strings W25Q16.V.eeprom | grep -i "password\|admin\|root"
```

Typical contents of a router firmware image:
- **U-Boot** bootloader at offset 0x0
- **Linux uImage** kernel
- **SquashFS or JFFS2** root filesystem
- Config files with default credentials

## Troubleshooting

**"No EEPROM/flash device found"**
- Check every wire connection with a multimeter
- Confirm MISO and MOSI are not swapped
- Drop speed to `spispeed=256k` and retry

**Dump differs between runs**
- The clip is not seated firmly — press it down and retry
- Ensure the router is fully powered off (no bus contention)
- Compare hashes: `sha256sum W25Q16.V.eeprom`

**Speed warning from flashrom**
- Normal on Bus Pirate firmware 6.1 — update to 6.2 or accept 2 MHz

---

*Testing performed on a personally owned device. Always obtain authorisation before extracting firmware from hardware you do not own.*
