import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConfirmacionPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function ConfirmacionPage({ params }: ConfirmacionPageProps) {
  const { orderId } = await params;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-600 mb-4" aria-hidden="true" />
      <h1 className="text-3xl font-bold text-gray-900">¡Pedido confirmado!</h1>
      <p className="mt-2 text-gray-500">Tu pedido ha sido procesado exitosamente.</p>

      <Card className="mt-8 text-left">
        <CardHeader>
          <CardTitle className="text-lg">Detalles del pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Número de orden</span>
            <span className="font-mono font-medium text-gray-900">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estado</span>
            <span className="font-medium text-green-700">Confirmado</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/">
          <Button className="bg-green-600 hover:bg-green-700 text-white">Seguir comprando</Button>
        </Link>
      </div>

      {/* Simulation reminder */}
      <p className="mt-8 text-xs text-gray-400">
        Recuerda: este es un pedido simulado. No se ha realizado ningún cargo real.
      </p>
    </div>
  );
}
