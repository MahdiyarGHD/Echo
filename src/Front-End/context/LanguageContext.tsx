"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Locale } from "@/lib/i18n";

interface LanguageContextType {
  locale: Locale;
  t: (key: keyof typeof translations.en) => string;
  toggleLocale: () => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("echo-locale") as Locale | null;
    if (saved === "fa" || saved === "en") setLocale(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
    localStorage.setItem("echo-locale", locale);
  }, [locale]);

  const toggleLocale = () => setLocale((l) => (l === "en" ? "fa" : "en"));

  const t = (key: keyof typeof translations.en) =>
    (translations[locale] as typeof translations.en)[key] ?? translations.en[key];

  return (
    <LanguageContext.Provider value={{ locale, t, toggleLocale, isRTL: locale === "fa" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
