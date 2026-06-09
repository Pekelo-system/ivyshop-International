import { ProductForm } from "@/components/admin/ProductForm";

export default function NuevoProductoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductForm mode="create" />
    </div>
  );
}
