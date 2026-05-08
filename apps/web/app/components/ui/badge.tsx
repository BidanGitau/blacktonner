import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors focus:outline-none focus:ring-2 focus:ring-black/30",
  {
    variants: {
      variant: {
        default: "border-transparent bg-black text-white",
        secondary: "border-transparent bg-stone-100 text-black/70",
        destructive: "border-transparent bg-red-500 text-white",
        outline: "border-stone-200 bg-white text-black/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
