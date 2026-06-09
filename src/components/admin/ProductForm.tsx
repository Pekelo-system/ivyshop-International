"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProductSchema } from "@/lib/validations/product";
import { type Product } from "@/types";
import { GenAIPanel } from "./GenAIPanel";

type ProductFormValues = {
  name: string;
  description?: string;
  price: number;
  category: "zapatos" | "ropa" | "electrónicos" | "libros" | "otros";
  stock: number;
  imageUrl?: string | null;
};

interface ProductFormProps {
  product?: Product;
  mode: "create" | "edit";
}

const CATEGORIES = [
  { value: "zapatos", label: "Zapatos" },
  { value: "ropa", label: "Ropa" },
  { value: "electrónicos", label: "Electrónicos" },
  { value: "libros", label: "Libros" },
  { value: "otros", label: "Otros" },
];

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: product ? {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      imageUrl: product.imageUrl,
    } : undefined,
  });

  async function onSubmit(data: ProductFormValues) {
    setServerError(null);
    try {
      const url = mode === "create" ? "/api/productos" : `/api/productos/${product?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error?.message ?? "Error al guardar el producto");
        return;
      }

      router.push("/admin/productos");
      router.refresh();
    } catch {
      setServerError("Error de conexión. Inténtalo de nuevo.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Nuevo producto" : "Editar producto"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre *</label>
            <Input id="name" {...register("name")} maxLength={200} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">Descripción</label>
            <textarea id="description" {...register("description")} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="price" className="text-sm font-medium text-gray-700">Precio *</label>
              <Input id="price" type="number" step="0.01" min="0.01" max="999999.99" {...register("price", { valueAsNumber: true })} aria-invalid={!!errors.price} />
              {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
            </div>
            <div className="space-y-1">
              <label htmlFor="stock" className="text-sm font-medium text-gray-700">Stock *</label>
              <Input id="stock" type="number" min="0" {...register("stock", { valueAsNumber: true })} aria-invalid={!!errors.stock} />
              {errors.stock && <p className="text-sm text-red-600">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="category" className="text-sm font-medium text-gray-700">Categoría *</label>
            <select id="category" {...register("category")} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" aria-invalid={!!errors.category}>
              <option value="">Seleccionar categoría</option>
              {CATEGORIES.map((cat) => (<option key={cat.value} value={cat.value}>{cat.label}</option>))}
            </select>
            {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
          </div>

          <GenAIPanel
            name={watch("name") ?? ""}
            category={watch("category") ?? ""}
            currentDescription={watch("description")}
            currentImageUrl={watch("imageUrl")}
            onDescriptionGenerated={(desc) => setValue("description", desc)}
            onImageGenerated={(url) => setValue("imageUrl", url)}
          />

          <div className="space-y-1">
            <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">URL de imagen</label>
            <Input id="imageUrl" type="url" {...register("imageUrl")} placeholder="https://..." />
            {errors.imageUrl && <p className="text-sm text-red-600">{errors.imageUrl.message}</p>}
          </div>

          {serverError && (
            <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{serverError}</div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : mode === "create" ? "Crear producto" : "Guardar cambios"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
