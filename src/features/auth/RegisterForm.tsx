"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { registerAction } from "@/actions/auth/auth.actions";
import { Input } from "../shared/ui/Input";
import { Button } from "../shared/ui/Button";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/auth/login");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input id="email"           name="email"           label="Email"                  type="email"    autoComplete="email" />
      <Input id="password"        name="password"        label="Contraseña"             type="password" autoComplete="new-password" />
      <Input id="confirmPassword" name="confirmPassword" label="Confirmá tu contraseña" type="password" autoComplete="new-password" />
      <Input id="phone"           name="phone"           label="Teléfono (opcional)"    type="tel" />

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" isLoading={isPending}>
        Crear cuenta
      </Button>
    </form>
  );
}