// Product categories
export type ProductCategory =
  | "zapatos"
  | "ropa"
  | "electrónicos"
  | "libros"
  | "otros";

// Product entity
export interface Product {
  PK: string; // "PRODUCT#<uuid>"
  SK: "METADATA";
  GSI1PK: string; // "CATEGORY#<category>"
  GSI1SK: string; // "PRICE#<zero-padded-price>"
  entityType: "PRODUCT";
  id: string;
  name: string; // max 200 chars
  description: string;
  price: number; // 0.01 – 999999.99
  category: ProductCategory;
  stock: number; // integer >= 0
  imageUrl: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// Cart item entity
export interface CartItem {
  PK: string; // "CART#<userId>"
  SK: string; // "ITEM#PRODUCT#<productId>"
  entityType: "CART_ITEM";
  userId: string;
  productId: string;
  quantity: number; // integer >= 1
  unitPrice: number; // price at time of adding
  createdAt: string;
  updatedAt: string;
}

// Order item (embedded in Order)
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

// Shipping address
export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  country: string;
}

// Order entity
export interface Order {
  PK: string; // "ORDER#<uuid>"
  SK: "METADATA";
  GSI1PK: string; // "USER#<userId>"
  GSI1SK: string; // "ORDER#<orderId>"
  entityType: "ORDER";
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  status: "CONFIRMED";
  createdAt: string;
}

// Seed flag entity
export interface SeedFlag {
  PK: "SEED#METADATA";
  SK: "v1";
  entityType: "SEED_FLAG";
  seededAt: string;
  productCount: number;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Pagination metadata
export interface PaginationMeta {
  page: number;
  limit: number;
  total?: number;
  lastEvaluatedKey?: string;
}

// Paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: PaginationMeta;
}
