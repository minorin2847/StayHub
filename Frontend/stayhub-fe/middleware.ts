import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest){
  const token = request.cookies.get('session_token')?.value;
  if(token && request.nextUrl.pathname.startsWith('/login')){
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ['/login', '/dashboard/:path*']
}