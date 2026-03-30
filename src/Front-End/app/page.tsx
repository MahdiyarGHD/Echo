"use client";

import { useLanguage } from "@/context/LanguageContext";
import PasteForm from "@/components/PasteForm";

export default function HomePage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-[#f5f5f5]">{t("appName")}</h1>
        <p className="text-[#a3a3a3]">{t("tagline")}</p>
      </div>
      <PasteForm />
    </div>
  );
}
