import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .min(1, "El nombre completo es obligatorio")
    .max(200, "El nombre no puede exceder 200 caracteres"),
  street: z
    .string()
    .min(1, "La calle y número son obligatorios"),
  city: z
    .string()
    .min(1, "La ciudad es obligatoria"),
  stateOrProvince: z
    .string()
    .min(1, "El estado o provincia es obligatorio"),
  postalCode: z
    .string()
    .min(1, "El código postal es obligatorio"),
  country: z
    .string()
    .min(1, "El país es obligatorio"),
});

export type ShippingAddressFormData = z.infer<typeof shippingAddressSchema>;
