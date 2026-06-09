"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GenAIPanelProps {
  name: string;
  category: string;
  onDescriptionGenerated: (description: string) => void;
  onImageGenerated: (imageUrl: string) => void;
  currentDescription?: string;
  currentImageUrl?: string | null;
}

export function GenAIPanel({
  name,
  category,
  onDescriptionGenerated,
  onImageGenerated,
  currentDescription,
  currentImageUrl,
}: GenAIPanelProps) {
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [descError, setDescError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const canGenerate = name.trim().length > 0 && category.trim().length > 0;

  async function handleGenerateDescription() {
    if (!canGenerate) return;
    setLoadingDesc(true);
    setDescError(null);
    try {
      const res = await fetch("/api/genai/descripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category }),
      });
      const data = await res.json();
      if (data.success) {
        onDescriptionGenerated(data.data.description);
      } else {
        setDescError(data.error?.message ?? "Error al generar descripción");
      }
    } catch {
      setDescError("Error de conexión");
    } finally {
      setLoadingDesc(false);
    }
  }

  async function handleGenerateImage() {
    if (!canGenerate) return;
    setLoadingImage(true);
    setImageError(null);
    try {
      const res = await fetch("/api/genai/imagen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, category }),
      });
      const data = await res.json();
      if (data.success) {
        onImageGenerated(data.data.imageUrl);
      } else {
        setImageError(data.error?.message ?? "Error al generar imagen");
      }
    } catch {
      setImageError("Error de conexión");
    } finally {
      setLoadingImage(false);
    }
  }

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-600" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-purple-900">Generación con IA</h3>
      </div>

      {!canGenerate && (
        <p className="text-xs text-purple-600">Completa el nombre y categoría para habilitar la generación con IA.</p>
      )}

      {/* Description */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleGenerateDescription}
          disabled={!canGenerate || loadingDesc}
          className="text-xs"
        >
          {loadingDesc ? (
            <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generando...</>
          ) : currentDescription ? (
            <><RefreshCw className="h-3 w-3 mr-1" /> Regenerar descripción</>
          ) : (
            <><Sparkles className="h-3 w-3 mr-1" /> Generar descripción</>
          )}
        </Button>
        {descError && <span className="text-xs text-red-600">{descError}</span>}
      </div>

      {/* Image */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleGenerateImage}
          disabled={!canGenerate || loadingImage}
          className="text-xs"
        >
          {loadingImage ? (
            <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generando...</>
          ) : currentImageUrl ? (
            <><RefreshCw className="h-3 w-3 mr-1" /> Regenerar imagen</>
          ) : (
            <><Sparkles className="h-3 w-3 mr-1" /> Generar imagen</>
          )}
        </Button>
        {imageError && <span className="text-xs text-red-600">{imageError}</span>}
      </div>
    </div>
  );
}
