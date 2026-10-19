"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { apiSend } from "@/lib/api";

export function SiteActions({
  siteId,
  initialConfig,
}: {
  siteId?: string;
  initialConfig?: Record<string, unknown>;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function createSite() {
    setBusy(true);
    setMsg("");
    try {
      await apiSend("/v1/sites", "POST", {
        name: "موقع جديد",
        domain: "example.com",
      });
      setMsg("تم إنشاء الموقع");
      window.location.reload();
    } catch {
      setMsg("فشل الإنشاء — تأكد أن الـ API يعمل");
    } finally {
      setBusy(false);
    }
  }

  async function saveConfig() {
    if (!siteId) return;
    setBusy(true);
    try {
      await apiSend(`/v1/sites/${siteId}/config`, "PUT", {
        ...(initialConfig || {}),
        language: "ar",
        position: "bottom-left",
        colors: { primary: "#0B5FFF" },
      });
      setMsg("تم حفظ الإعدادات");
    } catch {
      setMsg("فشل الحفظ");
    } finally {
      setBusy(false);
    }
  }

  if (!siteId) {
    return (
      <div className="flex items-center gap-2">
        <Button disabled={busy} onClick={createSite}>
          إضافة موقع
        </Button>
        {msg && <span className="text-xs text-slate-500">{msg}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button variant="ghost" disabled={busy} onClick={saveConfig}>
        حفظ إعدادات الأداة
      </Button>
      {msg && <span className="text-xs text-slate-500">{msg}</span>}
      <div className="rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-500">
        معاينة حية: اللغة عربي · الموضع يسار سفلي · اللون الأساسي أزرق
      </div>
    </div>
  );
}
