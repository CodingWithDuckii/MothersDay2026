import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Confetti = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vr: number;
  life: number;
  color: string;
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function ConfettiCanvas({
  burstKey,
  className,
}: {
  burstKey: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const burstRef = useRef<Confetti[] | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h * 0.38;

    const colors = ["#ff6fae", "#a78bfa", "#ffd6a5", "#fff5f8"];
    const pieces: Confetti[] = [];
    for (let i = 0; i < 90; i += 1) {
      const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
      const sp = rand(2.6, 8.4);
      pieces.push({
        x: cx + rand(-10, 10),
        y: cy + rand(-10, 10),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: rand(4, 8),
        rot: rand(-Math.PI, Math.PI),
        vr: rand(-0.25, 0.25),
        life: rand(60, 95),
        color: colors[Math.floor(rand(0, colors.length))]!,
      });
    }
    burstRef.current = pieces;

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const list = burstRef.current;
      if (!list || list.length === 0) return;

      for (const c of list) {
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.12;
        c.vx *= 0.992;
        c.rot += c.vr;
        c.life -= 1;

        const a = Math.max(0, Math.min(1, c.life / 90));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.r / 2, -c.r / 2, c.r, c.r * 0.75);
        ctx.restore();
      }

      burstRef.current = list.filter((p) => p.life > 0 && p.y < h + 80);
      rafRef.current = window.requestAnimationFrame(tick);
    };

    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [burstKey]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none absolute inset-0", className)}
    />
  );
}

