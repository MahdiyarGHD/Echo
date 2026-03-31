const apiHost = process.env.API_URL || "http://localhost:5000";

export const domain = process.env.DOMAIN || "http://localhost:3000";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ accessCode: string }> }
) {
  const { accessCode } = await params;

  let res: Response;
  try {
    res = await fetch(`${apiHost}/pastes/${encodeURIComponent(accessCode)}`, {
      cache: "no-store",
    });
  } catch {
    return Response.json({ title: "Could not reach the server." }, { status: 502 });
  }

  if (res.status === 200) return Response.json(await res.json(), { status: 200 });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (res.status === 404) {
    const b = body as { detail?: string };
    return Response.json({ title: b.detail || "Not found." }, { status: 404 });
  }
  if (res.status === 429) {
    return Response.json({ title: "Too many requests." }, { status: 429 });
  }
  return Response.json({ title: "An unexpected error occurred." }, { status: 500 });
}
