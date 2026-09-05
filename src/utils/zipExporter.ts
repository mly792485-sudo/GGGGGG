/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';

// Import all application source files dynamically at build/runtime as raw text strings
const globbedFiles = import.meta.glob(
  [
    '/src/**/*',
    '/index.html',
    '/package.json',
    '/tsconfig.json',
    '/vite.config.ts',
    '/capacitor.config.json',
    '/metadata.json',
    '/.env.example'
  ],
  {
    query: '?raw',
    import: 'default',
    eager: true
  }
) as Record<string, string>;

export async function downloadProjectZip(onProgress?: (percent: number, currentFile: string) => void) {
  const zip = new JSZip();

  // 1. Add Documentation & iOS/iPadOS/macOS deployment guides
  zip.file('README.md', `# 🕌 تطبيق نور الإسلام (Noor Al-Islam)
> تطبيق إسلامي شامل وحديث عالي الجودة يدعم جميع أجهزة الآيفون (iPhone)، الآيباد (iPad)، الماك (macOS)، والأندرويد (Android).

---

## 🌟 الميزات والمحتويات الشاملة:
1. **مواقيت الصلاة الدقيقة والأذان**:
   - حساب دقيق للمواقيت بدعم مدن العالم وحساب الشروق والغروب ومنتصف الليل والثلث الأخير.
   - إشعارات وتنبيهات أصلية لشاشة القفل وشريط الحالة (Native Notifications).
   - تسجيل أذان محلي مرفق يعمل دون إنترنت داخل المعاينة والإشعارات الأصلية. لا تُنسب التسجيلات إلى شيخ معيّن إلا بعد توفير ملف مرخّص ومصدر موثّق.
2. **القرآن الكريم كاملاً**:
   - تلاوات صوتية عطرة بجودة عالية لكبار قراء السعودية والعالم الإسلامي وأئمة الحرمين الشريفين (الشيخ السديس، الشريم، المعيقلي، الدوسري، الجهني، بليلة، علي جابر، محمد أيوب، الحذيفي، العجمي، الغامدي، القطامي، الشاطري، الجليل، أبكر، وغيرهم).
   - تفاسير الآيات وبيان مقاصد السور.
   - خطوط عثمانية ومصحف تفاعلي.
3. **منصة إحسان الإسلامية للعمل الخيري** (ehsan.sa) لدعم المشاريع والفرص الخيرية والوقفية.
4. **دقيقتان لآخرتك**: أدعية صوتية ومقروءة ومقاطع روحانية ملهمة.
5. **حصن المسلم الشامل**: أذكار الصباح والمساء، أذكار النوم، الرقية الشرعية، والاستغفار.
6. **السبحة الإلكترونية الذكية** وبوصلة القبلة التفاعلية الدقيقة.

---

## 🚀 التشغيل والتطوير المحلي:
\`\`\`bash
# 1. تثبيت الحزم
npm install

# 2. تشغيل السيرفر المحلي
npm run dev
\`\`\`

---

## 📱 بناء التطبيق لأجهزة الآيفون (iPhone) والآيباد (iPad) والماك (macOS):
\`\`\`bash
# 1. بناء ملفات الويب
npm run build

# 2. إضافة منصة iOS
npx cap add ios

# 3. مزامنة الملفات
npx cap sync ios

# 4. فتح المشروع في Xcode
npx cap open ios
\`\`\`
- من داخل **Xcode**: اختر جهاز الآيفون أو الآيباد أو Mac (Designed for iPad)، واضغط **Run** أو قم بتصدير ملف **IPA** لرفعه على TestFlight / App Store.

---

## 🤖 بناء التطبيق للأندرويد (Android):
\`\`\`bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
\`\`\`

نسأل الله تعالى القبول والإخلاص وأن يجعله صدقة جارية.
`);

  // 2. Add Capacitor Configuration
  zip.file('capacitor.config.json', JSON.stringify({
    appId: "com.noor.alislam",
    appName: "نور الإسلام",
    webDir: "dist",
    bundledWebRuntime: false,
    ios: {
      minDeploymentTarget: "15.0",
      contentInset: "always",
      scrollEnabled: true,
      preferredContentMode: "mobile",
      handleApplicationURL: true
    },
    plugins: {
      SplashScreen: {
        launchShowDuration: 0,
        launchAutoHide: true,
        launchFadeOutDuration: 0,
        backgroundColor: "#070D0E",
        showSpinner: false
      },
      LocalNotifications: {
        sound: "adhan.wav"
      },
      StatusBar: {
        overlaysWebView: true,
        style: "DARK"
      },
      Keyboard: {
        resize: "body",
        style: "DARK"
      }
    }
  }, null, 2));

  // 3. Add all project source files dynamically
  const fileKeys = Object.keys(globbedFiles);
  const total = fileKeys.length;
  let processed = 0;

  for (const filePath of fileKeys) {
    const rawContent = globbedFiles[filePath];
    // Remove leading slash if present to make standard zip relative path
    const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    zip.file(relativePath, rawContent);
    processed++;
    if (onProgress) {
      const pct = Math.round((processed / total) * 100);
      onProgress(pct, relativePath);
    }
  }

  // 4. Generate the ZIP file
  const blob = await zip.generateAsync(
    { 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent), 'جاري ضغط الملفات...');
      }
    }
  );

  // 5. Trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `noor-al-islam-full-project-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
