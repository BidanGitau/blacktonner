import { TRUST } from "~/components/home/home-data";

export function HomeTrustSection() {
  return (
    <section className="container mx-auto px-4 py-12 lg:px-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {TRUST.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fade-up 0.5s ease forwards",
                opacity: 0,
              }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-md shadow-brand/30">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.sub}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
