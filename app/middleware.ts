import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Also exclude API routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};

export async function middleware(request: NextRequest) {
  return await updateSession(request);
} 