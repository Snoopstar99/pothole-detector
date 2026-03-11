/**
 * HeroSection – full-width hero with generated background image
 * Design: Bold AI-Tech – dark overlay on road image with teal/amber accents
 * Image: hero-bg.webp (AI-generated aerial road with teal grid)
 */

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663425087452/cd4u2oyPLnybb3ZSNzBkHU/hero-bg-CoRyAWx7hD4z8BhzHihWFG.webp";
const SCAN_ILLUS = "https://d2xsxph8kpxj0f.cloudfront.net/310519663425087452/cd4u2oyPLnybb3ZSNzBkHU/scan-illustration-nkNY8uyvroRUSqJneLQoNg.webp";

export default function HeroSection() {
  const scrollToDetect = () => {
    document.getElementById("detect")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      style={{
        backgroundImage: `url(${HERO_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left – text */}
          <div className="fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs mono font-semibold text-primary">KSEF COMPETITION PROJECT</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6">
              <span className="text-foreground">Detect</span>
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, oklch(0.72 0.18 200), oklch(0.78 0.17 55))" }}
              >
                Potholes
              </span>
              <br />
              <span className="text-foreground">with AI</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              Upload any road image and our computer vision model — trained on real-world road data — will instantly identify potholes with precise bounding boxes and confidence scores.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 mb-8">
              {[
                { value: "AI", label: "Powered Model" },
                { value: "Real-time", label: "Detection" },
                { value: "Roboflow", label: "Infrastructure" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={scrollToDetect}
                className="btn-teal px-8 py-3.5 rounded-xl text-base font-bold inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Start Detection
              </button>
              <button
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="px-8 py-3.5 rounded-xl border border-border/50 text-foreground font-semibold text-base hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                How It Works
              </button>
            </div>
          </div>

          {/* Right – scan illustration */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-primary/10 blur-2xl" />
              <img
                src={SCAN_ILLUS}
                alt="AI pothole detection illustration"
                className="relative w-80 h-80 object-cover rounded-2xl border border-primary/20 shadow-2xl"
                style={{ boxShadow: "0 0 60px oklch(0.72 0.18 200 / 0.2)" }}
              />
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 glass-card rounded-xl px-4 py-3 border border-primary/30">
                <p className="text-xs mono text-primary font-semibold">MODEL ACTIVE</p>
                <p className="text-sm font-bold text-foreground">pothole-detection-iwfu9</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-green-400 mono">v3 · Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
        <span className="text-xs mono text-muted-foreground">Scroll to detect</span>
        <div className="w-5 h-8 rounded-full border border-border/50 flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </section>
  );
}
