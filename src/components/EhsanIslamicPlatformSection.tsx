/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  HeartHandshake, 
  ExternalLink, 
  Sparkles, 
  Heart, 
  Droplet, 
  Users, 
  ShieldCheck, 
  Copy, 
  Check, 
  Award,
  Building,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  MessageCircle,
  Clock,
  Shield,
  BookOpen,
  Share2,
  Timer,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppSettings } from '../types';
import { safeStorage } from '../utils/safeStorage';

interface EhsanIslamicPlatformProps {
  settings: AppSettings;
  isEn?: boolean;
}

// Quick Audio / Recited Supplications for "Two Minutes for Your Akhirah"
const AUDIO_SUPPLICATIONS = [
  {
    id: 'sayyid-istighfar',
    title: 'سيد الاستغفار (أعظم ما يُقال في الصباح والمساء)',
    duration: '01:15',
    category: 'استغفار ومغفرة',
    text: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.',
    reward: 'من قالها موقناً بها حين يمسي فمات دخل الجنة، وكذلك إذا أصبح.',
    audioUrl: 'https://server8.mp3quran.net/afs/001.mp3' // Fallback / audio source
  },
  {
    id: 'jawami-dua',
    title: 'جوامع دعاء النبي ﷺ (شامل لخير الدنيا والآخرة)',
    duration: '01:30',
    category: 'دعاء جامع',
    text: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ مِنْ خَيْرِ مَا سَأَلَكَ مِنْهُ نَبِيُّكَ مُحَمَّدٌ ﷺ، وَنَعُوذُ بِكَ مِنْ شَرِّ مَا اسْتَعَاذَ مِنْهُ نَبِيُّكَ مُحَمَّدٌ ﷺ، وَأَنْتَ الْمُسْتَعَانُ، وَعَلَيْكَ الْبَلاغُ، وَلا حَوْلَ وَلا قُوَّةَ إِلاَّ بِاللَّهِ.',
    reward: 'جمع خيري الدنيا والآخرة في كلمات مباركات.',
    audioUrl: ''
  },
  {
    id: 'relief-distress',
    title: 'دعاء تفريج الهم والكرب وسداد الدين',
    duration: '00:55',
    category: 'سكينة وتفريج كربة',
    text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ.',
    reward: 'أذهب الله همه وقضى عنه دينه.',
    audioUrl: ''
  },
  {
    id: 'travel-car',
    title: 'دعاء ركوب السيارة والتنقل اليومي',
    duration: '00:45',
    category: 'أذكار الطريق والسفر',
    text: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ * وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ. اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى.',
    reward: 'حفظ من الله وأجر على الطريق والمسير.',
    audioUrl: ''
  }
];

// Daily Faith Message Pool
const FAITH_MESSAGES = [
  {
    quote: '«إِنَّ مَعَ الْعُسْرِ يُسْرًا»',
    reflection: 'كل ضائقة يمر بها قلبك هي في الحقيقة مخاض لفرج عظيم، فثق بتدبير الله ولطفه الخفي الذي يدبر لك الخير وأنت لا تشعر.',
    author: 'لطائف قرآنية',
    tag: 'سكينة وطمأنينة'
  },
  {
    quote: '«مَنْ لَزِمَ الِاسْتِغْفَارَ جَعَلَ اللَّهُ لَهُ مِنْ كُلِّ ضِيقٍ مَخْرَجًا، وَمِنْ كُلِّ هَمٍّ فَرَجًا»',
    reflection: 'الاستغفار يفتح الأقفال ويجلب الأرزاق ويمحو الذنوب، اجعل لسانك رطباً به في سائر أوقاتك.',
    author: 'حديث شريف',
    tag: 'مفتاح الفرج'
  },
  {
    quote: '«مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ»',
    reflection: 'الصدقة تبارك في المال وتدفع البلاء وتظل صاحبها يوم القيامة، وبذل القليل بركة وتطهير للروح.',
    author: 'صحيح مسلم',
    tag: 'بركة وإحسان'
  }
];

