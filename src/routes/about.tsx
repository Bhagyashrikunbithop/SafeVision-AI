import { createFileRoute } from "@tanstack/react-router";
import { Brain, Camera, Image as ImageIcon, ScanLine, ShieldCheck, Video } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SafeVision AI – How Helmet Detection Works" },
      {
        name: "description",
        content:
          "Learn how SafeVision AI uses YOLO detection, number-plate detection and OCR to support helmet compliance and road-safety monitoring.",
      },
      { property: "og:title", content: "About SafeVision AI" },
      {
        property: "og:description",
        content:
          "How SafeVision AI applies YOLO detection, number-plate detection and OCR to road-safety monitoring.",
      },
    ],
  }),
  component: AboutPage,
});

const sections = [
  {
    icon: ShieldCheck,
    title: "Why helmet detection matters",
    text: "Head injuries are the leading cause of serious harm in two-wheeler accidents. Automatically spotting riders without a helmet makes it practical to monitor compliance across a busy road instead of relying on manual observation.",
  },
  {
    icon: Brain,
    title: "YOLO-based detection",
    text: "A trained YOLO model identifies bikes, drivers and passengers, and separates riders wearing a helmet from those who are not. The model runs in a dedicated FastAPI service, kept separate from this web application.",
  },
  {
    icon: ImageIcon,
    title: "Image detection",
    text: "Upload a single road or traffic photo. SafeVision AI returns the objects found, the helmet status of each rider and any violation with its associated vehicle.",
  },
  {
    icon: Video,
    title: "Video detection",
    text: "A recorded clip is processed frame by frame with tracking, so a single rider seen across many frames is aggregated into one violation record rather than hundreds.",
  },
  {
    icon: Camera,
    title: "Live detection",
    text: "Frames from your device camera are sampled at a controlled rate and analysed continuously, giving an immediate view of helmet compliance.",
  },
  {
    icon: ScanLine,
    title: "Number plate detection and OCR",
    text: "Helmet detection alone cannot read a plate. A separate detection module locates the number plate on the associated bike, the crop is preprocessed, and OCR reads the characters. When the result is not reliable, SafeVision AI reports that the plate is not readable rather than guessing a value.",
  },
] as const;

function AboutPage() {
  return (
    <>
      <section className="bg-hero border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
          <span className="eyebrow">About the project</span>
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            What SafeVision AI is
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            SafeVision AI is a computer-vision web application for detecting motorcycle riders,
            helmet violations and associated vehicle number plates from live camera streams,
            uploaded images and uploaded videos.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="surface-card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <section.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-lg font-bold tracking-tight">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{section.text}</p>
            </article>
          ))}
        </div>

        <div className="surface-card mt-6 p-6">
          <h2 className="text-lg font-bold tracking-tight">Road-safety applications</h2>
          <ul className="mt-3 grid gap-2.5 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
            <li>Monitoring helmet compliance on selected routes and junctions</li>
            <li>Supporting traffic monitoring teams with reviewable evidence</li>
            <li>Assisting safety enforcement with vehicle-linked violation records</li>
            <li>Producing road-safety analytics for awareness campaigns</li>
          </ul>
        </div>
      </section>
    </>
  );
}
