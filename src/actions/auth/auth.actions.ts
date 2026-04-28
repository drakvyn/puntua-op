"use server";

import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma/enums";
import { loginSchema, registerSchema } from "@/src/global/schemas/auth.schema";
import prisma from "@/lib/prisma";

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { email, password, phone } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { success: false, error: "El email ya está registrado" };

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, password: hashedPassword, phone: phone ?? null, role: Role.user },
  });

  return { success: true, message: "Cuenta creada exitosamente" };
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return { success: false, error: "Email o contraseña incorrectos" };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { success: false, error: "Email o contraseña incorrectos" };
  }

  return { success: true, message: "Credenciales válidas" };
}

export async function logoutAction(): Promise<void> {
  
}