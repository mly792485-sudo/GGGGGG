/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Bell, BellOff, CheckCircle2, Volume2, Eye, EyeOff, Sparkles, RefreshCw } from 'lucide-react';
import { AppSettings, PrayerTime, PrayerStatus } from '../types';
import { PRAYER_COUNTRIES, getAccuratePrayerTimes } from '../data/prayerCities';
import { formatTime12 } from '../utils/formatTime';
import { safeStorage } from '../utils/safeStorage';

interface PrayerTimesSectionProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onTriggerAdhanPreview?: (prayerName?: string) => void;
  isEn?: boolean;
}

export default function PrayerTimesSection({ settings, onUpdateSettings, onTriggerAdhanPreview, isEn: isEnProp }: PrayerTimesSectionProps) {
  const isEn = isEnProp ?? settings.language === 'en';
  const [selectedCountry, setSelectedCountry] = useState<string>(settings.country || 'مملكة البحرين');
  const [selectedCity, setSelectedCity] = useState<string>(settings.city || 'المنامة');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [prayerList, setPrayerList] = useState<PrayerTime[]>([]);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [countdownStr, setCountdownStr] = useState<string>('');
  const [hijriDateStr, setHijriDateStr] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sourceType, setSourceType] = useState<'bahrain-official' | 'api' | 'fallback'>('bahrain-official');

  const getPrayerDisplayName = (pName: string, arName: string) => {
    if (!isEn) return arName;
    const map: { [key: string]: string } = {
      Fajr: 'Fajr',
      Sunrise: 'Sunrise',
      Dhuhr: 'Dhuhr',
      Asr: 'Asr',
      Maghrib: 'Maghrib',
      Isha: 'Isha'
    };
    return map[pName] || pName;
  };
  
  // Todays prayer tracker checklist state
  const [todayChecklist, setTodayChecklist] = useState<PrayerStatus['prayers']>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const stored = safeStorage.getItem(`prayer_checklist_${todayStr}`);
    return stored ? JSON.parse(stored) : { fajr: false, sunrise: false, dhuhr: false, asr: false, maghrib: false, isha: false };
  });

  // Sync state if settings change externally
  useEffect(() => {
    if (settings.country) setSelectedCountry(settings.country);
    if (settings.city) setSelectedCity(settings.city);
  }, [settings.country, settings.city]);

  // Keep current time updated every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch / compute prayer times whenever country, city, calculationMethod, or date changes
  useEffect(() => {
    let isMounted = true;

    const loadTimes = async () => {
      setIsLoading(true);
      const res = await getAccuratePrayerTimes(selectedCountry, selectedCity, settings.calculationMethod);
      if (!isMounted) return;

      if (res.hijriDate) {
        setHijriDateStr(res.hijriDate);
      } else {
        setHijriDateStr('');
      }
      setSourceType(res.source as 'bahrain-official' | 'api' | 'fallback');

      const times = res.times;
      const today = new Date();

      const computedPrayers = [
        { name: 'Fajr', arabicName: 'الفجر', time: times.Fajr },
        { name: 'Sunrise', arabicName: 'الشروق', time: times.Sunrise },
        { name: 'Dhuhr', arabicName: 'الظهر', time: times.Dhuhr },
        { name: 'Asr', arabicName: 'العصر', time: times.Asr },
        { name: 'Maghrib', arabicName: 'المغرب', time: times.Maghrib },
        { name: 'Isha', arabicName: 'العشاء', time: times.Isha },
      ];

      const nowH = today.getHours();
      const nowM = today.getMinutes();
      const nowS = today.getSeconds();
      const nowInSeconds = nowH * 3600 + nowM * 60 + nowS;

      let foundNext = false;
      let nextIdx = -1;

      const itemsWithStatus = computedPrayers.map((p) => {
        const [pHStr, pMStr] = p.time.split(':');
        const pSeconds = parseInt(pHStr) * 3600 + parseInt(pMStr) * 60;
        const isPassed = nowInSeconds > pSeconds;
        
        return {
          ...p,
          isPassed,
          isNext: false
        };
      });

      // Find the next prayer
      for (let i = 0; i < itemsWithStatus.length; i++) {
        const [pHStr, pMStr] = itemsWithStatus[i].time.split(':');
        const pSeconds = parseInt(pHStr) * 3600 + parseInt(pMStr) * 60;
        if (nowInSeconds <= pSeconds) {
          itemsWithStatus[i].isNext = true;
          nextIdx = i;
          foundNext = true;
          break;
        }
      }

      // If all passed, then next is Fajr of tomorrow
      if (!foundNext) {
        itemsWithStatus[0].isNext = true;
        nextIdx = 0;
      }

      setPrayerList(itemsWithStatus);
      const nextP = itemsWithStatus[nextIdx];
      setNextPrayer(nextP);

      // Countdown Calculation
      if (nextP) {
        const [pHStr, pMStr] = nextP.time.split(':');
        let targetHours = parseInt(pHStr);
        const targetMinutes = parseInt(pMStr);
        
        let targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), targetHours, targetMinutes, 0);
        
        // If it's Fajr of tomorrow
        if (!foundNext) {
          targetDate.setDate(targetDate.getDate() + 1);
        }

        const msDiff = targetDate.getTime() - today.getTime();
        if (msDiff > 0) {
          const hours = Math.floor(msDiff / (1000 * 60 * 60));
          const minutes = Math.floor((msDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((msDiff % (1000 * 60)) / 1000);
          setCountdownStr(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          );
        }
      }

      setIsLoading(false);
    };

    loadTimes();

    return () => {
      isMounted = false;
    };
  }, [selectedCountry, selectedCity, settings.calculationMethod, currentTime.getMinutes()]);

  // Handle Country Selection
  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
    const countryObj = PRAYER_COUNTRIES.find(c => c.ar === countryName) || PRAYER_COUNTRIES[0];
    const defaultCity = countryObj.cities[0].ar;
    setSelectedCity(defaultCity);
    onUpdateSettings({ ...settings, country: countryName, city: defaultCity });
  };

  // Handle City Selection
  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    onUpdateSettings({ ...settings, country: selectedCountry, city: cityName });
  };

  // Persist prayer tracker checkoffs
  const handleToggleCheck = (pName: string) => {
    const key = pName.toLowerCase() as keyof typeof todayChecklist;
    const updated = {
      ...todayChecklist,
      [key]: !todayChecklist[key]
    };
    setTodayChecklist(updated);
    
    const todayStr = new Date().toISOString().split('T')[0];
    safeStorage.setItem(`prayer_checklist_${todayStr}`, JSON.stringify(updated));

    if (settings.soundEnabled && updated[key]) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const currentCountryObj = PRAYER_COUNTRIES.find(c => c.ar === selectedCountry) || PRAYER_COUNTRIES[0];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 text-right font-sans shadow-xs">
      
      {/* Header with Country & City Selection */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/40">
        <div className="flex items-center gap-2">
          <span className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-2xl shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
              {isEn ? 'Daily Prayer Times' : 'مواقيت الصلاة اليومية'}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 rounded-xl text-xs font-extrabold">
                <span>🌙 {isEn ? 'Hijri:' : 'الهجري:'}</span>
                <span>{hijriDateStr || (isEn ? 'Loading...' : 'جارِ التحميل...')}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100/70 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60 rounded-xl text-xs font-extrabold">
                <span>📅 {isEn ? 'Gregorian:' : 'الميلادي:'}</span>
                <span>{new Date().toLocaleDateString(isEn ? 'en-US' : 'ar-SA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end lg:justify-center">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[10px] font-extrabold ${
            sourceType === 'bahrain-official'
              ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60'
              : sourceType === 'api'
                ? 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60'
                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800'
          }`}>
            <span>✓</span>
            <span>
              {sourceType === 'bahrain-official'
                ? (isEn ? 'Bahrain Official Calendar' : 'التقويم البحريني الرسمي')
                : sourceType === 'api'
                  ? (isEn ? 'AlAdhan API' : 'مصدر المواقيت API')
                  : (isEn ? 'Offline fallback' : 'الحساب المحلي الاحتياطي')}
            </span>
          </span>
        </div>
        
        {/* Country & City Dropdowns */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 px-2 py-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <select
              id="prayer-country-select"
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-slate-800 dark:text-slate-200 border-none focus:outline-none cursor-pointer"
            >
              {PRAYER_COUNTRIES.map((c) => (
                <option key={c.ar} value={c.ar}>
                  {isEn ? c.en : c.ar}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 flex-1 min-w-0 px-2 py-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
            <select
              id="prayer-city-select"
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full bg-transparent text-xs font-black text-slate-800 dark:text-slate-200 border-none focus:outline-none cursor-pointer"
            >
              {currentCountryObj.cities.map((city) => (
                <option key={city.ar} value={city.ar}>
                  {isEn ? city.en : city.ar}
                </option>
              ))}
            </select>
          </div>

          {isLoading && (
            <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin shrink-0 mx-1" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Remaining Timer Widget (Left / spans 5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-5 flex flex-col justify-between items-center text-center shadow-lg relative overflow-hidden">
          {/* Decorative geometric star */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:12px_12px] opacity-70 pointer-events-none" />

          {nextPrayer && (
            <div className="space-y-4 z-10 w-full">
              <div className="flex items-center justify-center gap-1.5">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold tracking-wider text-emerald-200">
                  {isEn ? `Location: ${currentCountryObj.en} - ${(currentCountryObj.cities.find(c => c.ar === selectedCity)?.en || selectedCity)}` : `الجمهورية والمنطقة: ${selectedCountry} - ${selectedCity}`}
                </span>
              </div>

              <div>
                <h4 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-amber-300 break-words">
                  {isEn ? `${getPrayerDisplayName(nextPrayer.name, nextPrayer.arabicName)} Prayer` : `صلاة ${nextPrayer.arabicName}`}
                </h4>
                <p className="text-sm text-emerald-100/80 mt-1">
                  {isEn ? `Adhan at ${formatTime12(nextPrayer.time, isEn)}` : `أذان صلاة ${nextPrayer.arabicName} عند الساعة ${formatTime12(nextPrayer.time, isEn)}`}
                </p>
              </div>

              {/* Countdown Number */}
              <div className="py-3 sm:py-4 font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-white select-none drop-shadow-md bg-white/5 rounded-2xl border border-white/5">
                {countdownStr}
              </div>
              <p className="text-xs text-emerald-200/90">{isEn ? 'Time remaining for Next Prayer' : 'متبقي لدخول وقت الصلاة والاقامة'}</p>
            </div>
          )}

          {/* Quick Adhan Notification Toggle inside prayer card */}
          <div className="w-full mt-4 pt-4 border-t border-white/10 flex flex-col gap-3 z-10 text-xs text-emerald-200">
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold">{isEn ? 'Adhan Sound Alert' : 'صوت الأذان والتنبيه'}</span>
              <button
                id="prayer-adhan-remind-toggle"
                onClick={() => onUpdateSettings({ ...settings, adhanReminder: !settings.adhanReminder })}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  settings.adhanReminder ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white/10 text-emerald-200'
                }`}
                title={settings.adhanReminder ? "تعطيل تنبيه الأذان" : "تفعيل تنبيه الأذان"}
              >
                {settings.adhanReminder ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between w-full border-t border-white/5 pt-2">
              <span className="font-semibold">{isEn ? 'Visual Adhan & Supplication' : 'تنبيه الأذان المرئي والدعاء'}</span>
              <button
                id="prayer-visual-adhan-toggle"
                onClick={() => onUpdateSettings({ ...settings, visualAdhanAlert: !settings.visualAdhanAlert })}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  settings.visualAdhanAlert ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white/10 text-emerald-200'
                }`}
                title={settings.visualAdhanAlert ? "تعطيل التنبيه المرئي" : "تفعيل التنبيه المرئي"}
              >
                {settings.visualAdhanAlert ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            {/* Live Fullscreen Adhan Screen Preview Button */}
            {onTriggerAdhanPreview && (
              <button
                id="prayer-open-live-adhan-preview-btn"
                type="button"
                onClick={() => onTriggerAdhanPreview(nextPrayer?.name || 'Asr')}
                className="w-full mt-2 py-2.5 px-3 bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 hover:from-cyan-300 hover:to-amber-200 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-white/30"
              >
                <Sparkles className="w-4 h-4 text-cyan-900 animate-bounce shrink-0" />
                <span>{isEn ? "Open Live Adhan Screen (Preview)" : "معاينة شاشة وسماع الأذان (تجربة حية) 🕌"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Timings List & Daily Checklist Tracker (Right / spans 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col gap-2.5">
            {prayerList.map((p) => {
              const checklistKey = p.name.toLowerCase() as keyof typeof todayChecklist;
              const isChecked = todayChecklist[checklistKey];
              const displayName = getPrayerDisplayName(p.name, p.arabicName);

              return (
                <div
                  key={p.name}
                  className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-all duration-300 ${
                    p.isNext
                      ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/20'
                      : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-100/60 dark:border-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                      p.isNext 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {displayName[0]}
                    </div>
                    
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${p.isNext ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-100'}`}>
                          {displayName}
                        </span>
                        {p.isNext && (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full animate-pulse">
                            {isEn ? 'Next Prayer' : 'الصلاة القادمة'}
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-base font-black text-slate-800 dark:text-slate-100">
                        {formatTime12(p.time, isEn)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick listen / Adhan Preview for this prayer */}
                    {p.name !== 'Sunrise' && onTriggerAdhanPreview && (
                      <button
                        id={`preview-adhan-btn-${p.name}`}
                        type="button"
                        onClick={() => onTriggerAdhanPreview(p.name)}
                        className="py-2 px-3 text-xs font-bold rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        title={isEn ? `Listen ${displayName} Adhan` : `سماع أذان صلاة ${displayName}`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isEn ? 'Adhan' : 'الأذان'}</span>
                      </button>
                    )}

                    {/* Prayer checkoff button */}
                    {p.name !== 'Sunrise' ? (
                      <button
                        id={`check-prayer-btn-${p.name}`}
                        onClick={() => handleToggleCheck(p.name)}
                        className={`py-2 px-4 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-950'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {isChecked 
                            ? (isEn ? 'Prayed (Completed)' : 'أديتها (تم التوثيق)') 
                            : (isEn ? 'Mark as Prayed' : 'تحديد كـ أُدّيت')}
                        </span>
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-center py-1.5 px-3 bg-slate-100/50 dark:bg-slate-950/30 rounded-xl">
                        {isEn ? 'Sunrise Time (Disliked for prayer)' : 'وقت الشروق (كراهة الصلاة)'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spiritual Encouragement */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-950 dark:text-amber-300 leading-relaxed font-sans font-medium">
            💡 <strong>{isEn ? 'Maintaining Prayer:' : 'المحافظة على الصلاة:'}</strong> {isEn ? 'The Prophet ﷺ said: "The first thing for which a person will be brought to account on the Day of Resurrection is prayer. If it is sound, he will succeed and prosper." Make prayer the delight of your eyes.' : 'قال رسول الله ﷺ: "أول ما يحاسب به العبد يوم القيامة من عمله صلاته، فإن صلحت فقد أفلح وأنجح". اجعل صلاتك قرّة عينك، وسجِّل حضورك في الصلوات لتعزيز التزامك المبارك.'}
          </div>
        </div>
      </div>
    </div>
  );
}
