import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "dark" | "romance";

type Props = {
  variant: Variant;
  className?: string;
  reducedMotion?: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  rot: number;
  vr: number;
  t: "spark" | "heart";
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.33);
  ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.6);
  ctx.bezierCurveTo(x - s, y + s * 1.15, x, y + s * 1.25, x, y + s * 1.55);
  ctx.bezierCurveTo(x, y + s * 1.25, x + s, y + s * 1.15, x + s, y + s * 0.6);
  ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.33);
  ctx.closePath();
  ctx.fill();
}

export default function ParticlesCanvas({ variant, className, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  const palette = useMemo(() => {
    if (variant === "romance") {
      return {
        bgAlpha: 0.06,
        sparks: ["rgba(255,214,165,0.9)", "rgba(255,111,174,0.85)", "rgba(167,139,250,0.85)"],
        hearts: ["rgba(255,111,174,0.75)", "rgba(255,245,248,0.72)", "rgba(167,139,250,0.68)"],
      };
    }
    return {
      bgAlpha: 0.16,
      sparks: ["rgba(255,245,248,0.35)", "rgba(255,214,165,0.3)", "rgba(167,139,250,0.25)"],
      hearts: ["rgba(255,245,248,0.22)"],
    };
  }, [variant]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const density = reducedMotion ? 14 : variant === "romance" ? 46 : 34;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const arr: Particle[] = [];
      for (let i = 0; i < density; i += 1) {
        const isHeart = variant === "romance" && Math.random() > 0.45;
        arr.push({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.12, 0.12),
          vy: isHeart ? rand(-0.45, -0.18) : rand(-0.28, -0.1),
          r: isHeart ? rand(6, 14) : rand(1.2, 2.6),
          a: rand(0.18, 0.7),
          rot: rand(-Math.PI, Math.PI),
          vr: rand(-0.006, 0.006),
          t: isHeart ? "heart" : "spark",
        });
      }
      particlesRef.current = arr;
    };

    resize();
    seed();

    const step = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.fillStyle = `rgba(7,6,17,${palette.bgAlpha})`;
      ctx.fillRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        if (p.y < -40) {
          p.y = h + rand(0, 90);
          p.x = rand(0, w);
        }
        if (p.x < -40) p.x = w + 40;
        if (p.x > w + 40) p.x = -40;

        ctx.save();
        ctx.globalAlpha = p.a;
        if (p.t === "heart") {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = palette.hearts[Math.floor(rand(0, palette.hearts.length))]!;
          drawHeart(ctx, 0, 0, p.r);
        } else {
          ctx.fillStyle = palette.sparks[Math.floor(rand(0, palette.sparks.length))]!;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      rafRef.current = window.requestAnimationFrame(step);
    };

    rafRef.current = window.requestAnimationFrame(step);

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [palette, reducedMotion, variant]);

  return <canvas ref={canvasRef} className={cn("pointer-events-none absolute inset-0", className)} />;
}

