import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define protected and public routes
const isProtectedRoute = createRouteMatcher([
  '/studio(.*)',  // Protect all studio routes
  '/subscriptions',
  '/feed/subscribed',
  '/playlist(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',  // Home page is public
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/videos/webhook(.*)'  // Make Mux webhook endpoint public
]);

export default clerkMiddleware(async (auth, req) => {
  // If it's a public route, allow access
  if (isPublicRoute(req)) {
    return;
  }

  // For protected routes, ensure user is authenticated
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};