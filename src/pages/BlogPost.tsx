import { useParams, Link } from "react-router-dom";
import { getBlogPost } from "@/lib/markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import TableOfContents, { extractToc } from "@/components/TableOfContents";
import MarkdownCodeBlock from "@/components/MarkdownCodeBlock";
import ReadingProgress from "@/components/ReadingProgress";
import { useMemo } from "react";

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [
      ...(defaultSchema.attributes?.span || []),
      ["className", "accent-orange", "signature-accent"],
    ],
    img: [...(defaultSchema.attributes?.img || []), "src", "alt", "loading"],
  },
  tagNames: [...(defaultSchema.tagNames || []), "span", "figure", "figcaption"],
};

function estimateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = getBlogPost(slug || "");
  const toc = useMemo(() => (post ? extractToc(post.content) : []), [post]);
  const readTime = useMemo(() => (post ? estimateReadTime(post.content) : 0), [post]);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <p className="text-[hsl(var(--critical))] text-[15px]">Post not found.</p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 text-[hsl(var(--signature))] signature-underline text-[14px] mt-4"
        >
          <ArrowLeft size={14} /> back to writing
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-10 md:py-14">
      <ReadingProgress targetSelector="article.markdown-content" />

      {/* Breadcrumb */}
      <Link
        to="/blog"
        className="mono text-[11.5px] uppercase tracking-widest text-[hsl(var(--ink-muted))] hover:text-[hsl(var(--ink))] inline-flex items-center gap-2 mb-8 transition-colors"
      >
        <ArrowLeft size={12} />
        Back to writing
      </Link>

      {/* Post header */}
      <header className="mb-10">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 mb-5 mono text-[11px] uppercase tracking-widest text-[hsl(var(--ink-muted))]">
          <span className="text-[hsl(var(--signature))]">Writing</span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={11} /> {post.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={11} /> {readTime} min read
          </span>
        </div>

        <h1 className="text-[32px] md:text-[48px] leading-[1.05] tracking-[-0.024em] font-medium text-[hsl(var(--ink))] mb-5 text-balance">
          {post.title}
        </h1>

        {post.description && (
          <p className="text-[19px] md:text-[21px] italic text-[hsl(var(--ink-muted))] leading-snug max-w-2xl mb-6">
            {post.description}
          </p>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mono text-[10.5px] uppercase tracking-widest text-[hsl(var(--ink-muted))] pt-5 border-t border-[hsl(var(--rule))]">
            {post.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        )}
      </header>

      {/* Mobile TOC */}
      {toc.length > 0 && (
        <details className="lg:hidden mb-8 px-4 py-3 bg-[hsl(var(--paper-2))] border border-[hsl(var(--rule))]">
          <summary className="mono text-[11px] uppercase tracking-widest text-[hsl(var(--ink-muted))] cursor-pointer select-none">
            Contents
          </summary>
          <div className="mt-3">
            <TableOfContents items={toc} defaultOpen={true} />
          </div>
        </details>
      )}

      <div className="flex gap-10">
        <article className="markdown-content min-w-0 flex-1 max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeSlug]}
            components={{
              code: ({ className, children }) => (
                <MarkdownCodeBlock className={className}>{children}</MarkdownCodeBlock>
              ),
              a: ({ href, children }) => {
                const isExternal = !!href && (href.startsWith("http") || href.startsWith("//"));
                return (
                  <a
                    href={href}
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {children}
                  </a>
                );
              },
              img: ({ src, alt }) => (
                <figure className="my-6">
                  <img src={src} alt={alt || ""} loading="lazy" />
                  {alt && (
                    <figcaption className="mono text-[11px] tracking-wider text-[hsl(var(--ink-muted))] mt-2 text-center">
                      {alt}
                    </figcaption>
                  )}
                </figure>
              ),
              input: ({ type, checked, ...props }) => {
                if (type === "checkbox") {
                  return <input type="checkbox" checked={checked} readOnly className="mr-2" />;
                }
                return <input type={type} {...props} />;
              },
            }}
          >
            {post.content}
          </ReactMarkdown>

          {/* End marker */}
          <div className="mt-14 pt-6 border-t border-[hsl(var(--rule))] flex items-center justify-between">
            <span className="mono text-[11px] tracking-[0.3em] text-[hsl(var(--ink-dim))]">
              &sect; &sect; &sect;
            </span>
            <Link
              to="/blog"
              className="mono text-[11.5px] uppercase tracking-widest text-[hsl(var(--ink-muted))] hover:text-[hsl(var(--signature))] inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={12} /> Back to writing
            </Link>
          </div>
        </article>

        {toc.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <p className="mono text-[10.5px] uppercase tracking-widest text-[hsl(var(--ink-muted))] mb-3">
                Contents
              </p>
              <TableOfContents items={toc} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;
