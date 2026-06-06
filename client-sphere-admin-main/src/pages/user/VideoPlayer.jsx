import { useEffect, useRef, useState } from "react";
import { Play, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function VideoPlayer({
  src,
  poster,
  title,
  subtitle,
  badge,
  className,
}) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    if (!src) return;
    setStarted(true);
    setTimeout(() => {
      const v = videoRef.current;
      if (v) v.play().catch(() => {});
    }, 30);
  }, [src]);

  const start = () => {
    setStarted(true);

    // wait for video mount
    setTimeout(() => {
      const v = videoRef.current;
      if (v) v.play().catch(() => {});
    }, 30);
  };

  const toggleFullscreen = async () => {
    const el = wrapRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      try {
        await el.requestFullscreen();
        setIsFs(true);
      } catch {}
    } else {
      await document.exitFullscreen();
      setIsFs(false);
    }
  };

  return (
    <div
      ref={wrapRef}
      className={`relative aspect-video w-full overflow-hidden bg-black ${
        className || ""
      }`}
      onDoubleClick={toggleFullscreen}
    >
      {!started ? (
        <div
          className={`absolute inset-0 flex items-center justify-center ${
            poster && (poster.startsWith("http") || poster.startsWith("data:image"))
              ? ""
              : `bg-gradient-to-br ${poster || "from-slate-800 to-slate-900"}`
          }`}
          style={
            poster && (poster.startsWith("http") || poster.startsWith("data:image"))
              ? {
                  backgroundImage: `url(${poster})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative text-center text-white">
            <Button
              size="icon"
              onClick={start}
              className="h-16 w-16 rounded-full bg-white/95 text-foreground shadow-xl hover:bg-white"
            >
              <Play className="h-7 w-7" />
            </Button>

            {badge && (
              <Badge className="mt-4 border-0 bg-white/20 text-white">
                {badge}
              </Badge>
            )}

            {title && (
              <p className="mt-2 text-sm font-medium">{title}</p>
            )}

            {subtitle && (
              <p className="text-xs opacity-90">{subtitle}</p>
            )}
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={src}
          controls
          playsInline
          className="absolute inset-0 h-full w-full bg-black object-contain"
        />
      )}

      {/* Fullscreen button */}
      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-md bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
      >
        {isFs ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}