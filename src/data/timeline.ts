export interface TimelineEvent {
  conference: string;
  location: string;
  topic: string;
  role: "Talk" | "Workshop" | "Keynote" | "Village Lead" | "Training";
  year: number;
}

export const timelineEvents: TimelineEvent[] = [
  { conference: "miniorange", location: "Pune, India", topic: "Bluetooth Hacking Workshop", role: "Workshop", year: 2026 },
  { conference: "Seasides", location: "Goa, India", topic: "Advanced HW + BLE Exploitation", role: "Workshop", year: 2025 },
  { conference: "BSides Kerala", location: "Kerala, India", topic: "IoT Bug Discovery and Exploitation", role: "Workshop", year: 2025 },
  { conference: "BSides Dehradun", location: "Dehradun, India", topic: "Keynote", role: "Keynote", year: 2024 },
  { conference: "c0c0n", location: "Cochin, India", topic: "IoT Security Village", role: "Village Lead", year: 2023 },
  { conference: "OWASP Seasides", location: "Goa, India", topic: "BLE UAE", role: "Talk", year: 2020 },
  { conference: "p0scon", location: "Tehran, Iran", topic: "433MHz Exploitation", role: "Talk", year: 2019 },
  { conference: "null Bangalore", location: "Bangalore, India", topic: "IoT Exploitation", role: "Training", year: 2016 },
  { conference: "Cysinfo", location: "Bangalore, India", topic: "IoT Attacks", role: "Talk", year: 2016 },
];
