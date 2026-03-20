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
        <div className="space-y-3">
          {posts.map(post => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="block chip-card rounded px-4 py-3 hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-foreground font-medium group-hover:text-primary transition-colors">
                    {post.title}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">{post.description}</p>
                  {post.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {post.tags.map(t => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-muted-foreground text-xs whitespace-nowrap">{post.date}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;
