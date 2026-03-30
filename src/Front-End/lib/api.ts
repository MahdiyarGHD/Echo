export interface PasteResponse {
  accessCode: string;
  content: string;
  title?: string;
  isProtected: boolean;
  expirationTime?: string;
  createdAt: string;
  viewCount: number;
  isExplosive: boolean;
}

export interface CreatePasteRequest {
  content: string;
  title?: string;
  isProtected: boolean;
  expireHours: number;
  isExplosive: boolean;
}

export interface ApiError {
  type: "validation" | "notFound" | "rateLimit" | "server" | "network";
  message: string;
  fieldErrors?: Record<string, string[]>;
}

export async function createPaste(req: CreatePasteRequest): Promise<PasteResponse> {
  let res: Response;
  try {
    res = await fetch("/api/pastes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  } catch {
    throw { type: "network", message: "Network error" } as ApiError;
  }

  if (res.status === 201) return res.json();

  let body: unknown;
  try { body = await res.json(); } catch { body = {}; }

  if (res.status === 400) {
    const b = body as { title?: string; errors?: Record<string, string[]> };
    throw { type: "validation", message: b.title || "Validation failed.", fieldErrors: b.errors } as ApiError;
  }
  if (res.status === 429) throw { type: "rateLimit", message: "Too many requests." } as ApiError;
  throw { type: "server", message: "Server error." } as ApiError;
}
