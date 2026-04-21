export interface Project {
  name: string;
  year: number;
  track: "Active" | "Legacy";
  description: string;
  url?: string;
}

export const projects: Project[] = [
  // 2026
  { name: "Akhanda-OS", year: 2026, track: "Active", description: "Embedded hacking OS / security platform", url: "https://github.com/akhanda-os" },
  { name: "RFSploit", year: 2026, track: "Active", description: "RF exploitation toolkit (SDR, signals, protocol attacks)", url: "https://github.com/V33RU/rfsploit" },
  { name: "BlueSploit", year: 2026, track: "Active", description: "Bluetooth exploitation toolkit", url: "https://github.com/v33ru/bluesploit" },
  { name: "HARDAX", year: 2026, track: "Active", description: "Hardening Audit eXaminer for Android OS-based IoT devices", url: "https://github.com/v33ru/hardax" },
  { name: "HardenCheck", year: 2026, track: "Active", description: "Firmware hardening and security posture checker", url: "https://github.com/v33ru/hardencheck" },
  { name: "SiDEWiNDER", year: 2026, track: "Active", description: "SSID Injection Detection & Wireless INjection Defense EngineeR", url: "https://github.com/V33RU/sidewinder" },
  { name: "Venoid", year: 2026, track: "Active", description: "Android security analysis toolkit", url: "https://github.com/V33RU/venoid" },
  // 2024
  { name: "ICE-Bite", year: 2024, track: "Active", description: "Hardware probing toolkit", url: "https://github.com/iotsrg/ICEBite" },
  { name: "CommandInWiFi", year: 2024, track: "Active", description: "Covert command channel via WiFi", url: "https://github.com/v33ru/CommandInWiFi-Zeroclick" },
  // 2020
  { name: "IoT-PT OSv1", year: 2020, track: "Legacy", description: "A custom OS for IoT pentesting", url: "https://github.com/IoT-PTv/IoT-PT-v1" },
];

export const domains = [
  "Embedded Systems and Firmware Reversing",
  "Fault Injection and Glitch Attacks (Power/Clock/EMFI)",
  "Bluetooth Low Energy Hacking (BLE UAE, Braktooth, Sweyntooth)",
  "Radio Protocol Reverse Engineering (433MHz, Zigbee, Sub-GHz)",
  "Secure Boot Bypass via Hardware Attacks",
  "Hardware Debug Interfaces (UART/SWD/JTAG)",
  "WiFi Exploitation and Covert Channels",
];

export interface Publication {
  title: string;
  year: number;
  publishedIn: string;
  url: string;
  cover: string;
}

export const publications: Publication[] = [
  {
    title: "Hacking the IoT: A Pentester's OS",
    year: 2020,
    publishedIn: "Hakin9",
    url: "https://hakin9.org/product/android-applications-and-security/",
    cover: "/publications/hakin9-2020.jpg",
  },
  {
    title: "Hunting IoT Devices with NetHunter Pt.1",
    year: 2019,
    publishedIn: "Hakin9",
    url: "https://hakin9.org/product/practical-devops/",
    cover: "/publications/hakin9-2019.jpg",
  },
  {
    title: "IoT Security Essentials 101",
    year: 2017,
    publishedIn: "Pentest Magazine",
    url: "https://pentestmag.com/download/pentest-security-things/",
    cover: "/publications/pentestmag-2017.jpg",
  },
];
