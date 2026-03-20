const Footer = () => {
  return (
    <footer className="border-t border-border mt-20">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-center text-sm text-muted-foreground italic">
          "In a world of closed devices, open-source is rebellion."
        </p>
        <p className="text-center text-xs text-muted-foreground/50 mt-2">
          — Mr-IoT • {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
