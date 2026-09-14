import { Link } from "react-router-dom";
import { useState } from "react";
import { getBlogPosts } from "@/lib/markdown";

const Blog = () => {
  const posts = getBlogPosts();
  const [search, setSearch] = useState("");

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-4xl px-5 md:px-8 py-12 md:py-16">
      <div className="mb-10">
        <p className="eyebrow mb-4 flex items-center gap-3">
          <span className="w-5 h-px bg-[hsl(var(--rule-strong))] inline-block" />
          Field notes / Long-form research
        </p>
        <h1 className="text-[38px] md:text-[48px] leading-[1.05] tracking-[-0.022em] font-medium text-[hsl(var(--ink))] mb-4">
          Writing
        </h1>
        <p className="text-[18px] italic text-[hsl(var(--ink-muted))] max-w-2xl leading-snug">
          Deep-dive writeups on hardware and IoT security research. Each entry pins one bug or one technique to reproducible evidence.
        </p>
      </div>

      <div className="mb-6 pb-3 border-b border-[hsl(var(--rule))]">
        <input
          type="text"
          placeholder="Search by title or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value.slice(0, 100))}
          maxLength={100}
          className="w-full bg-transparent text-[hsl(var(--ink))] placeholder:text-[hsl(var(--ink-dim))] focus:outline-none text-[15px] py-2 mono"
          autoComplete="off"
        />
      </div>

      {filteredPosts.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[hsl(var(--rule))]">
          <p className="text-[hsl(var(--ink-muted))] text-[14px]">
            {search ? "No posts found matching your search." : "No posts yet."}
          </p>
        </div>
      ) : (
        <ul className="list-none p-0 m-0">
          {filteredPosts.map((post, i) => (
            <li key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                className="grid grid-cols-[auto_1fr_auto] gap-x-5 gap-y-1 py-5 border-b border-[hsl(var(--rule))] group hover:bg-[hsl(var(--paper-2)/0.5)] -mx-3 px-3 transition-colors items-baseline"
              >
                <span className="mono text-[11px] font-medium text-[hsl(var(--ink-dim))] tracking-wider pt-0.5 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[19px] leading-[1.3] font-medium tracking-tight text-[hsl(var(--ink))] group-hover:text-[hsl(var(--signature))] transition-colors text-balance">
                    {post.title}
                  </h3>
                  {post.tags.length > 0 && (
                    <div className="flex gap-3 mt-1.5 mono text-[10.5px] uppercase tracking-widest text-[hsl(var(--ink-muted))]">
                      {post.tags.slice(0, 3).map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-[hsl(var(--ink-dim))]">+{post.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                <span className="mono text-[11px] text-[hsl(var(--ink-muted))] tracking-wider whitespace-nowrap tabular-nums self-baseline">
                  {post.date}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Blog;
