/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    // Navigation & Tabs
    appName: 'نور الإسلام',
    prayerTimes: 'مواقيت الصلاة',
    quran: 'القرآن الكريم',
    azkar: 'الأذكار والتحصين',
    tasbih: 'السبحة الإلكترونية',
    qibla: 'اتجاه القبلة',
    hadith: 'الأحاديث النبوية',
    khatma: 'ختمة القرآن',
    ruqyah: 'الرقية الشرعية',
    aiAssistant: 'المساعد الإسلامي الذكي',

    // Header & Subtitles
    verseOfTheDay: 'آية اليوم - نفحات روحانية',
    hijriDateLabel: 'الهجري',
    gregorianDateLabel: 'الميلادي',
    settings: 'الإعدادات',
    darkMode: 'الوضع الليلي',
    lightMode: 'الوضع النهاري',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',

    // Prayer Names
    fajr: 'الفجر',
    sunrise: 'الشروق',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',

    // Prayer Section
    nextPrayer: 'الصلاة القادمة',
    remainingTime: 'الوقت المتبقي',
    completedPrayer: 'أديتها (تم التوثيق)',
    markAsPrayed: 'تحديد كـ أُدّيت',
    sunriseNotice: 'وقت الشروق (كراهة الصلاة)',
    dailyChecklist: 'جدول متابعة الصلوات والسنن اليومية',
    prayerTimesTitle: 'مواقيت الصلاة اليومية',
    calculationMethod: 'طريقة الحساب',

    // Quran Section
    searchSurahPlaceholder: 'ابحث عن سورة أو رقم...',
    meccan: 'مكية',
    medinan: 'مدنية',
    ayahs: 'آيات',
    instantRead: 'قراءة فورية',
    fontSize: 'حجم الخط',
    selectReciter: 'اختر القارئ',
    playAudio: 'تشغيل',
    pauseAudio: 'إيقاف',
    tafsirTitle: 'التفسير الميسر',
    surah: 'سورة',

    // Azkar Section
    morningAzkar: 'أذكار الصباح',
    eveningAzkar: 'أذكار المساء',
    sleepAzkar: 'أذكار النوم',
    wakeupAzkar: 'أذكار الاستيقاظ',
    prayerAzkar: 'أذكار بعد الصلاة',
    fortificationAzkar: 'أدعية التحصين',
    repeatTarget: 'التكرار المطلوب',
    resetCount: 'إعادة الضبط',

    // Tasbih Section
    tasbihCounter: 'عداد التسبيح والذكر',
    tasbihCount: 'عدد التكرارات الكلي',
    tapToPraise: 'اضغط للتسبيح والذكر',
    reset: 'تصفير العداد',
    customPhrase: 'إضافة ذكر جديد',

    // Qibla Section
    qiblaTitle: 'تحديد اتجاه القبلة',
    rotateInstruction: 'قم بلف جهازك باتجاه الكعبة المشرفة',
    kaabaDistance: 'المسافة إلى الكعبة',

    // Hadith Section
    fortyHadith: 'الأربعين النووية',
    sahihBukhari: 'صحيح البخاري',
    sahihMuslim: 'صحيح مسلم',
    narrator: 'الراوي',

    // Khatma Section
    khatmaTitle: 'خطة ختم القرآن الكريم',
    targetDays: 'مدة الختمة (أيام)',
    dailyTarget: 'الصفحات اليومية',
    progress: 'نسبة الإنجاز',

    // Settings Modal
    appSettingsTitle: 'إعدادات التطبيق',
    selectLanguage: 'لغة التطبيق',
    selectTheme: 'المظهر والوضع الليلي',
    selectCity: 'المدينة والدولة',
    soundAlerts: 'التنبيهات والأذان',
    saveSettings: 'حفظ الإعدادات',
    close: 'إغلاق',
  },
  en: {
    // Navigation & Tabs
    appName: 'Noor Al-Islam',
    prayerTimes: 'Prayer Times',
    quran: 'Holy Quran',
    azkar: 'Azkar & Supplications',
    tasbih: 'Digital Tasbih',
    qibla: 'Qibla Direction',
    hadith: 'Prophetic Hadiths',
    khatma: 'Quran Khatmah',
    ruqyah: 'Sharia Ruqyah',
    aiAssistant: 'AI Islamic Assistant',

    // Header & Subtitles
    verseOfTheDay: 'Verse of the Day - Spiritual Reflections',
    hijriDateLabel: 'Hijri',
    gregorianDateLabel: 'Gregorian',
    settings: 'Settings',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',

    // Prayer Names
    fajr: 'Fajr',
    sunrise: 'Sunrise',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',

    // Prayer Section
    nextPrayer: 'Next Prayer',
    remainingTime: 'Time Remaining',
    completedPrayer: 'Prayed (Completed)',
    markAsPrayed: 'Mark as Prayed',
    sunriseNotice: 'Sunrise Time (Disliked for Prayer)',
    dailyChecklist: 'Daily Prayer & Sunnah Tracker',
    prayerTimesTitle: 'Daily Prayer Times',
    calculationMethod: 'Calculation Method',

    // Quran Section
    searchSurahPlaceholder: 'Search surah name or number...',
    meccan: 'Meccan',
    medinan: 'Medinan',
    ayahs: 'Verses',
    instantRead: 'Instant Read',
    fontSize: 'Font Size',
    selectReciter: 'Select Reciter',
    playAudio: 'Play',
    pauseAudio: 'Pause',
    tafsirTitle: 'Tafsir (Exegesis)',
    surah: 'Surah',

    // Azkar Section
    morningAzkar: 'Morning Azkar',
    eveningAzkar: 'Evening Azkar',
    sleepAzkar: 'Sleep Azkar',
    wakeupAzkar: 'Wake-up Azkar',
    prayerAzkar: 'Post-Prayer Azkar',
    fortificationAzkar: 'Protection Supplications',
    repeatTarget: 'Target Count',
    resetCount: 'Reset Count',

    // Tasbih Section
    tasbihCounter: 'Tasbih & Dhikr Counter',
    tasbihCount: 'Total Count',
    tapToPraise: 'Tap to Praise & Remember Allah',
    reset: 'Reset Counter',
    customPhrase: 'Add Custom Dhikr',

    // Qibla Section
    qiblaTitle: 'Find Qibla Direction',
    rotateInstruction: 'Rotate your device until arrow points to the Holy Kaaba',
    kaabaDistance: 'Distance to Kaaba',

    // Hadith Section
    fortyHadith: 'Forty Nawawi',
    sahihBukhari: 'Sahih Al-Bukhari',
    sahihMuslim: 'Sahih Muslim',
    narrator: 'Narrator',

    // Khatma Section
    khatmaTitle: 'Quran Khatmah Planner',
    targetDays: 'Duration (Days)',
    dailyTarget: 'Daily Pages',
    progress: 'Completion Progress',

    // Settings Modal
    appSettingsTitle: 'Application Settings',
    selectLanguage: 'App Language',
    selectTheme: 'Appearance & Theme',
    selectCity: 'Country & City',
    soundAlerts: 'Notifications & Adhan',
    saveSettings: 'Save Settings',
    close: 'Close',
  }
};

export function getTranslation(lang: Language = 'ar') {
  return translations[lang] || translations.ar;
}
