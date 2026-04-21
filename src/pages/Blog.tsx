import { Link } from "react-router-dom";
import { getBlogPosts } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";
import SilkscreenLabel from "@/components/SilkscreenLabel";

const Blog = () => {
  const posts = getBlogPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SilkscreenLabel designator="U3" label="blog" className="mb-6" />

      {posts.length === 0 ? (
        <div className="chip-card rounded p-8 text-center">
          <p className="text-muted-foreground text-sm">No posts yet. Add .md files to /content/blog/</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="flex flex-col chip-card rounded p-4 hover:border-primary/50 transition-colors group h-full"
            >
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-foreground font-semibold group-hover:text-primary transition-colors text-sm leading-snug">
                    {post.title}
                  </p>
                  <span className="text-muted-foreground text-[10px] whitespace-nowrap shrink-0 mt-0.5">{post.date}</span>
                </div>
                <p className="text-muted-foreground text-xs line-clamp-3 flex-1">{post.description}</p>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto pt-2">
                    {post.tags.map(t => (
                      <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;
