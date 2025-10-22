// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define public routes that do not require authentication
const publicPaths = ["/login", "/register", "/api/auth", "/"];

// Middleware function
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // Skip middleware for static files and public assets
    if (
      pathname.startsWith('/_next/static') ||
      pathname.startsWith('/_next/image') ||
      pathname === '/favicon.ico' ||
      pathname.startsWith('/public')
    ) {
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;

        // Allow public paths
        if (publicPaths.some((path) => pathname.startsWith(path))) {
          return true;
        }

        // Protect all other routes
        return !!token;
      },
    },
    // Redirect unauthorized users to login page
    pages: {
      signIn: "/login",
    },
  }
);
