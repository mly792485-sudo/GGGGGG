/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  Minus, 
  Plus, 
  BookOpenCheck, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Loader2, 
  Headphones,
  Award,
  Target,
  Calendar,
  CheckCircle,
  TrendingUp,
  Clock,
  Bookmark,
  Star,
  Copy,
  Share2,
  Check,
  CheckCheck,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Repeat
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { quranMetadata } from '../data/quran_metadata';
import { offlineSurahs } from '../data/quran_text';
import { QURAN_RECITERS, QuranReciter } from '../data/quran_reciters';
import { SurahMetadata, SurahDetail, Ayah } from '../types';
import { safeStorage } from '../utils/safeStorage';

const FONT_FAMILIES = [
  { id: 'amiri', name: 'خط حفص / عثماني (الأميري)', class: 'font-amiri' },
  { id: 'scheherazade', name: 'خط النسخ (شهرزاد)', class: 'font-scheherazade' },
  { id: 'kufi', name: 'خط كوفي (ريم كوفي)', class: 'font-kufi' },
  { id: 'cairo', name: 'خط حديث (كايرو)', class: 'font-cairo' },
  { id: 'sans', name: 'خط النظام الافتراضي', class: 'font-sans' }
];

interface QuranSectionProps {
  isEn?: boolean;
}

