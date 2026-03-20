import { useMemo } from "react";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

export function extractToc(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = stripHtml(match[2].trim());
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    items.push({ id, text, level });
  }

  return items;
}

interface TableOfContentsProps {
  items: TocItem[];
}

const TableOfContents = ({ items }: TableOfContentsProps) => {
  if (items.length === 0) return null;

  const minLevel = Math.min(...items.map(i => i.level));

  return (
    <nav className="sticky top-20">
      <p className="text-xs text-primary mb-3 font-medium phosphor-glow-subtle">
        <span className="text-primary/50">$</span> cat TOC
      </p>
      <ul className="space-y-1.5 border-l border-border pl-3">
        {items.map((item, i) => (
          <li
            key={i}
            style={{ paddingLeft: `${(item.level - minLevel) * 12}px` }}
          >
            <button
              onClick={() => {
                const el = document.getElementById(item.id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors block py-0.5 leading-snug text-left"
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
