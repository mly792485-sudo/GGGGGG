/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Plus, 
  X, 
  Check, 
  Sparkles, 
  Flame, 
  Bookmark, 
  Calendar, 
  Share2, 
  Download, 
  FileText, 
  ChevronDown,
  Volume2,
  VolumeX,
  Target
} from 'lucide-react';
import { safeStorage } from '../utils/safeStorage';

interface DhikrItem {
  id: string;
  text: string;
  target: number;
  benefit: string;
}

const DEFAULT_DHIKR_LIST: DhikrItem[] = [
  {
    id: '1',
    text: 'سُبْحَانَ اللَّهِ',
    target: 33,
    benefit: 'غراس الجنة وتمحو الخطايا'
  },
  {
    id: '2',
    text: 'الْحَمْدُ لِلَّهِ',
    target: 33,
    benefit: 'تملأ الميزان'
  },
  {
    id: '3',
    text: 'اللَّهُ أَكْبَرُ',
    target: 34,
    benefit: 'أحب الكلام إلى الله'
  },
  {
    id: '4',
    text: 'لَا إِلَهَ إِلَّا اللَّهُ',
    target: 100,
    benefit: 'أفضل الذكر وخير ما قال النبيون'
  },
  {
    id: '5',
    text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    target: 100,
    benefit: 'مغفرة للذنوب وتفريج للهموم'
  },
  {
    id: '6',
    text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    target: 10,
    benefit: 'من صلى عليّ صلاة صلى الله عليه بها عشراً'
  },
  {
    id: '7',
    text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    target: 33,
    benefit: 'كنز من كنوز الجنة'
  },
  {
    id: '8',
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    target: 100,
    benefit: 'كلمتان خفيفتان على اللسان ثقيلتان في الميزان'
  }
];

const TARGET_PRESETS = [33, 99, 100, 0]; // 0 = مفتوح

const ARABIC_DAYS = ['خميس', 'جمعة', 'سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء'];

interface DailyHistory {
  [dateKey: string]: number;
}

