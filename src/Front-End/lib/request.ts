export function getClientIp(headersList: Pick<Headers, "get">): string | undefined {
  const forwardedFor = headersList.get("x-forwarded-for");
  return (
    (forwardedFor ? forwardedFor.split(",")[0].trim() : null) ??
    headersList.get("x-real-ip") ??
    undefined
  );
}
