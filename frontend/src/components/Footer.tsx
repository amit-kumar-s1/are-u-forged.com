import Link from "next/link"; import { Brand } from "./Logo"; import { MODULES } from "@/lib/modules"; import { CREATOR } from "@/lib/site";
export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div><Brand /><p className="mt-4 max-w-sm text-sm text-mute">Estimates about whether images, videos and text may be AI-generated or manipulated. A tool for judgment, not a verdict.</p></div>
        <ul className="space-y-2 text-sm text-mute">{MODULES.map(m => <li key={m.kind}><Link className="hover:text-ink" href={m.href}>{m.title}</Link></li>)}</ul>
        <ul className="space-y-2 text-sm text-mute">
          <li><Link className="hover:text-ink" href="/about">About the Creator</Link></li>
          <li><Link className="hover:text-ink" href="/privacy">Privacy Policy</Link></li>
          <li><Link className="hover:text-ink" href="/privacy#limitations">Terms and Limitations</Link></li>
          <li><a className="hover:text-ink" href={CREATOR.github} target="_blank" rel="noreferrer">GitHub</a></li>
        </ul>
      </div>
      <p className="border-t border-line py-5 text-center text-xs text-mute">© {new Date().getFullYear()} Are You Forged.com</p>
    </footer>
  );
}
