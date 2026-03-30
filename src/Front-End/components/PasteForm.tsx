"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { createPasteAction } from "@/app/actions";
import { encryptContent } from "@/lib/crypto";

const MAX_CONTENT_CHARS = 10000;
const MAX_TITLE_CHARS = 200;

const EXPIRATION_OPTIONS = [
  { key: "1hour", hours: 1 },
  { key: "3hours", hours: 3 },
  { key: "6hours", hours: 6 },
  { key: "12hours", hours: 12 },
  { key: "1day", hours: 24 },
  { key: "3days", hours: 72 },
  { key: "7days", hours: 168 },
  { key: "14days", hours: 336 },
] as const;

export default function PasteForm() {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [expiration, setExpiration] = useState<string>("1day");
  const [isExplosive, setIsExplosive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const contentChars = content.length;
  const charsOver = contentChars > MAX_CONTENT_CHARS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!content.trim()) return;
    if (charsOver) return;
    if (isProtected && !password) return;

    setLoading(true);
    try {
      let finalContent = content;
      if (isProtected && password) {
        finalContent = await encryptContent(content, password);
      }

      const expirationOption = EXPIRATION_OPTIONS.find((o) => o.key === expiration)!;
      const expireHours = expirationOption.hours;

      const result = await createPasteAction({
        content: finalContent,
        title: title || undefined,
        isProtected,
        expireHours,
        isExplosive,
      });

      if (!result.ok) {
        const apiErr = result.error;
        if (apiErr.type === "validation") {
          setFieldErrors(apiErr.fieldErrors || {});
          setError(t("errorOccurred"));
        } else if (apiErr.type === "rateLimit") {
          setError(t("tooManyRequests"));
        } else if (apiErr.type === "network") {
          setError(t("networkError"));
        } else {
          setError(t("errorOccurred"));
        }
        return;
      }

      const url = `${window.location.origin}/${result.data.accessCode}`;
      setCreatedUrl(url);
    } catch {
      setError(t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdUrl) return;
    await navigator.clipboard.writeText(createdUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleReset = () => {
    setCreatedUrl(null);
    setTitle("");
    setContent("");
    setIsProtected(false);
    setPassword("");
    setExpiration("1day");
    setIsExplosive(false);
    setError(null);
    setFieldErrors({});
  };

  if (createdUrl) {
    return (
      <div className="w-full max-w-2xl mx-auto animate-fade-in">
        <div className="rounded-xl border border-[#334155] bg-[#1e293b] p-6 text-center space-y-5">
          <div className="text-3xl">✅</div>
          <h2 className="text-xl font-bold text-[#e2e8f0]">{t("pasteCreated")}</h2>
          <p className="text-sm text-[#94a3b8]">{t("shareLink")}</p>
          <div className="flex items-center gap-2 bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3">
            <span className="flex-1 text-sm font-semibold text-[#6366f1] break-all text-start">{createdUrl}</span>
            <button
              onClick={handleCopyLink}
              className="shrink-0 px-3 py-1.5 text-xs bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-md transition-colors"
            >
              {linkCopied ? t("copied") : t("copyLink")}
            </button>
          </div>
          <div className="flex items-center justify-center gap-3">
            <a
              href={createdUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t("viewPaste")}
            </a>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#334155] hover:border-[#6366f1] text-sm text-[#94a3b8] hover:text-[#e2e8f0] rounded-lg transition-colors group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5"
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                  clipRule="evenodd"
                />
              </svg>
              {t("createPaste")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#94a3b8]">{t("title")}</label>
            <span className="text-xs text-[#94a3b8]">
              {t("charactersRemaining")} {MAX_TITLE_CHARS - title.length}
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_CHARS))}
            placeholder={t("titlePlaceholder")}
            className="w-full px-4 py-2.5 rounded-lg border border-[#334155] bg-[#0f172a] text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#6366f1] transition-colors text-sm"
          />
          {fieldErrors["Title"] && (
            <p className="text-xs text-red-400">{fieldErrors["Title"].join(", ")}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#94a3b8]">{t("content")}</label>
            <span className={`text-xs ${charsOver ? "text-red-400" : "text-[#94a3b8]"}`}>
              {t("charactersUsed")} {contentChars}/{MAX_CONTENT_CHARS}
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("contentPlaceholder")}
            required
            rows={10}
            className={`w-full px-4 py-2.5 rounded-lg border ${charsOver ? "border-red-500" : "border-[#334155]"} bg-[#0f172a] text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#6366f1] transition-colors text-sm font-mono resize-y`}
          />
          {fieldErrors["Content"] && (
            <p className="text-xs text-red-400">{fieldErrors["Content"].join(", ")}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#94a3b8]">{t("expiration")}</label>
            <select
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#334155] bg-[#0f172a] text-[#e2e8f0] focus:outline-none focus:border-[#6366f1] transition-colors text-sm appearance-none"
            >
              {EXPIRATION_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {t(opt.key as Parameters<typeof t>[0])}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 flex flex-col justify-end">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isProtected}
                  onChange={(e) => setIsProtected(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full transition-colors ${isProtected ? "bg-[#6366f1]" : "bg-[#334155]"}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isProtected ? "translate-x-5" : "translate-x-0"}`} />
              </div>
              <span className="text-sm text-[#94a3b8]">{t("passwordProtection")}</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isExplosive}
                  onChange={(e) => setIsExplosive(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full transition-colors ${isExplosive ? "bg-orange-500" : "bg-[#334155]"}`} />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isExplosive ? "translate-x-5" : "translate-x-0"}`} />
              </div>
              <span className="text-sm text-[#94a3b8]">🔥 {t("burnAfterRead")}</span>
            </label>
          </div>
        </div>

        {isProtected && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#94a3b8]">🔒 {t("password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              required={isProtected}
              className="w-full px-4 py-2.5 rounded-lg border border-[#334155] bg-[#0f172a] text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#6366f1] transition-colors text-sm"
            />
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-900/20 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || charsOver || !content.trim() || (isProtected && !password)}
          className="w-full py-3 rounded-lg bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
        >
          {loading ? t("loading") : t("createPaste")}
        </button>
      </form>
    </div>
  );
}
