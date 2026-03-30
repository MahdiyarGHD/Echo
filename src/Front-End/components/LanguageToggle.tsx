"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();
  return (
    <button
      onClick={toggleLocale}
      className="px-3 py-1 text-sm rounded-md border border-[#2a2a2a] bg-[#1a1a1a] text-[#a3a3a3] hover:text-[#f5f5f5] hover:border-[#6366f1] transition-colors"
      aria-label="Toggle language"
    >
      {locale === "en" ? "فارسی" : "English"}
    </button>
  );
}
