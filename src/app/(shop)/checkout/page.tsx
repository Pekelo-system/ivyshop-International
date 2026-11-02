"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { shippingAddressSchema, type ShippingAddressFormData } from "@/lib/validations/checkout";
import { AlertTriangle } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.getTotal());
  const clearCart = useCart((s) => s.clearCart);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ShippingAddressFormData>({
    resolver: zodResolver(shippingAddressSchema),
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Carrito vacío</h1>
        <p className="mt-2 text-slate-300">No puedes proceder al checkout sin productos en tu carrito.</p>
        <Button className="mt-6 bg-violet-600 hover:bg-violet-700 text-white" onClick={() => router.push("/")}>
          Explorar catálogo
        </Button>
      </div>
    );
  }

  async function onSubmit(data: ShippingAddressFormData) {
    setServerError(null);
    try {
      const res = await fetch("/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error?.message ?? "Error al procesar el pedido");
        return;
      }

      clearCart();
      router.push(`/confirmacion/${result.data.id}`);
    } catch {
      setServerError("Error de conexión. Inténtalo de nuevo.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Payment simulation banner */}
      <div className="mb-6 rounded-lg bg-amber-900/30 border border-amber-700 p-4 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm text-amber-200 font-medium">
          Este es un pago simulado. No se realizará ningún cargo real a tu cuenta.
        </p>
      </div>

      <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Shipping form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dirección de envío</CardTitle>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="fullName" className="text-sm font-medium text-gray-900">Nombre completo del destinatario</label>
                  <Input id="fullName" {...register("fullName")} aria-invalid={!!errors.fullName} />
                  {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-1">
                  <label htmlFor="street" className="text-sm font-medium text-gray-900">Calle y número</label>
                  <Input id="street" {...register("street")} aria-invalid={!!errors.street} />
                  {errors.street && <p className="text-sm text-red-600">{errors.street.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="city" className="text-sm font-medium text-gray-900">Ciudad</label>
                    <Input id="city" {...register("city")} aria-invalid={!!errors.city} />
                    {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="stateOrProvince" className="text-sm font-medium text-gray-900">Estado/Provincia</label>
                    <Input id="stateOrProvince" {...register("stateOrProvince")} aria-invalid={!!errors.stateOrProvince} />
                    {errors.stateOrProvince && <p className="text-sm text-red-600">{errors.stateOrProvince.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="postalCode" className="text-sm font-medium text-gray-900">Código postal</label>
                    <Input id="postalCode" {...register("postalCode")} aria-invalid={!!errors.postalCode} />
                    {errors.postalCode && <p className="text-sm text-red-600">{errors.postalCode.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="country" className="text-sm font-medium text-gray-900">País</label>
                    <Input id="country" {...register("country")} aria-invalid={!!errors.country} />
                    {errors.country && <p className="text-sm text-red-600">{errors.country.message}</p>}
                  </div>
                </div>

                {serverError && (
                  <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{serverError}</div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-slate-300 truncate max-w-[60%]">{item.productName ?? item.productId} × {item.quantity}</span>
                  <span className="font-medium text-white">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-violet-400">${total.toFixed(2)}</span>
              </div>
              <Button
                type="submit"
                form="checkout-form"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Procesando..." : "Confirmar pedido"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
