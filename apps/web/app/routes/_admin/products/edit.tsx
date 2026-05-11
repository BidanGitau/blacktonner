import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import {
  ProductForm,
  formToPayload,
  productToForm,
  type ProductFormValue,
} from "~/components/admin/ProductForm";
import { useCategories, useProduct, useUpdateProduct } from "~/lib/queries";

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(id!);
  const { data: categories = [] } = useCategories();
  const update = useUpdateProduct();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const initialValue = useMemo(() => (product ? productToForm(product) : undefined), [product]);

  function handleSave(form: ProductFormValue) {
    setSubmitError(undefined);
    update.mutate({ id: id!, ...formToPayload(form) } as any, {
      onSuccess: () => navigate("/admin/products"),
      onError: (err: any) => {
        const msg = err?.response?.data?.message ?? "Failed to update product";
        setSubmitError(Array.isArray(msg) ? msg.join(", ") : String(msg));
      },
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4 px-6 py-8 lg:px-10 lg:py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-stone-100" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 rounded-md border border-stone-200 bg-white p-6">
            {[1, 2, 3].map((j) => <div key={j} className="h-9 animate-pulse rounded bg-stone-100" />)}
          </div>
        ))}
      </div>
    );
  }

  if (isError || !product || !initialValue) {
    return (
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <p className="text-sm text-red-600">Product not found.</p>
        <Link to="/admin/products" className="eyebrow-xs mt-3 inline-block text-black hover:underline">
          ← Back to products
        </Link>
      </div>
    );
  }

  return (
    <ProductForm
      initialValue={initialValue}
      title={product.name}
      eyebrow="Edit product"
      categories={categories}
      saving={update.isPending}
      submitLabel="Save changes"
      submitError={submitError}
      onSave={handleSave}
    />
  );
}
