import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import SilkscreenLabel from "@/components/SilkscreenLabel";

interface Photo {
  src: string;
  caption: string;
}

const raw = import.meta.glob('/content/photography.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function parsePhotos(): Photo[] {
  const md = Object.values(raw)[0] || '';
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const photos: Photo[] = [];
  let match;
  while ((match = regex.exec(md)) !== null) {
    photos.push({ caption: match[1], src: match[2] });
  }
  return photos;
}

const Photography = () => {
  const photos = useMemo(() => parsePhotos(), []);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SilkscreenLabel designator="D1" label="photography" className="mb-8" />

      {/* Responsive Grid Gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((photo, i) => (
          <div
            key={i}
            className="cursor-pointer group relative overflow-hidden rounded border border-border bg-secondary/20 aspect-square"
            onClick={() => setSelectedIndex(i)}
          >
            <img
              src={photo.src}
              alt={photo.caption || `Photo ${i + 1}`}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
              loading="lazy"
            />
            {photo.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm px-2 py-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                <p className="text-xs text-muted-foreground truncate">
                  <span className="text-primary/40">// </span>{photo.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              className="absolute top-4 right-4 text-primary hover:text-foreground transition-colors"
              onClick={() => setSelectedIndex(null)}
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 max-w-4xl w-full">
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(Math.max(0, selectedIndex - 1)); }}
                className="text-primary hover:text-foreground transition-colors shrink-0"
              >
                <ChevronLeft size={32} />
              </button>

              <div className="flex-1 text-center min-w-0" onClick={e => e.stopPropagation()}>
                <img
                  src={photos[selectedIndex].src}
                  alt={photos[selectedIndex].caption || ""}
                  className="max-h-[70vh] mx-auto rounded film-strip-frame"
                />
                {photos[selectedIndex].caption && (
                  <p className="text-muted-foreground text-sm mt-4">
                    <span className="text-primary/40">// </span>{photos[selectedIndex].caption}
                  </p>
                )}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(Math.min(photos.length - 1, selectedIndex + 1)); }}
                className="text-primary hover:text-foreground transition-colors shrink-0"
              >
                <ChevronRight size={32} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Photography;
