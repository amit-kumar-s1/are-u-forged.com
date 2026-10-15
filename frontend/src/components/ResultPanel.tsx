"use client";
import { motion } from "framer-motion"; import { ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
import type { DetectionResult } from "@/lib/api";
const HEAD = {
  image: { real: "Likely Real", fake: "Potentially AI-Generated or Manipulated" },
  video: { real: "Likely Real", fake: "Potentially Deepfake" },
  text: { real: "Likely Human-Written", fake: "Potentially AI-Generated" },
} as const;
export default function ResultPanel({ r, children }: { r: DetectionResult; children?: React.ReactNode }) {
  const inc = r.label === "inconclusive";
  const title = inc ? "Inconclusive" : HEAD[r.modality][r.label as "real" | "fake"];
  const color = inc ? "text-warn" : r.label === "real" ? "text-real" : "text-fake";
  const Icon = inc ? ShieldQuestion : r.label === "real" ? ShieldCheck : ShieldAlert;
  const pct = Math.round(r.fake_probability * 100);
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}
      className="rounded-lg border border-line bg-panel p-6" aria-live="polite">
      <div className={`flex items-center gap-3 ${color}`}><Icon /><h2 className="font-display text-2xl">{title}</h2></div>
      <div className="mt-6">
        <div className="flex justify-between text-sm text-mute"><span>Model-estimated probability of {r.modality === "text" ? "AI-generated text" : "fake / manipulated"}</span><span className="text-ink">{pct}%</span></div>
        <div className="mt-2 h-2 rounded bg-line" role="img" aria-label={`${pct} percent`}><div className={`h-2 rounded ${inc ? "bg-warn" : r.label === "real" ? "bg-real" : "bg-fake"}`} style={{ width: `${pct}%` }} /></div>
        <p className="mt-2 text-xs text-mute">This is the model's output score, not proof. {r.confidence != null ? `The model assigns ${Math.round(r.confidence * 100)}% to its chosen label.` : "The score is too close to the middle to call either way."}</p>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div><dt className="text-mute">Model</dt><dd>{r.model}</dd></div>
        <div><dt className="text-mute">Processing time</dt><dd>{(r.processing_ms / 1000).toFixed(2)} s</dd></div>
      </dl>
      <details className="mt-5 text-sm"><summary className="cursor-pointer text-mute">Technical details</summary>
        <pre className="mt-2 overflow-x-auto rounded bg-bg p-3 text-xs text-mute">{JSON.stringify(r.details, null, 2)}</pre></details>
      <p className="mt-5 border-t border-line pt-4 text-xs text-mute">{r.disclaimer} False positives and false negatives are possible.</p>
      {children}
    </motion.section>
  );
}
