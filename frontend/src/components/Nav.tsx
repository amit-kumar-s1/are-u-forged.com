"use client";
import Link from "next/link"; import { useState } from "react"; import { Menu, X } from "lucide-react"; import { Brand } from "./Logo";
const L = [["Home", "/"], ["Detect Content", "/#detect"], ["How It Works", "/#how"], ["About the Creator", "/about"]];
export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5" aria-label="Main">
        <Link href="/" aria-label="Are You Forged.com home"><Brand /></Link>
        <ul className="hidden items-center gap-7 text-sm text-mute md:flex">
          {L.map(([t, h]) => <li key={t}><Link className="hover:text-ink" href={h}>{t}</Link></li>)}
          <li><Link href="/#detect" className="btn btn-primary">Start Detection</Link></li>
        </ul>
        <button className="md:hidden" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </nav>
      {open && <ul className="border-t border-line px-5 py-3 md:hidden">{[...L, ["Start Detection", "/#detect"]].map(([t, h]) =>
        <li key={t}><Link onClick={() => setOpen(false)} className="block py-2.5 text-mute hover:text-ink" href={h}>{t}</Link></li>)}</ul>}
    </header>
  );
}
