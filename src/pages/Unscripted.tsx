import { Link } from "react-router-dom";
import { getUnscriptedPosts } from "@/lib/markdown";
import { Badge } from "@/components/ui/badge";
import SilkscreenLabel from "@/components/SilkscreenLabel";

const Unscripted = () => {
  const posts = getUnscriptedPosts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <SilkscreenLabel designator="U4" label="unscripted" className="mb-6" />

      {posts.length === 0 ? (
        <div className="chip-card rounded p-8 text-center">
          <p className="text-muted-foreground text-sm">No thoughts yet. Add .md files to /content/unscripted/</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <Link
              key={post.slug}
              to={`/unscripted/${post.slug}`}
              className="block border border-border/50 rounded px-4 py-3 hover:border-primary/30 transition-colors group bg-secondary/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-foreground font-medium group-hover:text-primary transition-colors">
                    <span className="text-primary/40 mr-1">&gt;</span> {post.title}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">{post.description}</p>
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

export default Unscripted;
