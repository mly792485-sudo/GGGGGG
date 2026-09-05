export interface QuranReciter {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  tag: string;
  riwayah: string;
  url: string;
  fallbackUrl: string;
}

export const QURAN_RECITERS: QuranReciter[] = [
  // أئمة الحرم المكي والمسجد النبوي وكبار قراء المملكة العربية السعودية
  {
    id: 'sudais',
    name: 'عبد الرحمن السديس',
    nameEn: 'Abdul Rahman Al-Sudais',
    country: 'السعودية (إمام الحرم المكي)',
    tag: 'حرم مكي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server11.mp3quran.net/sds/',
    fallbackUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/'
  },
  {
    id: 'shuraym',
    name: 'سعود بن إبراهيم الشريم',
    nameEn: 'Saud Al-Shuraim',
    country: 'السعودية (إمام الحرم المكي السابق)',
    tag: 'حرم مكي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server7.mp3quran.net/shur/',
    fallbackUrl: 'https://everyayah.com/data/Saood_ash-Shuraym_128kbps/'
  },
  {
    id: 'maher',
    name: 'ماهر بن حمد المعيقلي',
    nameEn: 'Maher Al-Muaiqly',
    country: 'السعودية (إمام الحرم المكي)',
    tag: 'حرم مكي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server12.mp3quran.net/maher/',
    fallbackUrl: 'https://everyayah.com/data/MaherAlMuaiqly128kbps/'
  },
  {
    id: 'dossari',
    name: 'ياسر بن راشد الدوسري',
    nameEn: 'Yasser Al-Dosari',
    country: 'السعودية (إمام الحرم المكي)',
    tag: 'حرم مكي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server11.mp3quran.net/yasser/',
    fallbackUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/'
  },
  {
    id: 'juhany',
    name: 'عبد الله بن عواد الجهني',
    nameEn: 'Abdullah Awad Al-Juhany',
    country: 'السعودية (إمام الحرم المكي)',
    tag: 'حرم مكي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server13.mp3quran.net/jhn/',
    fallbackUrl: 'https://everyayah.com/data/Abdullah_Al-Juhany_128kbps/'
  },
  {
    id: 'baleela',
    name: 'بندر بن عبد العزيز بليلة',
    nameEn: 'Bandar Balila',
    country: 'السعودية (إمام الحرم المكي)',
    tag: 'حرم مكي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server6.mp3quran.net/balilah/',
    fallbackUrl: 'https://backup.mp3quran.net/balilah/'
  },
  {
    id: 'ali_jaber',
    name: 'علي بن عبد الله جابر (رحمه الله)',
    nameEn: 'Ali Jaber',
    country: 'السعودية (إمام الحرم المكي)',
    tag: 'حرم مكي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server11.mp3quran.net/a_jbr/',
    fallbackUrl: 'https://everyayah.com/data/Ali_Jaber_64kbps/'
  },
  {
    id: 'ayyoub',
    name: 'محمد أيوب (رحمه الله)',
    nameEn: 'Muhammad Ayyub',
    country: 'السعودية (إمام المسجد النبوي)',
    tag: 'مسجد نبوي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server8.mp3quran.net/ayyub/',
    fallbackUrl: 'https://everyayah.com/data/Muhammad_Ayyoob_128kbps/'
  },
  {
    id: 'hudhaify',
    name: 'علي بن عبد الرحمن الحذيفي',
    nameEn: 'Ali Al-Hudhaify',
    country: 'السعودية (إمام المسجد النبوي)',
    tag: 'مسجد نبوي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server9.mp3quran.net/hthfi/',
    fallbackUrl: 'https://everyayah.com/data/Hudhaify_128kbps/'
  },
  {
    id: 'budair',
    name: 'صلاح بن محمد البدير',
    nameEn: 'Salah Al-Budair',
    country: 'السعودية (إمام المسجد النبوي)',
    tag: 'مسجد نبوي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server6.mp3quran.net/s_bud/',
    fallbackUrl: 'https://everyayah.com/data/Salah_Al_Budair_128kbps/'
  },
  {
    id: 'ahmad_hudhaify',
    name: 'أحمد بن علي الحذيفي',
    nameEn: 'Ahmad Al-Hudhaify',
    country: 'السعودية (إمام المسجد النبوي)',
    tag: 'مسجد نبوي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server14.mp3quran.net/a_hthfi/',
    fallbackUrl: 'https://backup.mp3quran.net/a_hthfi/'
  },
  {
    id: 'muhanna',
    name: 'خالد بن سليمان المهنا',
    nameEn: 'Khalid Al-Muhanna',
    country: 'السعودية (إمام المسجد النبوي)',
    tag: 'مسجد نبوي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server11.mp3quran.net/mohna/',
    fallbackUrl: 'https://backup.mp3quran.net/mohna/'
  },
  {
    id: 'baijan',
    name: 'عبد الله بن عبد الرحمن البعيجان',
    nameEn: 'Abdullah Al-Baijan',
    country: 'السعودية (إمام المسجد النبوي)',
    tag: 'مسجد نبوي',
    riwayah: 'حفص عن عاصم',
    url: 'https://server16.mp3quran.net/baijan/',
    fallbackUrl: 'https://backup.mp3quran.net/baijan/'
  },
  {
    id: 'ajamy',
    name: 'أحمد بن علي العجمي',
    nameEn: 'Ahmed Al-Ajmy',
    country: 'المملكة العربية السعودية',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server10.mp3quran.net/ajm/',
    fallbackUrl: 'https://everyayah.com/data/Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net/'
  },
  {
    id: 'ghamdi',
    name: 'سعد بن سعيد الغامدي',
    nameEn: 'Saad Al-Ghamdi',
    country: 'المملكة العربية السعودية',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server7.mp3quran.net/s_gmd/',
    fallbackUrl: 'https://everyayah.com/data/Ghamadi_40kbps/'
  },
  {
    id: 'qatami',
    name: 'ناصر بن علي القطامي',
    nameEn: 'Nasser Al-Qatami',
    country: 'المملكة العربية السعودية (الرياض)',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server6.mp3quran.net/qtm/',
    fallbackUrl: 'https://everyayah.com/data/Nasser_Alqatami_128kbps/'
  },
  {
    id: 'shatri',
    name: 'أبو بكر الشاطري',
    nameEn: 'Abu Bakr Al-Shatri',
    country: 'المملكة العربية السعودية (جدة)',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server11.mp3quran.net/shatr/',
    fallbackUrl: 'https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps/'
  },
  {
    id: 'jaleel',
    name: 'خالد بن فهد الجليل',
    nameEn: 'Khalid Al-Jalil',
    country: 'المملكة العربية السعودية (الرياض)',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server10.mp3quran.net/jleel/',
    fallbackUrl: 'https://backup.mp3quran.net/jleel/'
  },
  {
    id: 'abkar',
    name: 'إدريس بن محمد أبكر',
    nameEn: 'Idrees Abkar',
    country: 'المملكة العربية السعودية (جدة)',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server6.mp3quran.net/abkr/',
    fallbackUrl: 'https://backup.mp3quran.net/abkr/'
  },
  {
    id: 'mansoor_salimi',
    name: 'منصور السالمي',
    nameEn: 'Mansoor Al-Salimi',
    country: 'المملكة العربية السعودية',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server14.mp3quran.net/mansor/',
    fallbackUrl: 'https://backup.mp3quran.net/mansor/'
  },
  {
    id: 'sayegh',
    name: 'توفيق بن سعيد الصايغ',
    nameEn: 'Tawfeeq Al-Sayegh',
    country: 'المملكة العربية السعودية',
    tag: 'قراء السعودية',
    riwayah: 'حفص عن عاصم',
    url: 'https://server6.mp3quran.net/saygh/',
    fallbackUrl: 'https://backup.mp3quran.net/saygh/'
  },
  {
    id: 'alafasy',
    name: 'مشاري بن راشد العفاسي',
    nameEn: 'Mishary Rashid Alafasy',
    country: 'دولة الكويت',
    tag: 'مشاهير القراء',
    riwayah: 'حفص عن عاصم',
    url: 'https://server8.mp3quran.net/afs/',
    fallbackUrl: 'https://everyayah.com/data/Alafasy_128kbps/'
  },
  {
    id: 'abbad',
    name: 'فارس بن عبد ربه عباد',
    nameEn: 'Fares Abbad',
    country: 'اليمن',
    tag: 'مشاهير القراء',
    riwayah: 'حفص عن عاصم',
    url: 'https://server8.mp3quran.net/frs_a/',
    fallbackUrl: 'https://everyayah.com/data/Fares_Abbad_64kbps/'
  },
  {
    id: 'bu_khatir',
    name: 'صلاح بن عبد الرحمن بو خاطر',
    nameEn: 'Salah Bu Khatir',
    country: 'الإمارات العربية المتحدة',
    tag: 'مشاهير القراء',
    riwayah: 'حفص عن عاصم',
    url: 'https://server8.mp3quran.net/bkt/',
    fallbackUrl: 'https://backup.mp3quran.net/bkt/'
  },
  {
    id: 'balushi',
    name: 'هزاع بن عبد الله البلوشي',
    nameEn: 'Hazza Al-Balushi',
    country: 'سلطنة عمان',
    tag: 'مشاهير القراء',
    riwayah: 'حفص عن عاصم',
    url: 'https://server11.mp3quran.net/hazza/',
    fallbackUrl: 'https://backup.mp3quran.net/hazza/'
  },
  {
    id: 'wadi_yamani',
    name: 'وديع بن حمادي اليمني',
    nameEn: 'Wadi Al-Yamani',
    country: 'اليمن',
    tag: 'مشاهير القراء',
    riwayah: 'حفص عن عاصم',
    url: 'https://server11.mp3quran.net/wadi/',
    fallbackUrl: 'https://backup.mp3quran.net/wadi/'
  },
  {
    id: 'saheem',
    name: 'عبد العزيز سحيم',
    nameEn: 'Abdelaziz Sahim',
    country: 'الجزائر',
    tag: 'مشاهير القراء',
    riwayah: 'حفص عن عاصم',
    url: 'https://server16.mp3quran.net/sahim/',
    fallbackUrl: 'https://backup.mp3quran.net/sahim/'
  },
  // عمالقة التلاوة الكلاسيكية
  {
    id: 'basit_murattal',
    name: 'عبد الباسط عبد الصمد (مرتل)',
    nameEn: 'Abdul Basit (Murattal)',
    country: 'مصر (العصر الذهبي)',
    tag: 'عمالقة التلاوة',
    riwayah: 'حفص عن عاصم',
    url: 'https://server7.mp3quran.net/basit/',
    fallbackUrl: 'https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/'
  },
  {
    id: 'basit_mujawwad',
    name: 'عبد الباسط عبد الصمد (مجوّد)',
    nameEn: 'Abdul Basit (Mujawwad)',
    country: 'مصر (العصر الذهبي)',
    tag: 'عمالقة التلاوة',
    riwayah: 'حفص عن عاصم',
    url: 'https://server7.mp3quran.net/basit_mgwd/',
    fallbackUrl: 'https://everyayah.com/data/AbdulSamad_64kbps_QuranExplorer.Com/'
  },
  {
    id: 'minshawi_murattal',
    name: 'محمد صديق المنشاوي (مرتل)',
    nameEn: 'Minshawi (Murattal)',
    country: 'مصر (العصر الذهبي)',
    tag: 'عمالقة التلاوة',
    riwayah: 'حفص عن عاصم',
    url: 'https://server10.mp3quran.net/minsh/',
    fallbackUrl: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/'
  },
  {
    id: 'minshawi_mujawwad',
    name: 'محمد صديق المنشاوي (مجوّد)',
    nameEn: 'Minshawi (Mujawwad)',
    country: 'مصر (العصر الذهبي)',
    tag: 'عمالقة التلاوة',
    riwayah: 'حفص عن عاصم',
    url: 'https://server11.mp3quran.net/minsh_mjwd/',
    fallbackUrl: 'https://everyayah.com/data/Minshawy_Mujawwad_192kbps/'
  },
  {
    id: 'husary',
    name: 'محمود خليل الحصري (مرتل)',
    nameEn: 'Mahmoud Khalil Al-Husary',
    country: 'مصر (شيخ المقارئ)',
    tag: 'عمالقة التلاوة',
    riwayah: 'حفص عن عاصم',
    url: 'https://server13.mp3quran.net/husr/',
    fallbackUrl: 'https://everyayah.com/data/Husary_128kbps/'
  }
];
