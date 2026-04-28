import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "El email es obligatorio" })
    .email("Email inválido"),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(6, "Mínimo 6 caracteres"),
});

export const registerSchema = z
  .object({
    email: z
      .string({ required_error: "El email es obligatorio" })
      .email("Email inválido"),
    password: z
      .string({ required_error: "La contraseña es obligatoria" })
      .min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string({ required_error: "Confirmá tu contraseña" }),
    phone: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type LoginInput    = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;