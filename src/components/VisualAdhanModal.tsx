/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Info, 
  Copy, 
  Check, 
  Mic, 
  Maximize2,
  Minimize2,
  Share2,
  Compass,
  Clock
} from 'lucide-react';
import { formatTime12 } from '../utils/formatTime';
import { 
  playAdhanAudio, 
  stopAdhanAudio, 
  isAdhanPlaying, 
  setAdhanPlayStateCallback,
  setAdhanVolume,
  getActiveAdhanAudio
} from '../utils/adhanPlayer';
import { ADHAN_VOICES_LIST, AdhanVoiceOption } from '../data/adhan_voices';

export interface PrayerTimeItem {
  name: string;
  arabicName: string;
  time: string;
}

interface VisualAdhanModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerName: string;
  arabicName: string;
  time: string;
  city: string;
  country?: string;
  supplication?: string;
  tip?: string;
  soundEnabled: boolean;
  selectedVoiceId?: string;
  onVoiceChange?: (voiceId: string) => void;
  allPrayers?: PrayerTimeItem[];
  isEn?: boolean;
}

// Curated high-resolution Islamic landmark wallpapers matching the video screenshots
const ADHAN_WALLPAPERS = [
  {
    id: 'sheikh_zayed',
    titleAr: 'جامع الشيخ زايد الكبير - الأعمدة الذهبية والبرك المائية',
    titleEn: 'Sheikh Zayed Grand Mosque, Abu Dhabi',
    url: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=1920&q=80',
    fallbackColor: '#0b2e38'
  },
  {
    id: 'kaaba_door',
    titleAr: 'باب الكعبة المشرفة الذهبي - مكة المكرمة',
    titleEn: 'Golden Door of the Holy Kaaba, Makkah',
    url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1920&q=80',
    fallbackColor: '#36240b'
  },
  {
    id: 'islamic_dome',
    titleAr: 'الزخارف الإسلامية العريقة والقبة والمشكاة',
    titleEn: 'Islamic Architectural Dome & Arabesque',
    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1920&q=80',
    fallbackColor: '#12303c'
  },
  {
    id: 'madinah_nabawi',
    titleAr: 'المسجد النبوي الشريف - المدينة المنورة',
    titleEn: 'Al-Masjid An-Nabawi, Madinah',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80',
    fallbackColor: '#082522'
  },
  {
    id: 'alaqsa_dome',
    titleAr: 'المسجد الأقصى وقبة الصخرة المشرفة - القدس',
    titleEn: 'Dome of the Rock & Al-Aqsa, Jerusalem',
    url: 'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=1920&q=80',
    fallbackColor: '#1a332a'
  }
];

