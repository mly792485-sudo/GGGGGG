/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Search, Copy, CheckCircle, Quote } from 'lucide-react';
import { hadithsData } from '../data/hadith';

interface HadithSectionProps {
  isEn?: boolean;
}

export default function HadithSection({ isEn = false }: HadithSectionProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, text: string, narrator: string, source: string) => {
    const shareText = isEn
      ? `${text}\n[Narrator: ${narrator} - Source: Sahih ${source}]\nCopied from Noor Al-Islam App`
      : `${text}\n[الراوي: ${narrator} - المصدر: صحيح ${source}]\nتم النسخ من تطبيق نور الإسلام`;
    navigator.clipboard.writeText(shareText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHadiths = hadithsData.filter((hadith) => {
    const matchesSearch =
      hadith.text.includes(searchQuery) ||
      hadith.narrator.includes(searchQuery) ||
      (hadith.chapter && hadith.chapter.includes(searchQuery));

    const matchesSource =
      selectedSource === 'all' ||
      (selectedSource === 'bukhari' && hadith.source === 'البخاري') ||
      (selectedSource === 'muslim' && hadith.source === 'مسلم');

    return matchesSearch && matchesSource;
  });

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 text-right font-sans shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/40">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </span>
          <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{isEn ? 'Noble Prophetic Hadiths' : 'الأحاديث النبوية الشريفة'}</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isEn ? 'Selected authentic Hadiths from Sahih Al-Bukhari & Sahih Muslim' : 'مقتطفات مختارة من صحيحي البخاري ومسلم'}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            id="hadith-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? "Search by keyword, topic, or narrator..." : "ابحث عن حديث، كلمة مفتاحية، أو راوي..."}
            className="w-full pr-10 pl-4 py-2 text-xs bg-emerald-50/40 dark:bg-slate-950 border border-emerald-100 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="flex gap-1.5">
          {[
            { id: 'all', name: isEn ? 'All' : 'الكل' },
            { id: 'bukhari', name: isEn ? 'Bukhari' : 'البخاري' },
            { id: 'muslim', name: isEn ? 'Muslim' : 'مسلم' },
          ].map((src) => (
            <button
              key={src.id}
              id={`hadith-filter-${src.id}`}
              onClick={() => setSelectedSource(src.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                selectedSource === src.id
                  ? 'bg-emerald-700 border-emerald-700 text-white'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-100/30 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              {src.name}
            </button>
          ))}
        </div>
      </div>

      {/* Hadith list */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {filteredHadiths.length > 0 ? (
          filteredHadiths.map((hadith) => (
            <div
              key={hadith.id}
              className="p-5 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100/40 dark:border-slate-850 rounded-2xl relative overflow-hidden group space-y-4"
            >
              {/* Decorative big quote icon */}
              <Quote className="absolute left-4 top-4 w-12 h-12 text-slate-100 dark:text-slate-900 pointer-events-none transform -scale-x-100 opacity-60" />

              {/* Hadith Text */}
              <p className="text-[14px] font-medium text-emerald-950 dark:text-emerald-100 leading-relaxed pr-2 border-r-2 border-emerald-500 font-sans select-text">
                {hadith.text}
              </p>

              {/* Narrator & Citation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-2 border-t border-slate-100/10">
                <div className="space-y-1">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    الراوي:{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {hadith.narrator}
                    </strong>
                  </span>
                  {hadith.chapter && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      الباب: {hadith.chapter}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-full font-bold text-[10px]">
                    صحيح {hadith.source}
                  </span>

                  <button
                    id={`copy-hadith-btn-${hadith.id}`}
                    onClick={() =>
                      handleCopy(hadith.id, hadith.text, hadith.narrator, hadith.source)
                    }
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 hover:shadow-xs cursor-pointer"
                    title="نسخ الحديث الشريف"
                  >
                    {copiedId === hadith.id ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] text-emerald-600 font-bold">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">نسخ ومشاركة</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
            <p className="text-sm">لم نجد أي حديث مطابق لبحثك.</p>
            <p className="text-xs">جرب البحث بكلمات أخرى مثل "عمل"، "صلاة"، "إيمان".</p>
          </div>
        )}
      </div>
    </div>
  );
}
