/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Loader2, 
  Headphones, 
  BookOpen, 
  Shield, 
  RotateCcw, 
  Info, 
  CheckCircle, 
  Sparkles, 
  Clock, 
  Heart, 
  Award,
  BookOpenCheck
} from 'lucide-react';
import { safeStorage } from '../utils/safeStorage';

interface RuqyahItem {
  id: string;
  title: string;
  text: string;
  count: number;
  reward?: string;
  reference?: string;
}

const RUQYAH_RECITERS = [
  { id: 'alafasy', name: 'الشيخ مشاري بن راشد العفاسي', url: 'https://download.quranicaudio.com/ruqyah/mishary_rashid_al_afasy_ruqyah.mp3' },
  { id: 'ajmy', name: 'الشيخ أحمد بن علي العجمي', url: 'https://download.quranicaudio.com/ruqyah/ahmed_bin_ali_al-ajmy_ruqyah.mp3' },
  { id: 'dosari', name: 'الشيخ ياسر الدوسري', url: 'https://download.quranicaudio.com/ruqyah/yasser_ad-dussary_ruqyah.mp3' },
  { id: 'ghamdi', name: 'الشيخ سعد الغامدي', url: 'https://download.quranicaudio.com/ruqyah/saad_al-ghamdi_ruqyah.mp3' },
  { id: 'shatri', name: 'الشيخ أبو بكر الشاطري', url: 'https://download.quranicaudio.com/ruqyah/abu_bakr_al_shatri_ruqyah.mp3' }
];

const QURAN_VERSES: RuqyahItem[] = [
  {
    id: 'q1',
    title: 'سورة الفاتحة (كاملة)',
    text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ (1) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (2) الرَّحْمَنِ الرَّحِيمِ (3) مَالِكِ يَوْمِ الدِّينِ (4) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (5) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (6) صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ (7)',
    count: 7,
    reward: 'رَقية شافية كافية تقرأ للشفاء بإذن الله ولها فضل عظيم في زوال الأسقام وحفظ النفس.',
    reference: 'سورة الفاتحة'
  },
  {
    id: 'q2',
    title: 'آية الكرسي',
    text: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    count: 3,
    reward: 'أعظم آية في القرآن الكريم، مَن قرأها حين يُصبح أُجير من الجن حتى يُمسي ومَن قرأها حين يُمسي أُجير منهم حتى يُصبح.',
    reference: 'سورة البقرة - الآية 255'
  },
  {
    id: 'q3',
    title: 'خواتيم سورة البقرة',
    text: 'آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ وَالْمُؤْمِنُونَ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِنْ رُسُلِهِ وَقَالُوا سَمِعْنَا وَأَطَعْنَا غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ * لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
    count: 1,
    reward: 'مَن قرأ الآيتين من آخر سورة البقرة في ليلةٍ كفتاه (كفتاه من كل سوء والشرور والجن).',
    reference: 'سورة البقرة - الآيتين 285-286'
  },
  {
    id: 'q4',
    title: 'سورة الإخلاص (كاملة)',
    text: 'قُلْ هُوَ اللَّهُ أَحَدٌ (1) اللَّهُ الصَّمَدُ (2) لَمْ يَلِدْ وَلَمْ يُولَدْ (3) وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ (4)',
    count: 3,
    reward: 'تعدل ثلث القرآن، وتقرأ مع المعوذتين للتحصين الكامل والوقاية من العين والسحر والشرور.',
    reference: 'سورة الإخلاص'
  },
  {
    id: 'q5',
    title: 'سورة الفلق (كاملة)',
    text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ (1) مِنْ شَرِّ مَا خَلَقَ (2) وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ (3) وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ (4) وَمِنْ شرّ حَاسِدٍ إِذَا حَسَدَ (5)',
    count: 3,
    reward: 'التحصين من العين، الحسد، الشرور، السحر والمخلوقات المؤذية.',
    reference: 'سورة الفلق'
  },
  {
    id: 'q6',
    title: 'سورة الناس (كاملة)',
    text: 'قُل * أَعُوذُ بِرَبِّ النَّاسِ (1) مَلِكِ النَّاسِ (2) إِلَهِ النَّاسِ (3) مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ (4) الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ (5) مِنَ الْجِنَّةِ وَالنَّاسِ (6)',
    count: 3,
    reward: 'الحماية والوقاية من كيد الشيطان، الهوام، والوساوس الضارة.',
    reference: 'سورة الناس'
  }
];

