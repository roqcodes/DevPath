"use client";

import { useCallback, useSyncExternalStore } from "react";

export type SoundName = "pop" | "success" | "levelup" | "tick";

const STORAGE_KEY = "devpath_sound";
const CHANGE_EVENT = "devpath:sound-setting";

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** `[enabled, setEnabled]`, persisted in localStorage `devpath_sound`. Off by default. */
export function useSoundSetting(): [boolean, (enabled: boolean) => void] {
  const enabled = useSyncExternalStore(subscribe, isSoundEnabled, () => false);
  const set = useCallback((next: boolean) => setSoundEnabled(next), []);
  return [enabled, set];
}

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(
  ac: AudioContext,
  freq: number,
  start: number,
  dur: number,
  { type = "sine", gain = 0.08, slideTo }: { type?: OscillatorType; gain?: number; slideTo?: number } = {},
) {
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/**
 * Short synthesized UI sounds. No-op unless the user enabled sound
 * (pass `{ force: true }` for a settings preview).
 */
export function playSound(name: SoundName, opts?: { force?: boolean }): void {
  if (!opts?.force && !isSoundEnabled()) return;
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + 0.01;
  switch (name) {
    case "tick":
      blip(ac, 1400, t, 0.035, { type: "triangle", gain: 0.04 });
      break;
    case "pop":
      blip(ac, 520, t, 0.09, { gain: 0.08, slideTo: 880 });
      break;
    case "success":
      blip(ac, 784, t, 0.12, { type: "triangle", gain: 0.07 });
      blip(ac, 1175, t + 0.08, 0.18, { type: "triangle", gain: 0.06 });
      break;
    case "levelup":
      [523, 659, 784, 1047].forEach((f, i) => blip(ac, f, t + i * 0.075, 0.16, { type: "triangle", gain: 0.065 }));
      blip(ac, 1568, t + 0.3, 0.32, { gain: 0.035 });
      break;
  }
}
