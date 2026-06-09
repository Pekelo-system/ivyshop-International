"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Product } from "@/types";

interface ProductTableProps {
  products: Product[];
  onDelete?: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
  zapatos: "Zapatos", ropa: "Ropa", "electrónicos": "Electrónicos", libros: "Libros", otros: "Otros",
};

export function ProductTable({ products, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">No hay productos</p>
        <p className="text-sm mt-1">Crea tu primer producto para comenzar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" aria-label="Lista de productos">
        <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3 text-right">Precio</th>
            <th className="px-4 py-3 text-right">Stock</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                {product.name}
              </td>
              <td className="px-4 py-3">
                <Badge variant="secondary" className="text-xs">
                  {categoryLabels[product.category] ?? product.category}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right font-medium text-green-700">
                ${product.price.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right">
                {product.stock === 0 ? (
                  <Badge variant="destructive" className="text-xs">Agotado</Badge>
                ) : (
                  <span className="text-gray-700">{product.stock}</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Link href={`/admin/productos/${product.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={`Editar ${product.name}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700" onClick={() => onDelete?.(product.id)} aria-label={`Eliminar ${product.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
