import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bike,
  Camera,
  Image as ImageIcon,
  ListChecks,
  ScanLine,
  ShieldCheck,
  Video,
} from "lucide-react";
import heroRider from "@/assets/hero-rider.jpg";
import featureLive from "@/assets/feature-live.jpg";
import featureImage from "@/assets/feature-image.jpg";
import featureVideo from "@/assets/feature-video.jpg";
import { DetectionCard } from "@/components/DetectionCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeVision AI – Helmet Detection & Road-Safety Monitoring" },
      {
        name: "description",
        content:
          "Detect motorcycle helmet violations and identify associated vehicle number plates using computer vision and YOLO.",
      },
      { property: "og:title", content: "SafeVision AI – Helmet Detection & Road Safety" },
      {
        property: "og:description",
        content:
          "Detect motorcycle helmet violations and identify associated vehicle number plates using computer vision and YOLO.",
      },
    ],
  }),
  component: HomePage,
});

const pillars = [
  {
    icon: ShieldCheck,
    title: "Helmet compliance",
    text: "Identify drivers and passengers riding with or without a helmet.",
  },
  {
    icon: ScanLine,
    title: "Number plate reading",
    text: "Locate the plate of the vehicle involved and read it when it is legible.",
  },
  {
    icon: Bike,
    title: "Violation association",
    text: "Link each violation to the correct bike using spatial and tracking information.",
  },
  {
    icon: ListChecks,
    title: "Saved history",
    text: "Every analysis is stored privately in your own SafeVision AI account.",
  },
] as const;

function HomePage() {
  return (
    <>
      <section className="bg-hero border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14 lg:py-20">
          <div className="animate-rise">
            <span className="eyebrow">Computer vision for road safety</span>
            <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              SafeVision AI
            </h1>
            <p className="mt-3 text-lg font-semibold text-primary sm:text-xl">
              AI-Powered Helmet Detection &amp; Safety Monitoring
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Detect motorcycle helmet violations and identify associated vehicle number plates
              using computer vision and YOLO.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/live" className="btn-primary">
                <Camera className="h-4 w-4" /> Start Live Detection
              </Link>
              <Link to="/image" className="btn-secondary">
                <ImageIcon className="h-4 w-4" /> Upload Image
              </Link>
              <Link to="/video" className="btn-secondary">
                <Video className="h-4 w-4" /> Analyze Video
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="surface-card overflow-hidden p-2 shadow-elevated">
              <img
                src={heroRider}
                alt="Motorcycle rider wearing a helmet riding on a city road"
                width={1600}
                height={1008}
                className="block aspect-[16/10] w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <span className="eyebrow">What it does</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Built for real road-safety monitoring
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            SafeVision AI combines a trained YOLO detection model with a separate number-plate
            pipeline and OCR, so a violation can be reviewed together with the vehicle involved.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="surface-card p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/12 text-accent">
                <pillar.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold tracking-tight">{pillar.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="max-w-2xl">
            <span className="eyebrow">Three ways to analyse</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Choose your input
            </h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <DetectionCard
              icon={Camera}
              badge="Live"
              title="Live Detection"
              description="Use your device camera for continuous helmet and number-plate monitoring."
              image={featureLive}
              imageAlt="Traffic monitoring camera above a road with motorbikes"
              cta="Start Live Detection"
              to="/live"
            />
            <DetectionCard
              icon={ImageIcon}
              badge="Image"
              title="Image Detection"
              description="Upload a road or traffic photo and review the riders, helmets and plates found."
              image={featureImage}
              imageAlt="Busy urban road with many motorbike riders"
              cta="Analyze Image"
              to="/image"
            />
            <DetectionCard
              icon={Video}
              badge="Video"
              title="Video Detection"
              description="Analyse a recorded traffic clip frame by frame with violation tracking."
              image={featureVideo}
              imageAlt="City traffic at dusk with light trails"
              cta="Analyze Video"
              to="/video"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="bg-navy-gradient overflow-hidden rounded-3xl px-6 py-12 text-navy-foreground shadow-elevated sm:px-12">
          <h2 className="max-w-2xl text-2xl font-extrabold tracking-tight sm:text-3xl">
            Ready to review your first analysis?
          </h2>
          <p className="mt-3 max-w-xl text-sm text-navy-foreground/75">
            Create your SafeVision AI account to save analyses, violations and number-plate results
            privately to your own history.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-foreground px-5 py-2.5 text-sm font-bold text-navy transition-opacity hover:opacity-90"
            >
              Create Account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="btn-ghost-light">
              Login
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
