import { type Product, type ProductCategory } from "@/types";
import { v4 as uuidv4 } from "uuid";

function makeProduct(
  overrides: Partial<Product> & {
    name: string;
    description: string;
    price: number;
    category: ProductCategory;
    stock: number;
    imageUrl?: string | null;
  }
): Product {
  const id = overrides.id ?? uuidv4();
  const category = overrides.category;
  const price = overrides.price;
  const priceKey =
    Math.floor(price).toString().padStart(7, "0") +
    "." +
    Math.round((price % 1) * 100)
      .toString()
      .padStart(2, "0");
  const now = new Date().toISOString();
  return {
    PK: `PRODUCT#${id}`,
    SK: "METADATA",
    GSI1PK: `CATEGORY#${category}`,
    GSI1SK: `PRICE#${priceKey}`,
    entityType: "PRODUCT",
    id,
    imageUrl: overrides.imageUrl ?? null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export const SEED_PRODUCTS: Product[] = [
  // --- ZAPATOS (4) ---
  makeProduct({
    name: "Zapatillas Running Pro",
    description:
      "Zapatillas deportivas de alto rendimiento para corredores exigentes. Suela de goma antideslizante.",
    price: 89.99,
    category: "zapatos",
    stock: 50,
    imageUrl: null,
  }),
  makeProduct({
    name: "Botas de Cuero Casual",
    description:
      "Botas de cuero genuino para uso diario. Cómodas y duraderas.",
    price: 129.99,
    category: "zapatos",
    stock: 30,
  }),
  makeProduct({
    name: "Sandalias de Playa",
    description:
      "Sandalias ligeras y resistentes al agua, perfectas para el verano.",
    price: 29.99,
    category: "zapatos",
    stock: 75,
  }),
  makeProduct({
    name: "Mocasines Elegantes",
    description:
      "Mocasines de piel sintética con suela flexible. Ideales para la oficina.",
    price: 69.99,
    category: "zapatos",
    stock: 40,
  }),

  // --- ROPA (5) ---
  makeProduct({
    name: "Camiseta Básica Algodón",
    description:
      "Camiseta de algodón 100% en corte clásico. Disponible en varios colores.",
    price: 19.99,
    category: "ropa",
    stock: 100,
  }),
  makeProduct({
    name: "Jeans Slim Fit",
    description:
      "Pantalón vaquero ajustado de alta calidad con elastano para mayor comodidad.",
    price: 59.99,
    category: "ropa",
    stock: 60,
  }),
  makeProduct({
    name: "Chaqueta de Invierno",
    description:
      "Chaqueta acolchada impermeable con capucha desmontable. Abriga hasta -10°C.",
    price: 149.99,
    category: "ropa",
    stock: 25,
  }),
  makeProduct({
    name: "Sudadera con Capucha",
    description:
      "Sudadera de algodón grueso con bolsillo canguro. Perfecta para el frío.",
    price: 44.99,
    category: "ropa",
    stock: 80,
  }),
  makeProduct({
    name: "Vestido Floral Verano",
    description:
      "Vestido ligero con estampado floral, ideal para días cálidos.",
    price: 39.99,
    category: "ropa",
    stock: 45,
  }),

  // --- ELECTRÓNICOS (5) ---
  makeProduct({
    name: "Auriculares Bluetooth Pro",
    description:
      "Auriculares inalámbricos con cancelación de ruido activa y 30h de batería.",
    price: 199.99,
    category: "electrónicos",
    stock: 35,
  }),
  makeProduct({
    name: "Smartwatch Serie 5",
    description:
      "Reloj inteligente con monitor de frecuencia cardíaca, GPS y resistencia al agua.",
    price: 249.99,
    category: "electrónicos",
    stock: 20,
  }),
  makeProduct({
    name: "Cargador Inalámbrico 15W",
    description:
      "Cargador rápido inalámbrico compatible con Qi. Carga tu dispositivo en minutos.",
    price: 34.99,
    category: "electrónicos",
    stock: 90,
  }),
  makeProduct({
    name: "Altavoz Portátil Waterproof",
    description:
      "Altavoz Bluetooth resistente al agua con 20h de reproducción. Sonido envolvente.",
    price: 79.99,
    category: "electrónicos",
    stock: 55,
  }),
  makeProduct({
    name: "Teclado Mecánico RGB",
    description:
      "Teclado mecánico con switches Blue y retroiluminación RGB personalizable.",
    price: 119.99,
    category: "electrónicos",
    stock: 0,
  }),

  // --- LIBROS (4) ---
  makeProduct({
    name: "El Arte de la Guerra",
    description:
      "Tratado militar escrito por Sun Tzu, con aplicaciones en negocios y vida cotidiana.",
    price: 12.99,
    category: "libros",
    stock: 120,
  }),
  makeProduct({
    name: "Código Limpio",
    description:
      "Manual de buenas prácticas de programación por Robert C. Martin. Lectura obligada.",
    price: 34.99,
    category: "libros",
    stock: 50,
  }),
  makeProduct({
    name: "Sapiens: De animales a dioses",
    description:
      "Historia de la humanidad desde el Homo Sapiens hasta nuestros días.",
    price: 18.99,
    category: "libros",
    stock: 85,
  }),
  makeProduct({
    name: "Diseño de Sistemas Distribuidos",
    description:
      "Guía práctica para construir sistemas escalables y confiables en la nube.",
    price: 44.99,
    category: "libros",
    stock: 30,
  }),

  // --- OTROS (4) ---
  makeProduct({
    name: "Mochila Viajera 40L",
    description:
      "Mochila de trekking con capacidad de 40 litros, impermeable y con soporte lumbar.",
    price: 89.99,
    category: "otros",
    stock: 40,
  }),
  makeProduct({
    name: "Botella Térmica Acero",
    description:
      "Botella de acero inoxidable que mantiene bebidas frías 24h o calientes 12h.",
    price: 24.99,
    category: "otros",
    stock: 110,
  }),
  makeProduct({
    name: "Set de Yoga Completo",
    description:
      "Incluye esterilla antideslizante, bloque y correa. Todo lo que necesitas para empezar.",
    price: 54.99,
    category: "otros",
    stock: 60,
  }),
  makeProduct({
    name: "Lámpara de Escritorio LED",
    description:
      "Lámpara LED con ajuste de intensidad y temperatura de color. Protege tu vista.",
    price: 49.99,
    category: "otros",
    stock: 70,
  }),
];
