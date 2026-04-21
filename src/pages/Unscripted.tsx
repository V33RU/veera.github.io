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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => (
            <Link
              key={post.slug}
              to={`/unscripted/${post.slug}`}
              className="flex flex-col border border-border/50 rounded p-4 hover:border-primary/30 transition-colors group bg-secondary/5 h-full"
            >
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-foreground font-semibold group-hover:text-primary transition-colors text-sm leading-snug">
                    <span className="text-primary/40 mr-1">&gt;</span> {post.title}
                  </p>
                  <span className="text-muted-foreground text-[10px] whitespace-nowrap shrink-0 mt-0.5">{post.date}</span>
                </div>
                <p className="text-muted-foreground text-xs line-clamp-3 flex-1">{post.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Unscripted;
