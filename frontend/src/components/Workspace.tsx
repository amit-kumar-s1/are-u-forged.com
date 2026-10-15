"use client";
import { useEffect, useRef, useState } from "react"; import Link from "next/link";
import { UploadCloud, X, Loader2, Check } from "lucide-react";
import { analyze, ApiError, type DetectionResult } from "@/lib/api"; import { MODULES, type Kind } from "@/lib/modules";
import ResultPanel from "./ResultPanel";

const MIN = 50, MAX = 20000;
const STAGES = { file: ["Preparing file", "Uploading", "Running detection", "Preparing results"], text: ["Preparing text", "Sending text", "Running detection", "Preparing results"] };
const fmt = (b: number) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.ceil(b / 1024)} KB`;

export default function Workspace({ kind }: { kind: Kind }) {
  const mod = MODULES.find(m => m.kind === kind)!, isText = kind === "text";
  const [file, setFile] = useState<File | null>(null), [text, setText] = useState("");
  const [phase, setPhase] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [stage, setStage] = useState(0), [pct, setPct] = useState(0), [err, setErr] = useState(""), [res, setRes] = useState<DetectionResult | null>(null), [drag, setDrag] = useState(false);
  const ctl = useRef<AbortController | null>(null), inp = useRef<HTMLInputElement>(null);
  const url = useRef<string>("");
  useEffect(() => () => { if (url.current) URL.revokeObjectURL(url.current); }, []);

  function pick(f?: File) {
    if (!f) return; setErr("");
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!mod.exts!.includes(ext)) return setErr(`Unsupported file type. Use ${mod.formats}.`);
    if (f.size > mod.maxMb! * 1048576) return setErr(`File is ${fmt(f.size)}; the limit is ${mod.maxMb} MB.`);
    if (url.current) URL.revokeObjectURL(url.current); url.current = URL.createObjectURL(f); setFile(f); setPhase("idle"); setRes(null);
  }
  function reset() { ctl.current?.abort(); if (url.current) URL.revokeObjectURL(url.current); url.current = ""; setFile(null); setText(""); setPhase("idle"); setRes(null); setErr(""); setPct(0); setStage(0); }
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const textErr = isText && text.trim().length > 0 && (text.trim().length < MIN ? `Enter at least ${MIN} characters (${text.trim().length} so far).` : text.length > MAX ? `Text is over the ${MAX.toLocaleString()} character limit.` : "");
  const ready = phase !== "busy" && (isText ? text.trim().length >= MIN && text.length <= MAX : !!file);

  async function run() {
    if (!ready) return; setPhase("busy"); setErr(""); setStage(0); setPct(0); ctl.current = new AbortController();
    try { setRes(await analyze(kind, isText ? text : file!, { onStage: setStage, onProgress: setPct, signal: ctl.current.signal })); setPhase("done"); }
    catch (e: any) { if (e.name === "AbortError") { setPhase("idle"); return; } setErr(e instanceof ApiError ? e.message : "Something went wrong."); setPhase("error"); }
  }
  const stages = STAGES[isText ? "text" : "file"], busy = phase === "busy";

  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="font-display text-4xl">{mod.title}</h1>
      <p className="mt-3 text-mute">{mod.blurb} {!isText && `Accepted: ${mod.formats}, up to ${mod.maxMb} MB.`}</p>

      <div className="mt-8">
        {isText ? (
          <div>
            <label htmlFor="t" className="sr-only">Text to analyze</label>
            <textarea id="t" value={text} disabled={busy} onChange={e => { setText(e.target.value); setPhase("idle"); setRes(null); }} rows={12}
              placeholder="Paste or type at least 50 characters…" className="w-full rounded-lg border border-line bg-panel p-4 text-sm leading-relaxed placeholder:text-mute" />
            <div className="mt-2 flex justify-between text-xs text-mute"><span>{words} words · {text.length.toLocaleString()} characters</span>
              <button className="hover:text-ink disabled:opacity-40" disabled={busy || !text} onClick={() => setText("")}>Clear text</button></div>
            {textErr && <p role="alert" className="mt-2 text-sm text-warn">{textErr}</p>}
          </div>
        ) : !file ? (
          <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
            className={`rounded-lg border border-dashed p-12 text-center ${drag ? "border-ink bg-panel" : "border-line"}`}>
            <UploadCloud className="mx-auto text-mute" />
            <p className="mt-3 text-sm">Drag a file here, or</p>
            <button className="btn btn-ghost mt-3" onClick={() => inp.current?.click()}>Choose file</button>
            <input ref={inp} type="file" accept={mod.accept} className="sr-only" aria-label={`Choose ${kind} file`} onChange={e => pick(e.target.files?.[0])} />
          </div>
        ) : (
          <div>
            <div className="relative overflow-hidden rounded-lg border border-line bg-panel">
              {kind === "image" ? <img src={url.current} alt="Selected upload preview" className="mx-auto max-h-[420px] object-contain" />
                : <video src={url.current} controls={!busy} className="mx-auto max-h-[420px] w-full" />}
              {busy && <><div className="scanline" /><div className="absolute inset-0 border border-ink/40" /></>}
            </div>
            <div className="mt-3 flex items-center justify-between text-sm"><span className="truncate text-mute">{file.name} · {file.name.split(".").pop()?.toUpperCase()} · {fmt(file.size)}</span>
              <button className="inline-flex items-center gap-1 text-mute hover:text-ink disabled:opacity-40" disabled={busy} onClick={reset}><X size={14} /> Remove</button></div>
          </div>
        )}
      </div>

      {err && <p role="alert" className="mt-4 rounded-md border border-fake/40 bg-fake/10 p-3 text-sm text-fake">{err}</p>}

      <div className="mt-6 flex gap-3">
        <button className="btn btn-primary" disabled={!ready} onClick={run}>{busy ? "Analyzing…" : mod.cta}</button>
        {busy && <button className="btn btn-ghost" onClick={() => ctl.current?.abort()}>Cancel</button>}
        {phase === "error" && <button className="btn btn-ghost" onClick={run}>Try again</button>}
      </div>

      {busy && <ol className="mt-6 space-y-2 text-sm" aria-live="polite">{stages.map((s, i) => (
        <li key={s} className={`flex items-center gap-2 ${i <= stage ? "text-ink" : "text-mute/50"}`}>
          {i < stage ? <Check size={14} className="text-real" /> : i === stage ? <Loader2 size={14} className="animate-spin" /> : <span className="w-3.5" />}
          {s}{i === 1 && stage === 1 && !isText && ` ${pct}%`}</li>))}</ol>}

      {phase === "done" && res && <div className="mt-8"><ResultPanel r={res}>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={reset}>{isText ? "Analyze again" : `Analyze another ${kind}`}</button>
          <button className="btn btn-ghost" onClick={reset}>Reset</button>
          <Link className="btn btn-ghost" href="/#detect">Detection home</Link></div></ResultPanel></div>}
    </main>
  );
}
