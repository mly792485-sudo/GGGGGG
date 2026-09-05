import React, { useState } from 'react';
import { Shield, Check, Copy, X, ExternalLink, Mail, Lock, Smartphone, Globe } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEn?: boolean;
}

export const PRIVACY_POLICY_TEXT_AR = `سياسة الخصوصية لتطبيق "نور الإسلام"

مقدمة:
نُولي في تطبيق "نور الإسلام" اهتماماً بالغاً بخصوصية المستخدمين. توضح هذه السياسة كيف نتعامل مع البيانات والمعلومات عند استخدامك لتطبيقنا.

جمع البيانات:
نحن لا نقوم بجمع أي بيانات شخصية أو حساسة عن المستخدمين (مثل الأسماء، أرقام الهواتف، البريد الإلكتروني، أو المواقع الجغرافية الحية). التطبيق مصمم لتقديم محتوى إسلامي متكامل (أذكار، قرآن كريم، مواقيت صلاة، قبلة، أدعية) دون الحاجة لتسجيل حساب أو تتبع المستخدم.

أذونات الجهاز:
قد يتطلب التطبيق بعض الأذونات الأساسية فقط لعمل بعض الميزات الحيوية (مثل إذن الإشعارات لتنبيهات الأذان والصلوات والأذكار، أو إذن تحديد الموقع التقديري لحساب مواقيت الصلاة واتجاه القبلة محلياً)، وهذه البيانات والعمليات الحسابية تتم معالجتها محلياً بنسبة 100% على جهازك ولا يتم إرسالها أو تخزينها أو مشاركتها على أي خوادم خارجية إطلاقاً.

خدمات الأطراف الثالثة:
لا نشارك أي معلومات أو بيانات مع أي أطراف ثالثة أو شركات إعلانية. التطبيق خالٍ تماماً من الإعلانات التجارية المزعجة.

التعديلات على السياسة:
قد نقوم بتحديث سياسة الخصوصية من وقت لآخر لمواكبة التحديثات التقنية، وسيتم نشر أي تغييرات داخل هذه الصفحة في التطبيق مباشرة.

التواصل معنا:
إذا كانت لديك أي استفسارات أو ملاحظات حول سياسة الخصوصية، يسعدنا تواصلك مع مطور التطبيق مباشرة.`;

export const PRIVACY_POLICY_TEXT_EN = `Privacy Policy for "Noor Al-Islam"

Introduction:
At "Noor Al-Islam", we prioritize and strictly respect the privacy of our users. This policy outlines how we handle data and information when you use our application.

Data Collection:
We do NOT collect, store, or share any personal, sensitive, or identifiable user data (such as names, phone numbers, email addresses, or real-time location tracking). The application is designed to provide comprehensive Islamic content (Quran, Adhkar, Prayer Times, Qibla, Supplications) with zero user tracking and no account registration required.

Device Permissions:
The application may request minimal local device permissions purely to operate core utility features (e.g., Local Notifications for Prayer Times/Adhan alerts, and local approximate coordinates to calculate prayer timings and Qibla direction). All calculations are executed 100% locally on your device and are never transmitted to or stored on external servers.

Third-Party Services:
We do not share any data with third parties or advertising networks. The app is completely ad-free and tracking-free.

Policy Updates:
We may update this Privacy Policy periodically to reflect technical enhancements. Any updates will be displayed directly within this page in the application.

Contact Us:
If you have any questions or feedback regarding this Privacy Policy, please feel free to reach out to the developer.`;

export const APPLE_REVIEW_NOTE_EN = `Hello Apple Review Team,
Regarding the privacy policy and data collection for 'نور الإسلام' (Noor Al-Islam) app:
The app is an Islamic utility app (containing Quran, Adhkar, and prayer times) and does not collect, store, or share any personal user data. No user accounts or login are required. The app operates locally on the user's device.
Thank you.`;

