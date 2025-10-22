// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Define public routes that do not require authentication
const publicPaths = ["/login", "/register", "/api/auth", "/"];

// Middleware function
export default withAuth(
  function middleware(req) {
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

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/(?!_next/static|_next/image|favicon.ico|public/).*",
  ],
};
