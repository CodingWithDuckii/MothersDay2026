import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

const ACCESS_CODE = "10011990";

type Props = {
  onUnlocked: () => void;
  onPrimeAudio?: () => Promise<void>;
};

export default function GateScene({ onUnlocked, onPrimeAudio }: Props) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const canSubmit = useMemo(() => value.trim().length > 0 && !busy, [busy, value]);

  useLayoutEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 22, scale: 0.985 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" },
    );
  }, []);

  const shake = () => {
    const el = inputRef.current ?? panelRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { x: 0 },
      { x: 10, duration: 0.06, ease: "power1.inOut", yoyo: true, repeat: 5 },
    );
  };

  const submit = async () => {
    if (!canSubmit) return;
    const code = value.trim();
    if (code !== ACCESS_CODE) {
      setError("Incorrect code. Try again.");
      shake();
      inputRef.current?.focus();
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await onPrimeAudio?.();
    } catch (e) {
      void e;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setBusy(false);
        onUnlocked();
      },
    });

    if (panelRef.current) {
      tl.to(panelRef.current, { opacity: 0, y: -10, duration: 0.5, ease: "power2.inOut" }, 0);
    }
    if (shellRef.current) {
      tl.to(shellRef.current, { opacity: 0, duration: 0.65, ease: "power2.inOut" }, 0.05);
    }
  };

  return (
    <div
      ref={shellRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#070611]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_30%,rgba(167,139,250,0.18),transparent_60%),radial-gradient(900px_520px_at_30%_70%,rgba(255,111,174,0.14),transparent_62%)]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div
        ref={panelRef}
        className="relative mx-4 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8"
      >
        <div className="font-display text-center text-3xl font-semibold tracking-tight text-romance-warm sm:text-4xl">
          Enter Access Code
        </div>
        <div className="mt-2 text-center text-sm text-white/65">
          A small cinematic gift, just for you.
        </div>

        <div className="mt-6">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••••"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-center text-lg tracking-[0.32em] text-white placeholder:text-white/25 outline-none transition focus:border-romance-lavender/50 focus:ring-2 focus:ring-romance-lavender/30"
          />
          <div className="mt-3 min-h-5 text-center text-sm text-rose-300">
            {error ?? ""}
          </div>
        </div>

        <button
          disabled={!canSubmit}
          onClick={submit}
          className="mt-2 h-12 w-full rounded-2xl bg-[linear-gradient(135deg,rgba(255,111,174,0.92),rgba(167,139,250,0.88),rgba(255,214,165,0.78))] px-5 font-medium text-[#0b0a12] shadow-[0_18px_50px_rgba(255,111,174,0.18)] transition hover:brightness-105 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Unlock
        </button>
      </div>
    </div>
  );
}
