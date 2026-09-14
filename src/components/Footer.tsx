const Footer = () => {
  return (
    <footer className="border-t border-primary/30 mt-20 bg-secondary/20">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-center text-base sm:text-lg text-primary phosphor-glow-subtle italic font-medium">
          "In a world of closed devices, open-source is rebellion."
        </p>
        <p className="text-center text-sm text-foreground/80 mt-3 tracking-wide">
          <span className="text-primary/60">-</span> Mr-IoT
          <span className="text-primary/40 mx-2">•</span>
          {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
