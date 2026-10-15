import Link from "next/link"; import { Image as Img, Video, FileText } from "lucide-react"; import { MODULES } from "@/lib/modules"; import { CREATOR } from "@/lib/site";
const ICON = { image: Img, video: Video, text: FileText };
const STEPS = [["Submit", "Upload an image or video, or paste text."], ["Analyze", "The selected detection service processes what you submitted."], ["Review", "See the result, the model's score where available, and technical details."]];
export default function Home() {
  return (<main>
    <section className="mx-auto max-w-6xl px-5 pb-24 pt-24">
      <h1 className="max-w-3xl font-display text-5xl leading-[1.05] md:text-7xl">Truth Deserves to Be Verified.</h1>
      <p className="mt-6 max-w-xl text-lg text-mute">Analyze images, videos, and text with AI-powered detection tools designed to help you identify potentially manipulated or artificially generated content.</p>
      <div className="mt-9 flex flex-wrap gap-3"><Link className="btn btn-primary" href="/#detect">Start Detection</Link><Link className="btn btn-ghost" href="/#how">Explore the Technology</Link></div>
      <figure className="mt-16 max-w-md border-l border-line pl-5">
        <blockquote lang="sa" className="font-deva text-xl leading-relaxed">नासतो विद्यते भावो नाभावो विद्यते सतः।</blockquote>
        <figcaption className="mt-2 text-sm text-mute">Bhagavad Gita 2.16 — a modern reflection: what is unreal does not truly endure; what is real does not cease to be. Seek what is real.</figcaption>
      </figure>
    </section>
    <section id="detect" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-20">
      <h2 className="font-display text-3xl">Choose what to check</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">{MODULES.map(m => { const I = ICON[m.kind]; return (
        <Link key={m.kind} href={m.href} className="group flex flex-col rounded-lg border border-line bg-panel p-6 hover:border-mute">
          <I className="text-mute group-hover:text-ink" /><h3 className="mt-5 font-display text-xl">{m.title}</h3>
          <p className="mt-2 flex-1 text-sm text-mute">{m.blurb}</p><p className="mt-4 text-xs text-mute">{m.formats}</p>
          <span className="btn btn-ghost mt-5">{m.cta}</span></Link>); })}</div>
    </section>
    <section id="how" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-20">
      <h2 className="font-display text-3xl">How it works</h2>
      <ol className="mt-8 grid gap-8 md:grid-cols-3">{STEPS.map(([t, d], i) => <li key={t} className="border-t border-line pt-4"><span className="text-sm text-mute">Step {i + 1}</span><h3 className="font-display text-xl">{t}</h3><p className="mt-1 text-sm text-mute">{d}</p></li>)}</ol>
      <p className="mt-8 max-w-2xl text-sm text-mute">Results are estimates. Detection models can be wrong in both directions: real content flagged as fake, and fake content passing as real.</p>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="font-display text-3xl">Responsible by design</h2>
      <ul className="mt-6 grid gap-x-12 gap-y-3 text-sm text-mute md:grid-cols-2">
        <li>Results show the model's raw score and what it means, nothing more.</li><li>Predictions are inputs to your judgment, never a final ruling.</li>
        <li>Uploads are processed for analysis; see the Privacy page for exactly what happens.</li><li>Automated detection has real limits, listed on the Limitations page.</li></ul>
      <figure className="mt-10 max-w-md border-l border-line pl-5"><blockquote lang="sa" className="font-deva text-lg">न हि ज्ञानेन सदृशं पवित्रमिह विद्यते।</blockquote>
        <figcaption className="mt-2 text-sm text-mute">Bhagavad Gita 4.38 — nothing here is as purifying as knowledge. Informed judgment comes first.</figcaption></figure>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-20"><h2 className="font-display text-3xl">Designed and developed by</h2>
      <p className="mt-4 text-lg">{CREATOR.name}</p><p className="text-sm text-mute">{CREATOR.role} · {CREATOR.university}</p>
      <Link className="btn btn-ghost mt-5" href="/about">About the creator</Link></section>
  </main>);
}
