import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(200, "El nombre no puede exceder 200 caracteres"),
  description: z.string().optional().default(""),
  price: z
    .number()
    .min(0.01, "El precio mínimo es $0.01")
    .max(999999.99, "El precio máximo es $999,999.99"),
  category: z.enum(["zapatos", "ropa", "electrónicos", "libros", "otros"], {
    message: "Categoría inválida",
  }),
  stock: z
    .number()
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo"),
  imageUrl: z.string().url("URL de imagen inválida").optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