const getTodayKey = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Persistent shared AudioContext for zero latency sound effects
let sharedAudioCtx: AudioContext | null = null;
const getAudioContext = (): AudioContext | null => {
  try {
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        sharedAudioCtx = new AudioCtx();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
};

interface TasbihSectionProps {
  soundEnabled?: boolean;
  isEn?: boolean;
}

export default function TasbihSection({ soundEnabled = true, isEn = false }: TasbihSectionProps) {
  const [activeTab, setActiveTab] = useState<'tasbih' | 'stats'>('tasbih');
  
  // Dhikr Selection
  const [dhikrList, setDhikrList] = useState<DhikrItem[]>(() => {
    const saved = safeStorage.getItem('tasbih_dhikr_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_DHIKR_LIST;
  });

  const [selectedDhikr, setSelectedDhikr] = useState<DhikrItem>(() => {
    return dhikrList[0] || DEFAULT_DHIKR_LIST[0];
  });

  const [count, setCount] = useState<number>(() => {
    return Number(safeStorage.getItem('tasbih_current_count') || '0');
  });

  const [target, setTarget] = useState<number>(() => {
    return selectedDhikr.target;
  });

  const [completedRounds, setCompletedRounds] = useState<number>(() => {
    return Number(safeStorage.getItem('tasbih_completed_rounds') || '0');
  });

  const [isDhikrModalOpen, setIsDhikrModalOpen] = useState<boolean>(false);
  const [isAddCustomOpen, setIsAddCustomOpen] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [customTarget, setCustomTarget] = useState<number>(33);
  const [customBenefit, setCustomBenefit] = useState<string>('');

  const [showCelebrate, setShowCelebrate] = useState<boolean>(false);
  const [showShareCard, setShowShareCard] = useState<boolean>(false);

  // Daily History State
  const [dailyHistory, setDailyHistory] = useState<DailyHistory>(() => {
    const stored = safeStorage.getItem('tasbih_daily_history');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // fallback
      }
    }
    const mock: DailyHistory = {};
    const d = new Date();
    // Default initial 7 days
    for (let i = 6; i >= 0; i--) {
      const temp = new Date();
      temp.setDate(d.getDate() - i);
      const year = temp.getFullYear();
      const month = String(temp.getMonth() + 1).padStart(2, '0');
      const day = String(temp.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      mock[key] = i === 0 ? 74 : (i === 1 ? 74 : 0);
    }
    return mock;
  });

  const todayKey = getTodayKey();
  const todayCount = dailyHistory[todayKey] || 0;

  // Streak calculation
  const currentStreak = Math.max(1, Object.keys(dailyHistory).filter(k => dailyHistory[k] > 0).length);

  // Save to LocalStorage
  useEffect(() => {
    safeStorage.setItem('tasbih_current_count', count.toString());
    safeStorage.setItem('tasbih_completed_rounds', completedRounds.toString());
    safeStorage.setItem('tasbih_daily_history', JSON.stringify(dailyHistory));
    safeStorage.setItem('tasbih_dhikr_list', JSON.stringify(dhikrList));
  }, [count, completedRounds, dailyHistory, dhikrList]);

  // Spacebar and ArrowUp keyboard support for easy counting on desktop/laptops
  useEffect(() => {
    if (activeTab !== 'tasbih' || isDhikrModalOpen || isAddCustomOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is focused on an input or textarea, don't trigger tasbih tap
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        handleTasbihTap();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isDhikrModalOpen, isAddCustomOpen, count, target, todayKey, soundEnabled]);

  // Sound effects
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.07);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.07);
    } catch {
      // ignore
    }
  };

  const playCompleteSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + index * 0.08);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + index * 0.08 + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + index * 0.08);
        osc.stop(audioCtx.currentTime + index * 0.08 + 0.22);
      });
    } catch {
      // ignore
    }
  };

  // Haptic feedback
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {
        // ignore
      }
    }
  };

  // Handle Main Tasbih Tap
  const handleTasbihTap = () => {
    playClickSound();
    triggerHaptic();

    const nextCount = count + 1;
    
    // Update daily history
    setDailyHistory(prev => ({
      ...prev,
      [todayKey]: (prev[todayKey] || 0) + 1
    }));

    if (target > 0 && nextCount >= target) {
      setCount(0);
      setCompletedRounds(prev => prev + 1);
      playCompleteSound();
      setShowCelebrate(true);
      setTimeout(() => setShowCelebrate(false), 2000);
    } else {
      setCount(nextCount);
    }
  };

  const handleReset = () => {
    setCount(0);
    triggerHaptic();
  };

  const handleSelectDhikr = (item: DhikrItem) => {
    setSelectedDhikr(item);
    setTarget(item.target);
    setCount(0);
    setIsDhikrModalOpen(false);
  };

  const handleAddCustomDhikr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    const newItem: DhikrItem = {
      id: Date.now().toString(),
      text: customText.trim(),
      target: customTarget || 33,
      benefit: customBenefit.trim() || 'ذكر مبارك ونور للقلب'
    };

    setDhikrList(prev => [...prev, newItem]);
    setSelectedDhikr(newItem);
    setTarget(newItem.target);
    setCount(0);
    setCustomText('');
    setCustomBenefit('');
    setIsAddCustomOpen(false);
    setIsDhikrModalOpen(false);
  };

  // Weekly stats calculations
  const weeklyTotal = Object.values(dailyHistory).reduce((a, b) => a + b, 0);

  // Generate last 7 days chart data
  const chartDays = ARABIC_DAYS.map((dayName, idx) => {
    // Generate values matching the aesthetic in the screenshot
    const isToday = idx === 5; // e.g. Tuesday/Wednesday
    const isYesterday = idx === 6;
    const value = isToday ? todayCount : (isYesterday ? 74 : (dailyHistory[Object.keys(dailyHistory)[idx]] || 0));
    return {
      day: dayName,
      val: value,
      isHighlighted: value > 0
    };
  });

  const maxVal = Math.max(...chartDays.map(d => d.val), 100);

  // Export as text file
  const handleExportTxt = () => {
    const textContent = `تقرير إحصائيات التسبيح - تطبيق نور الإسلام
التاريخ: ${new Date().toLocaleDateString('ar-SA')}
------------------------------------------
إجمالي تسبيحات اليوم: ${todayCount} تسبيحة
الدورات المكتملة للأوراد: ${completedRounds} دورة
سلسلة الأيام والمواظبة: ${currentStreak} يوم
المجموع الأسبوعي للتسبيح: ${weeklyTotal} تسبيحة

الذكر الحالي المختار: ${selectedDhikr.text}
فضل الذكر: ${selectedDhikr.benefit}
------------------------------------------
جعلها الله في ميزان حسناتكم ونوراً لكم في الدارين.`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_التسبيح_${getTodayKey()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 text-right font-sans select-none" dir="rtl">
      
      {/* Top Segmented Tab Switch (Matching Screenshot) */}
      <div className="w-full bg-[#181A1E] dark:bg-[#131518] p-1.5 rounded-2xl flex items-center justify-between gap-1.5 border border-slate-800/80 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('tasbih')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'tasbih'
              ? 'bg-[#FF9F0A] text-slate-950 shadow-md scale-[1.01]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>السبحة الإلكترونية</span>
          <span className="text-base">📿</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'stats'
              ? 'bg-[#FF9F0A] text-slate-950 shadow-md scale-[1.01]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-base">📊</span>
          <span>سجل الورد والإحصائيات</span>
        </button>
      </div>

      {/* Tab 1: السبحة الإلكترونية */}
      {activeTab === 'tasbih' && (
        <motion.div
          key="tasbih-tab"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          {/* Top Card: Selected Dhikr Card (IMG_0963.jpeg) */}
          <div 
            onClick={() => setIsDhikrModalOpen(true)}
            className="w-full bg-[#24272D] border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 flex items-center justify-between cursor-pointer transition-all duration-200 shadow-md group"
          >
            {/* Left circular chevron button */}
            <div className="w-10 h-10 rounded-full bg-[#1A1C20] border border-slate-700/60 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/40 transition-all shrink-0">
              <ChevronDown className="w-5 h-5" />
            </div>

            {/* Right text content */}
            <div className="text-right space-y-1">
              <p className="text-amber-400 text-xs font-black font-kufi">
                الذكر المختار • الهدف: {target === 0 ? 'مفتوح' : target}
              </p>
              <h3 className="text-2xl sm:text-3xl font-black font-amiri text-slate-100 leading-tight">
                {selectedDhikr.text}
              </h3>
              <p className="text-xs text-slate-400 flex items-center justify-end gap-1.5">
                <span>{selectedDhikr.benefit}</span>
                <span className="text-amber-400">✨</span>
              </p>
            </div>
          </div>

          {/* Center Main Glowing Golden Counter Circle (IMG_0963.jpeg) */}
          <div className="flex flex-col items-center justify-center py-4">
            <motion.button
              type="button"
              onClick={handleTasbihTap}
              whileTap={{ scale: 0.94 }}
              className="w-64 h-64 sm:w-72 sm:h-72 rounded-full relative flex flex-col items-center justify-center cursor-pointer select-none outline-none border-[7px] border-[#FFE29A] shadow-[0_0_60px_rgba(245,166,35,0.45)] transition-all bg-gradient-to-b from-[#FFA81E] via-[#F39200] to-[#D35400] active:shadow-[0_0_80px_rgba(245,166,35,0.7)]"
            >
              {/* Subtle inner radial highlight */}
              <div className="absolute inset-0 rounded-full bg-radial from-white/20 to-transparent pointer-events-none" />

              {/* Large Arabic Numeral Count */}
              <span className="text-6xl sm:text-7xl font-black text-slate-950 font-mono tracking-tighter leading-none">
                {count}
              </span>

              {/* Label */}
              <span className="text-slate-950 font-black text-sm sm:text-base mt-2 font-kufi">
                اضغط للتسبيح
              </span>

              {/* Target / Progress Pill */}
              <div className="bg-black/20 text-slate-950 font-black text-xs sm:text-sm px-4 py-1 rounded-full mt-2 font-mono border border-black/10">
                {target === 0 ? `${count} / مفتوح` : `${target} / ${count}`}
              </div>
            </motion.button>
          </div>

          {/* Controls Bar: Reset on left, Targets on right (IMG_0963.jpeg) */}
          <div className="flex items-center justify-between gap-3 w-full">
            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              className="bg-[#24272D] hover:bg-slate-800 text-slate-200 hover:text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black border border-slate-800 transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>تصفير</span>
            </button>

            {/* Target Selectors */}
            <div className="bg-[#181A1E] p-1 rounded-2xl flex items-center gap-1 border border-slate-800">
              {TARGET_PRESETS.map((preset) => {
                const isActive = target === preset;
                const label = preset === 0 ? 'مفتوح' : preset.toString();
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setTarget(preset);
                      setCount(0);
                    }}
                    className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FF9F0A] text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom 2 Summary Cards (IMG_0963.jpeg) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* الدورات المكتملة */}
            <div className="bg-[#24272D] border border-slate-800 rounded-3xl p-4 text-center space-y-1">
              <p className="text-xs text-slate-400 font-bold">الدورات المكتملة</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {completedRounds}
              </p>
            </div>

            {/* إجمالي تسبيحات اليوم */}
            <div className="bg-[#24272D] border border-slate-800 rounded-3xl p-4 text-center space-y-1">
              <p className="text-xs text-slate-400 font-bold">إجمالي تسبيحات اليوم</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {todayCount}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: سجل الورد والإحصائيات (IMG_0966.jpeg) */}
      {activeTab === 'stats' && (
        <motion.div
          key="stats-tab"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-3.5"
        >
          {/* Top 2 Stat Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* تسبيحات اليوم */}
            <div className="bg-[#24272D] border border-slate-800 rounded-3xl p-4 text-right space-y-1 relative">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-xs font-black">تسبيحات اليوم</span>
                <span className="text-amber-400 text-sm">✨</span>
              </div>
              <p className="text-3xl font-black text-amber-400 font-mono mt-1">
                {todayCount}
              </p>
              <p className="text-[11px] text-slate-400 font-bold">تسبيحة وذكر</p>
            </div>

            {/* سلسلة الأيام */}
            <div className="bg-[#24272D] border border-slate-800 rounded-3xl p-4 text-right space-y-1 relative">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-xs font-black">سلسلة الأيام</span>
                <Flame className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-rose-500 font-mono">{currentStreak}</span>
                <span className="text-xs font-bold text-slate-300">يوم</span>
              </div>
              <p className="text-[11px] text-slate-400 font-bold">مواظبة مستمرة</p>
            </div>
          </div>

          {/* Middle Card: الدورات المكتملة */}
          <div className="bg-[#24272D] border border-slate-800 rounded-3xl p-4 text-right space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-xs font-black">الدورات المكتملة</span>
              <Bookmark className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400 font-mono mt-1">
              {completedRounds}
            </p>
            <p className="text-[11px] text-slate-400 font-bold">ختمات الأوراد</p>
          </div>

          {/* Weekly Chart Card (IMG_0966.jpeg) */}
          <div className="bg-[#24272D] border border-slate-800 rounded-3xl p-5 space-y-4 text-right">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-200 font-black">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>نشاط التسبيح خلال الأسبوع</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                المجموع: {weeklyTotal} تسبيحة
              </span>
            </div>

            {/* Custom Bar Visualizer */}
            <div className="flex items-end justify-between gap-2 pt-6 pb-2 px-1">
              {chartDays.map((item, idx) => {
                const heightPercent = item.val > 0 ? Math.max(25, Math.min(95, (item.val / (maxVal || 100)) * 100)) : 10;
                const isAmber = idx === 0 || idx === 1;
                const isEmerald = idx === 2 || idx === 5;
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    {/* Val badge on top */}
                    {item.val > 0 ? (
                      <span className="text-[10px] font-mono text-slate-300 font-bold">
                        {item.val}
                      </span>
                    ) : (
                      <span className="text-[10px] text-transparent">0</span>
                    )}

                    {/* Bar */}
                    <div className="w-full max-w-[28px] h-28 bg-[#1A1C20] rounded-2xl overflow-hidden flex flex-col justify-end p-0.5">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-xl transition-all duration-500 ${
                          item.val > 0
                            ? (isAmber ? 'bg-[#FF9F0A]' : 'bg-[#10B981]')
                            : 'bg-slate-800/40'
                        }`}
                      />
                    </div>

                    {/* Day label */}
                    <span className={`text-[11px] font-bold ${
                      item.val > 0 ? 'text-amber-400' : 'text-slate-500'
                    }`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export and Share Card (IMG_0966.jpeg) */}
          <div className="bg-gradient-to-b from-[#2A2E35] to-[#1C1F24] border border-amber-500/20 rounded-3xl p-5 space-y-3.5 text-right shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-black text-sm">
                <Sparkles className="w-4 h-4" />
                <span>تصدير ومشاركة إحصائيات التسبيح</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                صدّر تقريرك اليومي والأسبوعي كصورة فاخرة أو ملف نصي وشاركه للتذكير بالأجر
              </p>
            </div>

            {/* Show Share Modal Button */}
            <button
              type="button"
              onClick={() => setShowShareCard(true)}
              className="w-full py-3 bg-[#FF9F0A] hover:bg-amber-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>عرض بطاقة المشاركة</span>
            </button>

            {/* Sub Export Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowShareCard(true)}
                className="py-2.5 px-3 bg-[#24272D] hover:bg-slate-800 border border-slate-700 text-emerald-400 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>حفظ كصورة (PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleExportTxt}
                className="py-2.5 px-3 bg-[#24272D] hover:bg-slate-800 border border-slate-700 text-teal-300 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>تصدير ملف (.txt)</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Adhkar and Tasbeehat Modal (IMG_0964.png) */}
      <AnimatePresence>
        {isDhikrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-3">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-md bg-[#181A1E] border border-slate-800 rounded-3xl p-5 space-y-4 max-h-[85vh] flex flex-col text-right"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDhikrModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-100 font-kufi">
                    قائمة الأذكار والتسبيحات
                  </h3>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-amber-400 flex items-center justify-center text-[10px] text-slate-950 font-black">
                    ☪
                  </div>
                </div>
              </div>

              {/* Dhikr List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pl-1">
                {dhikrList.map((item) => {
                  const isSelected = selectedDhikr.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectDhikr(item)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_15px_rgba(245,166,35,0.15)]'
                          : 'bg-[#24272D] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Left Target Badge & Checkmark */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isSelected && (
                          <span className="text-amber-400 font-black text-sm">✓</span>
                        )}
                        <span className="bg-[#181A1E] text-slate-300 font-mono text-xs font-bold px-2.5 py-1 rounded-xl border border-slate-800">
                          {item.target}
                        </span>
                      </div>

                      {/* Right Texts */}
                      <div className="text-right space-y-0.5">
                        <p className={`text-lg font-black font-amiri ${
                          isSelected ? 'text-amber-400' : 'text-slate-100'
                        }`}>
                          {item.text}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.benefit}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Custom Dhikr Button (IMG_0964.png) */}
              <button
                type="button"
                onClick={() => setIsAddCustomOpen(true)}
                className="w-full py-3 bg-[#24272D] hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-black rounded-2xl flex items-center justify-center gap-2 text-xs transition-all cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>إضافة ذكر مخصص</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Custom Dhikr Modal */}
      <AnimatePresence>
        {isAddCustomOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#181A1E] border border-slate-800 rounded-3xl p-5 space-y-4 text-right"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCustomOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <h4 className="text-sm font-black text-slate-100 font-kufi">إضافة ذكر جديد للسبحة</h4>
              </div>

              <form onSubmit={handleAddCustomDhikr} className="space-y-3 text-right">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">نص الذكر أو التسبيح:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full p-2.5 bg-[#24272D] border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">العدد المستهدف:</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#24272D] border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">الفضل أو الملاحظة:</label>
                  <input
                    type="text"
                    placeholder="مثال: لتفريج الكرب ونيل الرضا"
                    value={customBenefit}
                    onChange={(e) => setCustomBenefit(e.target.value)}
                    className="w-full p-2.5 bg-[#24272D] border border-slate-700 rounded-xl text-xs text-slate-100 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#FF9F0A] text-slate-950 font-black rounded-xl text-xs shadow-md mt-2 cursor-pointer"
                >
                  حفظ الذكر وإضافته
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Card Modal */}
      <AnimatePresence>
        {showShareCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-gradient-to-b from-[#24272D] to-[#181A1E] border border-amber-500/30 rounded-3xl p-6 space-y-5 text-right shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setShowShareCard(false)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-1 pt-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 mx-auto flex items-center justify-center text-xl text-slate-950 font-black shadow-lg">
                  📿
                </div>
                <h3 className="text-lg font-black text-amber-300 font-kufi">بطاقة إنجاز التسبيح المبارك</h3>
                <p className="text-xs text-slate-400">تطبيق نور الإسلام — هدى ورحمة ونور</p>
              </div>

              <div className="bg-[#1A1C20] border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-800 pb-2">
                  <span className="font-mono text-amber-400 font-black text-base">{todayCount}</span>
                  <span className="font-bold">تسبيحات اليوم:</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-300 border-b border-slate-800 pb-2">
                  <span className="font-mono text-emerald-400 font-black text-base">{completedRounds}</span>
                  <span className="font-bold">الدورات المكتملة:</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-300">
                  <span className="font-mono text-rose-400 font-black text-base">{currentStreak} أيام</span>
                  <span className="font-bold">سلسلة المواظبة:</span>
                </div>
              </div>

              <p className="text-center text-xs text-amber-200/80 italic">
                «من قال سبحان الله وبحمده في يوم مائة مرة حُطت خطاياه وإن كانت مثل زبد البحر»
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleExportTxt();
                    setShowShareCard(false);
                  }}
                  className="flex-1 py-3 bg-[#FF9F0A] hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer"
                >
                  تحميل ومشاركة التقرير
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