// Specific Authentic Hadiths & Virtues for each prayer
const PRAYER_HADITHS: Record<string, { hadith: string; source: string; virtue: string }> = {
  Fajr: {
    hadith: 'عن عبد الله بن مسعود أنه سأل النبي ﷺ: أي العمل أحب إلى الله؟ قال: الصلاة على وقتها. وقال ﷺ: "من صلى الصبح فهو في ذمة الله".',
    source: 'متفق عليه: صحيح البخاري ومسلم',
    virtue: 'ركعتا الفجر خير من الدنيا وما فيها، وصلاة الفجر جماعة تعدل قيام ليلة كاملة.'
  },
  Dhuhr: {
    hadith: 'عن عبد الله بن مسعود أنه سأل النبي ﷺ: أي العمل أحب إلى الله؟ قال: الصلاة على وقتها. وقال ﷺ: "إنها ساعة تفتح فيها أبواب السماء، فأحب أن يصعد لي فيها عمل صالح".',
    source: 'صحيح الترمذي والبخاري',
    virtue: 'صلاة الهجير تطرد الغفلة وتفتح أبواب الرحمة والبركة في الرزق وسائر اليوم.'
  },
  Asr: {
    hadith: 'عن عبد الله بن مسعود أنه سأل النبي ﷺ: أي العمل أحب إلى الله؟ قال: الصلاة على وقتها. وقال ﷺ: "من صلى البردين دخل الجنة" (الفجر والعصر).',
    source: 'متفق عليه: صحيح البخاري ومسلم',
    virtue: 'الصلاة الوسطى التي أكد الله على حفظها، والملائكة تجتمع عند الله في وقتها وتشهد لمن صلاها.'
  },
  Maghrib: {
    hadith: 'عن عبد الله بن مسعود أنه سأل النبي ﷺ: أي العمل أحب إلى الله؟ قال: الصلاة على وقتها. وقال ﷺ: "لا تزال أمتي بخير ما لم يؤخروا المغرب حتى تشتبك النجوم".',
    source: 'رواه أبو داود وصححه الألباني',
    virtue: 'وقت إجابة الدعاء وإقبال الليل وإدبار النهار، وسنة المغرب من الرواتب المؤكدة.'
  },
  Isha: {
    hadith: 'عن عبد الله بن مسعود أنه سأل النبي ﷺ: أي العمل أحب إلى الله؟ قال: الصلاة على وقتها. وقال ﷺ: "من صلى العشاء في جماعة فكأنما قام نصف الليل".',
    source: 'رواه مسلم',
    virtue: 'أثقل الصلوات على المنافقين، وهي نور وأمان وبركة ونور في القبر ويوم القيامة.'
  },
  Sunrise: {
    hadith: 'قال رسول الله ﷺ: "من صلى الفجر في جماعة ثم قعد يذكر الله حتى تطلع الشمس ثم صلى ركعتين كانت له كأجر حجة وعمرة تامة تامة تامة".',
    source: 'رواه الترمذي وحسنه الألباني',
    virtue: 'جلسة الضحى بعد الشروق من أعظم الغنائم وثوابها كحجة وعمرة تامة.'
  }
};

