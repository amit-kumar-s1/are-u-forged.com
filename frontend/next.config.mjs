const dev = process.env.NODE_ENV !== "production";
let api = "http://localhost:8000";
try { api = new URL(process.env.NEXT_PUBLIC_API_URL || api).origin; } catch {}

// CSP for this app: Next.js injects inline bootstrap scripts (no nonce configured) => 'unsafe-inline' for scripts.
// Dev needs 'unsafe-eval' for hot reload. Fonts come from Google Fonts. blob: is required for upload previews.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  `connect-src 'self' ${api}${dev ? " ws://localhost:3000" : ""}`,
  "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
].join("; ");

const headers = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  // HSTS only in production builds; Vercel serves HTTPS. Never sent over local http dev.
  ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]),
];

/** @type {import("next").NextConfig} */
export default { reactStrictMode: true, poweredByHeader: false, async headers() { return [{ source: "/:path*", headers }]; } };
