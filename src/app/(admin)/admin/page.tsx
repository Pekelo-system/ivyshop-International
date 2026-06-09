import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <Package className="h-8 w-8 text-green-600" aria-hidden="true" />
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-500">Gestiona el catálogo de productos</p>
            <div className="flex gap-2">
              <Link href="/admin/productos">
                <Button variant="outline" size="sm">Ver todos</Button>
              </Link>
              <Link href="/admin/productos/nuevo">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-1" /> Nuevo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
