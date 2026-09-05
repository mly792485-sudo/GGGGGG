import { SurahDetail } from '../types';

export const offlineSurahs: { [key: number]: SurahDetail } = {
  1: {
    number: 1,
    name: 'الفاتحة',
    englishName: 'Al-Fatihah',
    revelationType: 'Meccan',
    numberOfAyahs: 7,
    tafsirSummary: 'سورة الفاتحة هي أعظم سورة في القرآن الكريم، وهي السبع المثاني والقرآن العظيم الذي أوتيه النبي صلى الله عليه وسلم. تشتمل على مجمل معاني القرآن من توحيد وعبادة ووعد ووعيد.',
    ayahs: [
      { number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.', tafsir: 'البدء باسم الله مستعيناً به، والرحمن الرحيم اسمان من أسماء الله تعالى يدلان على سعة رحمته.' },
      { number: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: 'All praise is due to Allah, Lord of the universe.', tafsir: 'الثناء الكامل والمطلق لله سبحانه وتعالى مالك ومربي جميع المخلوقات برحمته ونعمه.' },
      { number: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'The Entirely Merciful, the Especially Merciful.', tafsir: 'ذو الرحمة الواسعة التي وسعت كل شيء، والرحمة الخاصة بالمؤمنين يوم القيامة.' },
      { number: 4, text: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Sovereign of the Day of Recompense.', tafsir: 'هو سبحانه وحده مالك يوم الجزاء والحساب، وهو يوم القيامة.' },
      { number: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'It is You we worship and You we ask for help.', tafsir: 'نخصك وحدك بالعبادة والطاعة، ونخصك وحدك بطلب العون في كل شؤوننا.' },
      { number: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide us to the straight path,', tafsir: 'أرشدنا وثبتنا على الطريق الواضح الموصل إلى رضاك وجنتك، وهو الإسلام.' },
      { number: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.', tafsir: 'طريق الأنبياء والصالحين الذين أنعمت عليهم، لا طريق اليهود الذين عرفوا الحق ورفضوه فغضبت عليهم، ولا طريق النصارى الذين تاهوا عن الحق.' }
    ]
  },
  67: {
    number: 67,
    name: 'الملك',
    englishName: 'Al-Mulk',
    revelationType: 'Meccan',
    numberOfAyahs: 30,
    tafsirSummary: 'سورة الملك تسمى المانعة والمنجية من عذاب القبر. تدور السورة حول إثبات عظمة الله سبحانه وقدرته العظيمة في الخلق وإتقان الكون، ومصير الكافرين والمؤمنين.',
    ayahs: [
      { number: 1, text: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', translation: 'Blessed is He in whose hand is dominion, and He is over all things competent', tafsir: 'تكاثرت خيرات الله وتقدس سبحانه، الذي بيده تصريف ملك السموات والأرض وله القدرة المطلقة.' },
      { number: 2, text: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ', translation: 'He who created death and life to test you as to which of you is best in deed - and He is the Exalted in Might, the Forgiving', tafsir: 'خلق سبحانه الموت والحياة ليمتحنكم أيها الناس ويظهر المطيع من العاصي، وهو القوي الغالب الغفور للتائبين.' },
      { number: 3, text: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ', translation: 'Who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency. So return [your] vision [to the heaven]; do you see any breaks?', tafsir: 'الذي خلق سبع سموات متطابقة بعضها فوق بعض، ما تجد في خلق الرحمن أي خلل أو عيب. كرر النظر في السماء، هل ترى شقوقاً؟' },
      { number: 4, text: 'ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ', translation: 'Then return [your] vision twice again. [Your] vision will return to you humbled while it is fatigued.', tafsir: 'ثم كرر النظر مرة بعد مرة، يرجع إليك بصرك ذليلاً عاجزاً عن رؤية أي عيب أو نقص في خلق الله وهو متعب.' },
      { number: 5, text: 'وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ', translation: 'And we have certainly beautified the nearest heaven with stars and have made them [as] thrown stones at the devils and have prepared for them the punishment of the Blaze.', tafsir: 'ولقد جمّلنا السماء القريبة بالنجوم المضيئة، وجعلناها حراسة تترصد وترجم الشياطين المسترقين للسمع، وهيأنا لهم ناراً مستعرة.' }
    ]
  },
  112: {
    number: 112,
    name: 'الإخلاص',
    englishName: 'Al-Ikhlas',
    revelationType: 'Meccan',
    numberOfAyahs: 4,
    tafsirSummary: 'سورة الإخلاص تعدل ثلث القرآن الكريم، لاشتمالها على توحيد الأسماء والصفات لله عز وجل، وتنزيهه عن الشريك والوالد والولد.',
    ayahs: [
      { number: 1, text: 'قُلْ هُوَ اللَّهُ أَحَدٌ', translation: 'Say, "He is Allah, [who is] One,', tafsir: 'قل يا محمد لهؤلاء المشركين: ربي الذي أعبده هو الله المنفرد بالوحدانية لا شريك له.' },
      { number: 2, text: 'اللَّهُ الصَّمَدُ', translation: 'Allah, the Eternal Refuge.', tafsir: 'الله وحده السيد الذي يقصده الخلائق كلهم ويرجون فضله وتنقاد له الصعاب لقضاء حوائجهم.' },
      { number: 3, text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', translation: 'He neither begets nor is born,', tafsir: 'ليس له ولد سبحانه، ولم يلده أحد، لأنه الأزلي القديم الذي لا بدء له ولا شبيه.' },
      { number: 4, text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', translation: 'Nor is there to Him any equivalent."', tafsir: 'ولم يكن له مماثل أو كفؤ في ذاته ولا أسمائه وصفاته ولا أفعاله سبحانه وتعالى.' }
    ]
  },
  113: {
    number: 113,
    name: 'الفلق',
    englishName: 'Al-Falaq',
    revelationType: 'Meccan',
    numberOfAyahs: 5,
    tafsirSummary: 'سورة الفلق هي إحدى المعوذتين اللتين كان النبي يتعوذ بهما من شرور المخلوقات والساحرين والحاسدين.',
    ayahs: [
      { number: 1, text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', translation: 'Say, "I seek refuge in the Lord of daybreak', tafsir: 'قل: أستجير وأتحصن برب الصبح وفالقه.' },
      { number: 2, text: 'مِن شَرِّ مَا خَلَقَ', translation: 'From the evil of that which He created', tafsir: 'من شر جميع المخلوقات وأذاها من الإنس والجن والدواب.' },
      { number: 3, text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', translation: 'And from the evil of darkness when it settles', tafsir: 'ومن شر الليل المظلم إذا دخل وغطى الكون بظلامه، وما ينتشر فيه من شرور.' },
      { number: 4, text: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', translation: 'And from the evil of the blowers in knots', tafsir: 'ومن شر السواحر اللاتي ينفثن وينفخن في عقد السحر لإيذاء الناس.' },
      { number: 5, text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', translation: 'And from the evil of an envier when he envies."', tafsir: 'ومن شر الحاسد الذي يتمنى زوال النعم عن غيره ويجتهد في إلحاق الضرر به.' }
    ]
  },
  114: {
    number: 114,
    name: 'الناس',
    englishName: 'An-Nas',
    revelationType: 'Meccan',
    numberOfAyahs: 6,
    tafsirSummary: 'سورة الناس هي المعوذة الثانية، وفيها استعاذة بالله الخالق المالك المعبود من وسواس الصدور والجن والإنس.',
    ayahs: [
      { number: 1, text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', translation: 'Say, "I seek refuge in the Lord of mankind,', tafsir: 'قل: أستجير وألتجئ برب البشر وخالقهم والقائم على شؤونهم.' },
      { number: 2, text: 'مَلِكِ النَّاسِ', translation: 'The Sovereign of mankind,', tafsir: 'ملك الملوك المتصرف في شؤون البشر لا شريك له في ملكه.' },
      { number: 3, text: 'إِلَٰهِ النَّاسِ', translation: 'The God of mankind,', tafsir: 'معبودهم الحق والوحيد الذي لا يستحق العبادة والذل غيره سبحانه.' },
      { number: 4, text: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', translation: 'From the evil of the retreating whisperer -', tafsir: 'من شر الشيطان الموسوس الذي يوسوس في قلب الإنسان ويهرب ويخنس إذا ذكر العبد ربه.' },
      { number: 5, text: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', translation: 'Who whispers [evil] into the breasts of mankind -', tafsir: 'الذي يبث الأفكار السيئة والشكوك والشهوات في عقول وقلوب بني آدم.' },
      { number: 6, text: 'مِنَ الْجِنَّةِ وَالنَّاسِ', translation: 'From among the jinn and mankind."', tafsir: 'سواء كان هذا الموسوس من شياطين الجن الذين لا يُرون، أو شياطين الإنس الذين يجرون إلى المعصية.' }
    ]
  }
};
