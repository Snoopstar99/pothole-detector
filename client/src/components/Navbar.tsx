/**
 * Navbar – top navigation bar
 * Design: Bold AI-Tech – glassmorphism nav with teal logo accent
 */

export default function Navbar() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/30"
      style={{ background: "oklch(0.13 0.025 265 / 0.85)", backdropFilter: "blur(16px)" }}
    >
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center pulse-glow">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-foreground text-lg leading-none">PotholeScan</span>
            <span className="block text-xs mono text-primary leading-none">AI Detection</span>
          </div>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollTo("detect")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Detect
          </button>
          <button
            onClick={() => scrollTo("how-it-works")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            How It Works
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={() => scrollTo("detect")}
          className="btn-teal px-4 py-2 rounded-lg text-sm font-bold"
        >
          Try Now →
        </button>
      </div>
    </nav>
  );
}
