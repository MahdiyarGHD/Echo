import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Echo",
  description: "Share your thoughts — a minimal pastebin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#0f0f0f] text-[#f5f5f5]">
        <LanguageProvider>
          <header className="sticky top-0 z-50 border-b border-[#2a2a2a] bg-[#0f0f0f]/80 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
              <a href="/" className="text-xl font-bold text-[#f5f5f5] hover:text-[#6366f1] transition-colors">
                Echo
              </a>
              <LanguageToggle />
            </div>
          </header>
          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
