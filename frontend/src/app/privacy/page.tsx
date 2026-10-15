export const metadata = { title: "Privacy & Limitations · Are You Forged.com" };
export default function Privacy() {
  return (<main className="mx-auto max-w-3xl px-5 py-16 text-sm leading-relaxed text-mute [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_section]:mb-12">
    <h1 className="mb-10 font-display text-4xl text-ink">Privacy and Limitations</h1>
    <section><h2>Privacy</h2>
      <p>Content you submit is sent to the backend to be analyzed. Uploaded videos are written to a temporary file named by the server and removed when analysis ends, whether it succeeds or fails. Images are processed in memory. The server does not log the text or file contents you submit.</p>
      <p className="mt-3">This policy describes the application code as shipped. It cannot speak for how a particular host, proxy or CDN handles traffic: whoever deploys this should review their provider's logging and retention practices. There are no user accounts and no payment data.</p></section>
    <section id="limitations"><h2>Limitations</h2>
      <p>Results are estimates, not proof. Models can flag genuine content (false positives) and miss manipulated content (false negatives), and perform worse on content unlike their training data. Compressed, cropped or screenshotted media is harder to assess. Text detection in particular is unreliable and must not be used as the sole basis for accusing anyone.</p>
      <p className="mt-3">The score shown is the model's probability that content is fake or AI-generated. It is not the probability that the content is genuine, and a high score for the predicted label is not a guarantee.</p></section>
  </main>);
}
