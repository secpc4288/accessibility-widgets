# حالة التطوير — منصة إمكانية الوصول (منير)

> آخر تحديث: 19 أكتوبر 2026 — الإصدار `0.1.0`

## ملخص سريع

المشروع تحوّل من سكربت واحد (`widget.js` مرخّص GPL) إلى **monorepo** (pnpm + Turborepo) مرخّص Apache-2.0، فيه 4 حزم وتطبيقان. الهيكل الأساسي جاهز ويعمل محلياً، لكنه **مرحلة MVP**: لا يوجد تسجيل دخول، وقاعدة البيانات SQLite، وكل العمل الجديد **لم يُعمل له commit بعد**.

---

## ما تم تطويره

### 1. `packages/core` — النواة المشتركة
- أنواع TypeScript موحّدة (`types.ts`) وإعدادات الأداة مع تحقق عبر Zod (`config.ts`).
- كتالوج الخصائص (`features.ts`): **37 خاصية + 7 ملفات تعريف**.
- ترجمات عربي/إنجليزي (`i18n.ts`).
- ملفات التعريف الجاهزة (`profiles.ts`): ضعف البصر، الصرع، ADHD، عسر القراءة، كبار السن، المكفوفون، الإعاقة الحركية.
- اختبارات: `config.test.ts`.

### 2. `packages/widget` — أداة الوصول (`muneer.js`)
- بناء عبر Vite إلى `dist/muneer.js` + سكربت فحص الحجم (`scripts/check-widget-size.mjs`).
- `init.ts`: التهيئة وجلب الإعدادات من الـ API عبر `siteKey`.
- الخصائص مقسّمة إلى:
  - **CSS** (`css-features.ts`): التباين، الألوان، حجم/تباعد النص، إخفاء الصور، المؤشر…
  - **Runtime** (`runtime-features.ts`، أكبر ملف ~410 سطر): القناع، دليل القراءة، المكبّر، التنقل بلوحة المفاتيح، قارئ الشاشة، التحكم الصوتي…
- وضع القراءة (`reader/reading-mode.ts`).
- إدارة الحالة مع حفظ محلي (`state/store.ts`) + اختبار.
- واجهة اللوحة وأنماطها (`ui/panel.ts`, `ui/styles.ts`).
- تحليلات استخدام مجمّعة ترسل كل ثانيتين إلى `/v1/events` (`analytics.ts`).
- صفحة عرض تجريبية: `demo/index.html`.

#### الخصائص حسب الفئة
| الفئة | الخصائص |
|---|---|
| بصري | high/dark/light-contrast، invert-colors، bigger-text، text-spacing، line-height، text-align، hide-images، bigger-cursor، saturation، color-filter، custom-colors، highlight-links، highlight-headings، page-zoom، magnifier، dyslexia-font، font-family |
| معرفي | pause-animations، reading-mask، reading-guide، focus-mode، mute-media، simplify-layout، tooltip-dictionary، page-map |
| تنقل | strong-focus، keyboard-nav، landmark-nav، skip-links، large-click-targets |
| قارئ وصوت | screen-reader، click-to-speak، word-highlight، reading-mode، tts-speed، voice-control |

### 3. `packages/scanner` — ماسح الصفحات
- Playwright + axe-core (`scan.ts`) مع حساب درجة (score) + اختبار.
- قواعد عربية مخصّصة (`arabic-rules.ts`): غياب `lang`، غياب `dir`، تخطّي مستويات العناوين، نص بديل للصور، تلميح تباين.
- أداة سطر أوامر: `pnpm scanner:cli <url>`.

### 4. `packages/fonts` — خط عسر القراءة
- ⚠️ حالياً يحمّل خط **Tajawal** من jsDelivr كبديل؛ لا يوجد خط عربي مخصّص لعسر القراءة فعلياً.

### 5. `apps/api` — الخادم (Hono + Prisma)
النماذج: `Organization`, `User`, `Site`, `License`, `WidgetConfig`, `ScanReport`, `UsageEvent`.

| المسار | الوظيفة |
|---|---|
| `GET /health` | فحص الصحة |
| `GET /v1/config/:siteKey` | إعدادات الأداة لموقع |
| `POST /v1/events` | استقبال أحداث الاستخدام |
| `GET/POST /v1/sites` | عرض/إنشاء المواقع |
| `PUT /v1/sites/:id/config` | تعديل إعدادات الأداة |
| `GET /v1/sites/:id/analytics` | إحصاءات الاستخدام |
| `GET /v1/licenses` | الرخص |
| `GET/POST /v1/scans` | عرض/تشغيل فحص |
| `GET /v1/users` | المستخدمون |

