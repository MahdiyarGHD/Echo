import { fetchPaste } from "@/lib/api.server";
import type { ApiError } from "@/lib/api";
import PasteView from "@/components/PasteView";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/request";

export default async function PastePage({
  params,
}: {
  params: Promise<{ accessCode: string }>;
}) {
  const { accessCode } = await params;

  const clientIp = getClientIp(await headers());

  try {
    const paste = await fetchPaste(accessCode, clientIp);
    return <PasteView paste={paste} errorType={null} />;
  } catch (err) {
    const errorType = (err as ApiError).type ?? "server";
    return <PasteView paste={null} errorType={errorType} />;
  }
}

