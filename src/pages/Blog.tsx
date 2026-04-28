import { Link } from "react-router-dom";
import { useState } from "react";
import { getBlogPosts } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";
import SilkscreenLabel from "@/components/SilkscreenLabel";

const Blog = () => {
  const posts = getBlogPosts();
  const [search, setSearch] = useState("");

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SilkscreenLabel designator="U3" label="blog" className="mb-6" />

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search posts by title or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value.slice(0, 100))}
          maxLength={100}
          className="w-full px-3 py-2 rounded border border-secondary bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          autoComplete="off"
        />
      </div>

      {filteredPosts.length === 0 ? (
        <div className="chip-card rounded p-8 text-center">
          <p className="text-muted-foreground text-sm">
            {search ? "No posts found matching your search." : "No posts yet. Add .md files to /content/blog/"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPosts.map(post => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded hover:bg-secondary/40 transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <p className="text-foreground font-semibold group-hover:text-primary transition-colors text-sm truncate">
                  {post.title}
                </p>
                {post.tags.length > 0 && (
                  <div className="flex gap-1 shrink-0">
                    {post.tags.slice(0, 2).map(t => (
                      <Badge key={t} variant="secondary" className="text-[9px] px-1 py-0">{t}</Badge>
                    ))}
                    {post.tags.length > 2 && (
                      <span className="text-muted-foreground text-[9px]">+{post.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </div>
              <span className="text-muted-foreground text-[10px] whitespace-nowrap shrink-0">{post.date}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;
