import { useState } from "react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const leftPins = [
  { to: "/", label: "HOME", pin: "01" },
  { to: "/blog", label: "BLOG", pin: "02" },
  { to: "/timeline", label: "TMLN", pin: "03" },
];

const rightPins = [
  { to: "/unscripted", label: "UNSC", pin: "06" },
  { to: "/photography", label: "PHTO", pin: "05" },
  { to: "/shop", label: "SHOP", pin: "04" },
];

const allPins = [
  { to: "/", label: "~/home", pin: "01" },
  { to: "/blog", label: "~/blog", pin: "02" },
  { to: "/timeline", label: "~/timeline", pin: "03" },
  { to: "/shop", label: "~/shop", pin: "04" },
  { to: "/photography", label: "~/photos", pin: "05" },
  { to: "/unscripted", label: "~/unscripted", pin: "06" },
];

const PinLink = ({ to, label, pin, side }: { to: string; label: string; pin: string; side: "left" | "right" }) => {
  const { pathname } = useLocation();
  const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);

  const content = side === "left" ? (
    <>
      <span className="text-[10px] font-light opacity-40 w-4 text-right mr-1">{pin}</span>
      <span className={cn("text-xs tracking-widest px-3 py-1.5 transition-all", isActive && "text-primary phosphor-glow-subtle")}>
        {label}
      </span>
      <div className={cn("w-12 lg:w-20 h-[2px] transition-all", isActive ? "bg-primary shadow-[0_0_6px_hsl(38_80%_55%/0.4)]" : "bg-border group-hover:bg-primary/50")} />
      <div className={cn("w-[7px] h-[7px] rounded-full transition-all", isActive ? "bg-primary shadow-[0_0_8px_hsl(38_80%_55%/0.5)]" : "bg-muted-foreground/30 group-hover:bg-primary/50")} />
    </>
  ) : (
    <>
      <div className={cn("w-[7px] h-[7px] rounded-full transition-all", isActive ? "bg-primary shadow-[0_0_8px_hsl(38_80%_55%/0.5)]" : "bg-muted-foreground/30 group-hover:bg-primary/50")} />
      <div className={cn("w-12 lg:w-20 h-[2px] transition-all", isActive ? "bg-primary shadow-[0_0_6px_hsl(38_80%_55%/0.4)]" : "bg-border group-hover:bg-primary/50")} />
      <span className={cn("text-xs tracking-widest px-3 py-1.5 transition-all", isActive && "text-primary phosphor-glow-subtle")}>
        {label}
      </span>
      <span className="text-[10px] font-light opacity-40 w-4 ml-1">{pin}</span>
    </>
  );

  return (
    <RouterNavLink
      to={to}
      className="group flex items-center gap-0 text-muted-foreground hover:text-primary transition-all"
    >
      {content}
    </RouterNavLink>
  );
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      {/* Desktop: IC Chip Layout */}
      <div className="hidden md:block">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="relative flex items-stretch justify-center">
            {/* Left pins */}
            <div className="flex flex-col justify-center gap-0">
              {leftPins.map((item) => (
                <PinLink key={item.to} {...item} side="left" />
              ))}
            </div>

            {/* Center chip body */}
            <div className="relative border border-border bg-card mx-0 px-8 py-4 min-w-[160px] flex flex-col items-center justify-center">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[1px] w-6 h-3 rounded-b-full border border-t-0 border-border bg-background" />
              {/* Pin 1 dot */}
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-primary/30" />

              <RouterNavLink to="/" className="text-primary font-bold text-lg phosphor-glow tracking-[0.3em] leading-none">
                Mr-IoT
              </RouterNavLink>

              {/* Bottom pad traces */}
              <div className="absolute bottom-1 right-2 flex gap-[2px]">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-[3px] h-[6px] bg-border/50" />
                ))}
              </div>
            </div>

            {/* Right pins */}
            <div className="flex flex-col justify-center gap-0">
              {rightPins.map((item) => (
                <PinLink key={item.to} {...item} side="right" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden border-b border-border">
        <div className="px-4 py-3 flex items-center justify-between">
          <RouterNavLink to="/" className="text-primary font-bold text-lg phosphor-glow tracking-wider">
            Mr-IoT
          </RouterNavLink>
          <button
            className="text-primary border border-border p-1.5 rounded-sm"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border overflow-hidden"
            >
              <div className="px-4 py-2 space-y-0">
                {allPins.map((item) => (
                  <RouterNavLink
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 px-2 py-2.5 text-sm text-muted-foreground hover:text-primary transition-colors border-b border-border/30 last:border-0"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="text-[10px] text-primary/40 w-4 font-mono">{item.pin}</span>
                    <div className="w-3 h-[2px] bg-border" />
                    <div className="w-[5px] h-[5px] rounded-full bg-muted-foreground/30" />
                    <span className="tracking-wider">{item.label}</span>
                  </RouterNavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