export default function QuranSection({ isEn = false }: QuranSectionProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSurah, setSelectedSurah] = useState<SurahDetail | null>(null);
  const [fontSize, setFontSize] = useState<number>(24);
  const [activeFontFamily, setActiveFontFamily] = useState<string>('amiri');
  const [isLoadingSurahText, setIsLoadingSurahText] = useState<boolean>(false);
  
  // Bookmarks & Favorites
  const [savedBookmark, setSavedBookmark] = useState<{ surahNumber: number; ayahNumber: number; surahName: string } | null>(() => {
    const saved = safeStorage.getItem('noor_quran_bookmark');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [favoriteAyahs, setFavoriteAyahs] = useState<string[]>(() => {
    const saved = safeStorage.getItem('noor_quran_fav_ayahs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [copiedAyahKey, setCopiedAyahKey] = useState<string | null>(null);

  // Audio Player states
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeReciterId, setActiveReciterId] = useState<string>('alafasy');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<boolean>(false);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);

  // Tafsir request state
  const [isLoadingTafsir, setIsLoadingTafsir] = useState<boolean>(false);
  const [tafsirResult, setTafsirResult] = useState<string | null>(null);
  const [activeTafsirAyah, setActiveTafsirAyah] = useState<number | null>(null);

  // Manual specific ayah lookup state
  const [lookupSurah, setLookupSurah] = useState<number>(18);
  const [lookupAyah, setLookupAyah] = useState<number>(1);
  const [lookupResult, setLookupResult] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);

  // Quick Directory Audio Play state
  const [directPlaySurahNum, setDirectPlaySurahNum] = useState<number>(1);
  const [directAudioPlaying, setDirectAudioPlaying] = useState<boolean>(false);
  const [directAudioLoading, setDirectAudioLoading] = useState<boolean>(false);

  const filteredSurahs = quranMetadata.filter((surah) => {
    return (
      surah.name.includes(searchQuery) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.number.toString() === searchQuery
    );
  });

  // Handle Surah selection with offline cache + online fallback
  const handleSelectSurah = async (surahMeta: SurahMetadata) => {
    setTafsirResult(null);
    setActiveTafsirAyah(null);

    // 1. Check built-in offlineSurahs
    if (offlineSurahs[surahMeta.number] && offlineSurahs[surahMeta.number].ayahs?.length > 0) {
      setSelectedSurah(offlineSurahs[surahMeta.number]);
      return;
    }

    // 2. Check local persistent storage cache
    const cacheKey = `noor_quran_surah_cached_${surahMeta.number}`;
    const cachedData = safeStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setSelectedSurah(parsed);
        return;
      } catch (e) {}
    }

    // 3. Fallback to API and cache
    setIsLoadingSurahText(true);
    setSelectedSurah({
      ...surahMeta,
      ayahs: []
    });

    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahMeta.number}/quran-uthmani`);
      const data = await response.json();
      if (data && data.code === 200 && data.data && data.data.ayahs) {
        const loadedAyahs: Ayah[] = data.data.ayahs.map((a: any) => ({
          number: a.numberInSurah,
          text: a.text
        }));

        const fullSurah: SurahDetail = {
          ...surahMeta,
          ayahs: loadedAyahs
        };

        safeStorage.setItem(cacheKey, JSON.stringify(fullSurah));
        setSelectedSurah(fullSurah);
      }
    } catch (err) {
      console.warn('Could not fetch online surah text:', err);
    } finally {
      setIsLoadingSurahText(false);
    }
  };

  const handleToggleAyahFavorite = (surahNum: number, ayahNum: number, text: string) => {
    const key = `${surahNum}:${ayahNum}`;
    let updated: string[];
    if (favoriteAyahs.includes(key)) {
      updated = favoriteAyahs.filter(k => k !== key);
    } else {
      updated = [...favoriteAyahs, key];
    }
    setFavoriteAyahs(updated);
    safeStorage.setItem('noor_quran_fav_ayahs', JSON.stringify(updated));
  };

  const handleSaveBookmark = (surahNum: number, ayahNum: number, surahName: string) => {
    const bm = { surahNumber: surahNum, ayahNumber: ayahNum, surahName };
    setSavedBookmark(bm);
    safeStorage.setItem('noor_quran_bookmark', JSON.stringify(bm));
  };

  const handleCopyAyah = (surahName: string, ayahNum: number, text: string) => {
    const key = `${surahName}:${ayahNum}`;
    const fullText = `﴿ ${text} ﴾ [سورة ${surahName}: الآية ${ayahNum}] - من تطبيق نور الإسلام`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullText);
      setCopiedAyahKey(key);
      setTimeout(() => setCopiedAyahKey(null), 2000);
    }
  };

  const handleShareAyah = (surahName: string, ayahNum: number, text: string) => {
    const fullText = `﴿ ${text} ﴾\n[سورة ${surahName}: الآية ${ayahNum}]\nتطبيق نور الإسلام`;
    if (navigator.share) {
      navigator.share({
        title: `آية من سورة ${surahName}`,
        text: fullText
      }).catch(() => {});
    } else {
      handleCopyAyah(surahName, ayahNum, text);
    }
  };

  const handleFetchSurahTafsir = async (surahNum: number, name: string) => {
    setIsLoadingTafsir(true);
    setTafsirResult(null);
    try {
      const res = await fetch('/api/gemini/tafsir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surahNumber: surahNum, surahName: name }),
      });
      const data = await res.json();
      if (data.error) {
        setTafsirResult(`⚠️ خطأ: ${data.error}`);
      } else {
        setTafsirResult(data.text);
      }
    } catch (e) {
      setTafsirResult('⚠️ عذراً، تعذر الاتصال بخادم التفسير. يرجى التحقق من اتصال الإنترنت.');
    } finally {
      setIsLoadingTafsir(false);
    }
  };

  const handleFetchAyahTafsir = async (surahNum: number, surahName: string, ayahNum: number) => {
    setIsLoadingTafsir(true);
    setActiveTafsirAyah(ayahNum);
    setTafsirResult(null);
    try {
      const res = await fetch('/api/gemini/tafsir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surahNumber: surahNum, surahName, ayahNumber: ayahNum }),
      });
      const data = await res.json();
      if (data.error) {
        setTafsirResult(`⚠️ خطأ: ${data.error}`);
      } else {
        setTafsirResult(data.text);
      }
    } catch (e) {
      setTafsirResult('⚠️ تعذر تحميل التفسير حالياً.');
    } finally {
      setIsLoadingTafsir(false);
    }
  };

  const handleManualAyahLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLookingUp(true);
    setLookupResult(null);
    
    const surahMeta = quranMetadata.find(s => s.number === Number(lookupSurah));
    const sName = surahMeta ? surahMeta.name : `سورة رقم ${lookupSurah}`;

    try {
      const res = await fetch('/api/gemini/tafsir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surahNumber: lookupSurah,
          surahName: sName,
          ayahNumber: lookupAyah,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setLookupResult(`⚠️ خطأ: ${data.error}`);
      } else {
        setLookupResult(data.text);
      }
    } catch (err) {
      setLookupResult('⚠️ عذراً، تعذر جلب التفسير لهذه الآية حالياً.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const changeFontSize = (delta: number) => {
    setFontSize(prev => Math.min(Math.max(prev + delta, 16), 40));
  };

  // Audio player handlers & effects
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsAudioLoading(false);
      setAudioError(false);
      setUsingFallback(false);
      
      if (selectedSurah) {
        const padded = String(selectedSurah.number).padStart(3, '0');
        const reciter = QURAN_RECITERS.find(r => r.id === activeReciterId) || QURAN_RECITERS[0];
        if (reciter) {
          audioRef.current.src = `${reciter.url}${padded}.mp3`;
          audioRef.current.load();
        }
      }
    }
  }, [selectedSurah]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleReciterChange = (reciterId: string) => {
    setActiveReciterId(reciterId);
    setUsingFallback(false);
    setAudioError(false);
    if (!selectedSurah) return;

    const wasPlaying = isPlaying;
    setIsAudioLoading(true);

    const padded = String(selectedSurah.number).padStart(3, '0');
    const reciter = QURAN_RECITERS.find(r => r.id === reciterId) || QURAN_RECITERS[0];
    if (reciter && audioRef.current) {
      audioRef.current.src = `${reciter.url}${padded}.mp3`;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Audio play failed, trying fallback:", err);
          handleAudioError();
        });
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handleAudioError = () => {
    if (!selectedSurah || !audioRef.current) return;
    const padded = String(selectedSurah.number).padStart(3, '0');
    const reciter = QURAN_RECITERS.find(r => r.id === activeReciterId) || QURAN_RECITERS[0];

    if (!usingFallback && reciter?.fallbackUrl) {
      // Auto-fallback to secondary high speed mirror
      setUsingFallback(true);
      setIsAudioLoading(true);
      audioRef.current.src = `${reciter.fallbackUrl}${padded}.mp3`;
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsAudioLoading(false);
        setAudioError(false);
      }).catch(() => {
        setIsAudioLoading(false);
        setIsPlaying(false);
        setAudioError(true);
      });
    } else {
      setIsAudioLoading(false);
      setIsPlaying(false);
      setAudioError(true);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setAudioError(false);
      setIsAudioLoading(true);
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsAudioLoading(false);
      }).catch(err => {
        console.error("Failed to play audio, trying fallback:", err);
        handleAudioError();
      });
    }
  };

  const skipTime = (delta: number) => {
    if (!audioRef.current) return;
    const newTime = Math.min(Math.max(audioRef.current.currentTime + delta, 0), duration || 1000);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cyclePlaybackRate = () => {
    const rates = [1.0, 1.25, 1.5, 0.75];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIdx]);
  };

  const handleNextSurah = () => {
    if (!selectedSurah) return;
    const nextNum = selectedSurah.number === 114 ? 1 : selectedSurah.number + 1;
    const nextMeta = quranMetadata.find(s => s.number === nextNum);
    if (nextMeta) {
      handleSelectSurah(nextMeta);
    }
  };

  const handlePrevSurah = () => {
    if (!selectedSurah) return;
    const prevNum = selectedSurah.number === 1 ? 114 : selectedSurah.number - 1;
    const prevMeta = quranMetadata.find(s => s.number === prevNum);
    if (prevMeta) {
      handleSelectSurah(prevMeta);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) {
      audioRef.current.muted = nextMute;
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const activeFontClass = FONT_FAMILIES.find(f => f.id === activeFontFamily)?.class || 'font-amiri';

  return (
    <div className="w-full bg-[#061214] border border-emerald-500/20 rounded-3xl p-4 sm:p-6 space-y-6 text-right font-sans shadow-xl">
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            setIsAudioLoading(false);
            setAudioError(false);
          }
        }}
        onPlay={() => {
          setIsPlaying(true);
          setIsAudioLoading(false);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          if (!isLooping) {
            setIsPlaying(false);
            setCurrentTime(0);
          }
        }}
        onError={() => handleAudioError()}
        onWaiting={() => setIsAudioLoading(true)}
        onCanPlay={() => {
          setIsAudioLoading(false);
          setAudioError(false);
        }}
      />
      
      {/* 1. Main Quran Directory or Selected Surah */}
      {!selectedSurah ? (
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-md">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">المصحف الشريف وتفسير السور</h3>
                <p className="text-xs text-emerald-400 font-medium">
                  تصفح وقراءة سور القرآن الـ ١١٤ كاملة مع الاستماع والتفسير
                </p>
              </div>
            </div>

            {/* Saved Bookmark Banner if exists */}
            {savedBookmark && (
              <button
                onClick={() => {
                  const meta = quranMetadata.find(s => s.number === savedBookmark.surahNumber);
                  if (meta) handleSelectSurah(meta);
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-amber-500/15 border border-amber-400/30 rounded-2xl text-xs text-amber-300 font-bold hover:bg-amber-500/25 transition-all cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-amber-400 fill-current" />
                <span>آخر علامة: سورة {savedBookmark.surahName} (آية {savedBookmark.ayahNumber})</span>
              </button>
            )}
          </div>

          {/* Quick Specific Ayah Lookup Form (GEMINI ENABLED) */}
          <div className="p-4 sm:p-5 bg-[#091B1F] border border-emerald-500/25 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-300">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <h4 className="text-xs sm:text-sm font-black">مستكشف آيات وتفاسير القرآن الفوري</h4>
            </div>
            <form onSubmit={handleManualAyahLookup} className="flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1 text-xs flex-1 min-w-[140px]">
                <span className="text-slate-400 font-bold">حدد السورة:</span>
                <select
                  id="lookup-surah-select"
                  value={lookupSurah}
                  onChange={(e) => setLookupSurah(Number(e.target.value))}
                  className="px-3 py-2 bg-[#030A0C] border border-emerald-500/30 rounded-xl text-xs font-bold text-white focus:outline-hidden"
                >
                  {quranMetadata.map(s => (
                    <option key={s.number} value={s.number} className="bg-[#061214] text-white">
                      {s.number}. سورة {s.name} ({s.numberOfAyahs} آية)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 text-xs">
                <span className="text-slate-400 font-bold">رقم الآية:</span>
                <input
                  id="lookup-ayah-input"
                  type="number"
                  min="1"
                  max={quranMetadata.find(s => s.number === lookupSurah)?.numberOfAyahs || 286}
                  value={lookupAyah}
                  onChange={(e) => setLookupAyah(Number(e.target.value))}
                  className="w-20 px-3 py-2 bg-[#030A0C] border border-emerald-500/30 rounded-xl text-xs font-bold text-center text-white focus:outline-hidden"
                />
              </div>

              <button
                id="lookup-ayah-submit-btn"
                type="submit"
                disabled={isLookingUp}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 h-9 cursor-pointer"
              >
                {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isLookingUp ? 'جاري جلب التفسير...' : 'جلب التفسير'}</span>
              </button>
            </form>

            {/* Quick Result Drawer */}
            {lookupResult && (
              <div className="mt-3 p-4 bg-[#030A0C] border border-emerald-500/30 rounded-2xl space-y-2 text-xs leading-relaxed max-h-[300px] overflow-y-auto text-slate-200 shadow-inner">
                <div className="markdown-body text-xs leading-relaxed">
                  <ReactMarkdown>{lookupResult}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Quick Reciter Audio Station (Play Any Surah with Any Sheikh) */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-[#0B252A] to-[#040C0E] border border-amber-500/30 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-400/30">
                  <Headphones className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-amber-300">مشغل تلاوات القرآن بأصوات كبار قراء السعودية والعالم الإسلامي</h4>
                  <p className="text-[11px] text-slate-300">اختر السورة والشيخ القارئ واستمع للتلاوة المباركة كاملة</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Select Reciter */}
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-slate-300 font-bold">القارئ الشيخ:</span>
                <select
                  id="quick-reciter-select"
                  value={activeReciterId}
                  onChange={(e) => handleReciterChange(e.target.value)}
                  className="px-3 py-2.5 bg-[#030A0C] border border-emerald-500/30 rounded-xl text-xs font-bold text-amber-300 focus:outline-hidden cursor-pointer"
                >
                  <optgroup label="🕋 أئمة الحرم المكي والمسجد النبوي" className="bg-[#061214] text-emerald-400 font-bold">
                    {QURAN_RECITERS.filter(r => r.tag === 'حرم مكي' || r.tag === 'مسجد نبوي').map((r) => (
                      <option key={r.id} value={r.id} className="bg-[#061214] text-white">
                        {r.name} ({r.country})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🇸🇦 كبار قراء المملكة العربية السعودية" className="bg-[#061214] text-emerald-400 font-bold">
                    {QURAN_RECITERS.filter(r => r.tag === 'قراء السعودية').map((r) => (
                      <option key={r.id} value={r.id} className="bg-[#061214] text-white">
                        {r.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌟 مشاهير القراء في العالم الإسلامي" className="bg-[#061214] text-emerald-400 font-bold">
                    {QURAN_RECITERS.filter(r => r.tag === 'مشاهير القراء').map((r) => (
                      <option key={r.id} value={r.id} className="bg-[#061214] text-white">
                        {r.name} ({r.country})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="📜 عمالقة التلاوة الكلاسيكية" className="bg-[#061214] text-emerald-400 font-bold">
                    {QURAN_RECITERS.filter(r => r.tag === 'عمالقة التلاوة').map((r) => (
                      <option key={r.id} value={r.id} className="bg-[#061214] text-white">
                        {r.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Select Surah */}
              <div className="flex flex-col gap-1 text-xs">
                <span className="text-slate-300 font-bold">السورة الكريمة:</span>
                <select
                  id="quick-surah-select"
                  value={directPlaySurahNum}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    setDirectPlaySurahNum(num);
                    const meta = quranMetadata.find(s => s.number === num);
                    if (meta) {
                      handleSelectSurah(meta);
                    }
                  }}
                  className="px-3 py-2.5 bg-[#030A0C] border border-emerald-500/30 rounded-xl text-xs font-bold text-white focus:outline-hidden cursor-pointer"
                >
                  {quranMetadata.map(s => (
                    <option key={s.number} value={s.number} className="bg-[#061214] text-white">
                      {s.number}. سورة {s.name} ({s.numberOfAyahs} آية - {s.revelationType === 'Meccan' ? 'مكية' : 'مدنية'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Play Button & Selected Reciter Tag */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/30 rounded-lg text-[10px] font-bold text-emerald-300">
                  {QURAN_RECITERS.find(r => r.id === activeReciterId)?.country || 'المملكة العربية السعودية'}
                </span>
                <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-400/20 rounded-lg text-[10px] font-bold text-amber-300">
                  {QURAN_RECITERS.find(r => r.id === activeReciterId)?.riwayah || 'حفص عن عاصم'}
                </span>
              </div>

              <button
                id="quick-listen-now-btn"
                type="button"
                onClick={() => {
                  const meta = quranMetadata.find(s => s.number === directPlaySurahNum);
                  if (meta) {
                    handleSelectSurah(meta);
                    setTimeout(() => {
                      if (audioRef.current) {
                        const padded = String(meta.number).padStart(3, '0');
                        const reciter = QURAN_RECITERS.find(r => r.id === activeReciterId) || QURAN_RECITERS[0];
                        audioRef.current.src = `${reciter.url}${padded}.mp3`;
                        audioRef.current.load();
                        audioRef.current.play().then(() => {
                          setIsPlaying(true);
                        }).catch(() => {});
                      }
                    }, 400);
                  }
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>فتح السورة والاستماع للشيخ الآن</span>
              </button>
            </div>
          </div>

          {/* Directory Search */}
          <div className="relative">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-emerald-400" />
            <input
              id="quran-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم السورة (مثلاً: الكهف، يس، الفاتحة) أو برقمها..."
              className="w-full pr-10 pl-4 py-2.5 text-xs sm:text-sm bg-[#030A0C] border border-emerald-500/25 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400 font-medium"
            />
          </div>

          {/* Vertical List of Surahs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSurahs.map((surah) => {
              return (
                <button
                  key={surah.number}
                  id={`surah-card-btn-${surah.number}`}
                  onClick={() => handleSelectSurah(surah)}
                  className="p-3.5 sm:p-4 bg-[#091B1F] border border-emerald-500/20 hover:border-emerald-400 rounded-3xl flex items-center justify-between gap-3 text-right transition-all duration-200 hover:shadow-lg group cursor-pointer"
                >
                  {/* Right side: Surah Number badge + Name + English name */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-[#061214] text-emerald-300 font-mono text-sm font-black rounded-2xl flex items-center justify-center border border-emerald-500/30 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-inner">
                      {surah.number}
                    </div>

                    <div>
                      <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                        سورة {surah.name}
                      </h4>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {surah.englishName}
                      </p>
                    </div>
                  </div>

                  {/* Left side: Surah metadata (verses count & revelation type) */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span className="px-2.5 py-1 bg-[#061214] border border-emerald-500/20 rounded-xl text-[10px] font-bold text-slate-300">
                      {surah.revelationType === 'Meccan' ? '🕋 مكية' : '🕌 مدنية'}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 rounded-xl text-[10px] font-black">
                      {surah.numberOfAyahs} آيات
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* 2. Selected Surah Reader Mode */
        <div className="space-y-6">
          
          {/* Back and Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
            <button
              id="back-to-quran-btn"
              onClick={() => setSelectedSurah(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لقائمة السور</span>
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Font Family selector */}
              <div className="flex items-center gap-1.5 bg-[#091B1F] p-1.5 rounded-2xl border border-emerald-500/20">
                <span className="text-[10px] text-slate-400 font-bold px-1">نوع الخط:</span>
                <select
                  value={activeFontFamily}
                  onChange={(e) => setActiveFontFamily(e.target.value)}
                  className="bg-transparent text-white text-xs font-bold focus:outline-hidden cursor-pointer border-none py-0.5"
                >
                  {FONT_FAMILIES.map(font => (
                    <option key={font.id} value={font.id} className="bg-[#061214] text-white">
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Adjustable Font sizing */}
              <div className="flex items-center gap-2 bg-[#091B1F] p-1.5 rounded-2xl border border-emerald-500/20">
                <span className="text-[10px] text-slate-400 pr-1 font-bold">الحجم:</span>
                <button
                  id="font-size-dec-btn"
                  onClick={() => changeFontSize(-2)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-black font-mono text-amber-300 px-1">{fontSize}</span>
                <button
                  id="font-size-inc-btn"
                  onClick={() => changeFontSize(2)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Surah Header / Title Block */}
          <div className="text-center p-6 bg-gradient-to-b from-[#0B252A] to-[#040C0E] text-white rounded-3xl space-y-2 relative overflow-hidden border border-emerald-500/30 shadow-2xl">
            <span className="px-3.5 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-300">
              السورة رقم {selectedSurah.number} • {selectedSurah.revelationType === 'Meccan' ? '🕋 مكية' : '🕌 مدنية'}
            </span>
            <h3 className="text-3xl font-black text-amber-300 mt-2 font-serif">سورة {selectedSurah.name}</h3>
            <p className="text-xs text-emerald-200/80">{selectedSurah.numberOfAyahs} آيات كريمة</p>
            
            {/* Quick Tafsir of whole surah button */}
            <button
              id="get-surah-tafsir-btn"
              onClick={() => handleFetchSurahTafsir(selectedSurah.number, selectedSurah.name)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-full shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>طلب تفسير وبيان مقاصد سورة {selectedSurah.name}</span>
            </button>
          </div>

          {/* Audio Player Card */}
          <div className="p-4 sm:p-5 bg-[#091B1F] border border-emerald-500/20 rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/15 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-600/30 text-emerald-300 rounded-xl">
                  <Headphones className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-white">الاستماع للتلاوة العطرة بصوت كبار القراء</span>
              </div>
              
              {/* Reciter Selector */}
              <div className="flex items-center gap-2 max-w-full">
                <span className="text-[10px] text-slate-400 font-bold shrink-0">القارئ الشيخ:</span>
                <select
                  id="quran-reciter-select"
                  value={activeReciterId}
                  onChange={(e) => handleReciterChange(e.target.value)}
                  className="bg-[#030A0C] border border-emerald-500/30 text-amber-300 text-xs font-black rounded-xl px-3 py-1.5 focus:outline-hidden cursor-pointer max-w-[220px] sm:max-w-xs truncate"
                >
                  <optgroup label="🕋 أئمة الحرم المكي والمسجد النبوي" className="bg-[#061214] text-emerald-400 font-bold">
                    {QURAN_RECITERS.filter(r => r.tag === 'حرم مكي' || r.tag === 'مسجد نبوي').map((r) => (
                      <option key={r.id} value={r.id} className="bg-[#061214] text-white">
                        {r.name} ({r.country})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🇸🇦 كبار قراء المملكة العربية السعودية" className="bg-[#061214] text-emerald-400 font-bold">
                    {QURAN_RECITERS.filter(r => r.tag === 'قراء السعودية').map((r) => (
                      <option key={r.id} value={r.id} className="bg-[#061214] text-white">
                        {r.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🌟 مشاهير القراء في العالم الإسلامي" className="bg-[#061214] text-emerald-400 font-bold">
                    {QURAN_RECITERS.filter(r => r.tag === 'مشاهير القراء').map((r) => (
                      <option key={r.id} value={r.id} className="bg-[#061214] text-white">
                        {r.name} ({r.country})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="📜 عمالقة التلاوة الكلاسيكية" className="bg-[#061214] text-emerald-400 font-bold">
                    {QURAN_RECITERS.filter(r => r.tag === 'عمالقة التلاوة').map((r) => (
                      <option key={r.id} value={r.id} className="bg-[#061214] text-white">
                        {r.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Controls, progress bar and volume */}
            <div className="flex flex-col md:flex-row items-center gap-4 justify-between" dir="rtl">
              
              {/* Main Play/Pause & Navigation block */}
              <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-start flex-wrap">
                {/* Prev Surah */}
                <button
                  id="audio-prev-surah-btn"
                  type="button"
                  title="السورة السابقة"
                  onClick={handlePrevSurah}
                  className="p-2.5 rounded-xl bg-[#040C0E] hover:bg-emerald-950 border border-emerald-500/20 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer active:scale-95"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {/* Rewind 10s */}
                <button
                  id="audio-rewind-10-btn"
                  type="button"
                  title="رجوع 10 ثواني"
                  onClick={() => skipTime(-10)}
                  className="p-2.5 rounded-xl bg-[#040C0E] hover:bg-emerald-950 border border-emerald-500/20 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer text-xs font-black flex items-center gap-1 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono">10</span>
                </button>

                {/* Play / Pause button */}
                <button
                  type="button"
                  onClick={handlePlayPause}
                  disabled={isAudioLoading}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95 text-white cursor-pointer ${
                    isPlaying 
                      ? 'bg-amber-500 hover:bg-amber-600' 
                      : 'bg-emerald-600 hover:bg-emerald-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isAudioLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-white translate-x-[-1px]" />
                  )}
                </button>

                {/* Forward 10s */}
                <button
                  id="audio-forward-10-btn"
                  type="button"
                  title="تقديم 10 ثواني"
                  onClick={() => skipTime(10)}
                  className="p-2.5 rounded-xl bg-[#040C0E] hover:bg-emerald-950 border border-emerald-500/20 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer text-xs font-black flex items-center gap-1 active:scale-95"
                >
                  <span className="text-[10px] font-mono">10</span>
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* Next Surah */}
                <button
                  id="audio-next-surah-btn"
                  type="button"
                  title="السورة التالية"
                  onClick={handleNextSurah}
                  className="p-2.5 rounded-xl bg-[#040C0E] hover:bg-emerald-950 border border-emerald-500/20 text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer active:scale-95"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                {/* Speed & Repeat */}
                <div className="flex items-center gap-1.5 mr-1">
                  <button
                    id="audio-speed-btn"
                    type="button"
                    title="سرعة التلاوة"
                    onClick={cyclePlaybackRate}
                    className="px-2.5 py-1.5 rounded-xl bg-[#040C0E] hover:bg-emerald-950 border border-emerald-500/20 text-[10px] font-black text-amber-300 transition-colors cursor-pointer"
                  >
                    {playbackRate}x
                  </button>
                  <button
                    id="audio-loop-btn"
                    type="button"
                    title="تكرار السورة"
                    onClick={() => setIsLooping(!isLooping)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isLooping 
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black' 
                        : 'bg-[#040C0E] text-slate-400 border-emerald-500/20 hover:text-white'
                    }`}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col text-right pr-2">
                  <span className="text-[10px] font-bold text-slate-400">حالة التلاوة</span>
                  <span className="text-xs font-black text-white">
                    {isAudioLoading ? 'جاري التحميل...' : isPlaying ? 'يُرتل الآن...' : audioError ? 'تعذر التحميل' : 'جاهز للاستماع'}
                  </span>
                </div>
              </div>

              {/* Progress Bar block */}
              <div className="flex items-center gap-3 w-full flex-1">
                <span className="text-[10px] font-mono text-slate-400 min-w-[35px] text-left">
                  {formatTime(currentTime)}
                </span>
                
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleProgressChange}
                  disabled={isAudioLoading || !duration}
                  className="flex-1 h-2 rounded-lg appearance-none bg-[#030A0C] accent-emerald-400 cursor-pointer disabled:opacity-50"
                />

                <span className="text-[10px] font-mono text-slate-400 min-w-[35px] text-right">
                  {formatTime(duration)}
                </span>
              </div>

              {/* Volume block */}
              <div className="flex items-center gap-2 border-r border-emerald-500/20 pr-3 mr-1 w-full md:w-32 justify-end md:justify-start">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1.5 rounded-lg appearance-none bg-[#030A0C] accent-emerald-400 cursor-pointer"
                />
              </div>

            </div>

            {/* Error or Fallback Status Notice */}
            {usingFallback && !audioError && (
              <div className="flex items-center justify-between px-3.5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                <span>⚡ تم تفعيل خادم التلاوة الاحتياطي فائق السرعة لضمان استمرار الاستماع بدون انقطاع.</span>
              </div>
            )}
            {audioError && (
              <div className="flex items-center justify-between px-3.5 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                <span>⚠️ تعذر تشغيل هذا القارئ حالياً بسبب ضغط الخادم. يمكنك التبديل لقارئ آخر أو إعادة المحاولة.</span>
                <button
                  type="button"
                  onClick={() => {
                    setAudioError(false);
                    handleAudioError();
                  }}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}
          </div>

          {/* Tafsir results display */}
          {isLoadingTafsir && (
            <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
              <p className="text-xs font-bold text-amber-300">
                يقوم مستشار نور الإسلام بطلب التفسير الصحيح من المعاجم والكتب المعتمدة...
              </p>
            </div>
          )}

          {tafsirResult && (
            <div className="p-5 bg-[#091B1F] border border-emerald-500/25 rounded-3xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpenCheck className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-black text-amber-300">
                    {activeTafsirAyah ? `تفسير الآية رقم ${activeTafsirAyah}` : `تفسير وبيان سورة ${selectedSurah.name}`}
                  </h4>
                </div>
                <button
                  id="clear-tafsir-btn"
                  onClick={() => {
                    setTafsirResult(null);
                    setActiveTafsirAyah(null);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                >
                  إغلاق التفسير
                </button>
              </div>

              {/* Render Tafsir markdown */}
              <div className="markdown-body text-xs text-slate-200 leading-relaxed max-h-[400px] overflow-y-auto pr-1">
                <ReactMarkdown>{tafsirResult}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Verses Content */}
          <div className="space-y-6">
            {isLoadingSurahText ? (
              <div className="p-12 text-center bg-[#091B1F] border border-emerald-500/20 rounded-3xl space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-emerald-300">جاري تحميل النص القرآني الشريف لسورة {selectedSurah.name}...</p>
              </div>
            ) : selectedSurah.ayahs && selectedSurah.ayahs.length > 0 ? (
              <div className="p-5 sm:p-8 bg-[#091B1F] border border-emerald-500/20 rounded-3xl space-y-6 text-center shadow-xl">
                
                {/* Bismillah */}
                {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                  <p className={`text-2xl sm:text-3xl ${activeFontClass} text-amber-300 py-3 border-b border-emerald-500/15 font-serif`}>
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                )}

                {selectedSurah.ayahs.map((ayah) => {
                  const ayahKey = `${selectedSurah.number}:${ayah.number}`;
                  const isFav = favoriteAyahs.includes(ayahKey);
                  const isBookmarked = savedBookmark?.surahNumber === selectedSurah.number && savedBookmark?.ayahNumber === ayah.number;
                  const isCopied = copiedAyahKey === `${selectedSurah.name}:${ayah.number}`;

                  return (
                    <div
                      key={ayah.number}
                      id={`ayah-${ayah.number}`}
                      className={`py-5 border-b border-emerald-500/10 last:border-none space-y-4 group text-center transition-all ${
                        isBookmarked ? 'bg-amber-500/10 p-4 rounded-2xl border border-amber-400/30' : ''
                      }`}
                    >
                      {/* Arabic scripture */}
                      <p
                        className={`text-slate-100 leading-loose sm:leading-loose tracking-wide ${activeFontClass} text-center transition-all duration-200 select-text`}
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {ayah.text}{' '}
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-emerald-400/40 text-xs font-mono font-black text-amber-300 select-none mr-2 bg-[#061214] shadow-xs">
                          {ayah.number}
                        </span>
                      </p>

                      {/* Ayah Action Controls: Bookmark, Favorite, Copy, Share, Tafsir */}
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        
                        {/* Bookmark button */}
                        <button
                          onClick={() => handleSaveBookmark(selectedSurah.number, ayah.number, selectedSurah.name)}
                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isBookmarked
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                              : 'bg-[#030A0C] border-emerald-500/20 text-slate-400 hover:text-amber-300'
                          }`}
                          title="حفظ علامة القراءة"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                          <span>{isBookmarked ? 'علامتك الحالية' : 'حفظ موضع القراءة'}</span>
                        </button>

                        {/* Favorite button */}
                        <button
                          onClick={() => handleToggleAyahFavorite(selectedSurah.number, ayah.number, ayah.text)}
                          className={`p-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                            isFav 
                              ? 'bg-amber-400/20 border-amber-400 text-amber-300' 
                              : 'bg-[#030A0C] border-emerald-500/20 text-slate-400 hover:text-amber-300'
                          }`}
                          title="إضافة للمفضلة"
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                        </button>

                        {/* Copy */}
                        <button
                          onClick={() => handleCopyAyah(selectedSurah.name, ayah.number, ayah.text)}
                          className="p-1.5 bg-[#030A0C] hover:bg-slate-800 border border-emerald-500/20 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                          title="نسخ الآية"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Share */}
                        <button
                          onClick={() => handleShareAyah(selectedSurah.name, ayah.number, ayah.text)}
                          className="p-1.5 bg-[#030A0C] hover:bg-slate-800 border border-emerald-500/20 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                          title="مشاركة الآية"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        {/* AI Tafsir button */}
                        <button
                          id={`ayah-tafsir-btn-${ayah.number}`}
                          onClick={() => handleFetchAyahTafsir(selectedSurah.number, selectedSurah.name, ayah.number)}
                          className="px-3 py-1.5 bg-[#030A0C] hover:bg-emerald-950/40 border border-emerald-500/25 rounded-xl text-[11px] font-bold text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>تفسير الآية</span>
                        </button>

                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 bg-[#091B1F] border border-emerald-500/20 rounded-3xl text-center space-y-4">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <h4 className="text-base font-bold text-white">سورة {selectedSurah.name} جاهزة للقراءة والتفسير</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  انقر على الزر بالأسفل لجلب تفسير وتحليل كامل مقاصد وآيات سورة {selectedSurah.name}.
                </p>
                
                <button
                  id="surah-online-tafsir-btn"
                  onClick={() => handleFetchSurahTafsir(selectedSurah.number, selectedSurah.name)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white text-xs font-bold rounded-2xl transition-all shadow-md flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>جلب تفسير سورة {selectedSurah.name} الآن</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
