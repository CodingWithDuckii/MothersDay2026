import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import ParticlesCanvas from "@/components/ParticlesCanvas";

type Props = {
  onNext: () => void;
  onConfetti: () => void;
  reducedMotion?: boolean;
};

const DEFAULT_CUSTOM_MESSAGE = "You are my strength, my comfort, my home.";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function MessageScene({ onNext, onConfetti, reducedMotion }: Props) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const line1Ref = useRef<HTMLDivElement | null>(null);
  const line2Ref = useRef<HTMLDivElement | null>(null);
  const line3Ref = useRef<HTMLDivElement | null>(null);
  const customRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [exiting, setExiting] = useState(false);

  const initialCustom = useMemo(() => DEFAULT_CUSTOM_MESSAGE, []);

  useLayoutEffect(() => {
    if (!shellRef.current) return;
    gsap.fromTo(shellRef.current, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.out" });
  }, []);

  useLayoutEffect(() => {
    const parts = [line1Ref.current, line2Ref.current, line3Ref.current, customRef.current].filter(
      Boolean,
    ) as HTMLElement[];

    const tl = gsap.timeline({
      defaults: { duration: reducedMotion ? 0.45 : 0.75, ease: "power3.out" },
      onComplete: () => {
        setReady(true);
        onConfetti();
      },
    });

    tl.set(parts, { opacity: 0, y: 18, filter: "blur(10px)" });
    tl.to(line1Ref.current, { opacity: 1, y: 0, filter: "blur(0px)" }, 0.08);
    tl.to(line2Ref.current, { opacity: 1, y: 0, filter: "blur(0px)" }, reducedMotion ? 0.35 : 0.55);
    tl.to(line3Ref.current, { opacity: 1, y: 0, filter: "blur(0px)" }, reducedMotion ? 0.6 : 0.98);
    tl.to(customRef.current, { opacity: 1, y: 0, filter: "blur(0px)" }, reducedMotion ? 0.85 : 1.25);

    return () => {
      tl.kill();
    };
  }, [onConfetti, reducedMotion]);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const reduced = !!reducedMotion;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let raf = 0;

    const tick = () => {
      const ease = reduced ? 0.09 : 0.06;
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;
      el.style.setProperty("--px", `${current.x.toFixed(4)}`);
      el.style.setProperty("--py", `${current.y.toFixed(4)}`);
      raf = window.requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const nx = (e.clientX - w / 2) / (w / 2);
      const ny = (e.clientY - h / 2) / (h / 2);
      target.x = clamp(nx, -1, 1);
      target.y = clamp(ny, -1, 1);
    };

    const onWheel = (e: WheelEvent) => {
      const dy = clamp(e.deltaY / 900, -0.9, 0.9);
      target.y = clamp(target.y + dy, -1, 1);
    };

    raf = window.requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("wheel", onWheel);
      window.cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  const continueNext = () => {
    if (!ready || exiting) return;
    setExiting(true);
    if (!shellRef.current) {
      onNext();
      return;
    }
    gsap.to(shellRef.current, {
      opacity: 0,
      duration: reducedMotion ? 0.35 : 0.65,
      ease: "power2.inOut",
      onComplete: onNext,
    });
  };

  return (
    <div
      ref={shellRef}
      className="relative h-full w-full overflow-hidden bg-[#070611] [--px:0] [--py:0]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(1200px_780px_at_50%_30%,rgba(255,111,174,0.48),transparent_60%),radial-gradient(1000px_620px_at_25%_80%,rgba(167,139,250,0.5),transparent_62%),radial-gradient(1100px_650px_at_80%_75%,rgba(255,214,165,0.42),transparent_58%)]" />

      <div
        className="absolute inset-0 opacity-80"
        style={{
          transform: "translate3d(calc(var(--px) * -10px), calc(var(--py) * -8px), 0)",
        }}
      >
        <ParticlesCanvas variant="romance" reducedMotion={reducedMotion} />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_0%,rgba(255,245,248,0.12),transparent_62%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,17,0.55),rgba(7,6,17,0.25),rgba(7,6,17,0.6))]" />

      <div className="relative flex h-full w-full items-center justify-center px-5">
        <div
          ref={cardRef}
          className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-white/5 px-6 py-8 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:px-10 sm:py-12"
          style={{
            transform: "translate3d(calc(var(--px) * 10px), calc(var(--py) * 12px), 0)",
          }}
        >
          <div
            ref={line1Ref}
            className="font-display text-center text-[clamp(34px,5vw,56px)] font-semibold leading-tight tracking-tight text-romance-warm drop-shadow-[0_0_28px_rgba(255,111,174,0.28)]"
          >
            Happy Mother’s Day <span className="text-romance-pink">❤️</span>
          </div>
          <div
            ref={line2Ref}
            className="mt-5 text-center text-[clamp(16px,2.2vw,22px)] font-medium text-white/85"
          >
            To the most special person in my life…
          </div>
          <div
            ref={line3Ref}
            className="mt-3 text-center text-[clamp(15px,2vw,20px)] font-normal text-white/80"
          >
            Thank you for everything you do.
          </div>

          <div className="mt-7">
            <div className="mb-2 text-center text-xs tracking-[0.22em] text-white/50">
              A little note
            </div>
            <div
              ref={customRef}
              contentEditable
              suppressContentEditableWarning
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center text-[clamp(15px,2vw,20px)] leading-relaxed text-white/90 outline-none transition focus:border-romance-gold/45 focus:ring-2 focus:ring-romance-gold/25"
            >
              {initialCustom}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center">
            <button
              onClick={continueNext}
              className="h-11 rounded-2xl border border-white/15 bg-white/10 px-6 text-sm font-medium text-romance-warm shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition hover:bg-white/15 active:translate-y-[1px]"
              style={{ opacity: ready ? 1 : 0, pointerEvents: ready ? "auto" : "none" }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.065] [background-image:radial-gradient(rgba(255,245,248,0.45)_1px,transparent_1px)] [background-size:3px_3px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1300px_900px_at_50%_40%,transparent_40%,rgba(0,0,0,0.65))]" />
    </div>
  );
}