// Ehsan Quick Categories
const EHSAN_CATEGORIES = [
  {
    id: 'water',
    title: 'سقيا الماء وحفر الآبار',
    desc: 'أفضل الصدقة سقيا الماء - توفير مياه نقية وإعانة المحتاجين',
    icon: Droplet,
    color: 'from-sky-500/20 to-blue-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30',
    tag: 'أجر متواصل'
  },
  {
    id: 'orphans',
    title: 'كفالة ورعاية الأيتام',
    desc: '«أنا وكافل اليتيم في الجنة هكذا» - رعاية وتعليم ومساندة',
    icon: Users,
    color: 'from-amber-500/20 to-yellow-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',
    tag: 'وصية نبوية'
  },
  {
    id: 'relief',
    title: 'تفريج كربة وسداد الديون',
    desc: 'من فرّج عن مسلم كربة من كرب الدنيا فرّج الله عنه كربة يوم القيامة',
    icon: Heart,
    color: 'from-rose-500/20 to-pink-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
    tag: 'تفريج كربة'
  },
  {
    id: 'waqf',
    title: 'الأوقاف وعمارة المساجد',
    desc: 'سهم في بناء المساجد ووقف القرآن الكريم ورعاية طلاب العلم',
    icon: Building,
    color: 'from-emerald-500/20 to-teal-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    tag: 'صدقة جارية'
  }
];

