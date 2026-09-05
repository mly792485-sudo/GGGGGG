/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Signal, 
  Headphones, 
  RotateCw,
  ExternalLink,
  Heart
} from 'lucide-react';

interface RadioStation {
  id: string;
  name: string;
  subtitle: string;
  url: string;
  backupUrl: string;
  icon: string;
}

const STATIONS: RadioStation[] = [
  {
    id: 'makkah',
    name: 'إذاعة القرآن الكريم من مكة المكرمة',
    subtitle: 'بث مباشر متواصل لتلاوات أئمة الحرم المكي الشريف',
    url: 'https://stream.radiojar.com/8s5u5tpdtwzuv',
    backupUrl: 'https://backup.qurango.net/radio/makkah',
    icon: '🕋'
  },
  {
    id: 'tarteel',
    name: 'إذاعة التلاوات الخاشعة والترتيل',
    subtitle: 'تلاوات ندية خاشعة ومختارة بأصوات كبار القراء',
    url: 'https://qurango.net/radio/tarteel',
    backupUrl: 'https://backup.qurango.net/radio/tarteel',
    icon: '📖'
  },
  {
    id: 'sunnah',
    name: 'إذاعة السنة النبوية الشريفة',
    subtitle: 'شروحات الأحاديث وسيرة النبي ﷺ العطرة',
    url: 'https://qurango.net/radio/sunnah',
    backupUrl: 'https://backup.qurango.net/radio/sunnah',
    icon: '✨'
  },
  {
    id: 'fatwa',
    name: 'إذاعة الفتاوى ونور على الدرب',
    subtitle: 'برامج الإفتاء والفقه الميسر لكبار العلماء',
    url: 'https://backup.qurango.net/radio/fatwa',
    backupUrl: 'https://qurango.net/radio/fatwa',
    icon: '🕌'
  }
];

interface MakkahLiveRadioPlayerProps {
  isEn?: boolean;
}

