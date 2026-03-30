"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-auto py-6 text-center text-sm text-[#a3a3a3] border-t border-[#2a2a2a]">
      {t("footer")}
    </footer>
  );
}
