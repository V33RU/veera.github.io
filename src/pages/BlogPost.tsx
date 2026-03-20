import { useParams, Link } from "react-router-dom";
import { getBlogPost } from "@/lib/markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import TableOfContents, { extractToc } from "@/components/TableOfContents";
import MarkdownCodeBlock from "@/components/MarkdownCodeBlock";
import SilkscreenLabel from "@/components/SilkscreenLabel";
import { useMemo } from "react";
import { motion } from "framer-motion";

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = getBlogPost(slug || "");
  const toc = useMemo(() => post ? extractToc(post.content) : [], [post]);
  const readTime = useMemo(() => post ? estimateReadTime(post.content) : 0, [post]);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center">
        <p className="text-destructive">Post not found.</p>
        <Link to="/blog" className="text-primary text-sm mt-4 inline-block">← back to blog</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link to="/blog" className="text-muted-foreground text-sm hover:text-primary transition-colors inline-flex items-center gap-1.5 mb-8 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-primary/50">cd</span> ~/blog
        </Link>
      </motion.div>

      {/* Post header */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-10 pb-8 border-b border-border"
      >
        <SilkscreenLabel designator="U3" label="post" className="mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold text-primary phosphor-glow mb-4 leading-tight" style={{ lineHeight: '1.15' }}>
          {post.title}
        </h1>

        {post.description && (
          <p className="text-muted-foreground text-sm md:text-base mb-5 max-w-2xl leading-relaxed">
            {post.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 text-muted-foreground text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={12} className="text-primary/50" />
              {post.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12} className="text-primary/50" />
              {readTime} min read
            </span>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map(t => (
                <Badge key={t} variant="secondary" className="text-[11px] px-2 py-0.5">{t}</Badge>
              ))}
            </div>
          )}
        </div>
      </motion.header>

      <div className="flex gap-10">
        {/* Main content */}
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="markdown-content min-w-0 flex-1 max-w-3xl"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw, rehypeSlug]}
            components={{
              code: ({ className, children }) => (
                <MarkdownCodeBlock className={className}>{children}</MarkdownCodeBlock>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-6 circuit-border rounded">
                  <table className="w-full text-sm border-collapse">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border-b border-border px-4 py-2.5 text-left text-primary text-xs font-medium bg-secondary/30">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border-b border-border/40 px-4 py-2 text-muted-foreground text-sm">{children}</td>
              ),
              img: ({ src, alt }) => (
                <figure className="my-6">
                  <img src={src} alt={alt || ""} className="rounded border border-border max-w-full" loading="lazy" />
                  {alt && <figcaption className="text-xs text-muted-foreground/60 mt-2 text-center">{alt}</figcaption>}
                </figure>
              ),
              hr: () => (
                <div className="my-8 flex items-center gap-3">
                  <div className="flex-1 h-[1px] bg-border" />
                  <div className="flex gap-1.5">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                    ))}
                  </div>
                  <div className="flex-1 h-[1px] bg-border" />
                </div>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-primary/50 pl-4 my-4 text-muted-foreground italic">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors">
                  {children}
                </a>
              ),
              input: ({ type, checked, ...props }) => {
                if (type === "checkbox") {
                  return <input type="checkbox" checked={checked} readOnly className="mr-2 accent-primary" />;
                }
                return <input type={type} {...props} />;
              },
            }}
          >
            {post.content}
          </ReactMarkdown>

          {/* End marker */}
          <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground/50 tracking-wider">EOF</span>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              back to blog
            </Link>
          </div>
        </motion.article>

        {/* TOC sidebar */}
        {toc.length > 0 && (
          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="hidden lg:block w-60 shrink-0"
          >
            <TableOfContents items={toc} />
          </motion.aside>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;
