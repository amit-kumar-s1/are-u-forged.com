// Brand mark: low-poly face mesh inside scan-frame corners (after the supplied reference).
// Right half is drawn once and mirrored, so the face is symmetric. Strokes use non-scaling-stroke to stay crisp at small sizes.
const OUTLINE = "M50 8 L66 12 L77 24 L79 40 L81 46 L85 50 L84 58 L80 62 L76 74 L66 86 L50 92";
const MESH = "M50 8 L58 30 M66 12 L58 30 M77 24 L58 30 M58 30 L50 38 M58 30 L72 34 M79 40 L72 34 M72 34 L66 44 M58 30 L66 44 M54 40 L64 38 L74 40 M70 45 L76 54 M62 49 L66 58 M76 54 L66 58 M66 58 L58 62 M76 54 L80 62 M66 58 L72 68 M80 62 L72 68 M72 68 L62 76 M62 76 L66 86 M62 76 L58 62 M52 40 L53 54 M53 54 L57 60 L50 62 M57 60 L58 56 L53 54 M58 62 L58 71 M50 70 L58 71 L63 70 M58 71 L52 75 L50 75 M62 76 L58 71 M50 80 L58 78 M58 78 L66 86 M58 78 L50 92 M81 46 L84 52 L80 58 M72 34 L77 24";
const EYE = "M55 46 L62 43 L70 45 L62 49 Z";
const Half = () => (<g transform="translate(6 0) scale(.88 1)">
  <path d={MESH} stroke="#e9e7e2" strokeOpacity=".5" strokeWidth=".8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
  <path d={OUTLINE} stroke="#e9e7e2" strokeWidth="1.3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
  <path d={EYE} stroke="#86b594" strokeWidth="1.1" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
</g>);
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      <path d="M3 20V3h17M80 3h17v17M97 80v17H80M20 97H3V80" stroke="#86b594" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinecap="square" />
      <path d="M50 8V92" stroke="#e9e7e2" strokeOpacity=".35" strokeWidth=".8" vectorEffect="non-scaling-stroke" />
      <Half />
      <g transform="translate(100 0) scale(-1 1)"><Half /></g>
    </svg>
  );
}
export function Brand() {
  return <span className="flex items-center gap-2.5"><LogoMark /><span className="font-display text-xl tracking-tight">Are You Forged<span className="text-mute">.com</span></span></span>;
}
