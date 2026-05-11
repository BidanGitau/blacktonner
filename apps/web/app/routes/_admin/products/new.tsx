import { useState } from "react";
import { useNavigate } from "react-router";

import { ProductForm, formToPayload, type ProductFormValue } from "~/components/admin/ProductForm";
import { useCategories, useCreateProduct } from "~/lib/queries";

export default function ProductNewPage() {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const create = useCreateProduct();
  const [submitError, setSubmitError] = useState<string | undefined>();

  function handleSave(form: ProductFormValue) {
    setSubmitError(undefined);
    create.mutate(formToPayload(form) as any, {
      onSuccess: () => navigate("/admin/products"),
      onError: (err: any) => {
        const msg = err?.response?.data?.message ?? "Failed to create product";
        setSubmitError(Array.isArray(msg) ? msg.join(", ") : String(msg));
      },
    });
  }

  return (
    <ProductForm
      title="Add product"
      eyebrow="New product"
      categories={categories}
      saving={create.isPending}
      submitLabel="Save product"
      autoSlug
      submitError={submitError}
      onSave={handleSave}
    />
  );
}
