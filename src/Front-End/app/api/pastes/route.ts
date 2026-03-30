import { postPaste } from "@/lib/api.server";
import type { CreatePasteRequest, ApiError } from "@/lib/api";

export async function POST(request: Request) {
  let body: CreatePasteRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ title: "Invalid request body." }, { status: 400 });
  }

  try {
    const result = await postPaste(body);
    return Response.json(result, { status: 201 });
  } catch (err) {
    const apiErr = err as ApiError;
    if (apiErr.type === "validation") {
      return Response.json(
        { title: apiErr.message, errors: apiErr.fieldErrors ?? {} },
        { status: 400 }
      );
    }
    if (apiErr.type === "rateLimit") {
      return Response.json({ title: "Too many requests." }, { status: 429 });
    }
    if (apiErr.type === "network") {
      return Response.json({ title: "Could not reach the server." }, { status: 502 });
    }
    return Response.json({ title: "An unexpected error occurred." }, { status: 500 });
  }
}
