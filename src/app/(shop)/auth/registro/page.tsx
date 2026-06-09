"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUp, confirmSignUp, resendSignUpCode } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
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
import {
  registerSchema,
  confirmCodeSchema,
  type RegisterFormData,
  type ConfirmCodeFormData,
} from "@/lib/validations/auth";

type Step = "register" | "verify";

export default function RegistroPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("register");
  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const verifyForm = useForm<ConfirmCodeFormData>({
    resolver: zodResolver(confirmCodeSchema),
  });

  async function onRegister(data: RegisterFormData) {
    setServerError(null);
    try {
      await signUp({
        username: data.email,
        password: data.password,
        options: { userAttributes: { email: data.email } },
      });
      setEmail(data.email);
      setStep("verify");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("UsernameExistsException")) {
        setServerError("Ya existe una cuenta con este correo.");
      } else {
        setServerError("Error al crear la cuenta. Inténtalo de nuevo.");
      }
    }
  }

  async function onVerify(data: ConfirmCodeFormData) {
    setServerError(null);
    try {
      await confirmSignUp({ username: email, confirmationCode: data.code });
      router.push("/auth/login?verified=1");
    } catch {
      setServerError("Código inválido o expirado. Solicita uno nuevo.");
    }
  }

  async function handleResend() {
    setResendMessage(null);
    try {
      await resendSignUpCode({ username: email });
      setResendMessage("Código reenviado. Revisa tu correo.");
    } catch {
      setResendMessage("No se pudo reenviar el código. Inténtalo más tarde.");
    }
  }

  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-700">
              Verifica tu correo
            </CardTitle>
            <CardDescription>
              Hemos enviado un código de verificación a{" "}
              <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={verifyForm.handleSubmit(onVerify)}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label
                  htmlFor="code"
                  className="text-sm font-medium text-gray-700"
                >
                  Código de verificación
                </label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  {...verifyForm.register("code")}
                  aria-invalid={!!verifyForm.formState.errors.code}
                />
                {verifyForm.formState.errors.code && (
                  <p className="text-sm text-red-600">
                    {verifyForm.formState.errors.code.message}
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
              {resendMessage && (
                <p className="text-sm text-green-700">{resendMessage}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={verifyForm.formState.isSubmitting}
              >
                {verifyForm.formState.isSubmitting
                  ? "Verificando..."
                  : "Verificar cuenta"}
              </Button>

              <button
                type="button"
                onClick={handleResend}
                className="w-full text-sm text-orange-600 hover:text-orange-700 underline"
              >
                Reenviar código de verificación
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-700">
            Crear cuenta
          </CardTitle>
          <CardDescription>Únete a ivyshop International</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={registerForm.handleSubmit(onRegister)}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label
                htmlFor="reg-email"
                className="text-sm font-medium text-gray-700"
              >
                Correo electrónico
              </label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                {...registerForm.register("email")}
                aria-invalid={!!registerForm.formState.errors.email}
              />
              {registerForm.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {registerForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="reg-password"
                className="text-sm font-medium text-gray-700"
              >
                Contraseña
              </label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                {...registerForm.register("password")}
                aria-invalid={!!registerForm.formState.errors.password}
              />
              {registerForm.formState.errors.password && (
                <p className="text-sm text-red-600">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Confirmar contraseña
              </label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                {...registerForm.register("confirmPassword")}
                aria-invalid={!!registerForm.formState.errors.confirmPassword}
              />
              {registerForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {registerForm.formState.errors.confirmPassword.message}
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
              disabled={registerForm.formState.isSubmitting}
            >
              {registerForm.formState.isSubmitting
                ? "Creando cuenta..."
                : "Crear cuenta"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/auth/login"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Inicia sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
