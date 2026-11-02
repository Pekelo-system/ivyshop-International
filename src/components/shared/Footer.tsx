import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div>
            <Link href="/" className="text-lg font-bold text-violet-600">
              ivy<span className="text-cyan-500">shop</span>
              <span className="ml-1 text-sm font-normal text-gray-500">International</span>
            </Link>
            <p className="mt-1 text-xs text-gray-400">Tu tienda en línea de confianza</p>
          </div>

          <nav aria-label="Enlaces del pie de página">
            <ul className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-violet-600 transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/carrito" className="hover:text-violet-600 transition-colors">
                  Carrito
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-violet-600 transition-colors">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </nav>

          <p className="text-xs text-gray-400">© {currentYear} ivyshop International</p>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Todos los pagos son simulados. No se realizan cargos reales.
        </p>
      </div>
    </footer>
  );
}
