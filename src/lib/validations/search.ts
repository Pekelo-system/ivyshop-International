import { z } from "zod";

export const searchFiltersSchema = z
  .object({
    q: z.string().optional(),
    categoria: z
      .enum(["zapatos", "ropa", "electrónicos", "libros", "otros"])
      .optional(),
    precioMin: z.coerce.number().min(0).optional(),
    precioMax: z.coerce.number().min(0).optional(),
  })
  .refine(
    (data) => {
      if (
        data.precioMin !== undefined &&
        data.precioMax !== undefined
      ) {
        return data.precioMin <= data.precioMax;
      }
      return true;
    },
    {
      message: "El precio mínimo no puede ser mayor al precio máximo",
      path: ["precioMin"],
    }
  );

export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;
