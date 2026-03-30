"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();
  return (
    <button
      onClick={toggleLocale}
      className="px-3 py-1 text-sm rounded-md border border-[#334155] bg-[#1e293b] text-[#94a3b8] hover:text-[#e2e8f0] hover:border-[#6366f1] transition-colors"
      aria-label="Toggle language"
    >
      {locale === "en" ? "فارسی" : "English"}
    </button>
  );
}
