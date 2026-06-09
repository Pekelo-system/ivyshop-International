"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/admin/ProductTable";
import { type Product } from "@/types";

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/productos?limit=100");
      const data = await res.json();
      if (data.success) setProducts(data.data ?? []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProducts(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-1" /> Nuevo producto
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando productos...</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <ProductTable products={products} onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}
