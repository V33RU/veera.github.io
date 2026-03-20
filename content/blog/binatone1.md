---
title: "Dumping Firmware with Bus Pirate v3.6 via USB"
date: "2021-06-19"
description: "The Bus Pirate v3.6a, a crucial tool for troubleshooting and communication between a PC and various embedded devices over multiple protocols. This guide focuses on using the Bus Pirate to dump firmware from embedded devices, vital for reverse engineering and security analysis."
tags: ["buspirate", "firmware dumping"]
---

### <span style="color: orange;">Introduction:</span>

Utilizing the Bus Pirate and SPI interface is an effective method for extracting firmware from hardware devices. This is particularly useful in scenarios where direct firmware downloads are not an option.

### <span style="color: orange;">Requirements:</span>

- **Bus Pirate**: A tool for interfacing with hardware devices at the protocol level.
- **Operating System**: Ubuntu 16.04 or other Linux distributions.
- **Flashrom Tool**: A utility for reading, writing, verifying, and erasing flash chips.
- **SOIC Cable Pin 8**: Connects the EEPROM chip.
- **Bus Pirate Connectors**

### <span style="color: orange;">Hardware Example: Binatone DT 850W Wireless Router:</span>

<p align="center">
  <img src="/blog/spi-dumping/1-1.jpg" alt="The Binatone DT 850W wireless router used for firmware dumping." style="border-radius: 8px;"/>
</p>

<p align="center">
  <i>The Binatone DT 850W wireless router used for firmware dumping.</i>
</p>

### <span style="color: orange;">What is EEPROM?:</span>

EEPROM stands for Electrically Erasable Programmable Read-Only Memory. It is a non-volatile memory used in electronic devices to store small amounts of data, allowing individual bytes to be erased and reprogrammed.

<p align="center">
  <img src="/blog/spi-dumping/2.jpg" alt="EEPROM chip on the circuit board." style="border-radius: 8px;"/>
</p>

<p align="center">
  <i>EEPROM chip on the circuit board.</i>
</p>

### <span style="color: orange;">Preparing for Firmware Dumping:</span>

#### <span style="color: orange;">1. Connecting Bus Pirate to EEPROM Chip:</span>

Use the Bus Pirate and the SOIC Pin 8 connector to establish a connection with the EEPROM chip. Ensure that the red wire connects to pin 1 of the EEPROM chip, identifiable by a round mark.

<p align="center">
  <img src="/blog/spi-dumping/3.png" alt="Bus Pirate and SOIC Pin 8 connector setup." style="border-radius: 8px;"/>
</p>

<p align="center">
  <i>Bus Pirate and SOIC Pin 8 connector setup.</i>
</p>

#### <span style="color: orange;">2. Bus Pirate and SOIC Cable Setup:</span>

Arrange the Bus Pirate and SOIC cable according to the provided diagrams to ensure correct pin connections.

#### <span style="color: orange;">3. Connection Verification:</span>

Check the VREG and PWR indicators on the Bus Pirate to ensure a proper connection.

<p align="center">
  <img src="/blog/spi-dumping/4.png" alt="Verifying the connection on the Bus Pirate." style="border-radius: 8px;"/>
</p>

<p align="center">
  <i>Verifying the connection on the Bus Pirate.</i>
</p>

### <span style="color: orange;">Firmware Dumping Process:</span>

#### <span style="color: orange;">Step 1: Initial Setup</span>

- Ensure the RED wire is connected to pin 1 of the EEPROM chip. A round mark on the chip identifies pin 1.

<p align="center">
  <img src="/blog/spi-dumping/6.png" alt="Identifying pin 1 on the EEPROM chip." style="border-radius: 8px;"/>
</p>

<p align="center">
  <i>Identifying pin 1 on the EEPROM chip.</i>
</p>

<p align="center">
  <img src="/blog/spi-dumping/5.png" alt="Bus Pirate wired to the EEPROM chip." style="border-radius: 8px;"/>
</p>

<p align="center">
  <i>Bus Pirate wired to the EEPROM chip.</i>
</p>

- Connect the SOIC cable to Bus Pirate Pins as shown below:

<p align="center">
  <img src="/blog/spi-dumping/7.png" alt="SOIC cable connected to the Bus Pirate pins." style="border-radius: 8px;"/>
</p>

<p align="center">
  <i>SOIC cable connected to the Bus Pirate pins.</i>
</p>

- Use this extra connector to the SOIC cable to identify the pins easily:

<p align="center">
  <img src="/blog/spi-dumping/8.png" alt="Extra connector aiding in pin identification." style="border-radius: 8px;"/>
</p>

<p align="center">
  <i>Extra connector aiding in pin identification.</i>
</p>

- After connecting the Bus Pirate to SOIC pin 8, it should look like this:

<p align="center">
  <img src="/blog/spi-dumping/9.jpg" alt="Complete setup of Bus Pirate and SOIC connector." style="border-radius: 8px;"/>
</p>

<p align="center">
  <i>Complete setup of Bus Pirate and SOIC connector.</i>
</p>

- A perfectly made connection to the device:

<p align="center">
  <img src="/blog/spi-dumping/10.jpg" alt="A perfectly established connection for firmware dumping." style="border-radius: 8px;"/>
</p>

<p align="center">
  <i>A perfectly established connection for firmware dumping.</i>
</p>

### <span style="color: orange;">Step 2: Identifying the EEPROM Chip</span>

Execute the following command to identify the connected EEPROM chip:

```bash
sudo flashrom -p buspirate_spi:dev=/dev/ttyUSB0
```

<p align="center"> <img src="/blog/spi-dumping/11.png" alt="Command execution for identifying the EEPROM chip." style="border-radius: 8px;"/> </p> <p align="center"> <i>Command execution for identifying the EEPROM chip.</i> </p>

<h3 style="color: orange;">Step 3: Dumping Firmware</h3>

- Execute the following command to dump the firmware from the chip to a binary file:

```bash
sudo flashrom -p buspirate_spi:dev=/dev/ttyUSB0,spispeed=1M -c <Chip name> -r <Filename.bin>
```

<p align="center"> <img src="/blog/spi-dumping/12.png" alt="Dumping firmware from flash chip." style="border-radius: 8px;"/> </p> <p align="center"> <i>Dumping firmware from flash chip.</i> </p>
