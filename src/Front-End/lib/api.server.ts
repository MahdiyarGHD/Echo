import type { PasteResponse, CreatePasteRequest, ApiError } from "@/lib/api";

const API_URL = process.env.API_URL || "http://localhost:5000";

export async function fetchPaste(accessCode: string, clientIp?: string): Promise<PasteResponse> {
  let res: Response;
  const fetchHeaders: Record<string, string> = {};
  if (clientIp) {
    fetchHeaders["X-Forwarded-For"] = clientIp;
  }
  try {
    res = await fetch(`${API_URL}/pastes/${encodeURIComponent(accessCode)}`, {
      cache: "no-store",
      headers: fetchHeaders,
    });
  } catch {
    throw { type: "network", message: "Network error" } as ApiError;
  }

  if (res.status === 200) return res.json();

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (res.status === 404) {
    const b = body as { detail?: string };
    throw { type: "notFound", message: b.detail || "Not found." } as ApiError;
  }
  if (res.status === 429) throw { type: "rateLimit", message: "Too many requests." } as ApiError;
  throw { type: "server", message: "Server error." } as ApiError;
}

export async function postPaste(req: CreatePasteRequest): Promise<PasteResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/pastes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  } catch {
    throw { type: "network", message: "Network error" } as ApiError;
  }

  if (res.status === 201) return res.json();

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (res.status === 400) {
    const b = body as { title?: string; errors?: Record<string, string[]> };
    throw { type: "validation", message: b.title || "Validation failed.", fieldErrors: b.errors } as ApiError;
  }
  if (res.status === 429) throw { type: "rateLimit", message: "Too many requests." } as ApiError;
  throw { type: "server", message: "Server error." } as ApiError;
}
