import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Writing" },
  { to: "/timeline", label: "Timeline" },
  { to: "/unscripted", label: "Notes" },
  { to: "/photography", label: "Photos" },
  { to: "/shop", label: "Shop" },
];

const THEME_KEY = "mr-iot-theme";

type ThemeMode = "light" | "dark" | "auto";

function getStoredTheme(): ThemeMode {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === "light" || t === "dark") return t;
  } catch {
    // Ignore storage errors (private mode etc.)
  }
  return "auto";
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "light") root.setAttribute("data-theme", "light");
  else if (mode === "dark") root.setAttribute("data-theme", "dark");
  else root.removeAttribute("data-theme");
}

function currentIsDark(): boolean {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark") return true;
  if (attr === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    applyTheme(getStoredTheme());
    setIsDark(currentIsDark());
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = currentIsDark() ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Ignore
    }
    setIsDark(next === "dark");
  };

  return (
    <nav className="sticky top-0 z-40 bg-[hsl(var(--paper)/0.94)] backdrop-blur-sm border-b border-[hsl(var(--rule))]">
      <div className="mx-auto max-w-4xl px-5 md:px-8 py-4 flex items-center gap-4">
        <NavLink to="/" className="flex items-center gap-3 group" aria-label="Mr-IoT home">
          <span className="w-9 h-9 flex items-center justify-center border border-[hsl(var(--rule-strong))] bg-[hsl(var(--paper-2))] font-medium text-[hsl(var(--ink))] italic text-lg leading-none tracking-[-0.06em] group-hover:border-[hsl(var(--signature))] transition-colors">
            <span>M</span><sub className="text-[hsl(var(--signature))] text-[12px] ml-[1px] align-baseline">i</sub>
          </span>
          <span className="hidden sm:flex flex-col">
            <span className="text-[15px] font-medium leading-tight tracking-tight">
              Veerababu P <span className="text-[hsl(var(--signature))]">Mr-IoT</span>
            </span>
            <span className="mono text-[10px] uppercase tracking-widest text-[hsl(var(--ink-muted))] leading-tight">
              Hardware &amp; IoT security research
            </span>
          </span>
        </NavLink>

        <div className="hidden md:flex items-center gap-6 ml-auto mono text-[11.5px] uppercase tracking-[0.14em] text-[hsl(var(--ink-muted))]">
          {links.slice(1).map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                isActive
                  ? "text-[hsl(var(--ink))] border-b border-[hsl(var(--signature))] pb-0.5"
                  : "hover:text-[hsl(var(--ink))] transition-colors"
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="ml-auto md:ml-0 flex items-center justify-center w-8 h-8 border border-[hsl(var(--rule))] text-[hsl(var(--ink-muted))] hover:text-[hsl(var(--ink))] hover:border-[hsl(var(--rule-strong))] transition-colors"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        <button
          type="button"
          className="md:hidden flex items-center justify-center w-8 h-8 border border-[hsl(var(--rule))] text-[hsl(var(--ink-muted))] hover:text-[hsl(var(--ink))]"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={14} /> : <Menu size={14} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[hsl(var(--rule))] bg-[hsl(var(--paper))]">
          <div className="mx-auto max-w-4xl px-5 py-3 flex flex-col gap-2 mono text-[13px] uppercase tracking-[0.12em]">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  isActive
                    ? "py-2 text-[hsl(var(--signature))]"
                    : "py-2 text-[hsl(var(--ink-2))] hover:text-[hsl(var(--ink))]"
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
