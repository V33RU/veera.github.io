import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

let initialized = false;

function initMermaid() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "strict",
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
    fontSize: 22,
    flowchart: { htmlLabels: true, curve: "basis", nodeSpacing: 80, rankSpacing: 90, padding: 20, useMaxWidth: false },
    sequence: { actorFontSize: 20, noteFontSize: 18, messageFontSize: 18, useMaxWidth: false },
    mindmap: { padding: 20, useMaxWidth: false },
    themeVariables: {
      background: "hsl(25, 15%, 6%)",
      primaryColor: "hsl(25, 15%, 10%)",
      primaryTextColor: "#f2f2f2",
      primaryBorderColor: "hsl(30, 80%, 55%)",
      lineColor: "hsl(30, 80%, 60%)",
      secondaryColor: "hsl(25, 15%, 14%)",
      tertiaryColor: "hsl(25, 15%, 18%)",
      fontSize: "16px",
    },
  });
  initialized = true;
}

let idCounter = 0;

interface Props {
  code: string;
}

const MermaidDiagram = ({ code }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    initMermaid();
    let cancelled = false;
    const id = `mermaid-${++idCounter}-${Date.now()}`;
    mermaid
      .render(id, code)
      .then(({ svg }) => {
        if (cancelled) return;
        const scaled = svg
          .replace(/max-width:\s*[^;"]+;?/g, "")
          .replace(/<svg ([^>]*?)width="[^"]*"/, "<svg $1")
          .replace(/<svg ([^>]*?)height="[^"]*"/, "<svg $1")
          .replace(/<svg /, '<svg style="width:100%;height:auto;" ');
        setSvg(scaled);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div className="my-6 rounded border border-destructive/50 bg-destructive/10 p-3">
        <div className="text-xs text-destructive mb-2">mermaid render error</div>
        <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">{error}</pre>
        <pre className="text-xs text-muted-foreground/60 mt-2 overflow-x-auto whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="my-8 rounded border border-border bg-secondary/20 p-4 overflow-x-auto w-full [&_svg]:block [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full [&_.nodeLabel]:!text-base [&_.nodeLabel]:!font-medium [&_text]:!fill-foreground [&_text]:!font-medium"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidDiagram;