### 6. `apps/dashboard` — لوحة التحكم (Next.js 15 + Tailwind، RTL)
صفحات: الرئيسية، المواقع (مع إجراءات)، الفحوصات (مع نموذج تشغيل)، الرخص، المستخدمون، الدعم.

### 7. البنية التحتية والتوثيق
- CI على GitLab (`.gitlab-ci.yml`): install → quality (typecheck + tests) → build. حُذف GitHub workflow القديم.
- التوثيق: `docs/install.md`, `docs/scanner.md`, `docs/cdn.md`, `docs/screen-reader-testing.md`.
- الكود القديم محفوظ في `legacy/` (GPL-3.0، لا يُبنى ولا يُستورد).

---

## فجوات ونقاط ناقصة

### حرجة (قبل أي إنتاج)
1. **لا يوجد تسجيل دخول/صلاحيات** — كل مسارات `/v1/*` مفتوحة، و`passwordHash` قيمته الافتراضية `"demo"`.
2. **لا تحقق من النطاق (domain)** عند طلب `/v1/config/:siteKey` أو إرسال الأحداث — أي موقع يمكنه استخدام أي مفتاح.
3. **لا يوجد rate limiting** على `/v1/events` و `/v1/scans` (الفحص مكلف لأنه يشغّل متصفح).
4. **SQLite** محلياً؛ الحقول `role`, `plan`, `status` نصوص حرة بدل enums، و`json` مخزّن كنص.
5. **العمل غير محفوظ في git** — كل الملفات الجديدة untracked.

### جودة
- `lint` في كل الحزم مجرد `echo "ok"` — لا ESLint فعلي.
- `typecheck` في CI عليه `allow_failure: true`.
- تغطية الاختبارات ضعيفة (4 ملفات صغيرة)، ولا اختبارات للوحة ولا لـ `runtime-features.ts` ولا E2E.
- الفحص يعمل بشكل متزامن داخل الطلب — يحتاج طابور (queue) وعامل منفصل.

### منتج
- خط عسر القراءة العربي غير موجود فعلياً.
- لا فوترة/تفعيل رخص فعلي (الرخصة مجرد سجل).
- لوحة التحكم بدون رسوم بيانية للإحصاءات ولا محرر إعدادات مرئي للأداة.
- لا يوجد اختبار فعلي موثّق مع قارئات الشاشة (NVDA / VoiceOver / JAWS) رغم وجود دليل الاختبار.

---

## خطة مقترحة للمرحلة القادمة

**المرحلة 1 — التثبيت (أسبوع)**
- [ ] commit للعمل الحالي على فرع وفتح MR.
- [ ] تفعيل ESLint + Prettier وإزالة `allow_failure` من typecheck.
- [ ] نقل قاعدة البيانات إلى PostgreSQL + تحويل الحقول النصية إلى enums.

**المرحلة 2 — الأمان (1–2 أسبوع)**
- [ ] مصادقة للوحة (Auth.js أو JWT) وصلاحيات حسب الدور والمنظمة.
- [ ] التحقق من `Origin` مقابل `Site.domain` و`License.domains`.
- [ ] Rate limiting + تحقق Zod على كل المدخلات.

**المرحلة 3 — المنتج (2–3 أسابيع)**
- [ ] محرر إعدادات الأداة في اللوحة مع معاينة حية.
- [ ] رسوم بيانية للتحليلات.
- [ ] طابور للفحوصات + فحوصات مجدولة + تصدير تقارير PDF.
- [ ] توسيع القواعد العربية في الماسح.

**المرحلة 4 — الجودة والإطلاق**
- [ ] اختبارات E2E (Playwright) للأداة واللوحة.
- [ ] اختبار يدوي مع قارئات الشاشة وتوثيق النتائج.
- [ ] نشر `muneer.js` على CDN بمسار إصداري (`/v2/muneer.js`).

---

## أوامر التشغيل

```bash
pnpm install
pnpm --filter @a11y/api db:push
pnpm dev          # API (8787) + اللوحة (3000) + الأداة (5173)
pnpm test
pnpm scanner:cli https://example.com
```