const SUNNAH_DUAS: RuqyahItem[] = [
  {
    id: 's1',
    title: 'دعاء الشفاء ورفع البأس',
    text: 'أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ، وَاشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا',
    count: 3,
    reward: 'رقى بها النبي صلى الله عليه وسلم عيادته لمرضاه وأهله لشفاء البدن وزوال الضر.',
    reference: 'صحيح البخاري ومسلم'
  },
  {
    id: 's2',
    title: 'دعاء جبريل عليه السلام لرسول الله',
    text: 'بِسْمِ اللهِ أُرْقِيكَ، مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ، مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنِ حَاسِدٍ، اللهُ يَشْفِيكَ، بِسْمِ اللهِ أُرْقِيكَ',
    count: 3,
    reward: 'من أعظم الأدعية في الرقية الشرعية رقى بها جبريل النبي عليه الصلاة والسلام.',
    reference: 'صحيح مسلم'
  },
  {
    id: 's3',
    title: 'التعوذ بكلمات الله التامات',
    text: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    count: 3,
    reward: 'من قاله حين ينزل منزلاً أو في صباحه ومسائه لم يضره شيء حتى يرحل منه.',
    reference: 'صحيح مسلم'
  },
  {
    id: 's4',
    title: 'الحفظ العام من المفاجآت والضر',
    text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    count: 3,
    reward: 'مَن قالها ثلاثاً في الصباح وثلاثاً في المساء لم يضره شيء ولم تصبه فجأة بلاء.',
    reference: 'سنن أبي داود والترمذي'
  },
  {
    id: 's5',
    title: 'دعاء التحصين من الشياطين والهوام',
    text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
    count: 3,
    reward: 'كان النبي صلى الله عليه وسلم يعوذ بها الحسن والحسين رضي الله عنهما.',
    reference: 'صحيح البخاري'
  },
  {
    id: 's6',
    title: 'الاستعاذة بعزة الله وقدرته',
    text: 'أَعُوذُ بِعِزَّةِ اللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ',
    count: 7,
    reward: 'يوضع اليد على موضع الألم ويقول: (بسم الله ثلاثاً) ثم يردد هذا الدعاء سبع مرات.',
    reference: 'صحيح مسلم'
  }
];

const GUIDELINES = [
  {
    title: 'الإخلاص واليقين التام',
    desc: 'أن يعتقد المرقي والراقي اعتقاداً جازماً أن الرقية سبب من الأسباب لا تؤثر بذاتها، وأن الشفاء بيد الله وحده سبحانه وتعالى، ويجب اليقين التام ببركة كلام الله وسنة نبيه.'
  },
  {
    title: 'أن تكون بكلام الله وصفاته',
    desc: 'تكون الرقية بالقرآن الكريم وبأسماء الله تعالى وصفاته، والأدعية النبوية الصحيحة المأثورة عن النبي صلى الله عليه وسلم.'
  },
  {
    title: 'اللسان العربي المبين',
    desc: 'أن تكون الرقية باللغة العربية الواضحة وبما يُفهم معناه، وتجنب أي طلاسم أو تمائم أو استعانة بغير الله عز وجل.'
  },
  {
    title: 'الطهارة والوضوء',
    desc: 'يُستحب بشدة للراقي والمرقي أن يكونا على طهارة تامة ووضوء، وفي اتجاه القبلة إن تيسر، وقراءة الآيات والأدعية بتدبر وسكينة.'
  },
  {
    title: 'النفث والمسح',
    desc: 'يُسن النفث (وهو نفخ لطيف بلا ريق أو بريق خفيف جداً) في اليدين بعد القراءة ثم مسح الجسد بهما، أو النفث على موضع الألم مباشرة.'
  }
];

interface RuqyahSectionProps {
  isEn?: boolean;
}

