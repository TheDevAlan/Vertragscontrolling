import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (NextAuth routes)
     * - api/cron (Cron-Jobs, haben eigene Authentifizierung)
     * - login (Login-Seite)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!api/auth|api/cron|login|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

