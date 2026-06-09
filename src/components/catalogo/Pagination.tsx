"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNext: () => void;
  onPrev: () => void;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  hasNextPage,
  hasPrevPage,
  onNext,
  onPrev,
  isLoading = false,
}: PaginationProps) {
  return (
    <nav
      className="flex items-center justify-center gap-4 py-8"
      aria-label="Paginación del catálogo"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={!hasPrevPage || isLoading}
        aria-label="Página anterior"
      >
        <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
        Anterior
      </Button>

      <span className="text-sm text-gray-600" aria-current="page">
        Página {currentPage}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!hasNextPage || isLoading}
        aria-label="Página siguiente"
      >
        Siguiente
        <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
