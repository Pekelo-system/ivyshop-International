import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es obligatorio")
    .email("Ingresa un correo válido"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "El correo es obligatorio")
      .email("Ingresa un correo válido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const confirmCodeSchema = z.object({
  code: z
    .string()
    .min(6, "El código debe tener 6 dígitos")
    .max(6, "El código debe tener 6 dígitos")
    .regex(/^\d+$/, "El código solo debe contener números"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ConfirmCodeFormData = z.infer<typeof confirmCodeSchema>;
