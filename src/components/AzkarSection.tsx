/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Moon, 
  Bed, 
  Activity, 
  BookOpen, 
  Shield, 
  Heart, 
  RefreshCw, 
  Award, 
  CheckCircle2, 
  RotateCcw, 
  Copy, 
  Share2, 
  Volume2, 
  VolumeX, 
  Search, 
  Star, 
  ChevronRight,
  ChevronLeft,
  ArrowRight, 
  Plus, 
  Minus,
  Sparkles,
  Bookmark,
  Check,
  Flame,
  ListFilter,
  Clock,
  Compass,
  Grid,
  X,
  Sliders,
  Play,
  Pause,
  Loader2,
  Headphones,
  UserCheck
} from 'lucide-react';
import { azkarData } from '../data/azkar';
import { ZekrItem } from '../types';
import { safeStorage } from '../utils/safeStorage';

export interface AzkarReciter {
  id: string;
  name: string;
  subName: string;
  quranPrefix: string;
}

export const SHEIKH_RECITERS: AzkarReciter[] = [
  { id: 'alafasy', name: 'الشيخ مشاري راشد العفاسي', subName: 'تسجيلات الأذكار والأدعية المعتمدة', quranPrefix: 'Alafasy_128kbps' },
  { id: 'ghamdi', name: 'الشيخ سعد الغامدي', subName: 'أذكار خاشعة من الحرم المكي', quranPrefix: 'Ghamadi_40kbps' },
  { id: 'ajmy', name: 'الشيخ أحمد بن علي العجمي', subName: 'تلاوات ورقية خاشعة', quranPrefix: 'Ahmed_ibn_Ali_al-Ajamy_128kbps' },
  { id: 'maher', name: 'الشيخ ماهر المعيقلي', subName: 'إمام الحرم المكي الشريف', quranPrefix: 'MaherAlMuaiqly128kbps' },
  { id: 'basit', name: 'الشيخ عبد الباسط عبد الصمد', subName: 'المصحف المرتل', quranPrefix: 'Abdul_Basit_Murattal_192kbps' },
  { id: 'dussary', name: 'الشيخ ياسر الدوسري', subName: 'تلاوات وأدعية من الحرم المكي', quranPrefix: 'Yasser_Ad-Dussary_128kbps' },
  { id: 'minshawi', name: 'الشيخ محمد صديق المنشاوي', subName: 'تلاوة مرتلة بالرواية الصحيحة', quranPrefix: 'Minshawy_Murattal_128kbps' },
  { id: 'qatami', name: 'الشيخ ناصر القطامي', subName: 'أدعية وتلاوات ترقيق القلوب', quranPrefix: 'Nasser_Alqatami_128kbps' }
];

// Audio URL mappings for category streaming
const CATEGORY_AUDIO_MAP: Record<string, Record<string, string>> = {
  morning: {
    alafasy: 'https://download.quranicaudio.com/adhkar/mishary_rashid_al_afasy_morning_adhkar.mp3',
    ghamdi: 'https://download.quranicaudio.com/adhkar/saad_al_ghamdi_adhkar.mp3',
    ajmy: 'https://download.quranicaudio.com/ruqyah/ahmed_bin_ali_al-ajmy_ruqyah.mp3',
    maher: 'https://everyayah.com/data/MaherAlMuaiqly128kbps/002255.mp3',
    basit: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/002255.mp3',
    dussary: 'https://download.quranicaudio.com/ruqyah/yasser_ad-dussary_ruqyah.mp3',
    minshawi: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/002255.mp3',
    qatami: 'https://download.quranicaudio.com/adhkar/mishary_rashid_al_afasy_morning_adhkar.mp3'
  },
  evening: {
    alafasy: 'https://download.quranicaudio.com/adhkar/mishary_rashid_al_afasy_evening_adhkar.mp3',
    ghamdi: 'https://download.quranicaudio.com/adhkar/saad_al_ghamdi_adhkar.mp3',
    ajmy: 'https://download.quranicaudio.com/ruqyah/ahmed_bin_ali_al-ajmy_ruqyah.mp3',
    maher: 'https://everyayah.com/data/MaherAlMuaiqly128kbps/002255.mp3',
    basit: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/002255.mp3',
    dussary: 'https://download.quranicaudio.com/ruqyah/yasser_ad-dussary_ruqyah.mp3',
    minshawi: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/002255.mp3',
    qatami: 'https://download.quranicaudio.com/adhkar/mishary_rashid_al_afasy_evening_adhkar.mp3'
  },
  sleep: {
    alafasy: 'https://download.quranicaudio.com/adhkar/mishary_rashid_al_afasy_sleep_adhkar.mp3',
    ghamdi: 'https://download.quranicaudio.com/adhkar/saad_al_ghamdi_adhkar.mp3',
    ajmy: 'https://download.quranicaudio.com/ruqyah/ahmed_bin_ali_al-ajmy_ruqyah.mp3',
    maher: 'https://everyayah.com/data/MaherAlMuaiqly128kbps/002255.mp3',
    basit: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/002255.mp3',
    dussary: 'https://download.quranicaudio.com/ruqyah/yasser_ad-dussary_ruqyah.mp3',
    minshawi: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/002255.mp3',
    qatami: 'https://download.quranicaudio.com/adhkar/mishary_rashid_al_afasy_sleep_adhkar.mp3'
  },
  wakeup: {
    alafasy: 'https://download.quranicaudio.com/adhkar/mishary_alafasy_wake_adhkar.mp3',
    ghamdi: 'https://download.quranicaudio.com/adhkar/saad_al_ghamdi_adhkar.mp3',
    ajmy: 'https://download.quranicaudio.com/ruqyah/ahmed_bin_ali_al-ajmy_ruqyah.mp3',
    maher: 'https://everyayah.com/data/MaherAlMuaiqly128kbps/001001.mp3',
    basit: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/001001.mp3',
    dussary: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/001001.mp3',
    minshawi: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/001001.mp3',
    qatami: 'https://download.quranicaudio.com/adhkar/mishary_alafasy_wake_adhkar.mp3'
  },
  ruqyah: {
    alafasy: 'https://download.quranicaudio.com/ruqyah/mishary_rashid_al_afasy_ruqyah.mp3',
    ghamdi: 'https://download.quranicaudio.com/ruqyah/saad_al-ghamdi_ruqyah.mp3',
    ajmy: 'https://download.quranicaudio.com/ruqyah/ahmed_bin_ali_al-ajmy_ruqyah.mp3',
    maher: 'https://server12.mp3quran.net/maher/001.mp3',
    basit: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/002255.mp3',
    dussary: 'https://download.quranicaudio.com/ruqyah/yasser_ad-dussary_ruqyah.mp3',
    minshawi: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/002255.mp3',
    qatami: 'https://download.quranicaudio.com/ruqyah/mishary_rashid_al_afasy_ruqyah.mp3'
  }
};

