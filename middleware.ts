// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rateLimit = {
  windowMs: 60 * 1000, // 1 menit
  maxRequests: 30,
};

const ipStore = new Map<string, { count: number; startTime: number }>();

export function middleware(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry) {
    ipStore.set(ip, { count: 1, startTime: now });
    return NextResponse.next();
  }

  const timePassed = now - entry.startTime;

  if (timePassed < rateLimit.windowMs) {
    if (entry.count >= rateLimit.maxRequests) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
    entry.count++;
  } else {
    ipStore.set(ip, { count: 1, startTime: now });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
