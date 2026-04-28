import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/src/global/schemas/auth.schema";
import { Role } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";

const handler = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) return null;

          const { email, password } = parsed.data;
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.password) return null;

          const valid = await bcrypt.compare(password, user.password);
          if (!valid) return null;

          return { id: user.id, email: user.email, role: user.role };
        } catch (e) {
          console.error("AUTHORIZE ERROR:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      return session;
    },
  },
});

export async function GET(req: Request, ctx: any) {
  console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✓" : "✗ UNDEFINED");
  console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL ?? "UNDEFINED");
  return handler(req, ctx);
}

export async function POST(req: Request, ctx: any) {
  return handler(req, ctx);
}