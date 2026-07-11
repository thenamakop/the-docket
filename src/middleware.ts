import { NextResponse } from 'next/server';

// Placeholder middleware: passes every request through unchanged.
// Route protection for /admin/* will be implemented in Phase 3.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
