/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Star, 
  X, 
  BookOpen, 
  Shield, 
  Heart, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink,
  Flame,
  Award
} from 'lucide-react';
import { quranMetadata } from '../data/quran_metadata';
import { azkarData } from '../data/azkar';
import { hadithsData } from '../data/hadith';
import { safeStorage } from '../utils/safeStorage';

interface UnifiedSearchFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (sectionId: string) => void;
  isEn?: boolean;
}

export default function UnifiedSearchFavoritesModal({
  isOpen,
  onClose,
  onNavigateSection,
  isEn = false
}: UnifiedSearchFavoritesModalProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');
  const [query, setQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Favorites state from safeStorage
  const favoriteAzkarIds = useMemo(() => {
    try {
      const stored = safeStorage.getItem('noor_favorite_azkar_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [isOpen, activeTab]);

  const favoriteAyahKeys = useMemo(() => {
    try {
      const stored = safeStorage.getItem('noor_quran_fav_ayahs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [isOpen, activeTab]);

  // Compiled search results across all modules
  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();

    // 1. Quran matches
    const matchedSurahs = quranMetadata.filter(s => 
      s.name.includes(q) || s.englishName.toLowerCase().includes(q) || s.number.toString() === q
    );

    // 2. Azkar matches
    const matchedAzkar: { catName: string; text: string; reward?: string; id: number }[] = [];
    azkarData.forEach(cat => {
      cat.items.forEach(item => {
        if (item.text.toLowerCase().includes(q) || (item.reward && item.reward.toLowerCase().includes(q))) {
          matchedAzkar.push({
            catName: cat.name,
            text: item.text,
            reward: item.reward,
            id: item.id
          });
        }
      });
    });

    // 3. Hadith matches
    const matchedHadiths = hadithsData.filter(h => 
      h.text.toLowerCase().includes(q) || h.narrator.toLowerCase().includes(q) || (h.chapter && h.chapter.toLowerCase().includes(q))
    );

    return {
      surahs: matchedSurahs,
      azkar: matchedAzkar,
      hadiths: matchedHadiths,
      total: matchedSurahs.length + matchedAzkar.length + matchedHadiths.length
    };
  }, [query]);

  // Compiled favorites
  const favoriteAzkarItems = useMemo(() => {
    const list: { catName: string; text: string; id: number }[] = [];
    azkarData.forEach(cat => {
      cat.items.forEach(item => {
        if (favoriteAzkarIds.includes(item.id)) {
          list.push({ catName: cat.name, text: item.text, id: item.id });
        }
      });
    });
    return list;
  }, [favoriteAzkarIds]);

  const removeAyahFavorite = (key: string) => {
    const updated = favoriteAyahKeys.filter((x: string) => x !== key);
    safeStorage.setItem('noor_quran_fav_ayahs', JSON.stringify(updated));
    setActiveTab('favorites');
  };

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const removeAzkarFavorite = (id: number) => {
    const updated = favoriteAzkarIds.filter((x: number) => x !== id);
    safeStorage.setItem('noor_favorite_azkar_ids', JSON.stringify(updated));
    setActiveTab('favorites'); // trigger re-render
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md pt-[max(calc(env(safe-area-inset-top,0px)+6px),12px)] pb-[max(calc(env(safe-area-inset-bottom,0px)+6px),12px)]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-[#061214] border border-emerald-500/30 rounded-3xl p-5 sm:p-7 text-right text-white shadow-2xl space-y-5 max-h-[85vh] flex flex-col font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4 shrink-0">
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-[#030A0C] border border-emerald-500/20 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                activeTab === 'search'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-emerald-400 shadow-md'
                  : 'bg-[#091B1F] text-slate-300 border-emerald-500/20 hover:border-emerald-500/40'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isEn ? 'Universal Search' : 'البحث الشامل'}</span>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                activeTab === 'favorites'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-[#091B1F] text-slate-300 border-emerald-500/20 hover:border-emerald-500/40'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{isEn ? 'Favorites' : 'المفضلة الموحدة'}</span>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full">
                {favoriteAzkarItems.length + favoriteAyahKeys.length}
              </span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {activeTab === 'search' ? (
            <div className="space-y-4">
              
              {/* Search Bar Input */}
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isEn ? 'Search across Quran, 41 Azkar categories, Hadith...' : 'ابحث في القرآن الكريم، كافة الأذكار والأدعية، والأحاديث...'}
                  className="w-full bg-[#030A0C] border border-emerald-500/30 rounded-2xl py-3 pr-11 pl-4 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-400 font-medium"
                  autoFocus
                />
                <Search className="w-5 h-5 text-emerald-400 absolute top-1/2 right-3.5 -translate-y-1/2" />
              </div>

              {/* No Query Default Prompt */}
              {!query.trim() && (
                <div className="text-center py-10 space-y-3">
                  <Sparkles className="w-10 h-10 text-amber-400/50 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-300">
                    {isEn ? 'Instant Islamic Search Engine' : 'محرك البحث الإسلامي الموحد'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {isEn 
                      ? 'Type any keyword like "الصباح", "الكهف", "استغفار", "الشفاء", "سفر" to search across all sections instantly.' 
                      : 'اكتب أي كلمة مثل "الصباح"، "الكهف"، "الرزق"، "الاستغفار"، "الشفاء"، "السفر" للبحث الفوري في كافة الأقسام.'}
                  </p>
                </div>
              )}

              {/* Search Results Display */}
              {searchResults && (
                <div className="space-y-5">
                  <div className="text-xs text-emerald-300 font-bold">
                    {isEn ? `Found ${searchResults.total} matches:` : `تم العثور على (${searchResults.total}) نتيجة:`}
                  </div>

                  {/* Quran Results */}
                  {searchResults.surahs.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                        <BookOpen className="w-4 h-4" />
                        <span>سور القرآن الكريم ({searchResults.surahs.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {searchResults.surahs.map(s => (
                          <div 
                            key={s.number}
                            onClick={() => {
                              onNavigateSection('quran');
                              onClose();
                            }}
                            className="p-3 bg-[#091B1F] border border-emerald-500/20 hover:border-emerald-400 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
                          >
                            <span className="text-sm font-black text-white">سورة {s.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">رقم {s.number} • {s.numberOfAyahs} آيات</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Azkar Results */}
                  {searchResults.azkar.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                        <Shield className="w-4 h-4" />
                        <span>الأذكار والأدعية ({searchResults.azkar.length})</span>
                      </div>
                      <div className="space-y-2.5">
                        {searchResults.azkar.map((az, idx) => (
                          <div 
                            key={`az-${idx}`}
                            className="p-4 bg-[#091B1F] border border-emerald-500/20 rounded-2xl space-y-2"
                          >
                            <div className="text-[11px] font-bold text-amber-400">📂 {az.catName}</div>
                            <p className="text-xs sm:text-sm text-slate-100 font-serif leading-relaxed select-text">{az.text}</p>
                            {az.reward && <p className="text-[11px] text-amber-300 font-medium">✨ {az.reward}</p>}
                            <div className="flex justify-end gap-2 pt-1 border-t border-emerald-500/10">
                              <button
                                onClick={() => handleCopy(`az-${idx}`, az.text)}
                                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                              >
                                {copiedId === `az-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedId === `az-${idx}` ? 'تم النسخ' : 'نسخ'}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hadith Results */}
                  {searchResults.hadiths.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-black text-teal-300">
                        <Award className="w-4 h-4" />
                        <span>الأحاديث النبوية الشريفة ({searchResults.hadiths.length})</span>
                      </div>
                      <div className="space-y-2.5">
                        {searchResults.hadiths.map((h, idx) => (
                          <div 
                            key={`hd-${idx}`}
                            className="p-4 bg-[#091B1F] border border-emerald-500/20 rounded-2xl space-y-2"
                          >
                            <div className="text-[11px] font-bold text-teal-300">📜 {h.source} - {h.narrator}</div>
                            <p className="text-xs sm:text-sm text-slate-100 font-serif leading-relaxed select-text">{h.text}</p>
                            <div className="flex justify-end gap-2 pt-1 border-t border-emerald-500/10">
                              <button
                                onClick={() => handleCopy(`hd-${idx}`, h.text)}
                                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                              >
                                {copiedId === `hd-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedId === `hd-${idx}` ? 'تم النسخ' : 'نسخ'}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          ) : (
            /* Favorites Tab */
            <div className="space-y-4">
              <div className="text-xs text-amber-300 font-bold">
                {isEn ? 'Your Saved Items in Favorites:' : 'العناصر المحفوظة في المفضلة الخاصة بك:'}
              </div>

              {favoriteAzkarItems.length === 0 && favoriteAyahKeys.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Star className="w-10 h-10 text-amber-400/40 mx-auto" />
                  <p className="text-xs text-slate-400">
                    {isEn ? 'You have no saved favorites yet.' : 'لم تقم بحفظ أي آيات أو أذكار في المفضلة بعد.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Saved Quran Ayahs */}
                  {favoriteAyahKeys.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{isEn ? `Saved Quran Verses (${favoriteAyahKeys.length})` : `آيات القرآن المحفوظة (${favoriteAyahKeys.length})`}</span>
                      </div>
                      {favoriteAyahKeys.map((key: string) => {
                        const [sNum, aNum] = key.split(':');
                        const sMeta = quranMetadata.find(m => m.number === Number(sNum));
                        return (
                          <div 
                            key={`fav-ayah-${key}`}
                            className="p-4 bg-[#091B1F] border border-amber-400/20 rounded-2xl space-y-2"
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                              <span>📖 سورة {sMeta ? sMeta.name : sNum} - الآية ({aNum})</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    onNavigateSection('quran');
                                    onClose();
                                  }}
                                  className="text-emerald-400 hover:text-emerald-300 text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/20 cursor-pointer flex items-center gap-1"
                                >
                                  <span>فتح السورة</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={() => removeAyahFavorite(key)}
                                  className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                                  title="حذف من المفضلة"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-slate-300 font-sans">
                              {isEn ? `Saved verse from Surah ${sMeta?.englishName || sNum} (Ayah ${aNum}).` : `آية كريمة محفوظة من سورة ${sMeta?.name || sNum} برقم (${aNum}).`}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Saved Azkar Items */}
                  {favoriteAzkarItems.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        <span>{isEn ? `Saved Adhkar (${favoriteAzkarItems.length})` : `الأذكار المحفوظة (${favoriteAzkarItems.length})`}</span>
                      </div>
                      {favoriteAzkarItems.map((item) => (
                        <div 
                          key={`fav-az-${item.id}`}
                          className="p-4 bg-[#091B1F] border border-amber-400/20 rounded-2xl space-y-2"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                            <span>📂 {item.catName}</span>
                            <button
                              onClick={() => removeAzkarFavorite(item.id)}
                              className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                              title="حذف من المفضلة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-100 font-serif leading-relaxed select-text">{item.text}</p>
                          <div className="flex justify-end gap-2 pt-1 border-t border-emerald-500/10">
                            <button
                              onClick={() => handleCopy(`fav-${item.id}`, item.text)}
                              className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              {copiedId === `fav-${item.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedId === `fav-${item.id}` ? 'تم النسخ' : 'نسخ'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
