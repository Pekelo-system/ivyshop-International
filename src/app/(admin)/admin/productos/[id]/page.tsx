import { notFound } from "next/navigation";
import { getProductById } from "@/lib/dynamo/products";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductForm mode="edit" product={product} />
    </div>
  );
}
