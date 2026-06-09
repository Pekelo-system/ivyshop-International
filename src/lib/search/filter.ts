import { type Product, type ProductCategory } from "@/types";

export interface SearchFilters {
  q?: string;
  categoria?: ProductCategory | string;
  precioMin?: number;
  precioMax?: number;
}

/**
 * Filter products client-side (or in-memory after a DynamoDB scan).
 * All active filters are applied conjunctively (AND).
 * Text search is case-insensitive and matches against product name.
 */
export function filterProducts(
  products: Product[],
  filters: SearchFilters
): Product[] {
  return products.filter((product) => {
    // Text filter — case-insensitive substring match on name
    if (filters.q && filters.q.trim().length > 0) {
      const term = filters.q.trim().toLowerCase();
      if (!product.name.toLowerCase().includes(term)) return false;
    }

    // Category filter
    if (filters.categoria && filters.categoria.trim().length > 0) {
      if (product.category !== filters.categoria) return false;
    }

    // Price range filter
    if (filters.precioMin !== undefined && product.price < filters.precioMin)
      return false;
    if (filters.precioMax !== undefined && product.price > filters.precioMax)
      return false;

    return true;
  });
}
