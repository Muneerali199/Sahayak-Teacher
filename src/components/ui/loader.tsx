import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const loaderVariants = cva("animate-spin rounded-full border-t-2 border-b-2", {
  variants: {
    variant: {
      primary: "border-primary",
      secondary: "border-secondary-foreground",
      default: "border-current",
    },
    size: {
      sm: "h-4 w-4 border-2",
      md: "h-6 w-6 border-[3px]",
      lg: "h-8 w-8 border-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "sm",
  },
});

interface LoaderProps extends VariantProps<typeof loaderVariants> {
  className?: string;
}

export const Loader = ({ className, variant, size }: LoaderProps) => {
  return <div className={cn(loaderVariants({ variant, size }), className)} />;
};
