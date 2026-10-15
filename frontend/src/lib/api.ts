import type { Kind } from "./modules";
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface DetectionResult {
  modality: Kind; label: "real" | "fake" | "inconclusive"; fake_probability: number; confidence: number | null;
  model: string; processing_ms: number; details: Record<string, unknown>; disclaimer: string;
}
export class ApiError extends Error { constructor(public code: string, message: string) { super(message); } }
export interface Hooks { onStage: (i: number) => void; onProgress: (pct: number) => void; signal: AbortSignal; }

const parseErr = (status: number, body: any) =>
  new ApiError(body?.code ?? "error", body?.message ?? `Request failed (${status}).`);

export function analyze(kind: Kind, input: File | string, h: Hooks): Promise<DetectionResult> {
  const url = `${BASE}/api/v1/detect/${kind}`;
  h.onStage(1);
  if (typeof input === "string") {
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: input }), signal: h.signal })
      .then(async (r) => { h.onStage(2); const b = await r.json().catch(() => null); if (!r.ok) throw parseErr(r.status, b); h.onStage(3); return b; })
      .catch((e) => { if (e instanceof ApiError || e.name === "AbortError") throw e; throw new ApiError("network", "Could not reach the analysis server. Check your connection and try again."); });
  }
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest(), fd = new FormData(); fd.append("file", input);
    x.open("POST", url); x.timeout = 10 * 60 * 1000;
    x.upload.onprogress = (e) => e.lengthComputable && h.onProgress(Math.round((e.loaded / e.total) * 100));
    x.upload.onload = () => h.onStage(2);   // bytes fully sent; server is now running detection
    x.onload = () => { let b: any = null; try { b = JSON.parse(x.responseText); } catch {}
      if (x.status >= 200 && x.status < 300) { h.onStage(3); resolve(b); } else reject(parseErr(x.status, b)); };
    x.onerror = () => reject(new ApiError("network", "Could not reach the analysis server. Check your connection and try again."));
    x.ontimeout = () => reject(new ApiError("timeout", "The analysis timed out. Try a shorter or smaller file."));
    h.signal.addEventListener("abort", () => { x.abort(); reject(new DOMException("Aborted", "AbortError")); });
    x.send(fd);
  });
}
