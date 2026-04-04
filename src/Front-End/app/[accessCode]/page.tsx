import { fetchPaste } from "@/lib/api.server";
import type { ApiError } from "@/lib/api";
import PasteView from "@/components/PasteView";
import { headers } from "next/headers";

export default async function PastePage({
  params,
}: {
  params: Promise<{ accessCode: string }>;
}) {
  const { accessCode } = await params;

  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const clientIp =
    (forwardedFor ? forwardedFor.split(",")[0].trim() : null) ??
    headersList.get("x-real-ip") ??
    undefined;

  try {
    const paste = await fetchPaste(accessCode, clientIp);
    return <PasteView paste={paste} errorType={null} />;
  } catch (err) {
    const errorType = (err as ApiError).type ?? "server";
    return <PasteView paste={null} errorType={errorType} />;
  }
}

