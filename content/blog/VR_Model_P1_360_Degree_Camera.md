---
title: "VR Model P1 - 360 Degree Camera"
date: "2020-05-19"
description: "This article discusses an assessment I conducted for fun in 2017 on a trending piece of technology in the IP camera domain - a 360 degree camera, specifically the model P1 VR camera. This assessment led to the assignment of CVE ID: CVE-2020-23512."
tags: ["CVE", "IP camera", "security assessment"]
---

### Introduction

#### What is a VR Camera?
In photography, an omnidirectional camera, also known as "Omni," has a 360-degree field of view on the horizontal plane. It can capture a nearly complete spherical view, making it valuable for applications requiring extensive visual coverage, like panoramic photography and robotics.

#### VR CAM P1 Proxy Eye Fisheye Camera IP 3D VR 360 Degree Panoramic 960P Wi-Fi CCTV Camera With SD Memory Card Slot Multi Viewing Mode

#### Features of the VR CAMERA:

| **Feature Category**          | **Details**                                                                                     |
|-------------------------------|-------------------------------------------------------------------------------------------------|
| **Brand**                     | VR CAM                                                                                         |
| **Model**                     | P1                                                                                             |
| **Product Dimension**         | 15 x 15 x 5 cm                                                                                 |
| **Resolution**                | 960p                                                                                           |
| **Compatibility**             | Android/iOS Devices                                                                             |
| **Optical Zoom**              | 16 X                                                                                           |
| **Connector Type**            | Wireless, Wired                                                                                 |
| **Material**                  | Plastic                                                                                        |
| **Lens Type**                 | Fisheye                                                                                         |
| **Voltage**                   | 12 Volts                                                                                        |
| **Wattage**                   | 130                                                                                            |
| **Additional Features**       | 360 Degree Panorama, 3D VR, Wi-Fi & Wired RJ45, TF Card Slot, Two Way Audio                   |
| **Multi-Angle Monitor Modes** | Mode 1: Electronic PTZ, Mode 2: Panoramic, Mode 3: Corridor, Mode 4: Traditional Split Screen |
| **Sensor**                    | 1/3 Inch CMOS                                                                                  |
| **Sensor Resolution**         | 1536 x 1536                                                                                    |
| **Lens Visual Angle**         | 1.19mm Visual Angle 360 degree                                                                  |
| **HD Quality**                | 3MP                                                                                             |
| **Equivalent to**             | 4 to 6 common cameras                                                                          |

### Configuration Guide
To configure the device, refer to the document: [Device Configuration Guide](http://www.global-export-import.eu/WEBSET_DOWNLOADS/611/AN-H360-1_EN.pdf)

### Security Assessment Overview
During the security assessment, I connected the device via Ethernet, obtaining an IP address. A scan of this address revealed several open ports, including 21 (FTP), 23 (Telnet), and 6789. Notably, port 21 allowed anonymous FTP access, granting direct access to the device's filesystem.

### Findings
- **FTP Access:** The filesystem was accessible without authentication via FTP, allowing firmware downloads and examination.
- **Filesystem Analysis:** Detailed firmware analysis exposed hardcoded credentials in the `etc/password` and `etc/shadow` files, including MD5-hashed passwords. Additionally, JFFS filesystem files contained remote FTP server IP details and credentials.
- **Wi-Fi Password Exposure:** The router's Wi-Fi password was stored in plaintext within the `/tmp/wifi_info` directory.
- **Web Interface Vulnerability:** The device's web interface was susceptible to unauthorized access. By navigating directly to specific URLs, such as `http://192.168.0.185/view.html`, it was possible to bypass login credentials and access the admin panel.

This article outlines a security assessment conducted on the VR Model P1 camera, culminating in the assignment of CVE ID: CVE-2020-23512.
