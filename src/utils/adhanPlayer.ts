/*
 * Offline adhan playback for the web view and native Capacitor shells.
 * The recording is bundled at public/audio/adhan.wav during the build.
 */

import { ADHAN_VOICES_LIST } from '../data/adhan_voices';

let activeAdhanAudio: HTMLAudioElement | null = null;
let currentVoiceId = 'bundled-cc0';
let onPlayStateChangeCallback: ((isPlaying: boolean) => void) | null = null;
let autoStopTimeoutId: ReturnType<typeof setTimeout> | null = null;

export function setAdhanPlayStateCallback(callback: ((isPlaying: boolean) => void) | null) {
  onPlayStateChangeCallback = callback;
}

/**
 * Plays the bundled WAV recording. A user gesture is required by iOS for a
 * foreground preview; native lock-screen alerts use the same bundled file.
 */
export async function playAdhanAudio(
  voiceId = 'bundled-cc0',
  volume = 1.0,
): Promise<HTMLAudioElement | null> {
  stopAdhanAudio();

  const voice = ADHAN_VOICES_LIST.find((item) => item.id === voiceId) || ADHAN_VOICES_LIST[0];
  currentVoiceId = voice.id;
  const candidateUrls = ['./audio/adhan.wav'];

  for (const url of candidateUrls) {
    try {
      const audio = new Audio();
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.preload = 'auto';
      audio.src = url;
      audio.onended = () => {
        if (activeAdhanAudio === audio) stopAdhanAudio();
      };
      audio.onpause = () => onPlayStateChangeCallback?.(false);
      audio.onplay = () => onPlayStateChangeCallback?.(true);
      activeAdhanAudio = audio;
      audio.load();
      await audio.play();

      if (autoStopTimeoutId) clearTimeout(autoStopTimeoutId);
      autoStopTimeoutId = setTimeout(() => stopAdhanAudio(), 300000);
      onPlayStateChangeCallback?.(true);
      return audio;
    } catch (error) {
      console.warn(`تعذر تشغيل ملف الأذان المحلي ${url}:`, error);
      if (activeAdhanAudio) {
        try { activeAdhanAudio.pause(); } catch { /* noop */ }
        activeAdhanAudio = null;
      }
    }
  }

  onPlayStateChangeCallback?.(false);
  return null;
}

export function setAdhanVolume(volume: number): void {
  if (activeAdhanAudio) {
    activeAdhanAudio.volume = Math.max(0, Math.min(1, volume));
  }
}

export function stopAdhanAudio(): void {
  if (autoStopTimeoutId) {
    clearTimeout(autoStopTimeoutId);
    autoStopTimeoutId = null;
  }
  if (activeAdhanAudio) {
    try {
      activeAdhanAudio.pause();
      activeAdhanAudio.currentTime = 0;
      activeAdhanAudio.removeAttribute('src');
      activeAdhanAudio.load();
    } catch { /* noop */ }
    activeAdhanAudio = null;
    onPlayStateChangeCallback?.(false);
  }
}

export function isAdhanPlaying(): boolean {
  return activeAdhanAudio !== null && !activeAdhanAudio.paused;
}

export function getActiveAdhanAudio(): HTMLAudioElement | null {
  return activeAdhanAudio;
}

/** Play a short in-app chime for a foreground preview. */
export function playPrePrayerChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    void ctx.resume();
    const notes = [
      { freq: 587.33, time: 0.0, duration: 1.2 },
      { freq: 739.99, time: 0.35, duration: 1.2 },
      { freq: 880.0, time: 0.7, duration: 1.4 },
      { freq: 1174.66, time: 1.05, duration: 2.0 },
    ];
    notes.forEach(({ freq, time, duration }) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + time);
      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(ctx.currentTime + time);
      oscillator.stop(ctx.currentTime + time + duration);
    });
  } catch (error) {
    console.warn('تعذر تشغيل التنبيه الصوتي القصير:', error);
  }
}

/** Play a short in-app iqama chime for a foreground preview. */
export function playIqamaChime(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    void ctx.resume();
    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.9 },
      { freq: 783.99, time: 0.3, duration: 1.5 },
    ];
    notes.forEach(({ freq, time, duration }) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + time);
      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(ctx.currentTime + time);
      oscillator.stop(ctx.currentTime + time + duration);
    });
  } catch { /* optional foreground effect */ }
}
