---
title: "UART: The First Door Into Any Embedded Device"
date: "2025-08-20"
tags: ["hardware", "uart", "reversing"]
description: "Why UART remains the most common entry point for hardware hackers and how to find it on any PCB."
---

## Why UART Still Matters

In 2025, UART remains the single most overlooked attack surface in embedded devices. Manufacturers leave debug interfaces exposed, and most don't even bother disabling the root shell.

### Finding UART Pins

Look for:
- **4 pins in a row** (TX, RX, GND, VCC)
- **Test pads** labeled TP1, TP2, etc.
- **Unpopulated headers** on the PCB

Tools you'll need:
- Logic analyzer or oscilloscope
- USB-to-UART adapter (FTDI, CP2102)
- JTAGulator (for automated pin identification)

```bash
$ screen /dev/ttyUSB0 115200
# Welcome to BusyBox
/ # id
uid=0(root) gid=0(root)
```

### From UART to Full Compromise

Once you have a root shell, the possibilities are endless:
- Dump the firmware (`dd if=/dev/mtd0 of=/tmp/fw.bin`)
- Extract credentials from config files
- Pivot into the internal network

**Always check UART first. It's the front door that most people forget to lock.**