// Item level Quranic audio resolver
function getItemAudioUrl(item: ZekrItem, reciter: AzkarReciter): string {
  // Ayat Al-Kursi (Baqarah 255)
  if (item.text.includes('اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ') || item.text.includes('آية الكرسي')) {
    return `https://everyayah.com/data/${reciter.quranPrefix}/002255.mp3`;
  }
  // Surah Al-Ikhlas (112)
  if (item.text.includes('قُلْ هُوَ اللَّهُ أَحَدٌ')) {
    return `https://everyayah.com/data/${reciter.quranPrefix}/112001.mp3`;
  }
  // Surah Al-Falaq (113)
  if (item.text.includes('قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ')) {
    return `https://everyayah.com/data/${reciter.quranPrefix}/113001.mp3`;
  }
  // Surah An-Nas (114)
  if (item.text.includes('قُلْ أَعُوذُ بِرَبِّ النَّاسِ')) {
    return `https://everyayah.com/data/${reciter.quranPrefix}/114001.mp3`;
  }
  // Baqarah Endings (285)
  if (item.text.includes('آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ')) {
    return `https://everyayah.com/data/${reciter.quranPrefix}/002285.mp3`;
  }
  // Al-Fatihah
  if (item.text.includes('الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ')) {
    return `https://everyayah.com/data/${reciter.quranPrefix}/001001.mp3`;
  }

  // Authentic general Azkar tracks by Alafasy / Ghamdi
  return `https://download.quranicaudio.com/adhkar/mishary_rashid_al_afasy_morning_adhkar.mp3`;
}

interface AzkarSectionProps {
  soundEnabled: boolean;
  isEn?: boolean;
}

