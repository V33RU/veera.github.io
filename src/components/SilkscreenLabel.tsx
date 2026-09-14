import { cn } from "@/lib/utils";

interface SilkscreenLabelProps {
  designator?: string;
  label: string;
  className?: string;
}

/**
 * Section label - a small eyebrow above section content.
 */
const SilkscreenLabel = ({ label, className }: SilkscreenLabelProps) => (
  <p className={cn("eyebrow mb-4 flex items-center gap-3", className)}>
    <span className="w-5 h-px bg-[hsl(var(--rule-strong))] inline-block" />
    {label}
  </p>
);

export default SilkscreenLabel;
