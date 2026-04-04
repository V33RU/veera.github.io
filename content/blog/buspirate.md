---
title: "Buspirate v3.6 firmware upgrade from USB"
date: "2021-06-19"
description: "The Bus Pirate v3.6a, designed by Ian Lesnet, is an invaluable troubleshooting tool that enables communication between a PC and any embedded device over a variety of protocols including 1-wire, 2-wire, 3-wire, UART, I2C, SPI, and HD44780 LCD, supporting voltages from 0 to 5.5VDC. This versatile product significantly reduces the early prototyping effort required when working with new or unknown chips."
tags: ["buspirate", "firmware upgrade"]
---

<h3 style="color: orange;">Upgrading Firmware:</h3>

> The Bus Pirate often ships without the latest firmware, requiring users to manually update it.

- **Bus Pirate v4:** Supports firmware version 7.
- **Bus Pirate v3.x:** Supports firmware versions 6 and 7.
  - **Note:** Firmware version 7 may potentially damage the device hardware, as it has not been fully tested. Use this version at your own risk.

<h3 style="color: orange;">Requirements:</h3>

- **Bus Pirate firmware and loader:** Available at [DangerousPrototypes GitHub](https://github.com/DangerousPrototypes/Bus_Pirate/tree/master/BPv3-bootloader).
- **ICSP Pins:** Focus on connecting the **"PGD"** and **"PGC"** pins for firmware loading. When in bootloader mode, the MODE LED of the Bus Pirate remains lit. Connect the **"PGD"** and **"PGC"** pins using a jumper cable as shown below:

<p align="center">
  <img src="/blog/firmware0-update-bp/2.webp" alt="ICSP Pin Connection" width="500" height="300">
</p>

<p align="center">
  <img src="/blog/firmware0-update-bp/3.webp" alt="Bus Pirate in Bootloader Mode" width="500" height="300">
</p>


<h3 style="color: orange;">Firmware Upgrade Procedure:</h3>


1. Clone the Bus Pirate repository from GitHub:

   ```bash
   git clone https://github.com/DangerousPrototypes/Bus_Pirate/
   cd Bus_Pirate/
   ```

2. Navigate to the bootloader folder:
    ```bash
    cd BPv3-bootloader/pirate-loader/
    ```
  <p align="center"> <img src="/blog/firmware0-update-bp/5.png" alt="Running the Pirate Loader Command" width="500" height="300"> </p>


<h3 style="color: orange;">Known Issues:</h3>

Firmware compilation may encounter errors. Ensure you are using the correct firmware version. For troubleshooting and solutions, visit the [Dangerous Prototypes Forum.](http://dangerousprototypes.com/forum/index.php?topic=6097.0#p56816)


<h3 style="color: orange;">References:</h3>

Official Bus Pirate repository: GitHub - [BusPirate](https://github.com/BusPirate/Bus_Pirate)
