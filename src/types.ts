/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppSettings {
  theme: 'light' | 'dark';
  language?: 'ar' | 'en';
  calculationMethod: 'BahrainOfficial' | 'UmmAlQura' | 'MWL' | 'ISNA' | 'Egypt' | 'GulfRegion';
  latitude: number | null;
  longitude: number | null;
  country?: string;
  city: string;
  adhanReminder: boolean;
  prePrayerReminder?: boolean; // Reminder before prayer (e.g. 5 mins before)
  prePrayerMinutes?: number; // 5, 10, 15, or 20 minutes
  iqamaReminder?: boolean; // Reminder after adhan for iqama & sunnah (e.g. 10 mins after)
  iqamaMinutes?: number; // 5, 10, 15, or 20 minutes
  visualAdhanAlert: boolean; // visual pop-up alert with religious tips/supplications
  azkarReminder: boolean;
  morningAzkarReminder?: boolean;
  eveningAzkarReminder?: boolean;
  fridayKahfReminder?: boolean;
  tahajjudReminder?: boolean;
  soundEnabled: boolean;
  customAdhanSound: string; // 'default' or custom tone
  selectedAdhanVoice?: string; // 'makkah' | 'madinah' | 'alaqsa' | 'qatami' | 'abdulbasit' | 'hadrawi'
  appName?: string;
  dedicationText?: string;
  developerName?: string;
  snapchatUrl?: string;
  appLogoUrl?: string;
  headerBgUrl?: string;
}

export interface PrayerTime {
  name: string;
  arabicName: string;
  time: string; // HH:MM
  isPassed: boolean;
  isNext: boolean;
}

export interface PrayerStatus {
  date: string; // YYYY-MM-DD
  prayers: {
    fajr: boolean;
    sunrise: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
}

export interface ZekrItem {
  id: number;
  text: string;
  count: number;
  currentCount?: number;
  source?: string;
  reward?: string;
}

export interface AzkarCategory {
  id: string;
  name: string;
  icon: string;
  items: ZekrItem[];
}

export interface HadithItem {
  id: number;
  text: string;
  narrator: string;
  source: 'البخاري' | 'مسلم';
  chapter?: string;
}

export interface KhatmaPlan {
  id: string;
  name: string;
  targetDays: number;
  startDate: string;
  totalPages: number; // usually 604
  readPages: number[]; // Array of read page numbers
  dailyTargetPages: number;
}

export interface SurahMetadata {
  number: number;
  name: string;
  englishName: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
}

export interface Ayah {
  number: number;
  text: string;
  translation?: string;
  tafsir?: string;
}

export interface SurahDetail extends SurahMetadata {
  ayahs: Ayah[];
  tafsirSummary?: string;
}

export interface TasbihPhrase {
  id: string;
  text: string;
  count: number;
}