export default function MakkahLiveRadioPlayer({ isEn = false }: MakkahLiveRadioPlayerProps) {
  const [selectedStation, setSelectedStation] = useState<RadioStation>(STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isError, setIsError] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'none';
    }

    const audio = audioRef.current;

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setIsError(false);
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      console.warn('Radio stream error, attempting backup URL...');
      if (audio.src !== selectedStation.backupUrl) {
        audio.src = selectedStation.backupUrl;
        audio.play().catch(e => {
          setIsLoading(false);
          setIsPlaying(false);
          setIsError(true);
        });
      } else {
        setIsLoading(false);
        setIsPlaying(false);
        setIsError(true);
      }
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [selectedStation]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsError(false);
      setIsLoading(true);
      if (audio.src !== selectedStation.url && audio.src !== selectedStation.backupUrl) {
        audio.src = selectedStation.url;
      }
      audio.play().catch(err => {
        console.warn('Playback blocked or failed:', err);
        // Try fallback url
        audio.src = selectedStation.backupUrl;
        audio.play().catch(() => {
          setIsLoading(false);
          setIsPlaying(false);
          setIsError(true);
        });
      });
    }
  };

  const changeStation = (station: RadioStation) => {
    setSelectedStation(station);
    setIsError(false);
    if (audioRef.current) {
      setIsLoading(true);
      audioRef.current.src = station.url;
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          audioRef.current!.src = station.backupUrl;
          audioRef.current!.play().catch(() => {
            setIsLoading(false);
            setIsPlaying(false);
            setIsError(true);
          });
        });
      }
    }
  };

  return (
    <div 
      id="makkah-live-radio-card"
      className="bg-gradient-to-br from-[#0B2124] via-[#08181A] to-[#040D0E] text-white border-2 border-emerald-500/30 rounded-3xl sm:rounded-[2.5rem] p-5 sm:p-7 shadow-xl relative overflow-hidden transition-all"
      dir={isEn ? "ltr" : "rtl"}
    >
      {/* Background Islamic Radial Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-60" />

      {/* Header Bar */}
      <div className="relative z-10 flex items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 font-bold text-lg">
            {selectedStation.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-300 font-kufi flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                {isEn ? "Live Quran Radio" : "إذاعة القرآن الكريم"}
              </span>
              <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {isEn ? "Live Makkah" : "مباشر مكة"}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-bold truncate max-w-[200px] sm:max-w-xs mt-0.5">
              {selectedStation.name}
            </p>
          </div>
        </div>

        {/* Stations Expand / List Button */}
        <button
          id="radio-expand-stations-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-emerald-200 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span>{isExpanded ? (isEn ? "Hide Stations" : "إخفاء القنوات") : (isEn ? "Select Station" : "تغيير القناة")}</span>
          <span className="text-[10px]">▼</span>
        </button>
      </div>

      {/* Main Playing Interface */}
      <div className="relative z-10 pt-5 space-y-4">
        
        {/* Animated Sound Waves + Status */}
        <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-2xl p-3.5">
          <div className="flex items-center gap-3">
            {/* Play/Pause Main Trigger */}
            <button
              id="radio-main-play-btn"
              onClick={togglePlay}
              disabled={isLoading}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-lg ${
                isPlaying
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
              title={isPlaying ? (isEn ? "Pause" : "إيقاف مؤقت") : (isEn ? "Play Live" : "تشغيل البث المباشر")}
            >
              {isLoading ? (
                <RotateCw className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <div>
              <p className="text-xs font-bold text-white leading-tight">
                {isPlaying 
                  ? (isEn ? "Now Streaming Live" : "جاري الاستماع للبث المباشر الآن...") 
                  : (isLoading 
                    ? (isEn ? "Connecting to Makkah Stream..." : "جاري الاتصال بالبث المباشر...") 
                    : (isEn ? "Tap Play to Listen" : "اضغط للتشغيل والاستماع للقرآن الكريم"))}
              </p>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                {selectedStation.subtitle}
              </p>
            </div>
          </div>

          {/* Equalizer Visualizer Bars */}
          <div className="flex items-end gap-1 h-6 px-2 shrink-0">
            {[0.4, 0.9, 0.6, 1.0, 0.7, 0.5, 0.85].map((scale, i) => (
              <span
                key={i}
                className={`w-1 rounded-full bg-gradient-to-t from-emerald-500 to-amber-400 transition-all ${
                  isPlaying ? 'animate-bounce' : 'h-1.5 opacity-40'
                }`}
                style={{
                  height: isPlaying ? `${scale * 24}px` : '4px',
                  animationDuration: `${0.6 + i * 0.15}s`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Volume & Quick Controls */}
        <div className="flex items-center justify-between gap-4 pt-1 text-xs text-slate-300">
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <button
              id="radio-mute-btn"
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          <div className="text-[11px] text-emerald-200/90 font-medium">
            {isEn ? "24/7 Continuous Holy Quran" : "بث متواصل على مدار 24 ساعة"}
          </div>
        </div>

        {/* Station Selection List when Expanded */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 space-y-2 overflow-hidden"
            >
              <div className="text-[11px] font-black text-amber-300 font-kufi pt-2 border-t border-white/10">
                {isEn ? "Select Live Radio Channel:" : "اختر المحطة الإذاعية:"}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STATIONS.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => changeStation(station)}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-3 cursor-pointer ${
                      selectedStation.id === station.id
                        ? 'bg-emerald-900/60 border-amber-400 text-white shadow-md ring-1 ring-amber-400/40'
                        : 'bg-black/30 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/15'
                    }`}
                  >
                    <span className="text-xl shrink-0">{station.icon}</span>
                    <div className="flex-1 truncate">
                      <p className="text-xs font-bold text-white truncate">{station.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{station.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isError && (
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs text-center">
            {isEn 
              ? "Unable to connect to live stream currently. Reconnecting..." 
              : "تعذر الاتصال بالبث المباشر حالياً، يرجى المحاولة مرة أخرى أو اختيار محطة بديلة."}
          </div>
        )}

      </div>
    </div>
  );
}
