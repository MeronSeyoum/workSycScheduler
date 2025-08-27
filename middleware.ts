// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { getAccessToken } from './lib/utils/auth';

// const protectedRoutes = ['/dashboard', '/settings']; // Add your protected routes

// export function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname;
//   const isProtected = protectedRoutes.some((route) =>
//     pathname.startsWith(route)
//   );

//   if (isProtected) {
//     const token = getAccessToken();
//     if (!token) {
//       return NextResponse.redirect(new URL('/login', request.url));
//     }
//   }

//   return NextResponse.next();
// }