export function PrivacyPolicyModal({ isOpen, onClose, isEn = false }: PrivacyPolicyModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md font-sans pt-[max(calc(env(safe-area-inset-top,0px)+6px),12px)] pb-[max(calc(env(safe-area-inset-bottom,0px)+6px),12px)]">
      <div 
        id="privacy-policy-modal"
        className="w-full max-w-2xl bg-[#FCFAF6] dark:bg-[#070D0E] border border-[#EBE7DF] dark:border-[#142225] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 max-h-[92vh] flex flex-col"
        dir={isEn ? "ltr" : "rtl"}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBE7DF] dark:border-[#142225] bg-gradient-to-r from-emerald-800 to-teal-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-kufi">
                {isEn ? "Privacy Policy & App Store Compliance" : "سياسة الخصوصية والاعتماد لمتجر آبل (App Store)"}
              </h3>
              <p className="text-[11px] text-emerald-100/80">
                {isEn ? "Noor Al-Islam Application" : "تطبيق نور الإسلام"}
              </p>
            </div>
          </div>
          <button
            id="close-privacy-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Quick Summary Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-emerald-950 dark:text-emerald-300">{isEn ? "Zero Data Collection" : "لا يتم جمع أي بيانات"}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "100% Private" : "خصوصية وأمان تام"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-amber-950 dark:text-amber-300">{isEn ? "Local Processing" : "معالجة محلية بالكامل"}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "On Device Only" : "داخل جهازك فقط"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
              <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-teal-950 dark:text-teal-300">{isEn ? "No Ads / No Trackers" : "بدون إعلانات أو تتبع"}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? "Clean Experience" : "تجربة إسلامية نقية"}</p>
              </div>
            </div>
          </div>

          {/* 1. Main Privacy Policy (Arabic) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-300 font-kufi flex items-center gap-2">
                <span>🇸🇦 نص سياسة الخصوصية الرسمي (باللغة العربية)</span>
              </h4>
              <button
                id="copy-privacy-ar-btn"
                type="button"
                onClick={() => handleCopy(PRIVACY_POLICY_TEXT_AR, 'ar')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                {copiedSection === 'ar' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ النص كاملاً</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-white dark:bg-[#0B1516] border border-[#EBE7DF] dark:border-[#132326] rounded-2xl text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-2.5 font-medium whitespace-pre-line shadow-xs">
              {PRIVACY_POLICY_TEXT_AR}
            </div>
          </div>

          {/* 2. Apple Review Team Message (English) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-amber-600 dark:text-amber-400 font-kufi flex items-center gap-2">
                <span>🍎 رسالة التوضيح الجاهزة لمراجعة آبل (Apple Review Notes)</span>
              </h4>
              <button
                id="copy-apple-note-btn"
                type="button"
                onClick={() => handleCopy(APPLE_REVIEW_NOTE_EN, 'apple')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
              >
                {copiedSection === 'apple' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ رد آبل (English)</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-400/30 rounded-2xl text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-mono space-y-2" dir="ltr">
              <p className="font-bold text-amber-700 dark:text-amber-400 font-sans">
                💡 Copy and paste this exact note in App Store Connect &gt; App Review Information &gt; Notes if requested:
              </p>
              <div className="p-3 bg-white dark:bg-black/40 rounded-xl border border-amber-500/20 whitespace-pre-line">
                {APPLE_REVIEW_NOTE_EN}
              </div>
            </div>
          </div>

          {/* 3. Direct URL access note */}
          <div className="p-4 bg-gradient-to-r from-emerald-950 to-[#041215] text-white rounded-2xl border border-emerald-500/30 flex items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-black text-amber-300">رابط صفحة سياسة الخصوصية المباشر</h5>
              <p className="text-[11px] text-slate-300">متاح مباشرة عبر الرابط الثابت في الخادم: <code className="font-mono text-emerald-400">/privacy-policy</code></p>
            </div>
            <a
              id="open-web-privacy-link"
              href="/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              <span>فتح الرابط</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#EBE7DF] dark:border-[#142225] bg-[#FAF8F5] dark:bg-[#050A0B] flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>تطبيق نور الإسلام - متوافق مع معايير App Store</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
