import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

let initialized = false;

function initMermaid() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "strict",
    logLevel: "fatal",
    suppressErrorRendering: true,
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

function looksLikeErrorSvg(svg: string): boolean {
  return (
    svg.includes("Syntax error in text") ||
    svg.includes('aria-roledescription="error"') ||
    svg.includes("mermaid version")
  );
}

const MermaidDiagram = ({ code }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [failed, setFailed] = useState<boolean>(false);

  useEffect(() => {
    initMermaid();
    let cancelled = false;
    const id = `mermaid-${++idCounter}-${Date.now()}`;

    (async () => {
      try {
        const parsed = await mermaid.parse(code, { suppressErrors: true });
        if (parsed === false) throw new Error("parse-failed");
        const rendered = await mermaid.render(id, code);
        if (cancelled) return;
        if (looksLikeErrorSvg(rendered.svg)) throw new Error("render-emitted-error");
        const scaled = rendered.svg
          .replace(/max-width:\s*[^;"]+;?/g, "")
          .replace(/<svg ([^>]*?)width="[^"]*"/, "<svg $1")
          .replace(/<svg ([^>]*?)height="[^"]*"/, "<svg $1")
          .replace(/<svg /, '<svg style="width:100%;height:auto;" ');
        setSvg(scaled);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (failed) {
    return (
      <pre className="my-6 rounded border border-border bg-secondary/20 p-4 overflow-x-auto text-xs text-muted-foreground whitespace-pre-wrap font-mono">
        {code}
      </pre>
    );
  }

  if (!svg) return null;

  return (
    <div
      ref={ref}
      className="my-8 rounded border border-border bg-secondary/20 p-4 overflow-x-auto w-full [&_svg]:block [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full [&_.nodeLabel]:!text-base [&_.nodeLabel]:!font-medium [&_text]:!fill-foreground [&_text]:!font-medium"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidDiagram;
