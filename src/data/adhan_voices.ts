/*
 * Audio metadata for the bundled adhan.
 * The shipped recording is the CC0/Public Domain "Beautiful adhan" file
 * documented in adhan-source-notes.md. It is intentionally not attributed to
 * a named sheikh without a verifiable source.
 */
export interface AdhanVoiceOption {
  id: string;
  nameAr: string;
  nameEn: string;
  muezzin: string;
  description: string;
  audioUrls: string[];
  nativeFile: string;
}

export const BUNDLED_ADHAN_ID = 'bundled-cc0';
export const BUNDLED_ADHAN_FILE = 'adhan.wav';

export const ADHAN_VOICES_LIST: AdhanVoiceOption[] = [
  {
    id: BUNDLED_ADHAN_ID,
    nameAr: 'الأذان المرفق (يعمل دون إنترنت)',
    nameEn: 'Bundled Adhan (Offline)',
    muezzin: 'تسجيل مرخّص CC0 / Public Domain',
    description: 'تسجيل أذان مرفق وموثّق المصدر، مناسب لتشغيل التطبيق والإشعارات دون اتصال.',
    audioUrls: [],
    nativeFile: BUNDLED_ADHAN_FILE,
  },
];
