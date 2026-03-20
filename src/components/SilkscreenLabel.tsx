import { cn } from "@/lib/utils";

interface SilkscreenLabelProps {
  designator: string; // e.g. "U1", "J2", "R3"
  label: string;
  className?: string;
}

/**
 * PCB silkscreen-style section label.
 * Mimics component designators printed on circuit boards.
 */
const SilkscreenLabel = ({ designator, label, className }: SilkscreenLabelProps) => (
  <div className={cn("flex items-center gap-2 mb-3", className)}>
    {/* Designator box — like a component outline on PCB */}
    <div className="flex items-center gap-0">
      <div className="h-[1px] w-2 bg-primary/30" />
      <span className="text-[10px] font-bold tracking-[0.25em] text-primary border border-primary/30 px-1.5 py-0.5 leading-none uppercase">
        {designator}
      </span>
      <div className="h-[1px] w-3 bg-primary/30" />
      {/* Pin 1 marker */}
      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 -ml-[2px]" />
    </div>
    {/* Silkscreen text label */}
    <span className="text-muted-foreground text-sm tracking-wider uppercase">
      {label}
    </span>
  </div>
);

export default SilkscreenLabel;
