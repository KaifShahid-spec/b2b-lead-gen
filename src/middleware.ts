import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 🚨 FIX: Next.js Edge Runtime sometimes fails to load .env.local
  // This ensures the variables are available locally.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://nyumapizvsdutebwormu.supabase.co";
  }

  // ⚠️ IMPORTANT: Replace the string below with your ACTUAL Anon Key from Supabase
  // (Dashboard -> Settings -> API -> anon public key)
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55dW1hcGl6dnNkdXRlYndvcm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDMyOTEsImV4cCI6MjA5ODkxOTI5MX0.AlI6XMMbdpIXRUuLTNougdRb27jC3NndUK-cTMoeiao";
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}