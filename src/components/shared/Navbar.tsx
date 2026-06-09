"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, LogOut, LogIn } from "lucide-react";
import { signOut } from "aws-amplify/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "./SearchBar";
import { useCart } from "@/hooks/useCart";

interface NavbarProps {
  isAuthenticated?: boolean;
}

export function Navbar({ isAuthenticated = false }: NavbarProps) {
  const router = useRouter();
  const totalItems = useCart((state) => state.getTotalItems());
  const total = useCart((state) => state.getTotal());

  async function handleSignOut() {
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex-shrink-0 text-xl font-bold text-green-700 hover:text-green-800 transition-colors"
          aria-label="ivyshop International - Inicio"
        >
          ivy<span className="text-orange-600">shop</span>
        </Link>

        <div className="flex flex-1 justify-center px-4">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <Link href="/carrito" aria-label={`Carrito: ${totalItems} artículos`}>
            <Button variant="ghost" size="sm" className="relative h-9 px-3">
              <ShoppingCart className="h-5 w-5 text-gray-600" aria-hidden="true" />
              {totalItems > 0 && (
                <Badge
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-orange-600 text-white"
                  aria-hidden="true"
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {totalItems > 0 && (
            <span
              className="hidden text-sm font-medium text-green-700 sm:block"
              aria-hidden="true"
            >
              ${total.toFixed(2)}
            </span>
          )}

          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="h-9 px-3 text-gray-600 hover:text-red-600"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span className="hidden ml-1 sm:inline">Salir</span>
            </Button>
          ) : (
            <Link href="/auth/login">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-gray-600 hover:text-green-700"
                aria-label="Iniciar sesión"
              >
                <LogIn className="h-5 w-5" aria-hidden="true" />
                <span className="hidden ml-1 sm:inline">Entrar</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
