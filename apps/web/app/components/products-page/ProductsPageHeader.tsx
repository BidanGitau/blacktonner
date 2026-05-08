export function ProductsPageHeader({
  title,
  countLabel,
}: {
  title: string;
  countLabel: string;
}) {
  return (
    <div className="border-b border-slate-100 bg-white">
      <div className="container mx-auto px-4 py-6 lg:px-6">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{countLabel}</p>
      </div>
    </div>
  );
}
