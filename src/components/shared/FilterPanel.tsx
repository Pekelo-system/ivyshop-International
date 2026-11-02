"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  { value: "zapatos", label: "Zapatos" },
  { value: "ropa", label: "Ropa" },
  { value: "electrónicos", label: "Electrónicos" },
  { value: "libros", label: "Libros" },
  { value: "otros", label: "Otros" },
];

export function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("categoria")?.split(",").filter(Boolean) ?? []
  );
  const [precioMin, setPrecioMin] = useState(searchParams.get("precioMin") ?? "");
  const [precioMax, setPrecioMax] = useState(searchParams.get("precioMax") ?? "");
  const [priceError, setPriceError] = useState<string | null>(null);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function applyFilters() {
    setPriceError(null);
    const min = precioMin ? parseFloat(precioMin) : undefined;
    const max = precioMax ? parseFloat(precioMax) : undefined;

    if (min !== undefined && max !== undefined && min > max) {
      setPriceError("El precio mínimo no puede ser mayor al máximo");
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategories.length > 0) {
      params.set("categoria", selectedCategories[0]);
    } else {
      params.delete("categoria");
    }

    if (precioMin) params.set("precioMin", precioMin);
    else params.delete("precioMin");

    if (precioMax) params.set("precioMax", precioMax);
    else params.delete("precioMax");

    router.push(`/buscar?${params.toString()}`);
  }

  function clearFilters() {
    setSelectedCategories([]);
    setPrecioMin("");
    setPrecioMax("");
    setPriceError(null);
    const q = searchParams.get("q");
    router.push(q ? `/buscar?q=${encodeURIComponent(q)}` : "/buscar");
  }

  return (
    <aside className="w-full lg:w-64 space-y-6" aria-label="Filtros de búsqueda">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Categorías</h3>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.value)}
                onChange={() => toggleCategory(cat.value)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-slate-300">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Rango de precio</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            step={0.01}
            placeholder="Mín"
            value={precioMin}
            onChange={(e) => { setPrecioMin(e.target.value); setPriceError(null); }}
            className="h-9 w-full"
            aria-label="Precio mínimo"
          />
          <span className="text-gray-400">–</span>
          <Input
            type="number"
            min={0}
            step={0.01}
            placeholder="Máx"
            value={precioMax}
            onChange={(e) => { setPrecioMax(e.target.value); setPriceError(null); }}
            className="h-9 w-full"
            aria-label="Precio máximo"
          />
        </div>
        {priceError && <p className="mt-1 text-xs text-red-600">{priceError}</p>}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button onClick={applyFilters} className="w-full bg-violet-600 hover:bg-violet-700 text-white" size="sm">
          Aplicar filtros
        </Button>
        <Button onClick={clearFilters} variant="outline" size="sm" className="w-full">
          Limpiar filtros
        </Button>
      </div>
    </aside>
  );
}
