"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "aws-amplify/auth";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const [serverError, setServerError] = useState<string | null>(null);
  const verified = searchParams.get("verified") === "1";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);
    try {
      const result = await signIn({
        username: data.email,
        password: data.password,
      });
      if (result.isSignedIn) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : "";
      if (name === "UserNotConfirmedException") {
        setServerError(
          "Tu cuenta aún no está verificada. Revisa tu correo para confirmarla.",
        );
      } else if (
        name === "LimitExceededException" ||
        name === "TooManyRequestsException" ||
        name === "TooManyFailedAttemptsException"
      ) {
        setServerError(
          "Demasiados intentos. Espera unos minutos antes de volver a intentarlo.",
        );
      } else {
        // Mensaje genérico para credenciales inválidas (NotAuthorizedException,
        // UserNotFoundException): no revela qué campo falló (evita enumeración de usuarios).
        setServerError("Correo o contraseña incorrectos.");
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-700">
            Iniciar Sesión
          </CardTitle>
          <CardDescription>
            Accede a tu cuenta de ivyshop International
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verified && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
              ¡Cuenta verificada correctamente! Ya puedes iniciar sesión.
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div
                role="alert"
                className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200"
              >
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link
                href="/auth/registro"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Regístrate
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
