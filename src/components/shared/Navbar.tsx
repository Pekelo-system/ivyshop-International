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
    <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-800 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex-shrink-0 flex flex-col"
          aria-label="ivyshop International - Inicio"
        >
          <span className="text-2xl font-bold text-violet-400 hover:text-violet-300 transition-colors">
            ivy<span className="text-cyan-400">shop</span>
            <span className="ml-1 text-sm font-normal text-slate-300">International</span>
          </span>
          <span className="text-xs text-slate-400 -mt-1">Tu tienda en línea de confianza</span>
        </Link>

        <div className="flex flex-1 justify-center px-4">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <Link href="/carrito" aria-label={`Carrito: ${totalItems} artículos`}>
            <Button variant="ghost" size="sm" className="relative h-10 px-4 gap-1">
              <ShoppingCart className="h-6 w-6 text-slate-300" aria-hidden="true" />
              <span className="hidden sm:inline text-sm text-slate-300">Carrito</span>
              {totalItems > 0 && (
                <Badge
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-cyan-500 text-white"
                  aria-hidden="true"
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {totalItems > 0 && (
            <span
              className="hidden text-sm font-medium text-violet-600 sm:block"
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
              className="h-10 px-4 text-slate-300 hover:text-red-400 gap-1"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-6 w-6" aria-hidden="true" />
              <span className="hidden sm:inline text-sm">Salir</span>
            </Button>
          ) : (
            <Link href="/auth/login">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-4 text-slate-300 hover:text-violet-400 gap-1"
                aria-label="Iniciar sesión"
              >
                <LogIn className="h-6 w-6" aria-hidden="true" />
                <span className="hidden sm:inline text-sm">Entrar</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
