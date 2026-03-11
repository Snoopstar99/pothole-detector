/**
 * StatsPanel – shows detection statistics and per-pothole confidence breakdown
 * Design: Bold AI-Tech – glassmorphism cards with teal/amber accents
 */

import type { DetectionResult } from "@/pages/Home";

interface Props {
  result: DetectionResult | null;
  isAnalyzing: boolean;
  imageFile: File | null;
  onNewImage: () => void;
}

export default function StatsPanel({ result, isAnalyzing, imageFile, onNewImage }: Props) {
  const avgConf = result && result.predictions.length > 0
    ? result.predictions.reduce((s, p) => s + p.confidence, 0) / result.predictions.length
    : 0;

  const maxConf = result && result.predictions.length > 0
    ? Math.max(...result.predictions.map((p) => p.confidence))
    : 0;

  const severityLabel = (conf: number) => {
    if (conf >= 0.8) return { label: "HIGH", color: "text-red-400", bg: "bg-red-400/10 border-red-400/30" };
    if (conf >= 0.6) return { label: "MED", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" };
    return { label: "LOW", color: "text-teal-400", bg: "bg-teal-400/10 border-teal-400/30" };
  };

  const confColor = (conf: number) => {
    if (conf >= 0.7) return "bg-primary";
    if (conf >= 0.5) return "bg-amber-400";
    return "bg-red-400";
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Summary card */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs mono font-semibold text-primary">ANALYSIS SUMMARY</span>
        </div>

        {isAnalyzing ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 rounded bg-muted animate-pulse" style={{ width: `${60 + i * 15}%` }} />
            ))}
          </div>
        ) : result ? (
          <div className="space-y-4">
            {/* Pothole count */}
            <div className="flex items-end gap-3">
              <span className="text-5xl font-extrabold text-foreground leading-none">
                {result.predictions.length}
              </span>
              <div className="pb-1">
                <p className="text-sm font-semibold text-foreground">
                  {result.predictions.length === 1 ? "Pothole" : "Potholes"}
                </p>
                <p className="text-xs text-muted-foreground">detected</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatBox
                label="Avg Confidence"
                value={`${Math.round(avgConf * 100)}%`}
                sub="model certainty"
              />
              <StatBox
                label="Peak Confidence"
                value={`${Math.round(maxConf * 100)}%`}
                sub="highest detection"
              />
              <StatBox
                label="Image Size"
                value={`${result.image.width}×${result.image.height}`}
                sub="pixels"
              />
              <StatBox
                label="Scan Time"
                value={result.time ? `${(result.time / 1000).toFixed(2)}s` : "—"}
                sub="inference time"
              />
            </div>

            {/* Status badge */}
            <div className={`
              flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold
              ${result.predictions.length > 0
                ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
                : "bg-primary/10 border-primary/30 text-primary"
              }
            `}>
              {result.predictions.length > 0 ? (
                <>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Road damage detected
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Road appears clear
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Waiting for analysis…</p>
        )}
      </div>

      {/* Per-detection list */}
      {result && result.predictions.length > 0 && (
        <div className="glass-card rounded-xl p-5 flex-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs mono font-semibold text-amber-400">DETECTIONS</span>
          </div>
          <div className="space-y-3 stagger-children">
            {result.predictions.map((pred, idx) => {
              const sev = severityLabel(pred.confidence);
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs mono text-muted-foreground w-5 shrink-0">#{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold capitalize">{pred.class}</span>
                      <span className={`text-xs mono font-bold px-2 py-0.5 rounded border ${sev.bg} ${sev.color}`}>
                        {sev.label}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full fill-bar ${confColor(pred.confidence)}`}
                        style={{ width: `${Math.round(pred.confidence * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs mono text-muted-foreground">
                      {Math.round(pred.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* File info */}
      {imageFile && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span className="text-xs mono font-semibold text-muted-foreground">FILE INFO</span>
          </div>
          <p className="text-xs text-foreground font-medium truncate">{imageFile.name}</p>
          <p className="text-xs text-muted-foreground mono">
            {(imageFile.size / 1024).toFixed(1)} KB · {imageFile.type}
          </p>
        </div>
      )}

      {/* New image button */}
      <button
        onClick={onNewImage}
        className="w-full py-3 rounded-xl border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors"
      >
        ↑ Analyze Another Image
      </button>
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold mono text-foreground leading-none">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}
