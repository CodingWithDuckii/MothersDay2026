import { useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import GateScene from "@/components/scenes/GateScene";
import CountdownScene from "@/components/scenes/CountdownScene";
import MessageScene from "@/components/scenes/MessageScene";
import OutroScene from "@/components/scenes/OutroScene";
import ConfettiCanvas from "@/components/ConfettiCanvas";
import { useAmbientAudio } from "@/hooks/useAmbientAudio";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Scene = "gate" | "countdown" | "message" | "outro";

async function requestFullscreen() {
  const el = document.documentElement;
  if (!el.requestFullscreen) return;
  if (document.fullscreenElement) return;
  await el.requestFullscreen();
}

export default function Home() {
  const reducedMotion = usePrefersReducedMotion();
  const ambient = useAmbientAudio();
  const [scene, setScene] = useState<Scene>("gate");
  const [flash, setFlash] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  const handleUnlocked = useCallback(() => {
    requestFullscreen().catch((e) => void e);
    setScene("countdown");
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setFlash(true);
    window.setTimeout(() => setFlash(false), 220);
    setScene("message");
    ambient.start();
  }, [ambient.start]);

  const handleConfetti = useCallback(() => {
    setConfettiKey((k) => k + 1);
  }, []);

  const handleNext = useCallback(() => {
    setScene("outro");
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {scene === "gate" ? <GateScene onUnlocked={handleUnlocked} onPrimeAudio={ambient.prime} /> : null}
      {scene === "countdown" ? (
        <CountdownScene reducedMotion={reducedMotion} onComplete={handleCountdownComplete} />
      ) : null}
      {scene === "message" ? (
        <div className="absolute inset-0">
          <MessageScene
            reducedMotion={reducedMotion}
            onConfetti={handleConfetti}
            onNext={handleNext}
          />
          <ConfettiCanvas burstKey={confettiKey} className="opacity-90" />
        </div>
      ) : null}
      {scene === "outro" ? <OutroScene reducedMotion={reducedMotion} /> : null}

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_520px_at_50%_40%,rgba(255,245,248,0.85),rgba(255,245,248,0.0))] transition-opacity duration-300"
        style={{ opacity: flash ? 1 : 0 }}
      />

      {scene !== "gate" && ambient.supported ? (
        <button
          onClick={ambient.toggleMute}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 backdrop-blur-xl transition hover:bg-white/10 active:translate-y-[1px]"
          aria-label={ambient.muted ? "Unmute" : "Mute"}
        >
          {ambient.muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      ) : null}
    </div>
  );
}
