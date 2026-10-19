import { clsx } from "clsx";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={clsx("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
        variant === "primary" && "bg-brand text-white hover:bg-blue-700",
        variant === "ghost" && "bg-slate-100 text-slate-800 hover:bg-slate-200",
        className,
      )}
      {...props}
    />
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
    </Card>
  );
}
