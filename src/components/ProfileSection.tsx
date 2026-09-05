/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Heart, 
  BookOpen, 
  RotateCcw, 
  Calendar, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  Star, 
  Check, 
  Share2 
} from 'lucide-react';
import { AppSettings } from '../types';
import { ISLAMIC_AVATARS } from '../assets/avatars';
import { safeStorage } from '../utils/safeStorage';

interface ProfileSectionProps {
  settings: AppSettings;
  isEn?: boolean;
  onNavigateSection?: (sectionId: string) => void;
}

export default function ProfileSection({ settings, isEn = false, onNavigateSection }: ProfileSectionProps) {
  // Load statistics from localStorage
  const [totalTasbih, setTotalTasbih] = useState<number>(() => {
    return parseInt(safeStorage.getItem('tasbih_total_all_time') || '0', 10);
  });

  const [favoriteAzkarCount, setFavoriteAzkarCount] = useState<number>(() => {
    try {
      const favs = JSON.parse(safeStorage.getItem('azkar_favorites') || '[]');
      return Array.isArray(favs) ? favs.length : 0;
    } catch {
      return 0;
    }
  });

  const [khatmaPagesRead, setKhatmaPagesRead] = useState<number>(() => {
    try {
      const plan = JSON.parse(safeStorage.getItem('noor_khatma_plan') || '{}');
      return plan.pagesRead || 0;
    } catch {
      return 0;
    }
  });

  const [fastingDays, setFastingDays] = useState<string[]>(() => {
    try {
      return JSON.parse(safeStorage.getItem('noor_fasting_days') || '[]');
    } catch {
      return [];
    }
  });

  const [weeklyActivity, setWeeklyActivity] = useState<number[]>(() => {
    try {
      const logs = JSON.parse(safeStorage.getItem('tasbih_daily_logs') || '{}');
      const days = [6, 5, 4, 3, 2, 1, 0];
      return days.map(d => {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const key = date.toISOString().split('T')[0];
        return logs[key] || 0;
      });
    } catch {
      return [12, 17, 14, 13, 15, 16, 15];
    }
  });

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Sync state whenever mounted
  useEffect(() => {
    const total = parseInt(safeStorage.getItem('tasbih_total_all_time') || '0', 10);
    setTotalTasbih(total);
  }, []);

  const khatmaPercent = Math.min(100, Math.round((khatmaPagesRead / 604) * 100));

  const handleResetStats = () => {
    safeStorage.setItem('tasbih_total_all_time', '0');
    safeStorage.setItem('tasbih_daily_logs', JSON.stringify({}));
    setTotalTasbih(0);
    setWeeklyActivity([0, 0, 0, 0, 0, 0, 0]);
    setShowResetConfirm(false);
  };

  const toggleFastingToday = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    let updated = [...fastingDays];
    if (updated.includes(todayStr)) {
      updated = updated.filter(d => d !== todayStr);
    } else {
      updated.push(todayStr);
    }
    setFastingDays(updated);
    safeStorage.setItem('noor_fasting_days', JSON.stringify(updated));
  };

  const isFastingToday = fastingDays.includes(new Date().toISOString().split('T')[0]);

  // Day names for 7-day chart
  const getDayNames = () => {
    const days = [];
    const locale = isEn ? 'en-US' : 'ar-EG';
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString(locale, { weekday: 'narrow' }));
    }
    return days;
  };

  const maxActivity = Math.max(...weeklyActivity, 20);

  const badges = [
    {
      id: 'tasbih_starter',
      title: isEn ? 'Dhikr Devotee' : 'مسبّح مداوم',
      desc: isEn ? 'Completed over 100 Tasbihs' : 'أنجز أكثر من 100 تسبيحة',
      unlocked: totalTasbih >= 100,
      icon: '📿'
    },
    {
      id: 'azkar_keeper',
      title: isEn ? 'Adhkar Guardian' : 'حافظ الأذكار',
      desc: isEn ? 'Saved favorite protective Adhkar' : 'حفظ أذكار الحصن والمفضلة',
      unlocked: favoriteAzkarCount >= 1,
      icon: '🛡️'
    },
    {
      id: 'quran_reader',
      title: isEn ? 'Quran Reciter' : 'قارئ الورد',
      desc: isEn ? 'Active Quran Khatma progress' : 'مستمر في تلاوة الختمة القرآنية',
      unlocked: khatmaPagesRead > 0,
      icon: '📖'
    },
    {
      id: 'fasting_seeker',
      title: isEn ? 'Fasting Devotee' : 'صائم النوافل',
      desc: isEn ? 'Tracked voluntary fasting days' : 'سجل صيام النوافل (الاثنين والخميس)',
      unlocked: fastingDays.length > 0,
      icon: '🌙'
    }
  ];

  return (
    <div id="profile-section-container" className="space-y-6 max-w-5xl mx-auto font-sans" dir={isEn ? "ltr" : "rtl"}>
      
      {/* 1. Profile User Card */}
      <div className="bg-gradient-to-br from-[#0B2520] via-[#0A1A18] to-[#061210] border-2 border-emerald-500/20 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          
          {/* Avatar and User Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-right">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-emerald-400 to-teal-500 shadow-xl overflow-hidden">
                <img 
                  src={ISLAMIC_AVATARS.profile} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-full bg-emerald-950"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <h3 className="text-xl sm:text-2xl font-black font-kufi text-white">
                  {isEn ? "Honored User" : "المستخدم الكريم"}
                </h3>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  {isEn ? "Active Account" : "حساب نشط"}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-md font-medium leading-relaxed">
                {isEn 
                  ? "All your stats, Dhikr logs, and Khatma records are automatically preserved on your device." 
                  : "جميع إحصائياتك وأذكارك ومحفوظاتك مسجلة تلقائياً على جهازك ✨ متابعة الطاعات والختمة والأذكار اليومية مفعلة."}
              </p>
            </div>
          </div>

          {/* Reset Stats Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="reset-stats-btn"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 rounded-2xl text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEn ? "Reset Stats" : "إعادة ضبط الإحصائيات"}</span>
            </button>
          </div>

        </div>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="mt-4 p-4 bg-red-950/80 border border-red-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-red-200">
              {isEn ? "Are you sure you want to reset all your Tasbih logs and statistics?" : "هل أنت متأكد من تصفير سجلات التسبيح والإحصائيات الكلية؟"}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleResetStats}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
              >
                {isEn ? "Yes, Reset" : "نعم، تصفير"}
              </button>
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl"
              >
                {isEn ? "Cancel" : "إلغاء"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Primary 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Tasbihs */}
        <div className="bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isEn ? "Total Tasbihs" : "إجمالي التسبيحات"}
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-950 dark:text-emerald-300">
            {totalTasbih.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {isEn ? "Dhikr & Istighfar logged" : "تسبيحة واستغفار مسجلة"}
          </span>
        </div>

        {/* Favorite Adhkar */}
        <div className="bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isEn ? "Favorite Adhkar" : "الأذكار المفضلة"}
            </span>
            <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-950 dark:text-emerald-300">
            {favoriteAzkarCount}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {isEn ? "Saved in Hisn al-Muslim" : "ذكر محفوظ في المفضلة"}
          </span>
        </div>

        {/* Khatma Progress */}
        <div className="bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isEn ? "Quran Khatma" : "نسبة إنجاز الختمة"}
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-950 dark:text-emerald-300">
            {khatmaPagesRead} <span className="text-xs text-slate-400 font-sans">/ 604</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${khatmaPercent}%` }}
            />
          </div>
        </div>

        {/* Voluntary Fasting */}
        <div className="bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] p-4 sm:p-5 rounded-3xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isEn ? "Voluntary Fasting" : "صيام النوافل"}
            </span>
            <div className="p-2 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-950 dark:text-emerald-300">
            {fastingDays.length} <span className="text-xs text-slate-400 font-sans">{isEn ? "days" : "يوم"}</span>
          </div>
          <button
            onClick={toggleFastingToday}
            className={`w-full py-1 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
              isFastingToday 
                ? 'bg-emerald-600 text-white border-emerald-600' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
            }`}
          >
            {isFastingToday ? (isEn ? "✓ Fasting Today" : "✓ صائم اليوم") : (isEn ? "+ Log Today's Fast" : "+ تسجيل صيام اليوم")}
          </button>
        </div>

      </div>

      {/* 3. 7-Day Dhikr Activity Chart */}
      <div className="bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#EBE7DF] dark:border-[#132326] pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-300 font-kufi">
              {isEn ? "7-Day Dhikr & Worship Activity" : "سجل الأيام السبعة الماضية (التسبيح والذكر)"}
            </h4>
          </div>
          <span className="text-[11px] bg-slate-100 dark:bg-slate-900 text-slate-500 px-2.5 py-0.5 rounded-lg font-bold">
            {isEn ? "Last 7 Days" : "آخر 7 أيام"}
          </span>
        </div>

        {/* Bar Chart Representation */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-36 pt-6 pb-2">
          {weeklyActivity.map((val, idx) => {
            const heightPercent = Math.min(100, Math.max(12, Math.round((val / maxActivity) * 100)));
            const isToday = idx === 6;
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-emerald-600 transition-colors">
                  {val}
                </span>
                <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800/80 rounded-t-xl overflow-hidden flex items-end h-24">
                  <div 
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      isToday 
                        ? 'bg-gradient-to-t from-emerald-700 to-amber-400' 
                        : 'bg-emerald-600/70 group-hover:bg-emerald-600'
                    }`} 
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className={`text-[11px] font-bold ${isToday ? 'text-emerald-700 dark:text-amber-400' : 'text-slate-500'}`}>
                  {isToday ? (isEn ? 'Today' : 'اليوم') : getDayNames()[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Badges of Honor (أوسمة الطاعات) */}
      <div className="bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#EBE7DF] dark:border-[#132326] pb-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-300 font-kufi">
              {isEn ? "Worship Achievement Badges" : "أوسمة الطاعات والإنجاز"}
            </h4>
          </div>
          <span className="text-[11px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-lg">
            {badges.filter(b => b.unlocked).length} / {badges.length} {isEn ? "Unlocked" : "مفتوح"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {badges.map((b) => (
            <div 
              key={b.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                b.unlocked 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200' 
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
              }`}
            >
              <div className="text-2xl p-2 bg-white dark:bg-slate-800 rounded-xl shadow-xs shrink-0">
                {b.icon}
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h5 className="text-xs font-black truncate">{b.title}</h5>
                  {b.unlocked && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                </div>
                <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
