import { NextRequest, NextResponse } from "next/server";
import {
  PRIVATE_AREAS_ENABLED,
  isPrivateAreaPath,
} from "./src/config/features";

export function middleware(request: NextRequest) {
  if (!PRIVATE_AREAS_ENABLED && isPrivateAreaPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/unavailable";
    url.search = "";
    return NextResponse.rewrite(url, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/dashboard/:path*"],
};
