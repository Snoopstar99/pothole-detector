/**
 * Footer – site footer
 * Design: Bold AI-Tech – minimal dark footer with teal brand accent
 */

export default function Footer() {
  return (
    <footer className="border-t border-border/30 py-10">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-foreground text-sm">PotholeScan</span>
              <span className="ml-1.5 text-xs mono text-muted-foreground">by King Alvan</span>
            </div>
          </div>

          {/* Center info */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              KSEF Competition Project · AI & Computer Vision
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Powered by{" "}
              <a
                href="https://roboflow.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Roboflow
              </a>{" "}
              · Model: pothole-detection-iwfu9/3
            </p>
          </div>

          {/* Tech stack */}
          <div className="flex items-center gap-2">
            {["React", "Roboflow API", "TypeScript"].map((t) => (
              <span key={t} className="text-xs mono px-2 py-1 rounded-md bg-muted/30 border border-border/30 text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
