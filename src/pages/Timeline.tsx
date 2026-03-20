import { useState } from "react";
import { motion } from "framer-motion";
import { timelineEvents, type TimelineEvent } from "@/data/timeline";
import { Badge } from "@/components/ui/badge";
import SilkscreenLabel from "@/components/SilkscreenLabel";

const roles = ["All", "Talk", "Workshop", "Keynote", "Village Lead", "Training"] as const;

const Timeline = () => {
  const [filter, setFilter] = useState<string>("All");

  const filtered = filter === "All" 
    ? timelineEvents 
    : timelineEvents.filter(e => e.role === filter);

  const years = [...new Set(filtered.map(e => e.year))].sort((a, b) => b - a);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SilkscreenLabel designator="CLK1" label="timeline" className="mb-6" />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {roles.map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`text-xs px-3 py-1 rounded border transition-colors ${
              filter === r 
                ? "border-primary text-primary bg-primary/10" 
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative pl-8">
        {/* PCB trace line */}
        <div className="absolute left-[18px] top-0 bottom-0 pcb-trace" />

        {years.map(year => (
          <div key={year} className="mb-8">
            {/* Year marker */}
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="solder-point absolute left-[-22px]" />
              <span className="text-primary font-bold text-lg phosphor-glow-subtle">{year}</span>
            </div>

            {/* Events */}
            <div className="space-y-3 ml-2">
              {filtered.filter(e => e.year === year).map((event, i) => (
                <motion.div
                  key={`${event.conference}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="chip-card rounded px-4 py-3 relative"
                >
                  {/* Mini trace connector */}
                  <div className="absolute left-[-18px] top-1/2 w-4 h-[2px] bg-pcb-trace" />
                  
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-foreground font-medium text-sm">{event.conference}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">{event.topic}</p>
                      <p className="text-muted-foreground/60 text-xs mt-0.5">{event.location}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">{event.role}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
