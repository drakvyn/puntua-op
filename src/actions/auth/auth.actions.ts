"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { Role } from "@/generated/prisma/enums";
import { loginSchema, registerSchema } from "@/src/global/schemas/auth.schema";
import prisma from "@/lib/prisma";

export type ActionResult =
  | { success: true;  message: string }
  | { success: false; error: string };

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    email:           formData.get("email"),
    password:        formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    phone:           formData.get("phone") || undefined,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { email, password, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "El email ya está registrado" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      phone:    phone ?? null,
      role:     Role.user,
    },
  });

  return { success: true, message: "Cuenta creada exitosamente" };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email:    formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  try {
    await signIn("credentials", {
      email:    parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true, message: "Sesión iniciada" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Email o contraseña incorrectos" };
        default:
          return { success: false, error: "Error al iniciar sesión" };
      }
    }
    throw error;
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction() {
  await signOut({ redirectTo: "/auth/login" });
}