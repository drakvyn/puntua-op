"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginAction } from "@/src/actions/auth/auth.actions";
import { Input } from "../shared/ui/Input";
import { Button } from "../shared/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }

      const res = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (res?.error) {
        setError("Email o contraseña incorrectos");
      } else {
        router.push("/user/me");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input id="email"    name="email"    label="Email"      type="email"    autoComplete="email" />
      <Input id="password" name="password" label="Contraseña" type="password" autoComplete="current-password" />

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <Button type="submit" isLoading={isPending}>
        Iniciar sesión
      </Button>
    </form>
  );
}