export default function AzkarSection({ soundEnabled, isEn = false }: AzkarSectionProps) {
  // Category selection
  const [selectedCatId, setSelectedCatId] = useState<string>(() => {
    return safeStorage.getItem('noor_azkar_selected_cat') || 'morning';
  });

  // Chosen Sheikh Reciter
  const [selectedReciterId, setSelectedReciterId] = useState<string>(() => {
    return safeStorage.getItem('noor_azkar_reciter_id') || 'alafasy';
  });

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Category Grid Modal Toggle
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [categoryModalFilter, setCategoryModalFilter] = useState<string>('');

  // Sheikh Reciter Chooser Modal Toggle
  const [isReciterModalOpen, setIsReciterModalOpen] = useState<boolean>(false);

  // Font Size Scaling for readability
  const [fontSizeLevel, setFontSizeLevel] = useState<'normal' | 'large' | 'xlarge'>(() => {
    return (safeStorage.getItem('noor_azkar_font_size') as any) || 'normal';
  });

  // Counter states: { [zekrId]: currentCompletedCount }
  const [countsState, setCountsState] = useState<{ [key: number]: number }>(() => {
    const saved = safeStorage.getItem('noor_azkar_counts_today');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const today = new Date().toISOString().substring(0, 10);
        if (parsed.date === today) return parsed.counts;
      } catch (e) {}
    }
    return {};
  });

  // Auto advance toggle
  const [autoAdvance, setAutoAdvance] = useState<boolean>(() => {
    return safeStorage.getItem('noor_azkar_auto_advance') === 'true';
  });

  // Favorites
  const [favorites, setFavorites] = useState<number[]>(() => {
    const stored = safeStorage.getItem('noor_favorite_azkar_ids');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Audio Playback State (Authentic Sheikh Recitations)
  const [activePlayingId, setActivePlayingId] = useState<number | 'category' | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const contentTopRef = useRef<HTMLDivElement>(null);

  const currentReciter = useMemo(() => {
    return SHEIKH_RECITERS.find(r => r.id === selectedReciterId) || SHEIKH_RECITERS[0];
  }, [selectedReciterId]);

  // Sync to safeStorage
  useEffect(() => {
    const today = new Date().toISOString().substring(0, 10);
    safeStorage.setItem('noor_azkar_counts_today', JSON.stringify({ date: today, counts: countsState }));
  }, [countsState]);

  useEffect(() => {
    safeStorage.setItem('noor_azkar_selected_cat', selectedCatId);
  }, [selectedCatId]);

  useEffect(() => {
    safeStorage.setItem('noor_azkar_reciter_id', selectedReciterId);
  }, [selectedReciterId]);

  useEffect(() => {
    safeStorage.setItem('noor_azkar_auto_advance', autoAdvance.toString());
  }, [autoAdvance]);

  useEffect(() => {
    safeStorage.setItem('noor_azkar_font_size', fontSizeLevel);
  }, [fontSizeLevel]);

  useEffect(() => {
    safeStorage.setItem('noor_favorite_azkar_ids', JSON.stringify(favorites));
  }, [favorites]);

  // Stop audio on unmount or category change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedCatId]);

  // Audio beep & vibration for counters
  const playHapticAndBeep = () => {
    if (soundEnabled && typeof window !== 'undefined') {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } catch (e) {}
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
  };

  // Play / Toggle Authentic Sheikh Audio for specific Zekr Item
  const handleToggleItemAudio = (item: ZekrItem) => {
    // If already playing this item, toggle pause/play
    if (activePlayingId === item.id) {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audioUrl = getItemAudioUrl(item, currentReciter);
    setIsLoadingAudio(true);
    setActivePlayingId(item.id);

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration || 0);
      setIsLoadingAudio(false);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setActivePlayingId(null);
      setAudioProgress(0);
    };

    audio.onerror = () => {
      setIsLoadingAudio(false);
      setIsPlaying(false);
      setActivePlayingId(null);
    };

    audio.play().then(() => {
      setIsPlaying(true);
      setIsLoadingAudio(false);
    }).catch(() => {
      setIsLoadingAudio(false);
      setIsPlaying(false);
      setActivePlayingId(null);
    });
  };

  // Play / Toggle Category Stream Audio
  const handleToggleCategoryAudio = () => {
    if (activePlayingId === 'category') {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const categoryUrls = CATEGORY_AUDIO_MAP[selectedCatId] || CATEGORY_AUDIO_MAP['morning'];
    const audioUrl = categoryUrls[selectedReciterId] || categoryUrls['alafasy'] || CATEGORY_AUDIO_MAP['morning']['alafasy'];

    setIsLoadingAudio(true);
    setActivePlayingId('category');

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration || 0);
      setIsLoadingAudio(false);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setActivePlayingId(null);
      setAudioProgress(0);
    };

    audio.onerror = () => {
      setIsLoadingAudio(false);
      setIsPlaying(false);
      setActivePlayingId(null);
    };

    audio.play().then(() => {
      setIsPlaying(true);
      setIsLoadingAudio(false);
    }).catch(() => {
      setIsLoadingAudio(false);
      setIsPlaying(false);
      setActivePlayingId(null);
    });
  };

  // Stop All Audio
  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoadingAudio(false);
    setActivePlayingId(null);
    setAudioProgress(0);
  };

  // Instant category switch handler
  const handleSelectCategory = (catId: string) => {
    handleStopAudio();
    setSelectedCatId(catId);
    setSearchQuery('');
    setIsCategoryModalOpen(false);

    // Center selected tab in pill bar
    setTimeout(() => {
      const tabEl = document.getElementById(`azkar-tab-${catId}`);
      if (tabEl) {
        tabEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 50);

    if (contentTopRef.current) {
      contentTopRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  };

  // Category navigation
  const currentCategoryIndex = useMemo(() => {
    return azkarData.findIndex(c => c.id === selectedCatId);
  }, [selectedCatId]);

  const handleNextCategory = () => {
    if (selectedCatId === 'favorites') {
      handleSelectCategory(azkarData[0].id);
      return;
    }
    if (currentCategoryIndex < azkarData.length - 1) {
      handleSelectCategory(azkarData[currentCategoryIndex + 1].id);
    } else {
      handleSelectCategory(azkarData[0].id);
    }
  };

  const handlePrevCategory = () => {
    if (selectedCatId === 'favorites') {
      handleSelectCategory(azkarData[azkarData.length - 1].id);
      return;
    }
    if (currentCategoryIndex > 0) {
      handleSelectCategory(azkarData[currentCategoryIndex - 1].id);
    } else {
      handleSelectCategory(azkarData[azkarData.length - 1].id);
    }
  };

  // Toggle favorite
  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Increment counter for a specific zekr
  const incrementCount = (item: ZekrItem, index: number, totalInCat: number) => {
    const current = countsState[item.id] || 0;
    const target = item.count;

    if (current < target) {
      const nextCount = current + 1;
      setCountsState(prev => ({ ...prev, [item.id]: nextCount }));
      playHapticAndBeep();

      if (nextCount >= target && autoAdvance && index + 1 < totalInCat) {
        setTimeout(() => {
          const nextEl = document.getElementById(`zekr-card-${index + 1}`);
          if (nextEl) {
            nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  };

  // Decrement counter
  const decrementCount = (item: ZekrItem) => {
    const current = countsState[item.id] || 0;
    if (current > 0) {
      setCountsState(prev => ({ ...prev, [item.id]: current - 1 }));
      playHapticAndBeep();
    }
  };

  // Reset counter for item
  const resetCount = (item: ZekrItem) => {
    setCountsState(prev => ({ ...prev, [item.id]: 0 }));
    playHapticAndBeep();
  };

  // Reset all in current category
  const resetCategoryCounts = (items: ZekrItem[]) => {
    const updated = { ...countsState };
    items.forEach(it => {
      updated[it.id] = 0;
    });
    setCountsState(updated);
    playHapticAndBeep();
  };

  // Copy Zekr text
  const handleCopy = (item: ZekrItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(item.text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Share Zekr
  const handleShare = (item: ZekrItem) => {
    if (navigator.share) {
      navigator.share({
        title: 'نور الإسلام - ذكر مبارك',
        text: `${item.text}\n\n${item.reward ? `الفضل: ${item.reward}\n` : ''}تطبيق نور الإسلام`
      }).catch(() => {});
    } else {
      handleCopy(item);
    }
  };

  // Icon selector helper
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun': return <Sun className="w-4 h-4" />;
      case 'Moon': return <Moon className="w-4 h-4" />;
      case 'Bed': return <Bed className="w-4 h-4" />;
      case 'Activity': return <Activity className="w-4 h-4" />;
      case 'Shield': return <Shield className="w-4 h-4" />;
      case 'Clock': return <Clock className="w-4 h-4" />;
      case 'Compass': return <Compass className="w-4 h-4" />;
      case 'RefreshCw': return <RefreshCw className="w-4 h-4" />;
      case 'CheckCircle': return <CheckCircle2 className="w-4 h-4" />;
      case 'Award': return <Award className="w-4 h-4" />;
      case 'Heart': return <Heart className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  // Filter items based on search query or selected category
  const filteredData = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const results: { catName: string; item: ZekrItem }[] = [];
      azkarData.forEach(cat => {
        cat.items.forEach(it => {
          if (it.text.toLowerCase().includes(q) || (it.reward && it.reward.toLowerCase().includes(q))) {
            results.push({ catName: cat.name, item: it });
          }
        });
      });
      return { isSearch: true, results };
    }

    if (selectedCatId === 'favorites') {
      const favItems: { catName: string; item: ZekrItem }[] = [];
      azkarData.forEach(cat => {
        cat.items.forEach(it => {
          if (favorites.includes(it.id)) {
            favItems.push({ catName: cat.name, item: it });
          }
        });
      });
      return { isSearch: false, isFav: true, categoryName: isEn ? 'My Favorites' : 'الأذكار المفضلة', items: favItems.map(f => f.item) };
    }

    const currentCat = azkarData.find(c => c.id === selectedCatId) || azkarData[0];
    return { isSearch: false, isFav: false, category: currentCat, categoryName: currentCat.name, items: currentCat.items };
  }, [searchQuery, selectedCatId, favorites, isEn]);

  // Progress metrics
  const currentItems = filteredData.items || [];
  const totalCategoryTarget = currentItems.reduce((acc, it) => acc + it.count, 0);
  const totalCategoryDone = currentItems.reduce((acc, it) => acc + Math.min(it.count, countsState[it.id] || 0), 0);
  const categoryProgressPercent = totalCategoryTarget > 0 ? Math.round((totalCategoryDone / totalCategoryTarget) * 100) : 0;

  // Filtered categories for the Category Grid Modal
  const modalCategoriesList = useMemo(() => {
    if (!categoryModalFilter.trim()) return azkarData;
    const q = categoryModalFilter.toLowerCase().trim();
    return azkarData.filter(c => c.name.toLowerCase().includes(q));
  }, [categoryModalFilter]);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Font size class mapping
  const getTextSizeClass = () => {
    switch (fontSizeLevel) {
      case 'large': return 'text-lg sm:text-2xl leading-loose sm:leading-loose';
      case 'xlarge': return 'text-xl sm:text-3xl leading-loose sm:leading-loose';
      default: return 'text-base sm:text-xl leading-loose sm:leading-loose';
    }
  };

  return (
    <div className="w-full space-y-5 text-right font-sans">
      
      {/* Anchor for top of content */}
      <div ref={contentTopRef} className="h-0 w-0 -mt-2" />

      {/* Main Top Header & Filter Controls */}
      <div className="bg-[#061214] border border-emerald-500/20 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

        {/* Title and Top Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
                <Shield className="w-5 h-5" />
              </span>
              <span>{isEn ? 'Hisn al-Muslim & Authentic Adhkar' : 'موسوعة الأذكار والأدعية وحصن المسلم الشامل'}</span>
            </h2>
            <p className="text-xs text-emerald-400 mt-1 font-medium">
              {isEn 
                ? 'Authentic audio recitations by renowned Sheikhs (No AI voices)' 
                : 'أصوات حقيقية ونقية لكبار الشيوخ والقراء المعتمدين (مشاري العفاسي، الغامدي، العجمي، المعيقلي...)'}
            </p>
          </div>

          {/* Action Bar: Reciter Picker, Font size, Auto advance & All Categories Overview */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            
            {/* Reciter Selector Button */}
            <button
              id="choose-sheikh-reciter-btn"
              onClick={() => setIsReciterModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#091B1F] hover:bg-[#0E272D] text-amber-300 border border-amber-400/30 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
              title="اختيار القارئ والشيخ"
            >
              <Headphones className="w-3.5 h-3.5 text-amber-400" />
              <span className="max-w-[130px] truncate">{currentReciter.name}</span>
            </button>

            {/* Font Size Toggle */}
            <div className="flex items-center bg-[#091B1F] rounded-xl border border-emerald-500/20 p-0.5 text-xs text-slate-300">
              <button
                onClick={() => setFontSizeLevel('normal')}
                className={`px-2 py-1 rounded-lg transition-all text-xs font-bold ${fontSizeLevel === 'normal' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                title="حجم خط عادي"
              >
                A
              </button>
              <button
                onClick={() => setFontSizeLevel('large')}
                className={`px-2 py-1 rounded-lg transition-all text-xs font-bold ${fontSizeLevel === 'large' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                title="حجم خط كبير"
              >
                A+
              </button>
              <button
                onClick={() => setFontSizeLevel('xlarge')}
                className={`px-2 py-1 rounded-lg transition-all text-xs font-bold ${fontSizeLevel === 'xlarge' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
                title="حجم خط كبير جداً"
              >
                A++
              </button>
            </div>

            {/* Auto Advance Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-[#091B1F] px-3 py-1.5 rounded-xl border border-emerald-500/20 text-xs text-slate-300 font-bold select-none">
              <input 
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="accent-emerald-500 w-3.5 h-3.5 rounded cursor-pointer"
              />
              <span>{isEn ? 'Auto' : 'انتقال تلقائي'}</span>
            </label>

            {/* Browse All 41 Categories Grid Button */}
            <button
              id="browse-all-azkar-categories-btn"
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{isEn ? 'Categories (41)' : 'الأقسام (٤١)'}</span>
            </button>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative z-10">
          <input
            id="azkar-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Search any Dhikr or Dua in all 41 categories...' : 'ابحث في كافة الأذكار والأدعية أو الفضائل عبر كافة الأقسام...'}
            className="w-full bg-[#030A0C] border border-emerald-500/25 rounded-2xl py-2.5 pr-10 pl-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400 transition-all font-medium shadow-inner"
          />
          <Search className="w-4 h-4 text-emerald-400 absolute top-1/2 right-3.5 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-0.5 rounded-md"
            >
              {isEn ? 'Clear' : 'مسح'}
            </button>
          )}
        </div>

        {/* Category Horizontal Quick-Switch Pill Bar (Instant Navigation) */}
        {!searchQuery && (
          <div 
            ref={tabsContainerRef}
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1 scroll-smooth relative z-10"
          >
            {/* Favorites Tab */}
            <button
              id="azkar-tab-favorites"
              onClick={() => handleSelectCategory('favorites')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 border select-none ${
                selectedCatId === 'favorites'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                  : 'bg-[#091B1F] text-slate-300 border-emerald-500/20 hover:border-emerald-500/40 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>{isEn ? 'Favorites' : 'المفضلة'} ({favorites.length})</span>
            </button>

            {/* All Azkar Categories Pills */}
            {azkarData.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`azkar-tab-${cat.id}`}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 border select-none ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-emerald-400 shadow-lg shadow-emerald-950/60 scale-105'
                      : 'bg-[#091B1F] text-slate-300 border-emerald-500/20 hover:border-emerald-500/40 hover:text-white'
                  }`}
                >
                  <span className={isSelected ? 'text-white' : 'text-emerald-400'}>
                    {getCategoryIcon(cat.icon)}
                  </span>
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/30 text-emerald-200' : 'bg-slate-800/80 text-slate-400'}`}>
                    {cat.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* Audio Player Bar for Current Category (Authentic Sheikh Recitation) */}
      {!filteredData.isSearch && (
        <div className="bg-gradient-to-r from-[#07191C] via-[#051315] to-[#07191C] border border-amber-400/30 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden">
          
          {/* Sheikh info & Play Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="category-audio-play-btn"
              onClick={handleToggleCategoryAudio}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg shrink-0 ${
                activePlayingId === 'category' && isPlaying
                  ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30 animate-pulse scale-105'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:scale-105'
              }`}
            >
              {isLoadingAudio && activePlayingId === 'category' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : activePlayingId === 'category' && isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-amber-300 font-kufi">
                  {isEn ? 'Listen to Full Adhkar' : `الاستماع إلى ${filteredData.categoryName}`}
                </span>
                {activePlayingId === 'category' && isPlaying && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 animate-pulse">
                    جاري التشغيل 🔊
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                بصوت: <strong className="text-emerald-300">{currentReciter.name}</strong>
              </p>
            </div>
          </div>

          {/* Player controls & progress scrubber */}
          <div className="flex items-center gap-3 w-full sm:w-80">
            {activePlayingId === 'category' && (
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {formatTime(currentTime)} / {formatTime(audioDuration)}
              </span>
            )}

            <div className="flex-1 h-2 bg-[#020708] rounded-full overflow-hidden border border-emerald-500/20">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${activePlayingId === 'category' ? audioProgress : 0}%` }}
              />
            </div>

            {activePlayingId !== null && (
              <button
                onClick={handleStopAudio}
                className="p-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 rounded-lg text-xs transition-all cursor-pointer"
                title="إيقاف الصوت"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => setIsReciterModalOpen(true)}
              className="text-[11px] text-emerald-400 hover:text-amber-300 hover:underline font-bold shrink-0"
            >
              تغيير الشيخ
            </button>
          </div>
        </div>
      )}

      {/* Active Category Header Banner with Prev / Next Navigation */}
      {!filteredData.isSearch && (
        <div className="bg-[#061214] border border-emerald-500/20 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-xl">
          
          {/* Previous Category Button */}
          <button
            onClick={handlePrevCategory}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#091B1F] hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            title={isEn ? 'Previous category' : 'القسم السابق'}
          >
            <ChevronRight className="w-4 h-4" />
            <span className="hidden sm:inline">{isEn ? 'Previous' : 'السابق'}</span>
          </button>

          {/* Current Category Title and Progress */}
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 text-sm sm:text-base font-black text-amber-300 font-kufi">
              <span>{filteredData.categoryName}</span>
              <span className="text-[11px] font-mono bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {currentItems.length} {isEn ? 'duas' : 'أذكار'}
              </span>
            </div>
            
            {/* Micro Progress */}
            {currentItems.length > 0 && (
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>{isEn ? 'Progress:' : 'إنجاز:'}</span>
                <span className="font-mono text-emerald-400 font-bold">{categoryProgressPercent}%</span>
                <span>({totalCategoryDone}/{totalCategoryTarget})</span>
              </div>
            )}
          </div>

          {/* Next Category Button */}
          <button
            onClick={handleNextCategory}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#091B1F] hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            title={isEn ? 'Next category' : 'القسم التالي'}
          >
            <span className="hidden sm:inline">{isEn ? 'Next' : 'التالي'}</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Progress Bar for Active Category */}
      {!filteredData.isSearch && currentItems.length > 0 && (
        <div className="w-full h-2 bg-[#020708] rounded-full overflow-hidden border border-emerald-500/20">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-500 rounded-full"
            style={{ width: `${categoryProgressPercent}%` }}
          />
        </div>
      )}

      {/* Zekr Cards Container with Smooth Animated Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filteredData.isSearch ? 'search-results' : selectedCatId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="space-y-4"
        >
          {/* Search Results Display */}
          {filteredData.isSearch && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 font-bold px-1 flex items-center justify-between">
                <span>{isEn ? `Found ${filteredData.results?.length} matching results:` : `تم العثور على (${filteredData.results?.length}) نتيجة مطابقة:`}</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-amber-400 hover:underline text-xs"
                >
                  {isEn ? 'Return to Categories' : 'العودة للتصنيفات'}
                </button>
              </div>

              {filteredData.results?.map(({ catName, item }, idx) => {
                const currentCount = countsState[item.id] || 0;
                const isCompleted = currentCount >= item.count;
                const isFav = favorites.includes(item.id);
                const isThisPlaying = activePlayingId === item.id && isPlaying;

                return (
                  <div 
                    key={`search-${item.id}`}
                    className={`bg-[#061214] border rounded-3xl p-5 transition-all shadow-lg relative overflow-hidden ${
                      isCompleted ? 'border-emerald-400/50 bg-emerald-950/10' : 'border-emerald-500/20'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-amber-400 mb-2">
                      📂 {catName}
                    </div>
                    <p className={`font-serif mb-3 select-text text-slate-100 ${getTextSizeClass()}`}>
                      {item.text}
                    </p>
                    {item.reward && (
                      <div className="p-3 rounded-xl bg-[#091B1F] border border-amber-400/20 text-xs text-amber-300 font-medium mb-3">
                        ✨ {item.reward}
                      </div>
                    )}
                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-emerald-500/15">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${isFav ? 'bg-amber-400/20 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                        <button
                          onClick={() => handleToggleItemAudio(item)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            isThisPlaying 
                              ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse' 
                              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                          }`}
                          title={`تلاوة بصوت ${currentReciter.name}`}
                        >
                          {isLoadingAudio && activePlayingId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isThisPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(item)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-all cursor-pointer"
                        >
                          {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      <button
                        onClick={() => incrementCount(item, idx, filteredData.results!.length)}
                        className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                          isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : null}
                        <span>{currentCount} / {item.count}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Category Items List */}
          {!filteredData.isSearch && currentItems.map((item, index) => {
            const currentCount = countsState[item.id] || 0;
            const isCompleted = currentCount >= item.count;
            const isFav = favorites.includes(item.id);
            const progress = Math.min(100, Math.round((currentCount / item.count) * 100));
            const isThisPlaying = activePlayingId === item.id && isPlaying;

            return (
              <div
                key={item.id}
                id={`zekr-card-${index}`}
                className={`bg-[#061214] border rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-xl relative overflow-hidden ${
                  isCompleted 
                    ? 'border-emerald-400/60 bg-emerald-950/15 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
                    : isThisPlaying
                    ? 'border-amber-400/50 bg-[#081B1F]'
                    : 'border-emerald-500/20 hover:border-emerald-500/40'
                }`}
              >
                {/* Completed Badge Glow */}
                {isCompleted && (
                  <div className="absolute top-0 left-0 bg-emerald-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-br-2xl flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Completed' : 'اكتمل الذكر المبارك'}</span>
                  </div>
                )}

                {/* Zekr Text */}
                <div 
                  onClick={() => incrementCount(item, index, currentItems.length)}
                  className="cursor-pointer select-none space-y-3"
                >
                  <p className={`font-serif pt-2 select-text text-slate-100 ${getTextSizeClass()}`}>
                    {item.text}
                  </p>

                  {/* Reward Benefit */}
                  {item.reward && (
                    <div className="p-3.5 rounded-2xl bg-[#091B1F] border border-amber-400/25 text-xs text-amber-300/95 font-medium flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{item.reward}</span>
                    </div>
                  )}
                </div>

                {/* Progress Line for the single Zekr */}
                <div className="w-full h-1.5 bg-[#020708] rounded-full overflow-hidden border border-emerald-500/10 my-4">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-r from-emerald-600 to-teal-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Interactive Toolbar & Smart Counter Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  
                  {/* Secondary Actions: Favorite, Authentic Sheikh Recitation Audio, Copy, Share, Decrement, Reset */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    
                    {/* Favorite button */}
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isFav 
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-xs' 
                          : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-amber-400'
                      }`}
                      title={isEn ? 'Favorite' : 'إضافة للمفضلة'}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>

                    {/* Authentic Sheikh Recitation Audio button */}
                    <button
                      onClick={() => handleToggleItemAudio(item)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                        isThisPlaying 
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/30 animate-pulse' 
                          : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-emerald-300'
                      }`}
                      title={`استمع لتلاوة الشيخ ${currentReciter.name}`}
                    >
                      {isLoadingAudio && activePlayingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                      ) : isThisPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span className="text-[10px] font-bold">إيقاف</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">{currentReciter.name.split(' ')[1]}</span>
                        </>
                      )}
                    </button>

                    {/* Copy button */}
                    <button
                      onClick={() => handleCopy(item)}
                      className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                      title={isEn ? 'Copy' : 'نسخ الذكر'}
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    {/* Share button */}
                    <button
                      onClick={() => handleShare(item)}
                      className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                      title={isEn ? 'Share' : 'مشاركة'}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Decrement Counter */}
                    <button
                      onClick={() => decrementCount(item)}
                      disabled={currentCount === 0}
                      className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-all cursor-pointer"
                      title={isEn ? 'Decrease count' : 'إنقاص مرة'}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    {/* Single Reset button */}
                    {currentCount > 0 && (
                      <button
                        onClick={() => resetCount(item)}
                        className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                        title={isEn ? 'Reset count' : 'إعادة ضبط'}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Primary Increment Counter Button */}
                  <button
                    id={`counter-btn-${item.id}`}
                    onClick={() => incrementCount(item, index, currentItems.length)}
                    className={`min-w-[130px] sm:min-w-[150px] py-2.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 shadow-emerald-500/20'
                        : 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 text-white hover:brightness-110'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isEn ? 'Done' : 'تم'} ({currentCount}/{item.count})</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span className="font-mono text-base">{currentCount}</span>
                        <span className="text-xs text-emerald-100 font-sans">/ {item.count}</span>
                      </>
                    )}
                  </button>

                </div>
              </div>
            );
          })}

          {/* Empty state for favorites */}
          {!filteredData.isSearch && selectedCatId === 'favorites' && currentItems.length === 0 && (
            <div className="p-8 text-center bg-[#061214] border border-emerald-500/20 rounded-3xl space-y-3">
              <Star className="w-10 h-10 text-amber-400/50 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">
                {isEn ? 'No Favorite Adhkar Yet' : 'لم تقم بإضافة أي أذكار إلى المفضلة بعد'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isEn 
                  ? 'Click the star icon on any Dhikr in other categories to add it to your quick access favorites.' 
                  : 'اضغط على رمز النجمة الموجود بجانب أي ذكر في الأقسام الأخرى لحفظه في قائمتك الخاصة.'}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sheikh Reciter Chooser Modal */}
      <AnimatePresence>
        {isReciterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#061214] border border-amber-400/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-right font-sans overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-kufi">
                      {isEn ? 'Select Reciter Sheikh' : 'اختيار الشيخ والقارئ للأذكار والتلاوة'}
                    </h3>
                    <p className="text-xs text-emerald-400">
                      {isEn ? 'Authentic recitations by Islamic scholars' : 'تسجيلات حقيقية نقية بدون أي ذكاء اصطناعي'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsReciterModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Reciters List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {SHEIKH_RECITERS.map((r) => {
                  const isSelected = selectedReciterId === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        handleStopAudio();
                        setSelectedReciterId(r.id);
                        setIsReciterModalOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer text-right ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg font-black'
                          : 'bg-[#091B1F] border-emerald-500/20 text-slate-200 hover:border-amber-400/40 hover:bg-[#0E272D]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-slate-950 text-amber-300' : 'bg-emerald-950 text-emerald-400'
                        }`}>
                          🎙️
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold font-kufi">{r.name}</p>
                          <p className={`text-[10px] ${isSelected ? 'text-slate-800' : 'text-slate-400'}`}>{r.subName}</p>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-slate-950" />}
                    </button>
                  );
                })}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Categories Overview Modal Dialog (41 Categories Index) */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#061214] border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-right font-sans overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-kufi">
                      {isEn ? 'All Adhkar & Duas Categories (41)' : 'فهرس أقسام الأذكار والأدعية الكامل (٤١ قسماً)'}
                    </h3>
                    <p className="text-xs text-emerald-400">
                      {isEn ? 'Click any category to open immediately' : 'اختر أي قسم للانتقال الفوري والمباشر إليه'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Filter in Modal */}
              <div className="relative">
                <input
                  type="text"
                  value={categoryModalFilter}
                  onChange={(e) => setCategoryModalFilter(e.target.value)}
                  placeholder={isEn ? 'Filter categories...' : 'ابحث عن اسم القسم (صباح، مساء، سفر، مطر، صلاة...)'}
                  className="w-full bg-[#030A0C] border border-emerald-500/25 rounded-2xl py-2 pr-9 pl-4 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400"
                />
                <Search className="w-3.5 h-3.5 text-emerald-400 absolute top-1/2 right-3 -translate-y-1/2" />
              </div>

              {/* Categories Grid List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Favorites Quick Option */}
                  <button
                    onClick={() => handleSelectCategory('favorites')}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      selectedCatId === 'favorites'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                        : 'bg-[#091B1F] border-emerald-500/20 text-slate-300 hover:border-amber-400/40 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="text-xs font-bold">{isEn ? 'My Favorites' : 'الأذكار المفضلة'}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 font-mono">
                      {favorites.length}
                    </span>
                  </button>

                  {/* 41 Categories */}
                  {modalCategoriesList.map((cat) => {
                    const isSelected = selectedCatId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer text-right ${
                          isSelected
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-emerald-400 shadow-md font-black'
                            : 'bg-[#091B1F] border-emerald-500/20 text-slate-300 hover:border-emerald-500/50 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={isSelected ? 'text-white' : 'text-emerald-400'}>
                            {getCategoryIcon(cat.icon)}
                          </span>
                          <span className="text-xs font-bold">{cat.name}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          isSelected ? 'bg-black/30 text-emerald-200' : 'bg-slate-900 text-slate-400'
                        }`}>
                          {cat.items.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
