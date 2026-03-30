"use server";

import { postPaste } from "@/lib/api.server";
import type { CreatePasteRequest, PasteResponse, ApiError } from "@/lib/api";

export type CreatePasteResult =
  | { ok: true; data: PasteResponse }
  | { ok: false; error: ApiError };

export async function createPasteAction(
  req: CreatePasteRequest
): Promise<CreatePasteResult> {
  try {
    const data = await postPaste(req);
    return { ok: true, data };
  } catch (err) {
    const apiErr = err as ApiError;
    return {
      ok: false,
      error: {
        type: apiErr.type ?? "server",
        message: apiErr.message ?? "Server error.",
        fieldErrors: apiErr.fieldErrors,
      },
    };
  }
}
