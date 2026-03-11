/**
 * HowItWorks – step-by-step explanation section
 * Design: Bold AI-Tech – numbered steps with teal accent lines
 */

const POTHOLE_SAMPLE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663425087452/cd4u2oyPLnybb3ZSNzBkHU/pothole-sample-JrCbPdsoZFz4Rb2RZ7KqXk.webp";

const steps = [
  {
    num: "01",
    title: "Upload Road Image",
    desc: "Drag and drop or click to upload any road photograph — JPG, PNG, or WEBP up to 20MB.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "AI Inference",
    desc: "Your image is sent to the Roboflow-hosted model which runs object detection inference in real time.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.213c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Bounding Box Overlay",
    desc: "Detected potholes are highlighted with precise bounding boxes drawn directly on your image.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Confidence Report",
    desc: "Each detection includes a confidence score and severity rating so you can prioritize road repairs.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left – steps */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mono bg-primary/10 text-primary border border-primary/20 mb-4">
              HOW IT WORKS
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
              Four steps to road intelligence
            </h2>
            <p className="text-muted-foreground mb-10 text-lg">
              From image upload to annotated results in seconds — powered by a trained computer vision model.
            </p>

            <div className="space-y-6">
              {steps.map((step, idx) => (
                <div key={step.num} className="flex gap-5 group">
                  {/* Step connector */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                      {step.icon}
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="w-px flex-1 mt-2 bg-gradient-to-b from-primary/30 to-transparent min-h-6" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs mono text-primary font-bold">{step.num}</span>
                      <h3 className="font-bold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – sample image */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-primary/5 blur-3xl pointer-events-none" />
            <div className="relative glass-card rounded-2xl overflow-hidden">
              <img
                src={POTHOLE_SAMPLE}
                alt="Example of a damaged road with potholes"
                className="w-full h-72 object-cover"
              />
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Road Damage Example</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Upload images like this to detect and count potholes automatically.
                    </p>
                  </div>
                </div>

                {/* Tech badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {["YOLOv8", "Roboflow", "Computer Vision", "Object Detection"].map((tag) => (
                    <span key={tag} className="text-xs mono px-2 py-1 rounded-md bg-muted/50 border border-border/50 text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
