"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { PasteResponse, ApiError } from "@/lib/api";
import { decryptContent } from "@/lib/crypto";

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
          <a href="/" className="inline-block text-sm text-[#6366f1] hover:underline mt-2">
            ← {t("createPaste")}
          </a>
        </div>
      </div>
    );
  }

  if (!paste) return null;

  const displayContent = decrypted ?? (paste.isProtected ? null : paste.content);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-[#f5f5f5] break-words">
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

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-xs text-[#a3a3a3]">
          <span>{t("created")}: {formatDate(paste.createdAt)}</span>
          <span>
            {t("expires")}:{" "}
            {paste.expirationTime ? formatDate(paste.expirationTime) : t("neverExpires")}
          </span>
          <span>{t("views")}: {paste.viewCount}</span>
        </div>
      </div>

      {/* Password form */}
      {paste.isProtected && !decrypted && (
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-6 space-y-4">
          <h2 className="text-lg font-medium text-[#f5f5f5]">🔒 {t("protectedPaste")}</h2>
          <p className="text-sm text-[#a3a3a3]">{t("enterPasswordDecrypt")}</p>
          <form onSubmit={handleDecrypt} className="flex gap-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] text-[#f5f5f5] placeholder-[#4a4a4a] focus:outline-none focus:border-[#6366f1] text-sm"
            />
            <button
              type="submit"
              disabled={decrypting || !password}
              className="px-5 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {decrypting ? "..." : t("decrypt")}
            </button>
          </form>
          {decryptError && (
            <p className="text-sm text-red-400">{decryptError}</p>
          )}
        </div>
      )}

      {/* Content */}
      {displayContent !== null && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a3a3a3]">{t("content")}</span>
            <button
              onClick={handleCopyContent}
              className="px-3 py-1.5 text-xs bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-[#2a2a2a] text-[#a3a3a3] hover:text-[#f5f5f5] rounded-md transition-colors"
            >
              {contentCopied ? t("copied") : t("copyContent")}
            </button>
          </div>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] p-5">
            <pre className="text-sm text-[#f5f5f5] whitespace-pre-wrap break-words font-mono leading-relaxed">
              {displayContent}
            </pre>
          </div>
        </div>
      )}

      <a
        href="/"
        className="inline-block text-sm text-[#a3a3a3] hover:text-[#6366f1] transition-colors"
      >
        ← {t("createPaste")}
      </a>
    </div>
  );
}

