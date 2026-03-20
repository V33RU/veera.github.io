import { useParams, Link } from "react-router-dom";
import { getUnscriptedPost } from "@/lib/markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import MarkdownCodeBlock from "@/components/MarkdownCodeBlock";

const UnscriptedPostPage = () => {
  const { slug } = useParams();
  const post = getUnscriptedPost(slug || "");

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center">
        <p className="text-destructive">Thought not found.</p>
        <Link to="/unscripted" className="text-primary text-sm mt-4 inline-block">← back</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link to="/unscripted" className="text-muted-foreground text-sm hover:text-primary transition-colors inline-flex items-center gap-1 mb-6">
        <ArrowLeft size={14} /> cd ~/unscripted
      </Link>
      <h1 className="text-2xl font-bold text-primary phosphor-glow mb-2">
        <span className="text-primary/40">&gt; </span>{post.title}
      </h1>
      <span className="text-muted-foreground text-xs">{post.date}</span>
      <div className="markdown-content mt-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: ({ className, children }) => (
              <MarkdownCodeBlock className={className}>{children}</MarkdownCodeBlock>
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default UnscriptedPostPage;
