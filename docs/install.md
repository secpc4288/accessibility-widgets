# التثبيت والدمج

## تضمين الأداة (سطر واحد)

```html
<script>
  window.ACCESSIBILITY_WIDGET_CONFIG = {
    siteKey: "demo-site-key",
    apiBaseUrl: "https://api.example.com",
    language: "ar"
  };
</script>
<script src="https://cdn.example.com/v2/muneer.js" defer></script>
```

للتطوير المحلي بعد البناء:

```html
<script src="/packages/widget/dist/muneer.js"></script>
```

## التشغيل المحلي

```bash
pnpm install
pnpm --filter @a11y/api db:push
pnpm --filter @a11y/widget build
pnpm --filter @a11y/api dev
pnpm --filter @a11y/dashboard dev
pnpm --filter @a11y/widget dev
```

- الأداة التجريبية: http://127.0.0.1:5173/demo/
- لوحة التحكم: http://127.0.0.1:3000
- API: http://127.0.0.1:8787
