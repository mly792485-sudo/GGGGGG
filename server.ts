/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to avoid startup crashes if key is initially empty
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// 1. API route for dynamic Tafsir
app.post("/api/gemini/tafsir", async (req, res) => {
  try {
    const { surahNumber, surahName, ayahNumber } = req.body;
    if (!surahNumber) {
      return res.status(400).json({ error: "surahNumber is required" });
    }

    const ai = getAi();
    let prompt = "";
    if (ayahNumber) {
      prompt = `أنت عالم مفسر للقرآن الكريم. يرجى تقديم تفسير ميسر ودقيق وموثوق (مستنداً إلى تفسير ابن كثير والسعدي والطبري) للآية رقم ${ayahNumber} من سورة ${surahName || surahNumber}. 
أظهر أولاً نص الآية الكريمة بخط قرآني واضح، ثم اذكر سبب النزول إن وجد، ثم التفسير المفصل، والفوائد والعبر المستخلصة من الآية. 
اكتب بلغة عربية فصيحة بليغة واستخدم تنسيق Markdown بشكل جميل ومنظم جداً مع فقرات واضحة وعناوين بارزة.`;
    } else {
      prompt = `أنت عالم مفسر للقرآن الكريم. يرجى تقديم تفسير شامل وتعريف متكامل لسورة ${surahName || surahNumber} (السورة رقم ${surahNumber}).
وضح الآتي:
1. مقاصد السورة ومواضيعها الرئيسية.
2. أسباب نزول السورة أو آيات مشهورة منها إن وجد.
3. فضل السورة الكريمة من الأحاديث الصحيحة.
4. خلاصة عامة أو تفسير إجمالي لآياتها.
اكتب بلغة عربية فصيحة بليغة واستخدم تنسيق Markdown بطريقة احترافية وجميلة ومريحة جداً للقراءة وبأسلوب منظم يسهل على المؤمن فهم كلام ربه.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Tafsir API Error:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء معالجة طلب التفسير" });
  }
});

// 2. API route for Islamic Q&A Companion (Streaming for real-time speed)
app.post("/api/gemini/qa/stream", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    const ai = getAi();
    
    const systemInstruction = `أنت عالم ومستشار إسلامي وقور واسمك "مستشار نور الإسلام". 
مهمتك إجابة تساؤلات المستخدمين الدينية والشرعية والفقهية والأخلاقية بوقار، أدب ومحبة.
استند بشكل أساسي ومباشر على القرآن الكريم، وصحيح البخاري، وصحيح مسلم، والسنّة النبوية المطهرة وفق منهج أهل السنّة والجماعة والوسطية والاعتدال.
تجنب الفتاوى الشاذة، واحرص دائماً على تيسير الدين وتوضيح المسائل الفقهية بأدلة واضحة وميسرة.
تأكد من:
1. بدء الإجابة بترحيب ودعاء سمح للمستفتي مثل "السلام عليكم ورحمة الله وبركاته، حيّاك الله وبارك فيك...".
2. ذكر الآيات والأحاديث الصحيحة بدقة وتنسيقها بشكل بارز بالماركداون.
3. كتابة الإجابة بتنسيق Markdown متقن ومنظم للغاية لكي تسهل قراءتها.
4. إبقاء الإجابة مختصرة وناقضة للهدف ومباشرة لسرعة القراءة.
5. إضافة نصيحة أخوية أو دعاء في نهاية الإجابة.`;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3.1-flash-lite",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("Streaming Q&A Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || "حدث خطأ أثناء الاتصال بمستشار نور الإسلام" });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

// 2b. Standard fallback API route for Islamic Q&A
app.post("/api/gemini/qa", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    const ai = getAi();
    
    const systemInstruction = `أنت عالم ومستشار إسلامي وقور واسمك "مستشار نور الإسلام". 
مهمتك إجابة تساؤلات المستخدمين الدينية والشرعية والفقهية والأخلاقية بوقار، أدب ومحبة.
استند بشكل أساسي ومباشر على القرآن الكريم، وصحيح البخاري، وصحيح مسلم، والسنّة النبوية المطهرة.
اكتب إجابة مختصرة، دقيقة، ومستندة للقرآن والسنة بالماركداون.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.6,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Islamic Q&A API Error:", error);
    res.status(500).json({ error: error.message || "حدث خطأ أثناء الاتصال بمستشار نور الإسلام" });
  }
});

// 3. API route to download project ZIP file directly
app.get("/api/download-zip", async (req, res) => {
  try {
    const zipPath = path.resolve(process.cwd(), "project_source.zip");
    const { execSync } = await import("child_process");
    try {
      execSync("python3 make_zip.py", { cwd: process.cwd(), timeout: 30000 });
    } catch (e) {
      console.error("Error creating zip:", e);
    }

    if (!fs.existsSync(zipPath)) {
      return res.status(500).json({ error: "ملف الـ ZIP غير موجود" });
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="Noor_Al_Islam_SourceCode.zip"');
    res.sendFile(zipPath);
  } catch (error: any) {
    console.error("Zip download error:", error);
    res.status(500).json({ error: "فشل تحميل ملف الـ ZIP" });
  }
});

// 4. Standalone Privacy Policy web page for App Store Connect submission
app.get("/privacy-policy", (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>سياسة الخصوصية | تطبيق نور الإسلام</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #064e3b;
      --accent: #d97706;
      --bg: #070d0e;
      --card-bg: #0c181a;
      --border: #1a3338;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.8;
      padding: 24px 16px;
    }
    .container {
      max-width: 780px;
      margin: 0 auto;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 32px 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    @media (min-width: 640px) {
      .container { padding: 48px 40px; }
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 26px;
      font-weight: 900;
      color: #fcd34d;
      margin-bottom: 8px;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 14px;
    }
    .section {
      margin-bottom: 24px;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 20px;
    }
    h2 {
      font-size: 17px;
      font-weight: 800;
      color: #6ee7b7;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    p {
      font-size: 14px;
      color: #cbd5e1;
      line-height: 1.9;
    }
    .english-box {
      direction: ltr;
      text-align: left;
      font-family: system-ui, -apple-system, sans-serif;
      margin-top: 32px;
      background: rgba(217, 119, 6, 0.08);
      border: 1px solid rgba(217, 119, 6, 0.25);
      border-radius: 16px;
      padding: 24px;
    }
    .english-box h3 {
      color: #f59e0b;
      font-size: 16px;
      margin-bottom: 8px;
    }
    .english-box p {
      font-size: 13px;
      color: #e2e8f0;
      line-height: 1.6;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-muted);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">وثيقة معتمدة ومطابقة لمتجر App Store</span>
      <h1>سياسة الخصوصية لتطبيق "نور الإسلام"</h1>
      <p class="subtitle">تاريخ آخر تحديث: 2026</p>
    </div>

    <div class="section">
      <h2>مقدمة</h2>
      <p>نُولي في تطبيق <strong>"نور الإسلام"</strong> اهتماماً بالغاً بخصوصية المستخدمين. توضح هذه السياسة كيف نتعامل مع البيانات والمعلومات عند استخدامك لتطبيقنا على كافة الأجهزة الذكية وأنظمة iOS و iPadOS.</p>
    </div>

    <div class="section">
      <h2>جمع البيانات</h2>
      <p>نحن لا نقوم بجمع أي بيانات شخصية أو حساسة عن المستخدمين (مثل الأسماء، أرقام الهواتف، البريد الإلكتروني، أو المواقع الجغرافية). التطبيق مصمم لتقديم محتوى إسلامي متكامل (أذكار، قرآن كريم، مواقيت صلاة، قبلة، أدعية) دون الحاجة لتسجيل حساب أو تتبع المستخدم على الإطلاق.</p>
    </div>

    <div class="section">
      <h2>أذونات الجهاز والمعالجة المحلية</h2>
      <p>قد يتطلب التطبيق بعض الأذونات الأساسية فقط لعمل بعض الميزات الحيوية (مثل إذن الإشعارات لتنبيهات الصلاة والأذان، أو إذن تحديد الموقع التقديري لحساب المواقيت والقبلة محلياً)، وهذه البيانات تتم معالجتها محلياً بنسبة 100% على جهازك ولا يتم إرسالها أو تخزينها على أي خوادم خارجية.</p>
    </div>

    <div class="section">
      <h2>خدمات الأطراف الثالثة</h2>
      <p>لا نشارك أي معلومات أو بيانات مع أي أطراف ثالثة أو شبكات إعلانية. التطبيق خالٍ تماماً من الإعلانات التجارية المزعجة.</p>
    </div>

    <div class="section">
      <h2>التعديلات على السياسة</h2>
      <p>قد نقوم بتحديث سياسة الخصوصية من وقت لآخر لمواكبة التحديثات التقنية، وسيتم نشر أي تغييرات داخل هذه الصفحة ومباشرة عبر التطبيق.</p>
    </div>

    <div class="section">
      <h2>التواصل معنا</h2>
      <p>إذا كانت لديك أي استفسارات أو ملاحظات حول سياسة الخصوصية، يسعدنا تواصلك مع مطور التطبيق مباشرة.</p>
    </div>

    <div class="english-box">
      <h3>App Store Review Compliance Note (English)</h3>
      <p><strong>App Name:</strong> Noor Al-Islam (نور الإسلام)<br>
      <strong>Data Collection:</strong> The app does not collect, track, or share any personal user data. All features (Quran recitation, local notifications, prayer times calculation, tasbih) operate entirely on-device with zero external data transmission. No user accounts or login required.</p>
    </div>

    <div class="footer">
      <p>تطبيق نور الإسلام - صدقة جارية عن لؤي بن حسين ووالده رحمه الله</p>
      <p>© 2026 جميع الحقوق محفوظة</p>
    </div>
  </div>
</body>
</html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

// Serve static files / Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback for SPA routing in development mode
    app.get("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = await fs.promises.readFile(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
