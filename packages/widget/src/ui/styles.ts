export function panelStyles(primary: string, width: string): string {
  return `
:host { all: initial; }
* { box-sizing: border-box; font-family: Tajawal, system-ui, -apple-system, sans-serif; }
.fab {
  position: fixed;
  width: 56px; height: 56px; border-radius: 50%;
  background: ${primary}; color: #fff; border: none;
  box-shadow: 0 8px 24px rgba(0,0,0,.25);
  cursor: pointer; z-index: 2147483647;
  display: grid; place-items: center;
}
.fab:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
.panel {
  position: fixed; width: min(${width}, calc(100vw - 24px));
  max-height: min(80vh, 640px); overflow: auto;
  background: #fff; color: #111827;
  border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,.28);
  z-index: 2147483647; padding: 12px;
  border: 1px solid #e5e7eb;
}
.header { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; }
.title { font-weight:700; font-size:1.05rem; margin:0; }
.search { width:100%; padding:10px 12px; border:1px solid #d1d5db; border-radius:10px; margin-bottom:10px; font-size:14px; }
.tabs { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px; }
.tab {
  border:1px solid #e5e7eb; background:#f9fafb; border-radius:999px;
  padding:6px 10px; cursor:pointer; font-size:12px;
}
.tab[aria-selected="true"] { background:${primary}; color:#fff; border-color:${primary}; }
.grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.feature {
  border:1px solid #e5e7eb; border-radius:12px; padding:10px;
  background:#fff; cursor:pointer; text-align:start; min-height:64px;
}
.feature[data-active="true"] { border-color:${primary}; background:#eff6ff; }
.feature .label { font-size:13px; font-weight:600; display:block; }
.feature .meta { font-size:11px; color:#6b7280; margin-top:4px; }
.footer { display:flex; gap:8px; margin-top:12px; }
.btn {
  flex:1; border:none; border-radius:10px; padding:10px;
  cursor:pointer; font-weight:600;
}
.btn-primary { background:${primary}; color:#fff; }
.btn-ghost { background:#f3f4f6; color:#111; }
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); border:0; }
@media (max-width:480px) { .grid { grid-template-columns:1fr; } }
`;
}

export function positionStyles(
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left",
): { fab: string; panel: string } {
  const map = {
    "bottom-right": {
      fab: "inset-inline-end:20px; bottom:20px;",
      panel: "inset-inline-end:20px; bottom:88px;",
    },
    "bottom-left": {
      fab: "inset-inline-start:20px; bottom:20px;",
      panel: "inset-inline-start:20px; bottom:88px;",
    },
    "top-right": {
      fab: "inset-inline-end:20px; top:20px;",
      panel: "inset-inline-end:20px; top:88px;",
    },
    "top-left": {
      fab: "inset-inline-start:20px; top:20px;",
      panel: "inset-inline-start:20px; top:88px;",
    },
  };
  return map[position];
}
