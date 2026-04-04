export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
  content: string;
}

function parseFrontmatter(raw: string): { meta: Record<string, any>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };
  
  const meta: Record<string, any> = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    // Parse arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        meta[key] = JSON.parse(value);
      } catch {
        meta[key] = value;
      }
    } else {
      meta[key] = value;
    }
  });
  
  return { meta, content: match[2] };
}

// Blog posts
const blogModules = import.meta.glob('/content/blog/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const unscriptedModules = import.meta.glob('/content/unscripted/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function loadPosts(modules: Record<string, string>): BlogPost[] {
  return Object.entries(modules).map(([path, raw]) => {
    const slug = path.split('/').pop()?.replace('.md', '') || '';
    const { meta, content } = parseFrontmatter(raw);
    return {
      slug,
      title: meta.title || slug,
      date: meta.date || '',
      tags: meta.tags || [],
      description: meta.description || '',
      content,
    };
  }).sort((a, b) => (b.date > a.date ? 1 : -1));
}

let _blogPosts: BlogPost[] | null = null;
let _unscriptedPosts: BlogPost[] | null = null;

export function getBlogPosts(): BlogPost[] {
  if (!_blogPosts) _blogPosts = loadPosts(blogModules);
  return _blogPosts;
}

export function getUnscriptedPosts(): BlogPost[] {
  if (!_unscriptedPosts) _unscriptedPosts = loadPosts(unscriptedModules);
  return _unscriptedPosts;
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getBlogPosts().find(p => p.slug === slug);
}

export function getUnscriptedPost(slug: string): BlogPost | undefined {
  return getUnscriptedPosts().find(p => p.slug === slug);
}
