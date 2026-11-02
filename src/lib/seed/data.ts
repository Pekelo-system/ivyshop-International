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

// Using direct Unsplash photo URLs with specific photo IDs that match each product
export const SEED_PRODUCTS: Product[] = [
  // --- ZAPATOS (4) ---
  makeProduct({
    name: "Zapatillas Running Pro",
    description: "Zapatillas deportivas de alto rendimiento para corredores exigentes. Suela de goma antideslizante.",
    price: 89.99,
    category: "zapatos",
    stock: 50,
    // Red/orange running shoe
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Botas de Cuero Casual",
    description: "Botas de cuero genuino para uso diario. Cómodas y duraderas.",
    price: 129.99,
    category: "zapatos",
    stock: 30,
    // Brown leather boots
    imageUrl: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Sandalias de Playa",
    description: "Sandalias ligeras y resistentes al agua, perfectas para el verano.",
    price: 29.99,
    category: "zapatos",
    stock: 75,
    // Flip flops/sandals on sand
    imageUrl: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Mocasines Elegantes",
    description: "Mocasines de piel sintética con suela flexible. Ideales para la oficina.",
    price: 69.99,
    category: "zapatos",
    stock: 40,
    // Elegant loafer shoes
    imageUrl: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500&h=500&fit=crop&crop=center",
  }),

  // --- ROPA (5) ---
  makeProduct({
    name: "Camiseta Básica Algodón",
    description: "Camiseta de algodón 100% en corte clásico. Disponible en varios colores.",
    price: 19.99,
    category: "ropa",
    stock: 100,
    // White basic t-shirt
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Jeans Slim Fit",
    description: "Pantalón vaquero ajustado de alta calidad con elastano para mayor comodidad.",
    price: 59.99,
    category: "ropa",
    stock: 60,
    // Blue jeans folded
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Chaqueta de Invierno",
    description: "Chaqueta acolchada impermeable con capucha desmontable. Abriga hasta -10°C.",
    price: 149.99,
    category: "ropa",
    stock: 25,
    // Winter puffer jacket - person wearing puffy winter coat
    imageUrl: "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Sudadera con Capucha",
    description: "Sudadera de algodón grueso con bolsillo canguro. Perfecta para el frío.",
    price: 44.99,
    category: "ropa",
    stock: 80,
    // Gray hoodie
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Vestido Floral Verano",
    description: "Vestido ligero con estampado floral, ideal para días cálidos.",
    price: 39.99,
    category: "ropa",
    stock: 45,
    // Floral summer dress
    imageUrl: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=500&h=500&fit=crop&crop=center",
  }),

  // --- ELECTRÓNICOS (5) ---
  makeProduct({
    name: "Auriculares Bluetooth Pro",
    description: "Auriculares inalámbricos con cancelación de ruido activa y 30h de batería.",
    price: 199.99,
    category: "electrónicos",
    stock: 35,
    // Over-ear headphones
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Smartwatch Serie 5",
    description: "Reloj inteligente con monitor de frecuencia cardíaca, GPS y resistencia al agua.",
    price: 249.99,
    category: "electrónicos",
    stock: 20,
    // Smartwatch on wrist
    imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Cargador Inalámbrico 15W",
    description: "Cargador rápido inalámbrico compatible con Qi. Carga tu dispositivo en minutos.",
    price: 34.99,
    category: "electrónicos",
    stock: 90,
    // White wireless charging pad with phone
    imageUrl: "https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Altavoz Portátil Waterproof",
    description: "Altavoz Bluetooth resistente al agua con 20h de reproducción. Sonido envolvente.",
    price: 79.99,
    category: "electrónicos",
    stock: 55,
    // Portable bluetooth speaker
    imageUrl: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Teclado Mecánico RGB",
    description: "Teclado mecánico con switches Blue y retroiluminación RGB personalizable.",
    price: 119.99,
    category: "electrónicos",
    stock: 0,
    // RGB mechanical keyboard
    imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&h=500&fit=crop&crop=center",
  }),

  // --- LIBROS (4) ---
  makeProduct({
    name: "El Arte de la Guerra",
    description: "Tratado militar escrito por Sun Tzu, con aplicaciones en negocios y vida cotidiana.",
    price: 12.99,
    category: "libros",
    stock: 120,
    // Old book with red/gold cover - strategy
    imageUrl: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Código Limpio",
    description: "Manual de buenas prácticas de programación por Robert C. Martin. Lectura obligada.",
    price: 34.99,
    category: "libros",
    stock: 50,
    // Code/programming book on desk
    imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Sapiens: De animales a dioses",
    description: "Historia de la humanidad desde el Homo Sapiens hasta nuestros días.",
    price: 18.99,
    category: "libros",
    stock: 85,
    // Stack of books
    imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Diseño de Sistemas Distribuidos",
    description: "Guía práctica para construir sistemas escalables y confiables en la nube.",
    price: 44.99,
    category: "libros",
    stock: 30,
    // Technical book on desk
    imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=500&fit=crop&crop=center",
  }),

  // --- OTROS (4) ---
  makeProduct({
    name: "Mochila Viajera 40L",
    description: "Mochila de trekking con capacidad de 40 litros, impermeable y con soporte lumbar.",
    price: 89.99,
    category: "otros",
    stock: 40,
    // Travel backpack
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Botella Térmica Acero",
    description: "Botella de acero inoxidable que mantiene bebidas frías 24h o calientes 12h.",
    price: 24.99,
    category: "otros",
    stock: 110,
    // Steel water bottle
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Set de Yoga Completo",
    description: "Incluye esterilla antideslizante, bloque y correa. Todo lo que necesitas para empezar.",
    price: 54.99,
    category: "otros",
    stock: 60,
    // Yoga mat and accessories
    imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop&crop=center",
  }),
  makeProduct({
    name: "Lámpara de Escritorio LED",
    description: "Lámpara LED con ajuste de intensidad y temperatura de color. Protege tu vista.",
    price: 49.99,
    category: "otros",
    stock: 70,
    // Desk lamp
    imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&h=500&fit=crop&crop=center",
  }),
];
