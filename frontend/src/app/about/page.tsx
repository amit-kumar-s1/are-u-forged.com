import { CREATOR } from "@/lib/site";
export const metadata = { title: "About the Creator · Are You Forged.com" };
export default function About() {
  const links = [["GitHub", CREATOR.github], ["LinkedIn", CREATOR.linkedin], ["Portfolio", CREATOR.portfolio]].filter(l => l[1]);
  return (<main className="mx-auto max-w-3xl px-5 py-16">
    <h1 className="font-display text-4xl">Designed and Developed By</h1>
    <div className="mt-8 flex items-center gap-5"><div className="grid h-16 w-16 place-items-center rounded-full border border-line bg-panel font-display text-xl" aria-hidden>{CREATOR.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
      <div><p className="text-xl">{CREATOR.name}</p><p className="text-sm text-mute">{CREATOR.role}</p><p className="text-sm text-mute">{CREATOR.university}</p></div></div>
    <p className="mt-8 max-w-xl text-mute">{CREATOR.project} was created to explore AI-based content verification and responsible digital trust.</p>
    <ul className="mt-6 flex gap-4 text-sm">{links.map(([t, h]) => <li key={t}><a className="underline underline-offset-4" href={h} target="_blank" rel="noreferrer">{t}</a></li>)}</ul></main>);
}
