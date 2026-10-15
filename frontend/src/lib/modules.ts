export type Kind = "image" | "video" | "text";
export interface Module { kind: Kind; title: string; href: string; cta: string; blurb: string; formats: string; accept?: string; exts?: string[]; maxMb?: number; }
// Add a module here (+ a route under app/detect/<kind> + a backend detector) to extend the platform.
export const MODULES: Module[] = [
  { kind: "image", title: "Image Detection", href: "/detect/image", cta: "Analyze Image",
    blurb: "Upload an image and get a model-based estimate of whether it may be AI-generated or manipulated.",
    formats: "JPG, JPEG, PNG, WEBP", accept: ".jpg,.jpeg,.png,.webp", exts: ["jpg", "jpeg", "png", "webp"],
    maxMb: Number(process.env.NEXT_PUBLIC_MAX_IMAGE_MB ?? 10) },
  { kind: "video", title: "Video Detection", href: "/detect/video", cta: "Analyze Video",
    blurb: "Submit a video clip to be checked for indicators of deepfake manipulation.",
    formats: "MP4, MOV, WEBM", accept: ".mp4,.mov,.webm", exts: ["mp4", "mov", "webm"],
    maxMb: Number(process.env.NEXT_PUBLIC_MAX_VIDEO_MB ?? 100) },
  { kind: "text", title: "Text Detection", href: "/detect/text", cta: "Analyze Text",
    blurb: "Paste writing to check for patterns associated with AI-generated text." , formats: "Plain text" },
];
