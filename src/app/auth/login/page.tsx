
import { LoginForm } from "@/features/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">Iniciar sesión</h1>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-gray-500">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </main>
  );
}