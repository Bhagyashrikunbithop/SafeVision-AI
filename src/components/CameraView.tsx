import { forwardRef } from "react";
import { CameraOff } from "lucide-react";

type Props = {
  running: boolean;
  overlayRef: React.RefObject<HTMLCanvasElement | null>;
};

/** Live camera preview with a detection overlay canvas on top. */
export const CameraView = forwardRef<HTMLVideoElement, Props>(function CameraView(
  { running, overlayRef },
  videoRef,
) {
  return (
    <div className="surface-card overflow-hidden p-3">
      <div className="bg-navy-gradient relative overflow-hidden rounded-xl">
        <video ref={videoRef} playsInline muted className="block w-full" />
        <canvas ref={overlayRef} className="pointer-events-none absolute inset-0 h-full w-full" />
        {!running && (
          <div className="grid aspect-video place-items-center px-6 text-center">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-foreground/10 text-navy-foreground">
                <CameraOff className="h-6 w-6" />
              </span>
              <p className="mt-4 text-sm font-semibold text-navy-foreground">Camera is off</p>
              <p className="mt-1 text-xs text-navy-foreground/70">
                Start the camera to begin live helmet detection.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
