---
title: "Flipperzero: TUGH? - Part 2 - Setup Guide"
date: "2024-10-31"
description: "This blog contains information like , how to setup flipperzero for your redteaming/security testing purpose"
tags: ["flipperzero", "hardware hacking", "security tools"]
---

### <span style="color: orange;">Introduction</span>

Previous blog expalins about what is flipperzero and supported hardware modules,firmwares. In this blog mostly covers practical scenarios.

### <span style="color: orange;">Setup</span>


When loading custom firmware on your Flipper Zero, it's essential to use qFlipper or a compatible browser for a smooth process. Make sure to select firmware that meets your specific needs, as firmware can vary widely in features and stability.

Personally, I prefer Momentum firmware due to its strong support and reliable updates. Compared to other options, Momentum firmware stands out for its stability, which ensures a more seamless experience.

#### <span style="color: orange;">Flipper Zero Firmware Comparison:</span>

| Feature | Official Firmware (OFW) | Unleashed | RogueMaster | Xtreme | Momentum |
|---------|-------------------------|-----------|-------------|--------|----------|
| **Stability of work**                       | +   | +         | +           | +      | +        |
| **Regional restrictions disabled**          | -   | +         | +           | +      | +        |
| **Easy spoofing for Name, MAC, and Serial**| -   | +         | +           | +      | +        |
| **Rolling Code Support**                    | -   | +         | +           | +      | +        |
| **BLE Spam**                                | -   | +         | +           | +      | +        |
| **Bad USB**                                 | +   | +         | +           | +      | +        |
| **Bad BT**                                  | -   | +         | +           | +      | +        |
| **Subdriving for saving coordinates for Sub-GHz** | - | -     | +           | +      | +        |
| **RGB Backlight**                           | +   | +         | +           | +      | +        |
| **Advanced Security measures**              | -   | -         | +           | +      | +        |
| **Interface customization**                  | -   | -         | +           | +      | +        |
| **Management App for easy configuration**   | -   | -         | +           | +      | +        |
| **Asset Packs**                             | -   | +         | +           | +      | +        |


#### <span style="color: orange;">Requirements:</span>

As i am linux user my requirements as follows
For setting up Flipper Zero on Linux, here's a checklist tailored to your needs:

| Requirement                     | Description                                                                                                            | Link            |
|---------------------------------|------------------------------------------------------------------------------------------------------------------------|----------------|
| **USB Cable**                   | Ensure it supports both data read and write capabilities.                                                              | [Link](https://amzn.to/3Uyib1T)       |
| **Flipper Zero Device**         | Have the device ready and powered.                                                                                     | [Link](https://amzn.to/3YLqJVO)       |
| **qFlipper Desktop (AppImage)**| Download the latest version of the AppImage for Linux from the Flipper Zero website.                                  | [Link](https://flipperzero.one/downloads)       |
| **Firmware File**               | Download the specific firmware file you want to install (e.g., Momentum firmware) and verify it's compatible with your device. | [Link](https://momentum-fw.dev/)       |


> **Note:** If your browser supports direct firmware loading, you can use it instead of qFlipper. Check the list below for supported browser versions. Refer to the screenshot for guidance.

![](/blog/flipper-zero/part-2/browser.png)

If not , you will get an error like below, Supported browsers list "https://momentum-fw.dev/update/"
![](/blog/flipper-zero/part-2/unsupported.png)

Easy peasy process without any hassle , simply download qFlipper and download firmware and load into it.

![](/blog/flipper-zero/part-2/1.webp)

- Firmware supposed to be download from github :
- Open the latest release page
![](/blog/flipper-zero/part-2/firmware-release.png)

- (Desktop) Make sure qFlipper is opened as "sudo"
![](/blog/flipper-zero/part-2/qFlipper.png)
- (Desktop) Click Connect and select your Flipper from the list
- (Desktop) Click Install and wait for the update to complete
![](/blog/flipper-zero/part-2/update.png)

### <span style="color: orange;">I have additional hardware information of what i use</span>

#### <span style="color: orange;">WiFi Devboard for Flipper Zero</span>

The developer board with Wi-Fi connectivity made specially for Flipper Zero. Based on the ESP32-S2 module, this devboard allows:

  - Wireless Flipper Zero firmware update
  - Advanced in-circuit debugging via USB or Wi-Fi using the Black Magic Probe open source project

As a bonus, ESP32-S2 allows Wi-Fi penetration testing (PMKID capturing, deauth, and more) and connects Flipper Zero to the Internet. These functions are not supplied with the module and must be implemented additionally.


![](/blog/flipper-zero/part-2/fpr-wifiboard.jpg)

#### <span style="color: orange;">Video Game Module for Flipper Zero</span>

The Video Game Module (Powered by Raspberry Pi) brings new entertainment and development opportunities to your Flipper Zero:


- Raspberry Pi RP2040 Microcontroller: compatible with lots of existing Raspberry Pi Pico projects; allows you to use the module as a standalone device
- **Video Out:** see the Flipper Zero screen on your TV
- **Motion Sensor:** built-in gyroscope and accelerometer with open API. Allows you to add motion input to any app or game
- **GPIO Port:** a 14-pin port for plugging in joysticks, sensors, and any other DIY components
- **USB-C Port:** dedicated USB port connected directly to the RP2040 allows you to communicate with PC or flash any firmware without Flipper Zero
- **Standalone Mode:** use the module without Flipper Zero by running any alternative firmware compatible with Raspberry Pi Pico
- **Open-Source Firmware and Schematics:** explore and customize any parts of the module, both software and hardware

![](/blog/flipper-zero/part-2/vgm.png)

#### <span style="color: orange;">Prototyping Boards for Flipper Zero</span>


Bare prototyping boards for making your own DIY modules, specially made for Flipper Zero GPIO header.


![](/blog/flipper-zero/part-2/all_proto.jpg)