export default function VisualAdhanModal({
  isOpen,
  onClose,
  prayerName,
  arabicName,
  time,
  city,
  country = 'مملكة البحرين',
  supplication,
  tip,
  soundEnabled,
  selectedVoiceId = 'bundled-cc0',
  onVoiceChange,
  allPrayers = [],
  isEn = false
}: VisualAdhanModalProps) {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(soundEnabled);
  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false);
  const [copiedDuaa, setCopiedDuaa] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [showVoicePicker, setShowVoicePicker] = useState<boolean>(false);
  const [activeVoice, setActiveVoice] = useState<string>(selectedVoiceId);

  // Auto-play Adhan and register playback state
  useEffect(() => {
    let isCancelled = false;

    if (isOpen) {
      setAdhanPlayStateCallback((playing) => {
        setIsPlaying(playing);
      });

      if (soundEnabled) {
        const timer = setTimeout(async () => {
          if (!isCancelled) {
            await playAdhanAudio(activeVoice, volume);
          }
        }, 200);
        return () => {
          isCancelled = true;
          clearTimeout(timer);
        };
      }
    } else {
      stopAdhanAudio();
      setAdhanPlayStateCallback(null);
    }

    return () => {
      stopAdhanAudio();
      setAdhanPlayStateCallback(null);
    };
  }, [isOpen, activeVoice, soundEnabled]);

  // Slideshow automatic background rotation (every 9 seconds)
  useEffect(() => {
    if (!isOpen) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ADHAN_WALLPAPERS.length);
    }, 9000);
    return () => clearInterval(slideTimer);
  }, [isOpen]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % ADHAN_WALLPAPERS.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + ADHAN_WALLPAPERS.length) % ADHAN_WALLPAPERS.length);
  };

  const handleTogglePlay = async () => {
    if (isPlaying) {
      stopAdhanAudio();
      setIsPlaying(false);
    } else {
      const audio = await playAdhanAudio(activeVoice, volume);
      if (audio) {
        setIsPlaying(true);
      }
    }
  };

  const handleSelectVoice = async (voiceId: string) => {
    setActiveVoice(voiceId);
    if (onVoiceChange) {
      onVoiceChange(voiceId);
    }
    setShowVoicePicker(false);
    if (isPlaying) {
      await playAdhanAudio(voiceId, volume);
    }
  };

  const handleCopyDuaa = () => {
    const duaaText = `اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ. (حلت له شفاعتي يوم القيامة)`;
    navigator.clipboard.writeText(duaaText);
    setCopiedDuaa(true);
    setTimeout(() => setCopiedDuaa(false), 2500);
  };

  if (!isOpen) return null;

  const currentHadithInfo = PRAYER_HADITHS[prayerName] || PRAYER_HADITHS['Fajr'];
  const currentVoiceObj = ADHAN_VOICES_LIST.find(v => v.id === activeVoice) || ADHAN_VOICES_LIST[0];

  return (
    <AnimatePresence>
      <div 
        id="visual-adhan-modal-overlay"
        className="fixed inset-0 z-[1000000] overflow-hidden select-none bg-black text-white font-sans flex flex-col justify-between"
        dir="rtl"
      >
        {/* Breathtaking Background Slide with Ken-Burns Motion */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${ADHAN_WALLPAPERS[currentSlide].url})`,
                backgroundColor: ADHAN_WALLPAPERS[currentSlide].fallbackColor
              }}
            />
          </AnimatePresence>

          {/* Vignette & Contrast Overlay Gradients for crisp legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/80 pointer-events-none" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/60 pointer-events-none" />
        </div>

        {/* TOP BAR: Controls & Header Actions */}
        <header className="relative z-20 w-full px-4 sm:px-6 pt-[max(calc(env(safe-area-inset-top,0px)+12px),16px)] pb-3 flex items-center justify-between gap-3">
          
          {/* Right Section (in RTL): App Title & Live Audio status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-amber-300 shadow-xl">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-amber-300 font-kufi">
                  {isEn ? 'Noor Al-Islam • Live Adhan' : 'نور الإسلام • نداء الصلاة'}
                </span>
                {isPlaying && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-[10px] font-bold text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{isEn ? 'Adhan Playing' : 'الآذان يُرفع الآن'}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {city} • {country}
              </p>
            </div>
          </div>

          {/* Left Section (in RTL): Audio controls & Close Button */}
          <div className="flex items-center gap-2">
            
            {/* Muadhin Voice Selector Pill */}
            <div className="relative">
              <button
                id="adhan-voice-selector-btn"
                type="button"
                onClick={() => setShowVoicePicker(!showVoicePicker)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/50 hover:bg-black/70 border border-white/25 backdrop-blur-xl text-xs font-bold text-slate-100 transition-all cursor-pointer active:scale-95 shadow-lg"
                title="تغيير صوت المؤذن"
              >
                <Mic className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline truncate max-w-[140px]">{currentVoiceObj.nameAr}</span>
                <span className="sm:hidden">{isEn ? 'Voice' : 'المؤذن'}</span>
              </button>

              {/* Voice Picker Dropdown Menu */}
              <AnimatePresence>
                {showVoicePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 sm:right-0 mt-2 w-72 max-h-80 overflow-y-auto bg-slate-950/95 border border-emerald-500/30 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl z-50 divide-y divide-white/10"
                  >
                    <div className="p-2 text-xs font-black text-amber-300 border-b border-white/10">
                      {isEn ? 'Select Muadhin / Adhan Voice' : 'اختر صوت الآذان والمؤذن 🕌'}
                    </div>
                    <div className="py-1 space-y-1">
                      {ADHAN_VOICES_LIST.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => handleSelectVoice(v.id)}
                          className={`w-full text-right p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            activeVoice === v.id
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          <div>
                            <div className="font-extrabold">{v.nameAr}</div>
                            <div className="text-[10px] opacity-75 font-normal">{v.muezzin}</div>
                          </div>
                          {activeVoice === v.id && <Check className="w-4 h-4 text-amber-300" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mute / Unmute Play Audio Button */}
            <button
              id="adhan-audio-toggle-btn"
              type="button"
              onClick={handleTogglePlay}
              className={`p-2.5 rounded-full border backdrop-blur-xl transition-all cursor-pointer active:scale-95 shadow-lg ${
                isPlaying 
                  ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300' 
                  : 'bg-black/50 text-white border-white/20 hover:bg-black/70'
              }`}
              title={isPlaying ? "كتم صوت الآذان" : "تشغيل صوت الآذان"}
              aria-label={isPlaying ? "Mute Adhan" : "Play Adhan"}
            >
              {isPlaying ? (
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                </div>
              ) : (
                <VolumeX className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* Close Button (X) */}
            <button
              id="close-visual-adhan-screen-btn"
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/60 hover:bg-rose-950/80 border border-white/25 backdrop-blur-xl text-white hover:text-rose-300 transition-all cursor-pointer active:scale-95 shadow-lg"
              title={isEn ? "Close and Return" : "إغلاق والرجوع"}
              aria-label="Close Adhan Screen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* MIDDLE SECTION: Ambient Islamic Audio Waves & Slideshow indicator */}
        <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full text-center">
          
          {/* Animated Islamic Dome Graphic / Soundwave Visualizer */}
          {isPlaying && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 flex items-center justify-center gap-1.5"
            >
              {[40, 75, 95, 60, 100, 70, 85, 45, 90, 65, 35].map((h, i) => (
                <motion.span
                  key={i}
                  animate={{ height: [`${Math.max(12, h * 0.3)}px`, `${h * 0.7}px`, `${Math.max(12, h * 0.3)}px`] }}
                  transition={{ duration: 0.8 + (i % 3) * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-1 sm:w-1.5 bg-gradient-to-t from-cyan-400 to-amber-300 rounded-full opacity-85 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                />
              ))}
            </motion.div>
          )}

          {/* Wallpaper Carousel navigation dots */}
          <div className="flex items-center gap-2 mb-2 bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            <button 
              onClick={handlePrevSlide}
              className="text-white/70 hover:text-white cursor-pointer p-1"
              aria-label="Previous Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {ADHAN_WALLPAPERS.map((w, idx) => (
                <button
                  key={w.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all rounded-full cursor-pointer ${
                    currentSlide === idx 
                      ? 'w-6 h-2 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' 
                      : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={w.titleAr}
                />
              ))}
            </div>
            <button 
              onClick={handleNextSlide}
              className="text-white/70 hover:text-white cursor-pointer p-1"
              aria-label="Next Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-[11px] text-slate-300 font-medium drop-shadow-md">
            {ADHAN_WALLPAPERS[currentSlide].titleAr}
          </div>
        </main>

        {/* BOTTOM SECTION: The Iconic Glowing Adhan Banner (Exact match to video!) */}
        <footer className="relative z-20 w-full px-3 sm:px-6 pb-[max(calc(env(safe-area-inset-bottom,0px)+10px),16px)] flex flex-col items-center gap-3">
          
          {/* Main Card Container */}
          <div className="w-full max-w-2xl bg-black/75 backdrop-blur-2xl border-2 border-cyan-400/50 rounded-3xl p-4 sm:p-5 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.25)] flex flex-col gap-3.5">
            
            {/* 1. Glowing Blue / Cyan Pill Header: "حان الآن موعد صلاة [الاسم]" */}
            <div className="w-full py-3 px-4 sm:px-6 bg-gradient-to-r from-cyan-600 via-sky-500 to-cyan-600 rounded-2xl shadow-[0_4px_20px_rgba(6,182,212,0.4)] text-center flex items-center justify-center gap-2 border border-cyan-300/40">
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse shrink-0" />
              <h2 className="text-xl sm:text-2xl font-black text-white font-kufi tracking-wide drop-shadow-md">
                {isEn ? `It is now time for ${prayerName} Prayer` : `حان الآن موعد صلاة ${arabicName}`}
              </h2>
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse shrink-0" />
            </div>

            {/* 2. Subtitle with the authentic Hadith matching the video */}
            <div className="flex items-start justify-between gap-3 px-1 sm:px-2 text-right">
              <div className="space-y-1 flex-1">
                <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed font-amiri text-justify">
                  {currentHadithInfo.hadith}
                </p>
                <div className="text-[10px] text-cyan-300 font-bold">
                  {currentHadithInfo.source}
                </div>
              </div>

              {/* "المزيد" Button */}
              <button
                id="adhan-show-more-details-btn"
                type="button"
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-xs font-black text-cyan-300 transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-1 shadow-md self-center"
              >
                <span>{showMoreDetails ? (isEn ? 'Less' : 'إخفاء') : (isEn ? 'More' : 'المزيد')}</span>
              </button>
            </div>

            {/* Expandable Details Drawer: Duaa after Adhan & Prayer Virtues */}
            <AnimatePresence>
              {showMoreDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-3 pt-2 border-t border-white/10"
                >
                  {/* Duaa after Adhan */}
                  <div className="bg-gradient-to-br from-amber-500/15 to-emerald-500/10 border border-amber-400/30 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 font-kufi">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>دعاء ما بعد الأذان (مستجاب):</span>
                      </div>
                      <button
                        onClick={handleCopyDuaa}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer"
                      >
                        {copiedDuaa ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDuaa ? 'تم النسخ' : 'نسخ الدعاء'}</span>
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-100 font-amiri leading-relaxed">
                      "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ"
                    </p>
                  </div>

                  {/* Prayer Virtues */}
                  <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-3 text-xs text-emerald-200">
                    <strong>فضيلة الصلاة: </strong>
                    <span>{currentHadithInfo.virtue}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Horizontal Prayer Times Strip at the very bottom (Identical to video!) */}
          <div className="w-full max-w-4xl bg-black/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 sm:p-2.5 shadow-2xl overflow-x-auto scrollbar-none">
            <div className="flex items-center justify-between gap-3 min-w-max text-xs sm:text-[13px] font-bold text-slate-200 px-2">
              
              {/* If allPrayers is provided, show all 6 times */}
              {allPrayers && allPrayers.length > 0 ? (
                allPrayers.map((p) => {
                  const isCurrent = p.name === prayerName;
                  return (
                    <div 
                      key={p.name}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all ${
                        isCurrent 
                          ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-300 font-black shadow-[0_0_12px_rgba(6,182,212,0.4)]' 
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="text-slate-400">{p.arabicName}:</span>
                      <span className="font-mono font-extrabold">{formatTime12(p.time, false)}</span>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="flex items-center gap-1 px-2 py-1 text-slate-300">
                    <span className="text-slate-400">الفجر:</span>
                    <span className="font-mono font-black">03:49 AM</span>
                  </div>
                  <span className="text-slate-600">|</span>
                  <div className="flex items-center gap-1 px-2 py-1 text-slate-300">
                    <span className="text-slate-400">الشروق:</span>
                    <span className="font-mono font-black">05:12 AM</span>
                  </div>
                  <span className="text-slate-600">|</span>
                  <div className="flex items-center gap-1 px-2 py-1 text-slate-300">
                    <span className="text-slate-400">الظهر:</span>
                    <span className="font-mono font-black">11:41 AM</span>
                  </div>
                  <span className="text-slate-600">|</span>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl ${prayerName === 'Asr' ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-300' : 'text-slate-300'}`}>
                    <span className="text-slate-400">العصر:</span>
                    <span className="font-mono font-black">03:12 PM</span>
                  </div>
                  <span className="text-slate-600">|</span>
                  <div className="flex items-center gap-1 px-2 py-1 text-slate-300">
                    <span className="text-slate-400">المغرب:</span>
                    <span className="font-mono font-black">06:09 PM</span>
                  </div>
                  <span className="text-slate-600">|</span>
                  <div className="flex items-center gap-1 px-2 py-1 text-slate-300">
                    <span className="text-slate-400">العشاء:</span>
                    <span className="font-mono font-black">07:39 PM</span>
                  </div>
                </>
              )}

              {/* City and State badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 text-amber-300 font-extrabold border border-white/10 shrink-0">
                <Compass className="w-3.5 h-3.5" />
                <span>{city}</span>
              </div>

            </div>
          </div>

        </footer>
      </div>
    </AnimatePresence>
  );
}
