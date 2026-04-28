---
title: "How I Purchase Costly Devices at Low Prices for IoT Pentesting"
date: "2021-02-02"
description: "Many aspiring IoT pentesters and device hackers face a significant barrier: the cost of hardware. In this article, I'll share my strategies for acquiring costly smart devices at lower prices, specifically focusing on the context of India. This approach helps me save money while not compromising on the quality of devices for testing and learning."
tags: ["IoT pentesting", "gadgets", "hardware"]
---

>Many aspiring IoT pentesters and device hackers face a significant barrier: the cost of hardware. In this article, I'll share my strategies for acquiring costly smart devices at lower prices, specifically focusing on the context of India. This approach helps me save money while not compromising on the quality of devices for testing and learning.

<h3 style="color: green;">IoT-Security101-Kit-Roughly-costing-110USD</h3>

| Component             | Description                                            | Buy Link                                                 |
|-----------------------|--------------------------------------------------|----------------------------------------------------------|
| CSR4.0                | Bluetooth Adapter (for pentesting Bluetooth 4.0)     | [Buy Here](https://amzn.to/2SYWhIg)                    |
| NRF52840              | BLE 5.0 Dongle, Zigbee, Thread pentesting purpose     | [Buy Here](https://in.element14.com/nordic-semiconductor/nrf52840-dongle/bluetooth-module-v5-2mbps/dp/2902521) |
| BusPirate             | Hardware Debugger (I2C, SPI, UART, 1-wire, JTAG)     | [Buy Here](https://www.tanotis.com/products/sparkfun-bus-pirate-v3-6a) |
| UART Cable            | UART cable (FT232RL)                                  | [Buy Here](https://amzn.to/3v0USPu)                   |
| Logic Analyzer 8 Pin  | Logic analyzer                                        | [Buy Here](https://www.tanotis.com/products/sparkfun-usb-logic-analyzer-24mhz-8-channel?_pos=2&_sid=6a022df94&_ss=r) |
| STLink v2             | SWD Pin Connector                                     | [Buy Here](https://amzn.to/3uXm8hI)                   |
| ESP32                 | MCU for developing embedded codes for WiFi and Bluetooth, suitable for testbed/offensive/defensive purposes | [Buy Here](https://amzn.to/33RSRZW) |
| RPI-Zero              | MCU - good for USB attacks, use a USB adapter         | [Buy Here](https://amzn.to/3hyDBcK)                   |
| IoTSecurity           | Debugger (under development)                          | -                                                        |
| IoT-PT Core Board     | Hardware Lab (under development)                      | -                                                        |



Note : for **UART/JTAG/SPI/I2C**  - I can use [FT232H](https://www.adafruit.com/product/2264) hardware debugger instead of the buspirate and UART CABLE

Link : https://github.com/IoT-PTv/IoT-Security101-Kit-Roughly-costing-110USD


<h3 style="color: green;">My Approach to Buying Devices</h3>

For learning purposes, I try to minimize investment in hardware due to the risk of bricking devices. However, for project-specific needs, I don't hesitate to purchase even the expensive ones. Here's a flow I follow to find the best deals:

- **OLX India**: A great platform for second-hand devices. Always inspect the device thoroughly before buying and prefer cash on delivery.

![Alt Text](/blog/how-i/image1.png)


- **Amazon and Flipkart**: Reliable for new gadgets, often offering smart bands and other IoT devices at discounted prices.

![Alt Text](/blog/how-i/image3.png)


- **CEX**: Offers smart devices with a warranty at reasonable prices. I prefer buying directly from CEX stores.

![Alt Text](/blog/how-i/image2.png)


- **Banggood**: Known for cheap and best gadgets, though shipping can be on hold due to circumstances like the pandemic.

![Alt Text](/blog/how-i/image5.png)


- **Chor Bazaars (Thief Markets)**: Though not the most secure or trustworthy, they can be a goldmine for testing devices at a fraction of the cost.

- **Electronic Bazaar (Street Side)**: Streets dedicated to electronics where you can find prototypes, cloned devices, and sometimes damaged goods at low prices.

- **Known People**: Buying from acquaintances often ensures a reasonable price and trustworthiness.


<h3 style="color: green;">Recommendations to start IoT Pentesting for beginners </h3>

Routers are not generally not consider as IoT devices until it is smart.

Attack Vectors As Follows:

**1.Network Intrusion:**

Dive into the essence of network protocols and vulnerabilities. Mastering these can reveal potential entry points and security lapses within the network layer.

**2.Embedded Application Exploitation:**

Harness the power of embedded applications by exploring web interfaces accessible through IP addresses. This exploration can uncover vulnerabilities in the application layer that could be exploited.

**3.Firmware Analysis:**

Engage in the art of firmware dumping using tools like Flashrom, UART, or even direct downloads from websites. Analyzing firmware allows for a deeper understanding of the device's operating logic and potential backdoors.

**4.Hardware Interface Testing:**

Experiment with hardware interfaces such as UART, SPI, and JTAG. These ports can often be gateways to accessing a device's core functionalities and testing its security perimeter.
By concentrating on these key areas, beginners can methodically enhance their skills in router pentesting, preparing themselves for more advanced challenges as they progress.

<h3 style="color: green;">Additional Resources</h3>

For those looking to expand their search, consider websites like xfurbish.com, 2gud.com, and eBay.com for refurbished or second-hand devices.


<h3 style="color: green;">Conclusion</h3>

By exploring various avenues, from online marketplaces to local electronics bazaars, it's possible to gather a comprehensive testing lab without breaking the bank. This approach has significantly contributed to my personal lab and ongoing projects in IoT pentesting.


<h3 style="color: green;">IoT-PT OS</h3>

<https://github.com/IoT-PTv>
