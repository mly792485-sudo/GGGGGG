/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  ChevronLeft, 
  Plus, 
  RefreshCw, 
  Trophy, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Award, 
  Trash2, 
  Target 
} from 'lucide-react';
import { safeStorage } from '../utils/safeStorage';

interface HistoryLog {
  date: string;
  page: number;
  timestamp: number;
}

interface KhatmaSectionProps {
  isEn?: boolean;
}

export default function KhatmaSection({ isEn = false }: KhatmaSectionProps) {
  const totalPages = 604; // Standard Quran mushaf page count

  // 1. Core States
  const [currentPage, setCurrentPage] = useState<number>(() => {
    return Number(safeStorage.getItem('khatma_current_page') || '0');
  });

  const [inputPage, setInputPage] = useState<string>('');

  const [targetPagesPerDay, setTargetPagesPerDay] = useState<number>(() => {
    return Number(safeStorage.getItem('khatma_target_pages_per_day') || '20');
  });

  const [targetDays, setTargetDays] = useState<number>(() => {
    return Number(safeStorage.getItem('khatma_target_days') || '30');
  });

  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>(() => {
    const stored = safeStorage.getItem('khatma_history');
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      // Ensure all logs have timestamps for projection math
      return parsed.map((log: any, index: number) => {
        if (!log.timestamp) {
          return {
            ...log,
            timestamp: Date.now() - index * 24 * 60 * 60 * 1000 // estimate chronological spacing
          };
        }
        return log;
      });
    } catch (e) {
      return [];
    }
  });

  // UI States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmBack, setShowConfirmBack] = useState<boolean>(false);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const [pendingPage, setPendingPage] = useState<number | null>(null);
  const [showChartGuide, setShowChartGuide] = useState<boolean>(false);

  // 2. Persistence Syncing
  useEffect(() => {
    safeStorage.setItem('khatma_current_page', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    safeStorage.setItem('khatma_history', JSON.stringify(historyLogs));
  }, [historyLogs]);

  useEffect(() => {
    safeStorage.setItem('khatma_target_pages_per_day', targetPagesPerDay.toString());
  }, [targetPagesPerDay]);

  useEffect(() => {
    safeStorage.setItem('khatma_target_days', targetDays.toString());
  }, [targetDays]);

  // 3. Sync Target Configuration Handlers
  const updateTargetDays = (days: number) => {
    const sanitizedDays = Math.max(1, days);
    setTargetDays(sanitizedDays);
    const pages = Math.ceil(totalPages / sanitizedDays);
    setTargetPagesPerDay(pages);
  };

  const updateTargetPagesPerDay = (pages: number) => {
    const sanitizedPages = Math.max(1, Math.min(totalPages, pages));
    setTargetPagesPerDay(sanitizedPages);
    const days = Math.ceil(totalPages / sanitizedPages);
    setTargetDays(days);
  };

  // 4. Update and Log page updates
  const handleUpdatePage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = Number(inputPage);
    if (isNaN(pageNum) || pageNum < 0 || pageNum > totalPages) {
      setErrorMessage('يرجى إدخال رقم صفحة صحيح بين 1 و 604');
      return;
    }

    setErrorMessage(null);

    if (pageNum < currentPage && pageNum !== 0) {
      setPendingPage(pageNum);
      setShowConfirmBack(true);
      return;
    }

    applyPageUpdate(pageNum);
  };

  const applyPageUpdate = (pageNum: number) => {
    setCurrentPage(pageNum);
    
    const todayStr = new Date().toLocaleDateString('ar-SA', { month: 'long', day: 'numeric', year: 'numeric' });
    
    // Check if we already have an entry for today. Update it or insert a new one.
    const existingIdx = historyLogs.findIndex(log => log.date === todayStr);
    if (existingIdx !== -1) {
      const updated = [...historyLogs];
      updated[existingIdx].page = pageNum;
      updated[existingIdx].timestamp = Date.now();
      setHistoryLogs(updated);
    } else {
      setHistoryLogs(prev => [{ date: todayStr, page: pageNum, timestamp: Date.now() }, ...prev]);
    }

    setInputPage('');
    setShowConfirmBack(false);
    setPendingPage(null);
  };

  // Quick increment reading log handler
  const handleIncrementPage = (amount: number) => {
    const newPage = Math.min(totalPages, currentPage + amount);
    if (newPage === currentPage) return;
    setErrorMessage(null);
    applyPageUpdate(newPage);
  };

  // Delete a history log item
  const handleDeleteLog = (idxToDelete: number) => {
    const updated = historyLogs.filter((_, idx) => idx !== idxToDelete);
    setHistoryLogs(updated);
    
    // Re-adjust current page to the latest remaining log's page value, or 0 if empty
    if (updated.length > 0) {
      setCurrentPage(updated[0].page);
    } else {
      setCurrentPage(0);
    }
  };

  // Reset Khatma
  const applyResetKhatma = () => {
    setCurrentPage(0);
    setHistoryLogs([]);
    setInputPage('');
    setShowConfirmReset(false);
    setErrorMessage(null);
  };

  // 5. Statistics Calculation
  const progressPercent = Math.min(Math.round((currentPage / totalPages) * 100), 100);
  const remainingPages = totalPages - currentPage;
  
  // Quran structural analysis for a spiritual touch
  const completedJuzCount = (currentPage / 20.13).toFixed(1);
  const currentJuzNum = Math.min(30, Math.floor(currentPage / 20.13) + 1);

  // Actual progress analytics & prediction
  const getActualSpeedStats = () => {
    if (historyLogs.length === 0 || currentPage === 0) {
      return {
        actualPagesPerDay: 0,
        estimatedDaysRemaining: null,
        expectedFinishDateStr: null,
        statusMessage: 'ابدأ بتسجيل وردك القرآني اليومي ليقوم المساعد بحساب معدلك الفعلي وتاريخ الختم المتوقع بدقة مباركة.'
      };
    }

    // Get earliest log
    const oldestLog = historyLogs[historyLogs.length - 1];
    const oldestTime = oldestLog.timestamp || Date.now();
    const msDiff = Date.now() - oldestTime;
    
    // Days elapsed, with a 1-day minimum to avoid dividing by 0 on the first day
    const daysElapsed = Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
    const pagesRead = currentPage;
    const actualRate = pagesRead / daysElapsed;
    
    if (actualRate <= 0.1) {
      return {
        actualPagesPerDay: 0.2,
        estimatedDaysRemaining: null,
        expectedFinishDateStr: null,
        statusMessage: 'استمر في تدوين الورد يومياً لتقدير زمن الختم بناءً على قراءتك المتواصلة.'
      };
    }

    const daysRemaining = Math.ceil(remainingPages / actualRate);
    
    // Expected Gregorian finish date
    const finishDate = new Date();
    finishDate.setDate(finishDate.getDate() + daysRemaining);
    
    const formattedFinishDate = finishDate.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      actualPagesPerDay: parseFloat(actualRate.toFixed(1)),
      estimatedDaysRemaining: daysRemaining,
      expectedFinishDateStr: formattedFinishDate,
      statusMessage: `تبارك الله! بمعدلك الفعلي الحالي (${actualRate.toFixed(1)} صفحة/يوم)، يتوقع أن تختم القرآن الكريم كاملاً خلال ${daysRemaining} يوماً، الموافق يوم ${formattedFinishDate} بمشيئة الله.`
    };
  };

  const actualSpeedStats = getActualSpeedStats();

  // 6. SVG Progress Chart Preparation (Last 7 Logs)
  const chartLogs = [...historyLogs].slice(0, 7).reverse();
  const hasChartData = chartLogs.length > 0;
  
  // Custom SVG Size Configuration
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;
  
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;
  
  const actualPoints: Array<{ x: number; y: number; page: number; dateStr: string }> = [];
  const targetPoints: Array<{ x: number; y: number; page: number }> = [];
  
  if (hasChartData) {
    // Determine target projection starting base
    const startingPage = Math.max(0, chartLogs[0].page - targetPagesPerDay);
    
    chartLogs.forEach((log, idx) => {
      // X Mapping
      const x = paddingLeft + (chartLogs.length > 1 ? (idx / (chartLogs.length - 1)) * plotWidth : plotWidth / 2);
      
      // Y Mapping (actual page reached)
      const y = chartHeight - paddingBottom - (log.page / totalPages) * plotHeight;
      const dateParts = log.date.split('،');
      const shortDate = (dateParts[0] || log.date).trim();
      
      actualPoints.push({ x, y, page: log.page, dateStr: shortDate });
      
      // Target trendline point for the same step
      const projectedTargetPage = Math.min(totalPages, startingPage + (idx + 1) * targetPagesPerDay);
      const targetY = chartHeight - paddingBottom - (projectedTargetPage / totalPages) * plotHeight;
      targetPoints.push({ x, y: targetY, page: projectedTargetPage });
    });
  } else {
    // Beautiful demo placeholder points representing a 7-day target guideline
    for (let i = 0; i < 7; i++) {
      const x = paddingLeft + (i / 6) * plotWidth;
      const projectedTargetPage = Math.min(totalPages, i * targetPagesPerDay);
      const targetY = chartHeight - paddingBottom - (projectedTargetPage / totalPages) * plotHeight;
      targetPoints.push({ x, y: targetY, page: projectedTargetPage });
      actualPoints.push({ x, y: chartHeight - paddingBottom, page: 0, dateStr: `اليوم ${i + 1}` });
    }
  }

  // Generate SVG Path expressions
  const actualPathD = actualPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const targetPathD = targetPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  // Filled area under actual line
  const actualAreaD = hasChartData 
    ? `${actualPathD} L ${actualPoints[actualPoints.length - 1].x} ${chartHeight - paddingBottom} L ${actualPoints[0].x} ${chartHeight - paddingBottom} Z` 
    : '';

  // Grid line levels mapping (Page 0, 200, 400, 604)
  const gridLevels = [0, 200, 400, 604];

  return (
    <div className="w-full bg-white dark:bg-[#090F10] border border-emerald-100 dark:border-slate-800/80 rounded-3xl p-5 md:p-6 space-y-6 text-right font-sans shadow-xs">
      
      {/* 1. Header with Spiritual Theme & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/40">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-sm">
            <Trophy className="w-5 h-5" />
          </span>
          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 font-kufi">مُخطط وختم القرآن الكريم</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">نظم قراءتك اليومية، راقب وتوقع ختمتك، وحلل تقدمك الإجمالي</p>
          </div>
        </div>
        <button
          id="reset-khatma-btn"
          onClick={() => setShowConfirmReset(true)}
          className="text-xs text-red-600 hover:text-white flex items-center gap-1.5 font-bold bg-red-50 hover:bg-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/60 px-3.5 py-2 rounded-xl transition-all border border-red-100 dark:border-red-900/30 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>تصفير والبدء من جديد</span>
        </button>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Metric 1: Completion Percentage */}
        <div className="bg-[#FAF9F5] dark:bg-[#0B1415] border border-slate-150 dark:border-slate-800/60 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 font-kufi flex items-center gap-1">
            <Award className="w-4 h-4 text-amber-500" />
            <span>مستوى إنجاز الختمة</span>
          </span>

          {/* SVG Radial Meter */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="54"
                className="stroke-slate-100 dark:stroke-slate-800/40"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="54"
                className="stroke-emerald-600 dark:stroke-emerald-400 transition-all duration-500"
                strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progressPercent / 100)}`}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">
                {progressPercent}%
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                الصفحة {currentPage} / {totalPages}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-slate-200/40 dark:border-slate-800/40 text-center text-xs">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">الأجزاء المقروءة</p>
              <p className="font-extrabold text-slate-800 dark:text-slate-200 font-mono">{completedJuzCount} جزء</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">الجزء الحالي</p>
              <p className="font-extrabold text-slate-800 dark:text-slate-200 font-mono">جزء {currentJuzNum}</p>
            </div>
          </div>
        </div>

        {/* Metric 2: Target Configuration (Specify Daily Pages) */}
        <div className="bg-[#FAF9F5] dark:bg-[#0B1415] border border-slate-150 dark:border-slate-800/60 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 font-kufi flex items-center gap-1">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>تحديد الورد اليومي (صفحات)</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              اختر عدد الصفحات التي تود قراءتها يومياً لتحديد المدة الكلية للختمة، أو أدخل قيمة مخصصة:
            </p>
          </div>

          {/* Quick Config Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            {[5, 10, 20].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => updateTargetPagesPerDay(p)}
                className={`py-1.5 px-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                  targetPagesPerDay === p
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {p} {p === 5 ? 'صفحات' : p === 10 ? 'صفحات' : 'صفحة'} ({p === 20 ? 'جزء' : p === 10 ? '½ جزء' : '¼ جزء'})
              </button>
            ))}
          </div>

          {/* Precise Input Adjuster */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الورد المخصص:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateTargetPagesPerDay(targetPagesPerDay - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 font-bold cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={targetPagesPerDay}
                onChange={(e) => updateTargetPagesPerDay(Number(e.target.value))}
                className="w-12 text-center text-xs font-black font-mono text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => updateTargetPagesPerDay(targetPagesPerDay + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Computed Target Duration */}
          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-2.5 rounded-xl text-center border border-emerald-500/10">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">المدة المتوقعة للختم بالورد الحالي:</p>
            <p className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 font-kufi mt-0.5">
              إتمام الختمة في <span className="font-mono text-sm font-black">{targetDays}</span> يوماً
            </p>
          </div>
        </div>

        {/* Metric 3: Actual Pace & Forecast Projection */}
        <div className="bg-[#FAF9F5] dark:bg-[#0B1415] border border-slate-150 dark:border-slate-800/60 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 font-kufi flex items-center gap-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>التحليل والتنبؤ بالختم</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              يقوم النظام بتحليل سرعتك الفعلية وتوقع موعد إكمال قراءة المصحف الشريف بالكامل:
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200/40 dark:border-slate-800/40">
              <span className="text-slate-400 dark:text-slate-500 font-bold">معدل قراءتك الفعلي:</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                {actualSpeedStats.actualPagesPerDay} صفحة/يوم
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 dark:text-slate-500 font-bold">الأيام المتبقية (فعلي):</span>
              <span className="font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                {actualSpeedStats.estimatedDaysRemaining !== null ? `${actualSpeedStats.estimatedDaysRemaining} يوم` : 'غير محدد'}
              </span>
            </div>
          </div>

          {/* Spiritual message banner */}
          <div className="bg-amber-500/5 dark:bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/10 text-center">
            <p className="text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed font-semibold">
              {actualSpeedStats.statusMessage}
            </p>
          </div>
        </div>

      </div>

      {/* 3. Interactive Progress Graph (SVG) */}
      <div className="bg-[#FAF9F5] dark:bg-[#0B1415] border border-slate-150 dark:border-slate-800/60 p-4 rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 font-kufi">رسم بياني لتطور الختمة (آخر ٧ تسجيلات)</h4>
          </div>
          <button 
            type="button" 
            onClick={() => setShowChartGuide(!showChartGuide)}
            className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            {showChartGuide ? 'إخفاء الدليل' : 'كيف يُقرأ المخطط؟'}
          </button>
        </div>

        {showChartGuide && (
          <div className="p-3 bg-emerald-500/5 dark:bg-[#060D0E] border border-emerald-500/10 rounded-xl space-y-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-0.5 bg-emerald-600 dark:bg-emerald-400 inline-block"></span>
              <p><strong>الخط الأخضر المتصل:</strong> يمثل تقدمك الفعلي الحالي ووصولك لأرقام الصفحات عبر الأيام.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-0.5 border-t border-dashed border-amber-600 inline-block"></span>
              <p><strong>الخط البرتقالي المنقط:</strong> يمثل المسار المستهدف (الخطة) بناءً على وردك المقترح ({targetPagesPerDay} صفحة/يوم).</p>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold pt-1">💡 يهدف المخطط لمساعدتك على إبقاء خط تقدمك الأخضر مساوياً للخط البرتقالي أو أعلى منه لتضمن الختم في الموعد المحدد!</p>
          </div>
        )}

        {/* Responsive Custom SVG Canvas */}
        <div className="w-full relative">
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            className="w-full h-auto overflow-visible select-none"
          >
            {/* Background Gradients definitions */}
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {gridLevels.map((lvl) => {
              const y = chartHeight - paddingBottom - (lvl / totalPages) * plotHeight;
              return (
                <g key={lvl} className="opacity-40 dark:opacity-20">
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={chartWidth - paddingRight} 
                    y2={y} 
                    stroke="currentColor" 
                    strokeWidth="1" 
                    strokeDasharray="3,3"
                    className="text-slate-300 dark:text-slate-700"
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={y + 3} 
                    textAnchor="end" 
                    className="text-[9px] font-mono font-bold fill-slate-400 dark:fill-slate-500"
                  >
                    ص {lvl}
                  </text>
                </g>
              );
            })}

            {/* Target Plan Dotted Guideline */}
            <path 
              d={targetPathD} 
              fill="none" 
              stroke="#D97706" 
              strokeWidth="1.5" 
              strokeDasharray="4,4" 
              className="opacity-75"
            />

            {/* Actual Progress Glowing Filled Area */}
            {hasChartData && (
              <path 
                d={actualAreaD} 
                fill="url(#areaGrad)" 
              />
            )}

            {/* Actual Progress Line */}
            {hasChartData ? (
              <path 
                d={actualPathD} 
                fill="none" 
                stroke="#047857" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            ) : (
              // Empty actual placeholder line flat at page 0
              <line 
                x1={paddingLeft} 
                y1={chartHeight - paddingBottom} 
                x2={chartWidth - paddingRight} 
                y2={chartHeight - paddingBottom} 
                stroke="#94A3B8" 
                strokeWidth="2" 
                strokeDasharray="2,2" 
                className="opacity-45"
              />
            )}

            {/* Interactive/Decorative Points */}
            {actualPoints.map((p, idx) => (
              <g key={idx} className="group/point cursor-pointer">
                {/* Visual Glow */}
                <circle cx={p.x} cy={p.y} r="7" className="fill-emerald-500/0 group-hover/point:fill-emerald-500/20 transition-all duration-200" />
                {/* Point Center */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="3.5" 
                  className={`stroke-emerald-600 dark:stroke-emerald-400 stroke-[2] ${
                    hasChartData ? 'fill-white dark:fill-[#0B1415]' : 'fill-slate-300 dark:fill-slate-800'
                  }`} 
                />
                
                {/* Page label atop point */}
                {hasChartData && (
                  <g className="opacity-90 group-hover/point:opacity-100 transition-opacity">
                    <rect 
                      x={p.x - 14} 
                      y={p.y - 18} 
                      width="28" 
                      height="12" 
                      rx="4" 
                      className="fill-slate-850 dark:fill-slate-800 text-white shadow-xs" 
                    />
                    <text 
                      x={p.x} 
                      y={p.y - 10} 
                      textAnchor="middle" 
                      className="text-[8px] font-mono font-black fill-white"
                    >
                      {p.page}
                    </text>
                  </g>
                )}
                
                {/* X-Axis Date text labels */}
                <text 
                  x={p.x} 
                  y={chartHeight - 8} 
                  textAnchor="middle" 
                  className="text-[8px] font-bold fill-slate-400 dark:fill-slate-500"
                >
                  {p.dateStr}
                </text>
              </g>
            ))}
          </svg>

          {!hasChartData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-[1px] p-4 rounded-xl">
              <BookOpen className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-1" />
              <p className="text-xs font-black text-slate-700 dark:text-slate-300">لا يوجد سجل قراءة بعد</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">ابدأ بتدوين الورد الأول اليوم لتفعيل المخطط البياني والمسار الفعلي لختمتك!</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Logger Form & Daily Increment Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Logger input (Col span 5) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Error and confirmation dialogs */}
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 rounded-xl text-xs font-bold">
              ⚠️ {errorMessage}
            </div>
          )}

          {showConfirmBack && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 rounded-2xl space-y-3 text-xs">
              <p className="font-bold">⚠️ رقم الصفحة المدخل ({pendingPage}) أقل من صفحتك الحالية ({currentPage}). هل تود التراجع بالفعل؟</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => pendingPage !== null && applyPageUpdate(pendingPage)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  نعم، تراجع
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmBack(false);
                    setPendingPage(null);
                  }}
                  className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {showConfirmReset && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-2xl space-y-3 text-xs">
              <p className="font-bold">⚠️ هل أنت متأكد من تصفير خطة الختمة والبدء من جديد بالكامل؟ (سيتم مسح كافة سجلات قراءتك الفصيلية)</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={applyResetKhatma}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  نعم، تصفير والبدء من جديد
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {!showConfirmBack && !showConfirmReset && (
            <div className="p-4.5 bg-[#FAF9F5] dark:bg-[#0B1415] border border-slate-150 dark:border-slate-800/60 rounded-2xl space-y-4">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 font-kufi">أضف وردك اليوم لتسجيل التقدم</h4>
              
              {/* Form Input */}
              <form onSubmit={handleUpdatePage} className="space-y-3">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  أدخل رقم آخر صفحة أتممت قراءتها (١ - ٦٠٤):
                </label>
                <div className="flex gap-2">
                  <input
                    id="khatma-page-input"
                    type="number"
                    min="1"
                    max={totalPages}
                    value={inputPage}
                    onChange={(e) => setInputPage(e.target.value)}
                    placeholder="مثال: ٥٠"
                    className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                  />
                  <button
                    id="khatma-update-submit"
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>تحديث التقدم</span>
                  </button>
                </div>
              </form>

              {/* Quick Increment Buttons */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/40 dark:border-slate-800/40">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">تدوين سريع بالصفحات الإضافية:</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[5, 10, 20].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleIncrementPage(val)}
                      className="py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-emerald-500/5 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>+{val} {val === 5 ? 'صفحات' : 'صفحة'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* History timeline logs list (Col span 7) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 font-kufi">سجل الأوراد والخطوات السابقة:</h4>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-850 px-2.5 py-0.5 rounded-md text-slate-500 dark:text-slate-400 font-bold">
              {historyLogs.length} تدوينات
            </span>
          </div>

          <div className="space-y-2 max-h-[225px] overflow-y-auto pr-1">
            {historyLogs.length > 0 ? (
              historyLogs.map((log, index) => (
                <div
                  key={index}
                  className="p-3 bg-[#FAF9F5]/40 dark:bg-[#0B1415]/30 border border-slate-150 dark:border-slate-800/30 rounded-xl flex items-center justify-between text-xs transition-all hover:bg-[#FAF9F5] dark:hover:bg-[#0B1415]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span className="text-slate-500 dark:text-slate-400 font-bold">{log.date}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-emerald-800 dark:text-emerald-300 font-kufi bg-emerald-500/5 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                      وصلت إلى الصفحة {log.page}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteLog(index)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/5 dark:hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                      title="حذف هذا التدوين"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/10 rounded-2xl">
                <Calendar className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                  لا يوجد سجلات قراءة سابقة للختمة الحالية. ابدأ بقراءة وردك اليوم وسجل تقدمك المبارك!
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

