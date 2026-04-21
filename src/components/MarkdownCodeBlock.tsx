import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import MermaidDiagram from "./MermaidDiagram";

const customTheme = {
  ...vscDarkPlus,
  'pre[class*="language-"]': {
    ...vscDarkPlus['pre[class*="language-"]'],
    background: "hsl(25, 15%, 6%)",
    margin: 0,
    padding: "1em",
    borderRadius: "0 0 4px 4px",
    fontSize: "0.85em",
  },
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    background: "transparent",
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
  },
};

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
}

const MarkdownCodeBlock = ({ className, children }: CodeBlockProps) => {
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const code = String(children).replace(/\n$/, "");

  if (language === "mermaid") {
    return <MermaidDiagram code={code} />;
  }

  if (!match) {
    return (
      <code className={className}>
        {children}
      </code>
    );
  }

  return (
    <div className="mb-4 rounded overflow-hidden border border-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-secondary/50 border-b border-border">
        <span className="text-xs text-primary/70 font-medium">{language}</span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          copy
        </button>
      </div>
      <SyntaxHighlighter
        style={customTheme}
        language={language}
        PreTag="div"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default MarkdownCodeBlock;
