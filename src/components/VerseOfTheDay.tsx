import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, Share2, Copy, Download, X, Check, Heart, Shield } from 'lucide-react';
import { AppSettings } from '../types';

// Curated beautiful, comforting Quranic verses
export interface QuranVerse {
  text: string;
  ref: string;
  surah: string;
}

const QURAN_VERSES: QuranVerse[] = [
  { text: "لَا تَدْرِي لَعَلَّ اللَّهَ يُحْدِثُ بَعْدَ ذَلِكَ أَمْرًا", ref: "الآية ١", surah: "سورة الطلاق" },
  { text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", ref: "الآية ٦", surah: "سورة الشرح" },
  { text: "وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ", ref: "الآية ٥", surah: "سورة الضحى" },
  { text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", ref: "الآية ٢٨", surah: "سورة الرعد" },
  { text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا * وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ", ref: "الآيات ٢-٣", surah: "سورة الطلاق" },
  { text: "فَإِنِّي قَرِيبٌ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ", ref: "الآية ١٨٦", surah: "سورة البقرة" },
  { text: "وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا", ref: "الآية ٤٨", surah: "سورة الطور" },
  { text: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", ref: "الآية ١٥٣", surah: "سورة البقرة" },
  { text: "ادْعُونِي أَسْتَجِبْ لَكُمْ", ref: "الآية ٦٠", surah: "سورة غافر" },
  { text: "مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ", ref: "الآية ٣", surah: "سورة الضحى" },
  { text: "إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ", ref: "الآية ٥٦", surah: "سورة الأعراف" },
  { text: "وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ", ref: "الآية ٥٨", surah: "سورة الفرقان" },
  { text: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", ref: "الآية ٤", surah: "سورة الحديد" },
  { text: "إِنَّ رَبِّى قَرِيبٌ مُّجِيبٌ", ref: "الآية ٦١", surah: "سورة هود" },
  { text: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ", ref: "الآية ٤٥", surah: "سورة البقرة" },
  { text: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", ref: "الآية ٥٣", surah: "سورة الزمر" },
  { text: "إِنَّ رَبِّي لَطِيفٌ لِّمَا يَشَاءُ ۚ إِنَّهُ هُوَ الْعَلِيمُ الْحَكِيمُ", ref: "الآية ١٠٠", surah: "سورة يوسف" },
  { text: "فَسَيَكْفِيكَهُمُ اللَّهُ ۚ وَهُوَ السَّمِيعُ الْعَلِيمُ", ref: "الآية ١٣٧", surah: "سورة البقرة" }
];

interface VerseOfTheDayProps {
  settings: AppSettings;
}

export default function VerseOfTheDay({ settings }: VerseOfTheDayProps) {
  const isEn = settings.language === 'en';

  // Select daily verse deterministically by day of the month
  const getDailyIndex = () => {
    const today = new Date();
    // Deterministic key based on year, month, and day
    const dayKey = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate();
    return dayKey % QURAN_VERSES.length;
  };

  const [currentIndex, setCurrentIndex] = useState<number>(getDailyIndex());
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Share Card themes
  const cardThemes = [
    {
      id: 'emerald',
      name: 'الزمرد الملكي',
      gradient: 'from-[#0D2E27] to-[#051411]',
      textClass: 'text-emerald-100',
      accentText: 'text-amber-400',
      canvasBg: ['#0D2E27', '#051411'],
      textColor: '#E6F4F0',
      accentColor: '#FBBF24',
      borderColor: 'rgba(251, 191, 36, 0.45)'
    },
    {
      id: 'navy',
      name: 'الكحلي الكوني',
      gradient: 'from-[#0F1E36] to-[#070F1C]',
      textClass: 'text-slate-100',
      accentText: 'text-amber-400',
      canvasBg: ['#0F1E36', '#070F1C'],
      textColor: '#F1F5F9',
      accentColor: '#FBBF24',
      borderColor: 'rgba(251, 191, 36, 0.45)'
    },
    {
      id: 'andalusian',
      name: 'الأندلسي الدافئ',
      gradient: 'from-[#3F2B1D] to-[#1D140E]',
      textClass: 'text-amber-50',
      accentText: 'text-amber-400',
      canvasBg: ['#3F2B1D', '#1D140E'],
      textColor: '#FEF3C7',
      accentColor: '#FBBF24',
      borderColor: 'rgba(251, 191, 36, 0.45)'
    },
    {
      id: 'slate-rose',
      name: 'الحجر الأرجواني',
      gradient: 'from-[#2B1D1D] to-[#140D0D]',
      textClass: 'text-rose-50',
      accentText: 'text-amber-400',
      canvasBg: ['#2B1D1D', '#140D0D'],
      textColor: '#FFF1F2',
      accentColor: '#FBBF24',
      borderColor: 'rgba(251, 191, 36, 0.45)'
    }
  ];

  const [activeTheme, setActiveTheme] = useState(cardThemes[0]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeVerse = QURAN_VERSES[currentIndex];

  const randomizeVerse = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * QURAN_VERSES.length);
    } while (nextIndex === currentIndex && QURAN_VERSES.length > 1);
    setCurrentIndex(nextIndex);
  };

  const handleCopyText = () => {
    const shareText = `« ${activeVerse.text} »\n${activeVerse.surah} • ${activeVerse.ref}\n\nتمت المشاركة من تطبيق: ${settings.appName || 'نور الإسلام'}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate and download image via canvas
  const downloadCardImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution card size (1200 x 750)
    const w = 1200;
    const h = 750;
    canvas.width = w;
    canvas.height = h;

    // 1. Draw elegant gradient background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, activeTheme.canvasBg[0]);
    grad.addColorStop(1, activeTheme.canvasBg[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 2. Draw luxury geometric background grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // 3. Draw dual golden ornamental border lines
    const paddingOuter = 40;
    const paddingInner = 50;
    
    ctx.strokeStyle = activeTheme.borderColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(paddingOuter, paddingOuter, w - paddingOuter * 2, h - paddingOuter * 2);
    
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)';
    ctx.lineWidth = 3;
    ctx.strokeRect(paddingInner, paddingInner, w - paddingInner * 2, h - paddingInner * 2);

    // Draw little golden ornamental star/diamonds at the four inner corners
    const corners = [
      { x: paddingInner, y: paddingInner },
      { x: w - paddingInner, y: paddingInner },
      { x: paddingInner, y: h - paddingInner },
      { x: w - paddingInner, y: h - paddingInner }
    ];
    ctx.fillStyle = activeTheme.accentColor;
    corners.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Mini diamond outline
      ctx.strokeStyle = activeTheme.accentColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y - 10);
      ctx.lineTo(c.x + 10, c.y);
      ctx.lineTo(c.x, c.y + 10);
      ctx.lineTo(c.x - 10, c.y);
      ctx.closePath();
      ctx.stroke();
    });

    // 4. Draw Header Title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.font = 'bold 22px "Inter", sans-serif';
    ctx.fillStyle = activeTheme.accentColor;
    ctx.fillText('آيَــةُ الـيَــوْم', w / 2, paddingInner + 45);

    // Ornament below header title
    ctx.font = '24px "Amiri", serif';
    ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.fillText('✦ ✦ ✦', w / 2, paddingInner + 85);

    // 5. Wrap and draw Quranic Verse Text (Centered vertically and horizontally)
    const verseText = `« ${activeVerse.text} »`;
    ctx.fillStyle = activeTheme.textColor;
    ctx.font = 'bold 36px "Amiri", "Georgia", serif';
    
    const maxTextWidth = 900;
    const words = verseText.split(' ');
    const lines = [];
    let currentLine = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = currentLine + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxTextWidth && n > 0) {
        lines.push(currentLine);
        currentLine = words[n] + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Draw the multi-line verse text centered vertically
    const lineHeight = 65;
    const totalLinesHeight = lines.length * lineHeight;
    let startY = (h / 2) - (totalLinesHeight / 2) + 15;

    lines.forEach((lineText) => {
      // Draw subtle elegant text shadow for high luxury feeling
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillText(lineText.trim(), w / 2, startY);
      
      // Reset shadows
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      startY += lineHeight;
    });

    // 6. Draw Surah and verse reference below text
    ctx.font = 'bold 20px "Amiri", serif';
    ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
    ctx.fillText(`${activeVerse.surah} • ${activeVerse.ref}`, w / 2, startY + 25);

    // 7. Draw brand signatures & dedication at bottom
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.1)';
    ctx.beginPath();
    ctx.moveTo(paddingInner + 40, h - paddingInner - 55);
    ctx.lineTo(w - paddingInner - 40, h - paddingInner - 55);
    ctx.stroke();

    // Brand Name (Right side)
    ctx.textAlign = 'right';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillStyle = activeTheme.textColor;
    ctx.fillText(`${settings.appName || 'نور الإسلام'} 🕌`, w - paddingInner - 40, h - paddingInner - 30);

    // Dedication (Left side)
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px "Amiri", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    const dedication = settings.dedicationText 
      ? settings.dedicationText.replace(/<[^>]*>/g, '') // remove HTML tags
      : "صدقة جارية بإذن الله عن لؤي بن حسين ووالده رحمه الله وغفر له";
    // Truncate dedication text if too long
    const displayDedication = dedication.length > 80 ? dedication.substring(0, 77) + '...' : dedication;
    ctx.fillText(displayDedication, paddingInner + 40, h - paddingInner - 30);

    // Trigger browser download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `noor_al_islam_verse_${activeVerse.surah.replace(/\s+/g, '_')}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <>
      {/* 1. Luxurious Dashboard Widget */}
      <div className="bg-gradient-to-br from-[#FAF5EC] to-[#F1EAD9] dark:from-[#0B1516] dark:to-[#080E0F] border-2 border-amber-500/10 dark:border-amber-500/15 rounded-[2rem] p-6 relative overflow-hidden shadow-xs hover:shadow-sm transition-all group border-b-4 border-b-amber-500/30">
        
        {/* Intricate golden Islamic arch background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/5 to-transparent rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)] pointer-events-none rounded-full"></div>
        
        {/* Card Header row */}
        <div className="flex items-center justify-between pb-3.5 border-b border-amber-500/10 mb-4.5">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-800 dark:text-amber-400 text-xs font-black rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="font-kufi">{isEn ? 'VERSE OF THE DAY • SPIRITUAL BLESSINGS' : 'آيَــةُ الـيَــوْم • نَفَحَاتٌ رُوحَانِيَّة'}</span>
          </span>
          
          <div className="flex items-center gap-1.5">
            {/* Randomize button */}
            <button
              id="refresh-daily-verse-btn"
              onClick={randomizeVerse}
              className="p-1.5 rounded-xl hover:bg-amber-500/10 text-amber-800 dark:text-amber-400 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold active:scale-95"
              title={isEn ? "Show another random verse" : "عرض آية عشوائية أخرى"}
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow text-amber-600 dark:text-amber-400" />
              <span>{isEn ? "Another Verse" : "آية أخرى"}</span>
            </button>
          </div>
        </div>

        {/* Verse display content */}
        <div className="space-y-4 py-1 text-center relative z-10">
          
          {/* Main Quranic Text with elegant font family */}
          <p className="text-xl md:text-2xl font-extrabold text-[#1C2D2F] dark:text-[#E6EFF0] font-amiri leading-loose max-w-4xl mx-auto drop-shadow-xs selection:bg-amber-100 dark:selection:bg-amber-950/40 px-2 py-1">
            " {activeVerse.text} "
          </p>

          {/* Reference row & Quick actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-amber-500/5 mt-2">
            <p className="text-xs text-[#C5A059] dark:text-amber-400/80 font-black flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {activeVerse.surah} • {activeVerse.ref}
            </p>

            {/* Quick Share buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
              
              {/* Copy text button */}
              <button
                id="copy-verse-text-btn"
                onClick={handleCopyText}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  copied 
                    ? 'bg-emerald-600 border-transparent text-white' 
                    : 'bg-[#FAF8F5] dark:bg-[#060B0C] text-slate-600 dark:text-slate-300 border-[#E9E1D2]/60 dark:border-slate-800 hover:border-amber-500/30 dark:hover:border-amber-400/30 hover:bg-amber-500/5'
                }`}
                title={isEn ? "Copy verse text" : "نسخ الآية الكريمة بنصها"}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white animate-scale" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isEn ? 'Copied!' : 'تم النسخ!') : (isEn ? 'Copy Verse' : 'نسخ الآية')}</span>
              </button>

              {/* Share as custom image card button */}
              <button
                id="open-share-verse-modal-btn"
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-xs rounded-xl transition-all shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
                title={isEn ? "Share as designed image card" : "مشاركة الآية كبطاقة مصممة"}
              >
                <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isEn ? "Share Card Image" : "مشاركة كصورة بطاقة"}</span>
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* 2. Premium Image Share Customizer Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            
            {/* Dark backing overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            {/* Modal Body container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh] text-right"
              dir="rtl"
            >
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-[#FAF8F5] dark:bg-[#060B0C]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-300 font-kufi leading-none">مشاركة الآية كبطاقة مصممة</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">صمم بطاقة ذِكر مخصصة وحملها مباشرة على جهازك</p>
                  </div>
                </div>
                
                <button
                  id="close-share-modal-btn"
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* A. Dynamic Styled Live Card Preview */}
                <div className="space-y-2">
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 font-kufi block">معاينة تصميم البطاقة:</span>
                  
                  <div 
                    id="share-card-live-preview"
                    className={`w-full aspect-[16/10] bg-gradient-to-br ${activeTheme.gradient} rounded-2xl p-5 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-md border border-white/5`}
                  >
                    {/* Tiny decorative star on card preview */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

                    {/* Outer dual lines border */}
                    <div className="absolute inset-3 border border-amber-400/15 rounded-xl pointer-events-none"></div>
                    <div className="absolute inset-4 border border-amber-400/30 rounded-xl pointer-events-none"></div>

                    {/* Card Preview Header */}
                    <div className="text-center relative z-10">
                      <span className="text-[10px] font-extrabold tracking-widest text-amber-400/90 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-md">
                        آيَــةُ الـيَــوْم
                      </span>
                      <span className="text-[12px] block text-amber-400/40 mt-1">✦ ✦ ✦</span>
                    </div>

                    {/* Card Verse text */}
                    <div className="text-center py-2 px-1 relative z-10 max-h-[50%] overflow-y-auto">
                      <p className={`text-md md:text-xl font-bold ${activeTheme.textClass} font-amiri leading-loose line-clamp-4 text-center glow-gold`}>
                        " {activeVerse.text} "
                      </p>
                    </div>

                    {/* Card Footer row */}
                    <div className="relative z-10">
                      
                      {/* Surah ref */}
                      <p className="text-center text-[11px] md:text-xs text-amber-400 font-black mb-3">
                        {activeVerse.surah} • {activeVerse.ref}
                      </p>
                      
                      <div className="border-t border-white/10 pt-2.5 flex items-center justify-between text-[8px] md:text-[10px] text-white/50 font-sans">
                        <span>صدقة جارية عن لؤي بن حسين ووالده رحمه الله</span>
                        <span className="font-extrabold text-white/70">{settings.appName || 'نور الإسلام'} 🕌</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* B. Customizer Theme Selector */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 font-kufi block">اختر مظهر ولون الخلفية:</span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {cardThemes.map((theme) => {
                      const isActive = theme.id === activeTheme.id;
                      return (
                        <button
                          key={theme.id}
                          id={`theme-select-btn-${theme.id}`}
                          onClick={() => setActiveTheme(theme)}
                          className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between h-16 relative overflow-hidden active:scale-95 ${
                            isActive 
                              ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/30 hover:bg-slate-50 dark:hover:bg-slate-900 bg-white dark:bg-[#060B0C]'
                          }`}
                        >
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 relative z-10">{theme.name}</span>
                          <div className={`w-8 h-3.5 rounded-md bg-gradient-to-r ${theme.gradient} border border-white/10`} />
                          {isActive && (
                            <div className="absolute top-1 left-1.5 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-[8px]">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direct hidden Canvas to draw on-demand card */}
                <canvas ref={canvasRef} className="hidden" />

              </div>

              {/* Modal Footer (Action row) */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-[#FAF8F5] dark:bg-[#060B0C] flex flex-col sm:flex-row items-center gap-3">
                <button
                  id="download-verse-card-final-btn"
                  onClick={downloadCardImage}
                  className="w-full sm:flex-1 py-3 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-600 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل الصورة وحفظها على الجهاز</span>
                </button>
                
                <button
                  id="copy-text-from-modal-btn"
                  onClick={handleCopyText}
                  className="w-full sm:w-auto px-5 py-3 bg-white dark:bg-[#060B0C] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 font-extrabold text-xs rounded-xl transition-all cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'تم نسخ النص!' : 'نسخ النص فقط'}</span>
                </button>
              </div>

            </motion.div>

          </div>
        )}
      </AnimatePresence>
    </>
  );
}
