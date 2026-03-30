"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="mt-auto py-6 text-center text-sm text-[#94a3b8] border-t border-[#334155]">
      <span dir="ltr" className="inline-block">
        {t("footerBy")}{" "}
        <a
          href="https://github.com/MahdiyarGHD"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6366f1] hover:underline"
        >
          MahdiyarGHD
        </a>
        {" · "}
        <a
          href="https://github.com/MahdiyarGHD/Echo"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6366f1] hover:underline"
        >
          Source
        </a>
      </span>
    </footer>
  );
}
