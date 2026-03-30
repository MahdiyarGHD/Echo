import { fetchPaste } from "@/lib/api.server";
import type { ApiError } from "@/lib/api";
import PasteView from "@/components/PasteView";

export default async function PastePage({
  params,
}: {
  params: Promise<{ accessCode: string }>;
}) {
  const { accessCode } = await params;

  try {
    const paste = await fetchPaste(accessCode);
    return <PasteView paste={paste} errorType={null} />;
  } catch (err) {
    const errorType = (err as ApiError).type ?? "server";
    return <PasteView paste={null} errorType={errorType} />;
  }
}

