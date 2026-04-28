
// Exposes GET and POST for Auth.js:
// GET  /api/auth/session
// GET  /api/auth/csrf
// GET  /api/auth/providers
// GET  /api/auth/callback/google
// POST /api/auth/callback/credentials
// POST /api/auth/signout

import { handlers } from "@/auth";



// etc.
export const { GET, POST } = handlers;