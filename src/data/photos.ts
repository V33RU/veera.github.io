export interface Photo {
  src: string;
  caption?: string;
}

export const photos: Photo[] = [
  { src: "/photos/placeholder-1.svg", caption: "Hardware lab setup" },
  { src: "/photos/placeholder-2.svg", caption: "PCB probing session" },
  { src: "/photos/placeholder-3.svg", caption: "Conference talk" },
  { src: "/photos/placeholder-4.svg", caption: "Soldering station" },
  { src: "/photos/placeholder-5.svg", caption: "RF analysis" },
  { src: "/photos/placeholder-6.svg", caption: "BLE research" },
];
