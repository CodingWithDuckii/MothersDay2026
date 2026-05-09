import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import ParticlesCanvas from "@/components/ParticlesCanvas";

type Props = {
  onComplete: () => void;
  reducedMotion?: boolean;
};

export default function CountdownScene({ onComplete, reducedMotion }: Props) {
  const [n, setN] = useState(3);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const numRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(false);

  useLayoutEffect(() => {
    if (!shellRef.current) return;
    gsap.fromTo(shellRef.current, { opacity: 0 }, { opacity: 1, duration: 0.75, ease: "power2.out" });
  }, []);

  useEffect(() => {
    const numEl = numRef.current;
    if (!numEl) return;

    const glow = gsap.timeline();
    glow.fromTo(
      numEl,
      { opacity: 0, y: 14, scale: 0.88, filter: "blur(6px)" },
      { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out" },
    );
    glow.to(numEl, { scale: 1.06, duration: 0.65, ease: "sine.inOut", yoyo: true, repeat: 1 }, "<");
    glow.to(numEl, { opacity: 0, y: -10, duration: 0.28, ease: "power2.in" }, "-=0.1");

    return () => {
      glow.kill();
    };
  }, [n]);

  useEffect(() => {
    const stepMs = reducedMotion ? 520 : 900;
    const t1 = window.setTimeout(() => setN(2), stepMs);
    const t2 = window.setTimeout(() => setN(1), stepMs * 2);
    const t3 = window.setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      onComplete();
    }, stepMs * 2.85);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onComplete, reducedMotion]);

  return (
    <div
      ref={shellRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#070611]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(1000px_560px_at_50%_40%,rgba(255,111,174,0.08),transparent_66%),radial-gradient(900px_520px_at_40%_60%,rgba(167,139,250,0.09),transparent_68%)]" />
      <ParticlesCanvas variant="dark" reducedMotion={reducedMotion} className="opacity-80" />
      <div className="absolute inset-0 backdrop-blur-[10px]" />

      <div
        ref={numRef}
        className="select-none font-display text-[clamp(92px,14vw,170px)] font-semibold tracking-tight text-romance-warm drop-shadow-[0_0_32px_rgba(255,111,174,0.25)]"
      >
        {n}
      </div>
    </div>
  );
}

