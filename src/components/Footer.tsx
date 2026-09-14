const Footer = () => {
  return (
    <footer className="mt-24 border-t border-[hsl(var(--rule))]">
      <div className="mx-auto max-w-4xl px-5 md:px-8 py-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-baseline">
        <p className="italic text-[hsl(var(--ink))] text-[15px] leading-relaxed max-w-sm">
          &ldquo;In a world of closed devices, open source is rebellion.&rdquo;
        </p>
        <p className="mono text-[10.5px] uppercase tracking-[0.14em] text-[hsl(var(--ink-muted))] md:text-right">
          Mr-IoT &nbsp;/&nbsp; Bengaluru &nbsp;/&nbsp; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