export default function RuqyahSection({ isEn = false }: RuqyahSectionProps) {
  const [activeTab, setActiveTab] = useState<'quran' | 'sunnah' | 'guidelines'>('quran');
  
  // Audio Player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeReciterId, setActiveReciterId] = useState<string>('alafasy');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Counter state for reading progress
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>(() => {
    const stored = safeStorage.getItem('noor_ruqyah_counts');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // Fallback
      }
    }
    return {};
  });

  const activeReciter = RUQYAH_RECITERS.find(r => r.id === activeReciterId) || RUQYAH_RECITERS[0];

  // Sync state to local storage
  useEffect(() => {
    safeStorage.setItem('noor_ruqyah_counts', JSON.stringify(completedCounts));
  }, [completedCounts]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Handle counter tap
  const handleItemTap = (itemId: string, maxCount: number) => {
    const currentCount = completedCounts[itemId] !== undefined ? completedCounts[itemId] : maxCount;
    if (currentCount > 0) {
      const nextCount = currentCount - 1;
      setCompletedCounts(prev => ({
        ...prev,
        [itemId]: nextCount
      }));
      
      // Gentle Haptic tap simulation / audio cue
      if ('vibrate' in navigator) {
        navigator.vibrate(15);
      }
    }
  };

  const handleResetItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedCounts(prev => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  const handleResetCategory = () => {
    const itemsToReset = activeTab === 'quran' ? QURAN_VERSES : SUNNAH_DUAS;
    setCompletedCounts(prev => {
      const updated = { ...prev };
      itemsToReset.forEach(item => {
        delete updated[item.id];
      });
      return updated;
    });
  };

  // Audio Play/Pause controls
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsAudioLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsAudioLoading(false);
        })
        .catch(err => {
          console.error("Audio playback error:", err);
          setIsPlaying(false);
          setIsAudioLoading(false);
        });
    }
  };

  const handleReciterChange = (reciterId: string) => {
    setActiveReciterId(reciterId);
    const reciter = RUQYAH_RECITERS.find(r => r.id === reciterId);
    if (reciter && audioRef.current) {
      const wasPlaying = isPlaying;
      setIsAudioLoading(true);
      audioRef.current.src = reciter.url;
      audioRef.current.load();
      if (wasPlaying) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsAudioLoading(false);
          })
          .catch(err => {
            console.error("Playback failed upon reciter change:", err);
            setIsPlaying(false);
            setIsAudioLoading(false);
          });
      } else {
        setIsPlaying(false);
        setIsAudioLoading(false);
      }
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

  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return '00:00';
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Helpers to fetch current item counter
  const getRemainingCount = (item: RuqyahItem) => {
    return completedCounts[item.id] !== undefined ? completedCounts[item.id] : item.count;
  };

  const isCompleted = (item: RuqyahItem) => {
    return getRemainingCount(item) === 0;
  };

  const currentItems = activeTab === 'quran' ? QURAN_VERSES : SUNNAH_DUAS;
  const totalInCat = currentItems.length;
  const completedInCat = currentItems.filter(item => isCompleted(item)).length;
  const progressPercentage = totalInCat > 0 ? Math.round((completedInCat / totalInCat) * 100) : 0;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 text-right font-sans shadow-xs">
      
      {/* Hidden audio tag */}
      <audio
        ref={audioRef}
        src={activeReciter.url}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            setIsAudioLoading(false);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onWaiting={() => setIsAudioLoading(true)}
        onCanPlay={() => setIsAudioLoading(false)}
      />

      {/* Header Block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl">
              <Shield className="w-6 h-6 animate-pulse" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white font-sans">
              {isEn ? 'Authentic Ruqyah' : 'الرقية الشرعية المطهرة'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isEn ? 'Protect yourself and your family with Quranic verses and authentic Prophetic supplications' : 'حصن نفسك وأهل بيتك بآيات كتاب الله عز وجل والأدعية الصحيحة من السنة النبوية الشريفة'}
          </p>
        </div>

        {/* Global actions or stats */}
        {activeTab !== 'guidelines' && (
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between bg-slate-50 dark:bg-slate-950/30 px-3.5 py-2 rounded-2xl border border-slate-100 dark:border-slate-800/50">
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-slate-400">{isEn ? 'Reading Progress' : 'التقدم المقروء'}</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                {completedInCat} {isEn ? 'of' : 'من'} {totalInCat} ({progressPercentage}%)
              </span>
            </div>
            
            <button
              type="button"
              onClick={handleResetCategory}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer"
              title="إعادة تعيين العدادات للقسم الحالي"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Relaxing Ruqyah Audio Player Card */}
      <div className="p-4 bg-slate-50/90 dark:bg-slate-950/40 border border-slate-150/40 dark:border-slate-800/80 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/50 dark:border-slate-800/50 pb-3" dir="rtl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100/60 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 rounded-lg">
              <Headphones className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
              الاستماع المباشر للرقية الشرعية الشاملة بصوت شجي ومريح
            </span>
          </div>

          {/* Reciter selector */}
          <div className="flex items-center gap-1.5 self-end md:self-auto">
            <span className="text-[11px] text-slate-400 font-bold">القارئ:</span>
            <select
              value={activeReciterId}
              onChange={(e) => handleReciterChange(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-lg px-2.5 py-1 focus:border-emerald-500 focus:ring-emerald-500 cursor-pointer"
            >
              {RUQYAH_RECITERS.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Audio controls block */}
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between" dir="rtl">
          <div className="flex items-center gap-3 w-full md:w-auto justify-start">
            <button
              type="button"
              onClick={handlePlayPause}
              disabled={isAudioLoading}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 text-white cursor-pointer ${
                isPlaying 
                  ? 'bg-amber-500 hover:bg-amber-600' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_12px_rgba(16,185,129,0.2)]'
              } disabled:opacity-60`}
            >
              {isAudioLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white translate-x-[-1px]" />
              )}
            </button>

            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-slate-400">حالة الصوت</span>
              <span className="text-xs font-black text-slate-700 dark:text-slate-200">
                {isAudioLoading ? 'جاري التحميل...' : isPlaying ? 'يُرتل الآن...' : 'جاهز للاستماع والتحصين'}
              </span>
            </div>
          </div>

          {/* Progress slider */}
          <div className="flex items-center gap-3 w-full flex-1">
            <span className="text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 min-w-[32px] text-left">
              {formatTime(currentTime)}
            </span>

            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleProgressChange}
              disabled={isAudioLoading || !duration}
              className="flex-1 h-1.5 rounded-lg appearance-none bg-slate-200 dark:bg-slate-800 accent-emerald-600 dark:accent-emerald-400 cursor-pointer disabled:opacity-50"
            />

            <span className="text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 min-w-[32px] text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume slider */}
          <div className="flex items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-3 mr-1 w-full md:w-32 justify-end md:justify-start">
            <button
              type="button"
              onClick={toggleMute}
              className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" />
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
              className="w-20 h-1.5 rounded-lg appearance-none bg-slate-200 dark:bg-slate-800 accent-emerald-600 dark:accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex overflow-x-auto gap-2 pb-1.5 scrollbar-none border-b border-slate-100 dark:border-slate-800/40" dir="rtl">
        <button
          type="button"
          onClick={() => setActiveTab('quran')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'quran'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>آيات القرآن للرقية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sunnah')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'sunnah'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>الأدعية من السنة النبوية</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guidelines')}
          className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'guidelines'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>إرشادات وشروط الرقية</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {activeTab === 'guidelines' ? (
            <motion.div
              key="guidelines"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 text-right"
              dir="rtl"
            >
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5 animate-bounce-slow" />
                <div className="text-xs leading-relaxed space-y-1">
                  <h4 className="font-bold">ملاحظة هامة جداً:</h4>
                  <p>
                    الرقية الشرعية هي التماس مباشر من الله بالدعاء والقرآن، وليس لها أثر بذاتها بل الشافي والمجيب هو الله سبحانه وتعالى. احرص على تدبر المعاني والتحلي بصدق النية واليقين عند الرقية.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GUIDELINES.map((guide, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/70 rounded-2xl space-y-2 text-right"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                        {guide.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      {guide.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
              dir="rtl"
            >
              <div className="text-[10px] text-slate-400 font-bold text-center">
                * انقر على بطاقة الذكر لتسجيل القراءة؛ سيقل العداد تلقائياً وتتحول البطاقة للون الأخضر عند الاكتمال.
              </div>

              <div className="space-y-4">
                {currentItems.map((item, idx) => {
                  const remCount = getRemainingCount(item);
                  const isDone = remCount === 0;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleItemTap(item.id, item.count)}
                      className={`group p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden select-none ${
                        isDone 
                          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs dark:bg-emerald-950/15'
                          : remCount < item.count
                          ? 'bg-amber-500/5 border-amber-300/50 shadow-2xs dark:bg-amber-950/5'
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850 hover:border-emerald-200 dark:hover:border-slate-750 hover:shadow-xs'
                      }`}
                    >
                      {/* Completion status visual glow background */}
                      {isDone && (
                        <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/2 pointer-events-none" />
                      )}

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-lg">
                              <BookOpenCheck className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-[11px] font-black text-slate-800 dark:text-slate-100">
                              {item.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isDone ? (
                              <div className="flex items-center gap-1 bg-emerald-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3 fill-emerald-500 text-white" />
                                <span>اكتمل التكرار</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-slate-200/50 dark:border-slate-800/50">
                                <span>التكرار المطلـوب:</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-black">{item.count}</span>
                              </div>
                            )}

                            {remCount < item.count && (
                              <button
                                type="button"
                                onClick={(e) => handleResetItem(item.id, e)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                                title="إعادة تكرار هذا الذكر"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Text Block */}
                        <p className="text-sm md:text-[15px] font-semibold text-slate-800 dark:text-slate-100 leading-relaxed font-sans text-right select-text group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {item.text}
                        </p>

                        {/* Reference & reward info */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100/50 dark:border-slate-800/40">
                          {item.reference && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                              {item.reference}
                            </span>
                          )}

                          {item.reward && (
                            <span className="text-[10px] bg-emerald-50/50 dark:bg-emerald-950/15 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg leading-relaxed max-w-full font-medium">
                              {item.reward}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Counter Badge Button overlay */}
                      {!isDone && (
                        <div className="absolute bottom-4 left-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-600 group-hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center shadow-md active:scale-90 transition-all">
                            {remCount}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
