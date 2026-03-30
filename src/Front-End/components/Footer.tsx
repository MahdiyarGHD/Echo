"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t, isRTL } = useLanguage();
  return (
    <footer className="mt-auto py-6 text-center text-sm text-[#94a3b8] border-t border-[#334155]">
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="inline-flex flex-wrap items-center justify-center gap-1"
      >
        <span>{t("footerBy")}</span>
        <a
          href="https://github.com/MahdiyarGHD"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6366f1] hover:underline"
          dir="ltr"
        >
          MahdiyarGHD
        </a>
        <span>·</span>
        <a
          href="https://github.com/MahdiyarGHD/Echo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6366f1] hover:underline"
          dir="ltr"
        >
          Source
        </a>
      </div>
    </footer>
  );
}
