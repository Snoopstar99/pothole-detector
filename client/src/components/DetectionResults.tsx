/**
 * DetectionResults – displays Roboflow API detection results
 */

interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
}

interface Result {
  predictions: Detection[];
  image: { width: number; height: number };
}

interface Props {
  result: Result;
  imageUrl: string | null;
  onReset: () => void;
}

export default function DetectionResults({ result, imageUrl, onReset }: Props) {
  const totalDetections = result.predictions.length;
  const avgConfidence =
    totalDetections > 0
      ? (result.predictions.reduce((s, p) => s + p.confidence, 0) / totalDetections * 100).toFixed(1)
      : 0;

  const severityLabel = (conf: number) => {
    if (conf >= 0.8) return { label: "HIGH", color: "text-red-400", bg: "bg-red-400/10" };
    if (conf >= 0.6) return { label: "MED", color: "text-amber-400", bg: "bg-amber-400/10" };
    return { label: "LOW", color: "text-green-400", bg: "bg-green-400/10" };
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image display */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <span className="text-sm font-semibold text-primary mono">DETECTION RESULTS</span>
              <button
                onClick={onReset}
                className="text-xs px-3 py-1 rounded-md border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                ← Back
              </button>
            </div>
            {imageUrl && (
              <img src={imageUrl} alt="Analyzed" className="w-full h-auto" />
            )}
          </div>
        </div>

        {/* Stats panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Summary */}
          <div className="glass-card rounded-xl p-5">
            <p className="text-xs text-muted-foreground mono mb-3">SUMMARY</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-extrabold leading-none">{totalDetections}</span>
              <div className="pb-1">
                <p className="text-sm font-semibold">
                  {totalDetections === 1 ? "Pothole" : "Potholes"}
                </p>
                <p className="text-xs text-muted-foreground">detected</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground mb-1">Average Confidence</p>
              <p className="text-2xl font-bold">{avgConfidence}%</p>
            </div>
          </div>

          {/* Detections list */}
          {totalDetections > 0 && (
            <div className="glass-card rounded-xl p-5">
              <p className="text-xs text-muted-foreground mono mb-3">DETECTIONS</p>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {result.predictions.map((pred, idx) => {
                  const sev = severityLabel(pred.confidence);
                  const conf = Math.round(pred.confidence * 100);
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-xs mono text-muted-foreground">#{idx + 1}</p>
                        <p className="text-sm font-semibold capitalize">{pred.class}</p>
                      </div>
                      <span className={`text-xs mono font-bold px-2 py-1 rounded ${sev.bg} ${sev.color}`}>
                        {sev.label} {conf}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status */}
          <div className={`
            rounded-xl p-4 border text-sm font-semibold flex items-center gap-2
            ${totalDetections > 0
              ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
              : "bg-green-400/10 border-green-400/30 text-green-400"
            }
          `}>
            {totalDetections > 0 ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Road damage detected
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Road appears clear
              </>
            )}
          </div>

          {/* New analysis button */}
          <button
            onClick={onReset}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            ↑ Analyze Another Image
          </button>
        </div>
      </div>
    </div>
  );
}
