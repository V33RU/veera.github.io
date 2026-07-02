import { useEffect, useRef, useState } from "react";
import { ChevronDown, List } from "lucide-react";
import GithubSlugger from "github-slugger";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

function stripCodeBlocks(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/~~~[\s\S]*?~~~/g, "");
}

export function extractToc(markdown: string): TocItem[] {
  const source = stripCodeBlocks(markdown);
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const all: TocItem[] = [];
  const slugger = new GithubSlugger();
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(source)) !== null) {
    const level = match[1].length;
    const text = stripHtml(match[2].trim());
    if (!text) continue;
    const id = slugger.slug(text);
    all.push({ id, text, level });
  }

  // Keep only the top 2 distinct heading levels actually present.
  // Avoids dumping every #### sub-subheading into the sidebar.
  const distinctLevels = Array.from(new Set(all.map((i) => i.level))).sort(
    (a, b) => a - b
  );
  const allowed = new Set(distinctLevels.slice(0, 2));
  return all.filter((i) => allowed.has(i.level));
}

interface TableOfContentsProps {
  items: TocItem[];
  defaultOpen?: boolean;
  className?: string;
}

const TableOfContents = ({
  items,
  defaultOpen = true,
  className,
}: TableOfContentsProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const [activeId, setActiveId] = useState<string | null>(null);
  const visibleRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map((i) => i.id);
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    visibleRef.current = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) visibleRef.current.add(id);
          else visibleRef.current.delete(id);
        }
        // Pick the first heading (in document order) that is currently visible.
        const firstVisible = ids.find((id) => visibleRef.current.has(id));
        if (firstVisible) setActiveId(firstVisible);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const minLevel = Math.min(...items.map((i) => i.level));

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  return (
    <nav className={cn("lg:sticky lg:top-20", className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger
          className="w-full flex items-center justify-between gap-2 text-xs text-primary font-medium phosphor-glow-subtle group"
          aria-label="Toggle table of contents"
        >
          <span className="inline-flex items-center gap-1.5">
            <List size={12} className="text-primary/60" />
            <span className="text-primary/50">$</span> cat TOC
            <span className="text-muted-foreground/50">
              ({items.length})
            </span>
          </span>
          <ChevronDown
            size={14}
            className={cn(
              "text-primary/60 transition-transform duration-200",
              open ? "rotate-180" : "rotate-0"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <ul className="space-y-1.5 border-l border-border pl-3 mt-3 max-h-[70vh] overflow-y-auto">
            {items.map((item, i) => {
              const isActive = item.id === activeId;
              return (
                <li
                  key={`${item.id}-${i}`}
                  style={{ paddingLeft: `${(item.level - minLevel) * 12}px` }}
                  className="relative"
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute -left-[13px] top-1/2 -translate-y-1/2 w-[2px] h-4 bg-primary phosphor-glow-subtle"
                    />
                  )}
                  <button
                    onClick={() => handleClick(item.id)}
                    className={cn(
                      "text-xs transition-colors block py-0.5 leading-snug text-left w-full",
                      isActive
                        ? "text-primary font-medium phosphor-glow-subtle"
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    {isActive && (
                      <span className="text-primary/60 mr-1">&gt;</span>
                    )}
                    {item.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </nav>
  );
};

export default TableOfContents;