export default function EhsanIslamicPlatformSection({ settings, isEn = false }: EhsanIslamicPlatformProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [activeTab, setActiveTab] = useState<'ehsan' | 'two-min' | 'faith-msg' | 'hisn'>('ehsan');

  // In-App Browser Modal State for Ehsan
  const [isInAppBrowserOpen, setIsInAppBrowserOpen] = useState(false);

  // Audio Player State for "Two Minutes for Your Akhirah"
  const [selectedAudioIdx, setSelectedAudioIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDurationSec, setAudioDurationSec] = useState(75);
  const audioIntervalRef = useRef<any>(null);

  // Speech synthesis for direct offline voice recitation
  const playSupplicationVoice = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.88; // Calm, respectful recitation speed
      utterance.pitch = 1.0;
      utterance.onend = () => {
        setIsPlayingAudio(false);
        setAudioProgress(100);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const togglePlaySupplication = () => {
    const current = AUDIO_SUPPLICATIONS[selectedAudioIdx];
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      clearInterval(audioIntervalRef.current);
    } else {
      setIsPlayingAudio(true);
      setAudioProgress(0);
      playSupplicationVoice(current.text);

      // Smooth progress timer
      const totalSeconds = 60;
      let currentSec = 0;
      audioIntervalRef.current = setInterval(() => {
        currentSec += 1;
        setAudioProgress((currentSec / totalSeconds) * 100);
        if (currentSec >= totalSeconds) {
          clearInterval(audioIntervalRef.current);
          setIsPlayingAudio(false);
        }
      }, 1000);
    }
  };

  const handleStopAudio = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlayingAudio(false);
    setAudioProgress(0);
    clearInterval(audioIntervalRef.current);
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  // Copy Link Handler
  const handleCopyEhsan = () => {
    navigator.clipboard.writeText('https://ehsan.sa');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Daily Faith Message
  const dayIdx = new Date().getDate() % FAITH_MESSAGES.length;
  const currentFaithMsg = FAITH_MESSAGES[dayIdx];

  const handleShareWhatsApp = () => {
    const text = `🌸 *رسالة إيمانية من منصة إحسان الإسلامية - تطبيق نور الإسلام*\n\n${currentFaithMsg.quote}\n\n💡 *فائدة:* ${currentFaithMsg.reflection}\n\n— ${currentFaithMsg.author}\n\n📱 *تطبيق نور الإسلام*`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyMessage = () => {
    const text = `🌸 رسالة إيمانية اليوم:\n\n${currentFaithMsg.quote}\n\n${currentFaithMsg.reflection}\n\n— ${currentFaithMsg.author}`;
    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  // Hisn counter state
  const [quickHisnCount, setQuickHisnCount] = useState(() => {
    try {
      return parseInt(safeStorage.getItem('noor_quick_hisn_count') || '0', 10);
    } catch {
      return 0;
    }
  });

  const handleIncrementQuickHisn = () => {
    const nextVal = quickHisnCount + 1;
    setQuickHisnCount(nextVal);
    safeStorage.setItem('noor_quick_hisn_count', String(nextVal));

    if (settings.soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } catch (e) {}
    }
  };

  return (
    <section 
      id="ehsan-islamic-platform-section"
      className="w-full bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] dark:from-[#060C0D] dark:via-[#091315] dark:to-[#060C0D] rounded-3xl border-2 border-emerald-500/20 dark:border-emerald-500/15 p-5 sm:p-7 lg:p-9 shadow-2xl relative overflow-hidden space-y-7 my-10"
    >
      {/* Background Ambience Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Prominent Quick Action Banner (ساهم في العطاء عبر منصة إحسان) */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-400/40 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4 text-right">
          <div className="p-3.5 bg-amber-400 text-slate-950 rounded-2xl shadow-md shrink-0">
            <Heart className="w-6 h-6 fill-current text-rose-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black font-amiri text-white">
                ساهم في العطاء عبر منصة إحسان
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/30 text-emerald-200 rounded-full border border-emerald-400/30">
                رسمي ومعتمد
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              فرصة للمساهمة في تفريج الكرب وسقيا الماء وكفالة الأيتام بضغطة زر وبكل سهولة وأمان.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            id="quick-banner-donate-btn"
            onClick={() => setIsInAppBrowserOpen(true)}
            className="flex-1 md:flex-none py-3 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
          >
            <span>تبرع الآن (ehsan.sa)</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Section Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white rounded-2xl shadow-lg ring-4 ring-emerald-500/20">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-amiri tracking-wide">
                {isEn ? "Islamic Ehsan Platform" : "منصة إحسان الإسلامية"}
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-black bg-amber-400 text-slate-950 rounded-full shadow-xs">
                {isEn ? "Humanitarian & Faith Hub" : "بوابة البر والعمل الخيري"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {isEn 
                ? "Official donations, short 2-minute audio supplications, daily reflections & fortress of the muslim" 
                : "التبرع الموثوق عبر منصة إحسان، أدعية مسموعة لدقيقتين، ورسائل إيمانية متجددة"}
            </p>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#0B1516] rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            id="tab-ehsan-main"
            onClick={() => setActiveTab('ehsan')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'ehsan'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            منصة إحسان الرسمية
          </button>
          <button
            id="tab-two-min"
            onClick={() => setActiveTab('two-min')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'two-min'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>دقيقتان لآخرتك (صوتيات)</span>
          </button>
          <button
            id="tab-faith-msg"
            onClick={() => setActiveTab('faith-msg')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'faith-msg'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>رسالة إيمانية اليوم</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Ehsan Official Platform Main Card */}
      {activeTab === 'ehsan' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main Hero Card */}
          <div className="relative bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-emerald-400/30 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xs">
                    {isEn ? "Official Platform" : "المنصة الوطنية المعتمدة"}
                  </span>
                  <span className="text-xs text-emerald-200 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    {isEn ? "100% Secure & Verified" : "موثوقة ورسمية 100% (ehsan.sa)"}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black font-amiri text-white tracking-wide">
                  {isEn ? "Ehsan Charity Platform" : "منصة إحسان للعمل الخيري (ehsan.sa)"}
                </h3>

                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  {isEn
                    ? "Direct access to the premier Saudi national charity platform empowering transparent donations across healthcare, orphans, water, and debt relief."
                    : "بوابة الخير الوطنية الكبرى؛ تمكّنك من التبرع المباشر والموثوق لآلاف الحالات المعتمدة برعاية رسمية في مجالات سقيا الماء، كفالة الأيتام، تفريج الكربات، والإغاثة."}
                </p>

                <div className="flex items-center gap-2 text-xs text-amber-300 font-bold pt-1">
                  <Sparkles className="w-4 h-4" />
                  <span>{isEn ? "Direct Domain:" : "الرابط الرسمي المعتمد:"}</span>
                  <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded-lg">ehsan.sa</span>
                </div>
              </div>

              {/* Action Buttons: In-App Browser & Safe External */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
                {/* 1. Direct Safe In-App Browser / Open */}
                <button
                  id="open-ehsan-inapp-btn"
                  onClick={() => setIsInAppBrowserOpen(true)}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
                >
                  <span>{isEn ? "Open Ehsan Platform" : "فتح منصة إحسان الآن"}</span>
                  <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </button>

                {/* 2. Direct External Tab Button */}
                <a
                  id="open-ehsan-external-btn"
                  href="https://ehsan.sa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-center"
                >
                  <span>فتح في متصفح خارجي ↗</span>
                </a>

                {/* 3. Copy Link */}
                <button
                  id="copy-ehsan-link-btn"
                  onClick={handleCopyEhsan}
                  className="w-full py-2.5 px-4 bg-black/30 hover:bg-black/40 text-slate-200 font-semibold text-xs rounded-xl border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>تم نسخ الرابط (ehsan.sa)</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ رابط المنصة</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Categories Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EHSAN_CATEGORIES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  id={`ehsan-card-${item.id}`}
                  onClick={() => setIsInAppBrowserOpen(true)}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} border transition-all duration-200 hover:scale-[1.02] hover:shadow-md flex flex-col justify-between space-y-3 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#0B1516] shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/80 dark:bg-black/40 border border-current">
                      {item.tag}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-amiri group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-[11px] font-bold">
                    <span>تبرع عبر إحسان</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Tab 2: Two Minutes for Your Akhirah (دقيقتان لآخرتك مع أدعية مسموعة ومقروءة) */}
      {activeTab === 'two-min' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0B1516] rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-amiri">
                  دقيقتان لآخرتك (أدعية صوتية ومقروءة أثناء قيادة السيارة أو وقت الراحة)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  استمع لأدعية جامعة ومختصرة في أقل من دقيقتين تجلب البركة وتملأ ميزانك بالحسنات
                </p>
              </div>
            </div>

            {isPlayingAudio && (
              <span className="px-3 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full flex items-center gap-1.5 animate-pulse">
                <Volume2 className="w-3.5 h-3.5" />
                <span>جاري الاستماع الآن...</span>
              </span>
            )}
          </div>

          {/* Audio Playlist Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {AUDIO_SUPPLICATIONS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  handleStopAudio();
                  setSelectedAudioIdx(idx);
                }}
                className={`p-3 rounded-2xl text-right transition-all cursor-pointer border flex flex-col justify-between space-y-1.5 ${
                  selectedAudioIdx === idx
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-900 dark:text-emerald-300 shadow-xs'
                    : 'bg-slate-50 dark:bg-[#070D0E] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-600 text-white rounded-md">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.duration}
                  </span>
                </div>
                <h5 className="text-xs font-bold line-clamp-1 font-amiri">
                  {item.title}
                </h5>
              </button>
            ))}
          </div>

          {/* Active Audio Player & Text Card */}
          <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-950 via-[#0C2427] to-slate-950 text-white rounded-3xl border-2 border-emerald-500/30 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-amber-300 font-bold">
                  {AUDIO_SUPPLICATIONS[selectedAudioIdx].category}
                </span>
                <h4 className="text-lg sm:text-xl font-black font-amiri text-white mt-0.5">
                  {AUDIO_SUPPLICATIONS[selectedAudioIdx].title}
                </h4>
              </div>

              {/* Play / Pause Controls */}
              <div className="flex items-center gap-2">
                <button
                  id="play-supplication-audio-btn"
                  onClick={togglePlaySupplication}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>إيقاف مؤقت</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>استمع للدعاء بصوت هادئ</span>
                    </>
                  )}
                </button>

                {isPlayingAudio && (
                  <button
                    onClick={handleStopAudio}
                    className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
                    title="إعادة البدء"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Audio Progress Bar */}
            {isPlayingAudio && (
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            )}

            {/* Supplication Text */}
            <div className="p-4 sm:p-5 bg-black/30 rounded-2xl border border-white/10 space-y-3">
              <p className="text-base sm:text-lg font-bold font-amiri text-amber-100 leading-loose text-center">
                «{AUDIO_SUPPLICATIONS[selectedAudioIdx].text}»
              </p>
              <div className="text-xs text-emerald-300 font-medium text-center border-t border-white/10 pt-2">
                ✨ <strong>فضل الدعاء:</strong> {AUDIO_SUPPLICATIONS[selectedAudioIdx].reward}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 3: Daily Faith Message (رسالة إيمانية اليوم) */}
      {activeTab === 'faith-msg' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-emerald-500/30 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl font-bold shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black font-amiri text-white">
                  رسالة إيمانية اليوم (للمشاركة والتأمل)
                </h3>
                <p className="text-xs text-slate-300">
                  خاطرة إيمانية قصيرة جاهزة للمشاركة الفورية عبر واتساب وشبكات التواصل
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="share-whatsapp-direct-btn"
                onClick={handleShareWhatsApp}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>مشاركة عبر واتساب</span>
              </button>

              <button
                id="copy-faith-text-btn"
                onClick={handleCopyMessage}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                {copiedMsg ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedMsg ? "تم النسخ" : "نسخ البطاقة"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <blockquote className="text-lg sm:text-2xl font-bold font-amiri text-amber-200 leading-relaxed bg-black/20 p-5 rounded-2xl border-r-4 border-amber-400">
              {currentFaithMsg.quote}
            </blockquote>

            <p className="text-sm text-emerald-50 leading-relaxed">
              💡 <strong className="text-amber-300">الفائدة واللطيفة الإيمانية:</strong> {currentFaithMsg.reflection}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
              <span>{currentFaithMsg.author}</span>
              <span className="text-emerald-400 font-semibold">منصة إحسان الإسلامية 🌿</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* In-App Browser Modal for Ehsan */}
      <AnimatePresence>
        {isInAppBrowserOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl h-[88vh] bg-white dark:bg-[#0B1516] rounded-3xl shadow-2xl border-2 border-emerald-500/40 flex flex-col overflow-hidden"
            >
              {/* Modal Top Bar */}
              <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between border-b border-emerald-700/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-black">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black font-amiri">
                      منصة إحسان الوطنية للعمل الخيري (ehsan.sa)
                    </h4>
                    <span className="text-[11px] text-emerald-200 flex items-center gap-1 font-mono">
                      https://ehsan.sa
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://ehsan.sa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                    title="فتح في نافذة خارجية"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => setIsInAppBrowserOpen(false)}
                    className="p-2 bg-white/10 hover:bg-rose-600 text-white rounded-xl transition-all cursor-pointer"
                    title="إغلاق"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* In-App Browser Frame / Content */}
              <div className="flex-1 w-full bg-slate-50 dark:bg-[#070D0E] relative flex flex-col">
                <iframe
                  src="https://ehsan.sa"
                  title="منصة إحسان للعمل الخيري"
                  className="w-full flex-1 border-0"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />

                {/* Fallback Banner in case iframe is blocked by domain security policies */}
                <div className="p-4 bg-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-emerald-800">
                  <div className="flex items-center gap-2 text-xs text-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>لأمان التبرع والمدفوعات الإلكترونية، يمكنك فتح موقع إحسان مباشرة في المتصفح الرسمي:</span>
                  </div>
                  <a
                    href="https://ehsan.sa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <span>الدخول المباشر لإحسان</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
