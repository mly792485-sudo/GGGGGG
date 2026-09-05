/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Bot
} from 'lucide-react';
import { AppSettings } from '../types';
import { ISLAMIC_AVATARS } from '../assets/avatars';
import { safeStorage } from '../utils/safeStorage';

interface WelcomeSplashScreenProps {
  settings: AppSettings;
  isEn?: boolean;
  onEnter: (sectionId?: string) => void;
}

export default function WelcomeSplashScreen({ settings, isEn = false, onEnter }: WelcomeSplashScreenProps) {
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(false);

  const handleEnterClick = (sectionId?: string) => {
    if (dontShowAgain) {
      safeStorage.setItem('noor_hide_welcome_splash', 'true');
    }
    onEnter(sectionId);
  };

  return (
    <motion.div
      id="welcome-splash-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35 }}
      className="welcome-splash-overlay fixed inset-0 z-[99999] flex items-center justify-center bg-[#04090A] text-white p-3 sm:p-6 overflow-x-hidden overflow-y-auto overscroll-contain"
      dir={isEn ? "ltr" : "rtl"}
    >
      {/* Background Ambient Glows & Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0C292B_0%,#04090A_75%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card Shell */}
      <motion.div 
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="welcome-splash-card relative z-10 w-full max-w-lg min-w-0 max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)] bg-gradient-to-b from-[#0B1E21]/95 to-[#061214]/95 border-2 border-emerald-500/30 rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-4 sm:space-y-5 overflow-y-auto overflow-x-hidden my-auto"
      >
        {/* Top: Bismillah in Elegant Golden Line Frame */}
        <div className="w-full py-2 px-4 rounded-2xl border border-amber-400/40 bg-amber-400/5 backdrop-blur-sm">
          <p className="text-sm sm:text-base font-amiri text-amber-300 font-black tracking-widest leading-relaxed">
            « بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ »
          </p>
        </div>

        {/* Center: Circular App Logo with Soft Glow */}
        <div className="relative my-1">
          <div className="welcome-splash-logo w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-amber-400/70 shadow-2xl shadow-amber-500/25 p-1 bg-gradient-to-br from-emerald-700 via-teal-900 to-slate-950 ring-4 ring-emerald-500/20 group shrink-0">
            <img 
              src={settings.appLogoUrl || ISLAMIC_AVATARS.appLogo} 
              alt="Logo" 
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Below Logo: Main Greeting & Description */}
        <div className="space-y-2">
          <h1 className="text-xl sm:text-3xl font-black font-kufi text-white tracking-tight leading-tight">
            {isEn ? "Welcome to Noor Al-Islam" : "أهلاً بك في تطبيق نور الإسلام"}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-sm mx-auto leading-relaxed font-sans">
            {isEn 
              ? "Your comprehensive daily companion for worship, prayer times & adhan, adhkar, Holy Quran, and smart Islamic assistant." 
              : "رفيقك اليومي الشامل للعبادة، مواقيت الصلاة والأذان، الأذكار والقرآن الكريم، والمستشار الإسلامي الذكي."}
          </p>
        </div>

        {/* 3 Prominent Feature Shortcut Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 w-full pt-1">
          <button 
            onClick={() => handleEnterClick('quran')}
            className="w-full sm:w-1/3 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/30 hover:border-amber-400/50 text-emerald-200 hover:text-amber-300 shadow-xs transition-all active:scale-95 cursor-pointer group"
          >
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold font-kufi whitespace-nowrap">{isEn ? "Holy Quran 📖" : "القرآن والتفسير 📖"}</span>
          </button>
          <button 
            onClick={() => handleEnterClick('prayer-times')}
            className="w-full sm:w-1/3 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/30 hover:border-amber-400/50 text-emerald-200 hover:text-amber-300 shadow-xs transition-all active:scale-95 cursor-pointer group"
          >
            <Clock className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold font-kufi whitespace-nowrap">{isEn ? "Prayer Times 🌿" : "مواقيت الصلاة 🌿"}</span>
          </button>
          <button 
            onClick={() => handleEnterClick('ai-assistant')}
            className="w-full sm:w-1/3 flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/30 hover:border-amber-400/50 text-emerald-200 hover:text-amber-300 shadow-xs transition-all active:scale-95 cursor-pointer group"
          >
            <Bot className="w-4 h-4 text-teal-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold font-kufi whitespace-nowrap">{isEn ? "AI Assistant ✨" : "الذكاء الإسلامي ✨"}</span>
          </button>
        </div>

        {/* Bottom: Big Gradient Entrance Button */}
        <div className="w-full space-y-2.5 pt-2">
          <button
            id="splash-enter-app-btn"
            onClick={() => handleEnterClick()}
            className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-emerald-600 via-amber-500 to-orange-500 hover:from-emerald-500 hover:via-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 group font-kufi"
          >
            <span>{isEn ? "Enter Application 🕌 →" : "الدخول إلى التطبيق 🕌 ←"}</span>
            <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isEn ? '' : 'rotate-180 group-hover:-translate-x-1'}`} />
          </button>

          <p className="text-[11px] text-slate-400 font-medium">
            {isEn ? "Tap above to start and enjoy all spiritual services" : "اضغط أعلاه للبدء والاستفادة من كافة الخدمات"}
          </p>

          <label className="flex items-center justify-center gap-2 text-xs text-slate-400 cursor-pointer select-none pt-1">
            <input 
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-black/40 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span>{isEn ? "Don't show this screen automatically next time" : "عدم إظهار هذه الشاشة مرة أخرى تلقائياً"}</span>
          </label>
        </div>

      </motion.div>
    </motion.div>
  );
}
