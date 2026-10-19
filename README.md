# منصة إمكانية الوصول

منصة عربية-أولاً لإتاحة المحتوى الرقمي: أداة وصول قابلة للتضمين، قارئ، ماسح صفحات، ولوحة تحكم لإدارة المواقع والرخص والاستخدام.

> **الرخصة:** الكود الجديد تحت [Apache-2.0](./LICENSE). مجلد [`legacy/`](./legacy) يحتوي المرجع الأصلي المرخّص بـ GPL-3.0 ولا يُستورد ولا يُبنى ضمن المنتج.

## البنية

```
apps/
  api/          # Hono + Prisma (SQLite محلياً / PostgreSQL للإنتاج)
  dashboard/    # Next.js لوحة تحكم RTL
packages/
  core/         # أنواع، إعدادات، ترجمات، كتالوج الخصائص
  widget/       # أداة الوصول (Vite → muneer.js)
  scanner/      # Playwright + axe-core + قواعد عربية
  fonts/        # خط عسر القراءة العربي
docs/           # توثيق التثبيت والماسح والاختبارات
```

## البدء السريع

```bash
pnpm install
pnpm --filter @a11y/api db:push
pnpm dev
```

`pnpm dev` يشغّل الـ API واللوحة والأداة معاً. أو في طرفيات منفصلة:

```bash
pnpm --filter @a11y/api dev
pnpm --filter @a11y/dashboard dev
pnpm --filter @a11y/widget dev
```

**مهم:** لا تلصق كل الأوامر في طرفية واحدة — أمر `dev` يبقى شغّالاً ويمنع الأوامر التالية.

## خصائص الأداة

أكثر من 40 خاصية ضمن: بصري، معرفي، تنقل، قارئ، وملفات تعريف جاهزة (ضعف البصر، الصرع، ADHD، عسر القراءة، كبار السن، المكفوفون، حركي).

## CDN

بعد البناء انشر `packages/widget/dist/muneer.js` على مسار إصداري مثل `/v2/muneer.js`.

## التوثيق

- [التثبيت](./docs/install.md)
- [الماسح](./docs/scanner.md)
- [اختبار قارئات الشاشة](./docs/screen-reader-testing.md)
