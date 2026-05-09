import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ParticlesCanvas from "@/components/ParticlesCanvas";

export default function OutroScene({ reducedMotion }: { reducedMotion?: boolean }) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const tl = gsap.timeline();
    if (shellRef.current) tl.fromTo(shellRef.current, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.out" });
    if (textRef.current) tl.fromTo(textRef.current, { opacity: 0, y: 18, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out" }, 0.25);
    if (shellRef.current) tl.to(shellRef.current, { opacity: 0, duration: 1.35, ease: "power2.inOut" }, reducedMotion ? "+=2.4" : "+=4.2");
    return () => {
      tl.kill();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={shellRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#070611]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(1100px_760px_at_50%_35%,rgba(255,111,174,0.22),transparent_62%),radial-gradient(900px_520px_at_70%_70%,rgba(167,139,250,0.24),transparent_64%)]" />
      <ParticlesCanvas variant="romance" reducedMotion={reducedMotion} className="opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(1000px_700px_at_50%_40%,transparent_45%,rgba(0,0,0,0.7))]" />

      <div
        ref={textRef}
        className="mx-6 max-w-xl rounded-[26px] border border-white/10 bg-white/5 px-8 py-10 text-center shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
      >
        <div className="font-display text-[clamp(28px,4vw,44px)] font-semibold tracking-tight text-romance-warm">
          Made with love <span className="text-romance-pink">❤️</span>
        </div>
        <div className="mt-3 text-sm text-white/65">Happy Mother’s Day.</div>
      </div>
    </div>
  );
}
