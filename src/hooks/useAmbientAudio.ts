import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type AmbientControls = {
  supported: boolean;
  muted: boolean;
  prime: () => Promise<void>;
  start: () => Promise<void>;
  toggleMute: () => void;
};

export function useAmbientAudio(): AmbientControls {
  const supported = useMemo(() => typeof window !== "undefined" && !!window.AudioContext, []);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const startedRef = useRef(false);
  const primedRef = useRef(false);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(muted);

  useEffect(() => {
    mutedRef.current = muted;
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);

  const setGain = useCallback((target: number, seconds: number) => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(target, now + seconds);
  }, []);

  const ensure = useCallback(async () => {
    if (!supported) return;
    if (!ctxRef.current) ctxRef.current = new window.AudioContext();
    if (ctxRef.current.state !== "running") await ctxRef.current.resume();
    if (!masterRef.current) {
      const master = ctxRef.current.createGain();
      master.gain.value = 0;
      master.connect(ctxRef.current.destination);
      masterRef.current = master;
    }
  }, [supported]);

  const prime = useCallback(async () => {
    if (!supported) return;
    if (primedRef.current) return;
    await ensure();
    
    const audio = new Audio("/ost.mp3");
    audio.loop = true;
    audio.crossOrigin = "anonymous";
    audio.muted = mutedRef.current;
    audioRef.current = audio;

    const source = ctxRef.current!.createMediaElementSource(audio);
    source.connect(masterRef.current!);
    sourceRef.current = source;

    primedRef.current = true;
  }, [ensure, supported]);

  const start = useCallback(async () => {
    if (!supported) return;
    await prime();
    if (startedRef.current) return;
    startedRef.current = true;
    
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
    
    setGain(mutedRef.current ? 0 : 0.45, 2.8);
  }, [prime, setGain, supported]);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  useEffect(() => {
    if (!supported) return;
    if (!primedRef.current) return;
    setGain(muted ? 0 : startedRef.current ? 0.45 : 0, 0.45);
  }, [muted, setGain, supported]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      sourceRef.current?.disconnect();
      masterRef.current?.disconnect();
      ctxRef.current?.close();
    };
  }, []);

  return useMemo(
    () => ({ supported, muted, prime, start, toggleMute }),
    [supported, muted, prime, start, toggleMute],
  );
}

