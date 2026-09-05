/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { 
  Home, 
  BookOpen, 
  Heart, 
  Shield, 
  Clock, 
  BookOpenCheck, 
  Sparkles, 
  Compass, 
  Bot, 
  HardDrive,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  avatarUrl?: string;
  colorClass?: string;
}

interface CategoryBarProps {
  activeSection: string | null;
  onSelectSection: (sectionId: string | null) => void;
  sections: CategoryItem[];
  isEn?: boolean;
}

export default function CategoryBar({
  activeSection,
  onSelectSection,
  sections,
  isEn = false
}: CategoryBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active category into view smoothly
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeBtn = scrollContainerRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeSection]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 240;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div 
      id="horizontal-category-bar-wrapper"
      className="sticky top-[var(--app-main-top)] z-35 bg-white/90 dark:bg-[#080E10]/95 backdrop-blur-md border-b border-[#EBE7DF] dark:border-[#142225] py-2 px-2.5 sm:py-2.5 sm:px-6 shadow-xs select-none transition-all"
    >
      <div className="max-w-7xl mx-auto min-w-0 flex items-center gap-1.5 sm:gap-2 relative">
        
        {/* Optional scroll button left */}
        <button
          onClick={() => scroll(isEn ? 'left' : 'right')}
          className="hidden md:flex p-1.5 rounded-full bg-[#FAF8F5] dark:bg-[#0F1C1E] border border-[#E9E1D2]/60 dark:border-[#1E3336]/60 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-[#152B2E] transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
          title={isEn ? "Scroll left" : "تمرير لليمين"}
          aria-label="Scroll left"
        >
          <ChevronRight className={`w-4 h-4 ${isEn ? 'rotate-180' : ''}`} />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={scrollContainerRef}
          id="horizontal-category-scroll-container"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* 1. Home Chip */}
          <button
            id="cat-chip-home"
            data-active={activeSection === null}
            onClick={() => onSelectSection(null)}
            className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer border active:scale-95 ${
              activeSection === null
                ? 'bg-emerald-700 text-white border-emerald-600 shadow-md shadow-emerald-700/20 font-black scale-[1.02]'
                : 'bg-[#FAF8F5]/80 dark:bg-[#0B1516]/80 text-slate-700 dark:text-slate-300 border-[#EBE7DF] dark:border-[#18282B] hover:bg-emerald-50 dark:hover:bg-[#122427] hover:border-emerald-500/30'
            }`}
          >
            <div className={`w-5 h-5 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${
              activeSection === null ? 'border-amber-400/50 bg-amber-400/20 text-white' : 'border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400'
            }`}>
              <Home className="w-3.5 h-3.5" />
            </div>
            <span className="font-kufi">{isEn ? 'Home' : 'الرئيسية'}</span>
          </button>

          {/* 2. Dynamic Section Chips */}
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                id={`cat-chip-${sec.id}`}
                data-active={isActive}
                onClick={() => onSelectSection(sec.id)}
                className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer border active:scale-95 ${
                  isActive
                    ? 'bg-emerald-700 text-white border-emerald-600 shadow-md shadow-emerald-700/20 font-black scale-[1.02]'
                    : 'bg-[#FAF8F5]/80 dark:bg-[#0B1516]/80 text-slate-700 dark:text-slate-300 border-[#EBE7DF] dark:border-[#18282B] hover:bg-emerald-50 dark:hover:bg-[#122427] hover:border-emerald-500/30'
                }`}
              >
                {sec.avatarUrl ? (
                  <div className={`w-6 h-6 rounded-full overflow-hidden shrink-0 border transition-transform ${
                    isActive ? 'border-amber-300 ring-2 ring-amber-300/40 scale-105' : 'border-emerald-600/30 shadow-xs'
                  }`}>
                    <img 
                      src={sec.avatarUrl} 
                      alt={sec.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className={`p-1 rounded-lg shrink-0 ${isActive ? 'bg-white/20 text-white' : 'text-emerald-700 dark:text-emerald-400'}`}>
                    {sec.icon}
                  </div>
                )}
                <span className="font-kufi">{sec.title}</span>
              </button>
            );
          })}
        </div>

        {/* Optional scroll button right */}
        <button
          onClick={() => scroll(isEn ? 'right' : 'left')}
          className="hidden md:flex p-1.5 rounded-full bg-[#FAF8F5] dark:bg-[#0F1C1E] border border-[#E9E1D2]/60 dark:border-[#1E3336]/60 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-[#152B2E] transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
          title={isEn ? "Scroll right" : "تمرير لليسار"}
          aria-label="Scroll right"
        >
          <ChevronLeft className={`w-4 h-4 ${isEn ? 'rotate-180' : ''}`} />
        </button>

      </div>
    </div>
  );
}
