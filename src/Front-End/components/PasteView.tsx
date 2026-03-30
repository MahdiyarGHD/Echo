"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { PasteResponse, ApiError } from "@/lib/api";
import { decryptContent } from "@/lib/crypto";

const CREATE_PASTE_BTN_CLASS =
  "inline-flex items-center gap-2 px-4 py-2 text-sm bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-[#94a3b8] hover:text-[#e2e8f0] rounded-lg transition-colors";

function PlusIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

interface Props {
  paste: PasteResponse | null;
  errorType: ApiError["type"] | null;
}

export default function PasteView({ paste, errorType }: Props) {
  const { t, locale } = useLanguage();
  const [password, setPassword] = useState("");
  const [decrypted, setDecrypted] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [decrypting, setDecrypting] = useState(false);
  const [contentCopied, setContentCopied] = useState(false);

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paste || !password) return;
    setDecrypting(true);
    setDecryptError(null);
    try {
      const result = await decryptContent(paste.content, password);
      setDecrypted(result);
    } catch {
      setDecryptError(t("wrongPassword"));
    } finally {
      setDecrypting(false);
    }
  };

  const handleCopyContent = async () => {
    const text = decrypted ?? paste?.content ?? "";
    await navigator.clipboard.writeText(text);
    setContentCopied(true);
    setTimeout(() => setContentCopied(false), 2000);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(locale === "fa" ? "fa-IR" : "en-US");
    } catch {
      return iso;
    }
  };

  if (errorType) {
    const errorKey =
      errorType === "notFound"
        ? "pasteNotFound"
        : errorType === "rateLimit"
        ? "tooManyRequests"
        : errorType === "network"
        ? "networkError"
        : "errorOccurred";
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="rounded-xl border border-red-800 bg-red-900/10 p-8 text-center space-y-3">
          <div className="text-4xl">⚠️</div>
          <p className="text-red-400 font-medium">{t(errorKey as Parameters<typeof t>[0])}</p>
          <a
            href="/"
            className={`${CREATE_PASTE_BTN_CLASS} mt-2`}
          >
            <PlusIcon />
            {t("createPaste")}
          </a>
        </div>
      </div>
    );
  }

  if (!paste) return null;

  const displayContent = decrypted ?? (paste.isProtected ? null : paste.content);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-[#e2e8f0] break-words">
            {paste.title || t("viewPaste")}
          </h1>
          <div className="flex gap-2 flex-wrap">
            {paste.isExplosive && (
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                🔥 {t("explosive")}
              </span>
            )}
            {paste.isProtected && (
              <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30">
                🔒 {t("protected")}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-[#94a3b8]">
          <span>{t("created")}: {formatDate(paste.createdAt)}</span>
          <span>
            {t("expires")}:{" "}
            {paste.expirationTime ? formatDate(paste.expirationTime) : t("neverExpires")}
          </span>
          <span>{t("views")}: {paste.viewCount}</span>
        </div>
      </div>

      {paste.isProtected && !decrypted && (
        <div className="rounded-xl border border-[#334155] bg-[#1e293b] p-6 space-y-4">
          <h2 className="text-lg font-medium text-[#e2e8f0]">🔒 {t("protectedPaste")}</h2>
          <p className="text-sm text-[#94a3b8]">{t("enterPasswordDecrypt")}</p>
          <form onSubmit={handleDecrypt} className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              className="w-full sm:flex-1 px-4 py-2.5 rounded-lg border border-[#334155] bg-[#0f172a] text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#6366f1] text-sm"
            />
            <button
              type="submit"
              disabled={decrypting || !password}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {decrypting ? "..." : t("decrypt")}
            </button>
          </form>
          {decryptError && (
            <p className="text-sm text-red-400">{decryptError}</p>
          )}
        </div>
      )}

      {displayContent !== null && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94a3b8]">{t("content")}</span>
            <button
              onClick={handleCopyContent}
              className="px-3 py-1.5 text-xs bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-[#94a3b8] hover:text-[#e2e8f0] rounded-md transition-colors"
            >
              {contentCopied ? t("copied") : t("copyContent")}
            </button>
          </div>
          <div className="rounded-xl border border-[#334155] bg-[#0f172a] p-5">
            <pre className="text-sm text-[#e2e8f0] whitespace-pre-wrap break-words font-mono leading-relaxed">
              {displayContent}
            </pre>
          </div>
        </div>
      )}

      <a
        href="/"
        className={CREATE_PASTE_BTN_CLASS}
      >
        <PlusIcon />
        {t("createPaste")}
      </a>
    </div>
  );
}

