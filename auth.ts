import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { loginSchema } from "@/src/global/schemas/auth.schema";
import { Role } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      credentials: {
        email:    { label: "Email",     type: "email" },
        password: { label: "Password",  type: "password" },
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
          console.error("AUTHORIZE ERROR:", JSON.stringify(e, null, 2));
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Login con credentials o google → adjuntar id y role al token
      if (user) {
        token.id   = user.id as string;
        token.role = (user as { role: Role }).role;
      }

      // Login con Google → upsert en DB y sincronizar token
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.upsert({
          where:  { email: token.email },
          update: {},
          create: {
            email:    token.email,
            password: "",         // sin contraseña para OAuth
            role:     Role.user,
          },
        });
        token.id   = dbUser.id;
        token.role = dbUser.role;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id   = token.id;
      session.user.role = token.role;
      return session;
    },
  },
});