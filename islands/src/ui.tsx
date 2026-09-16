// Minimal shadcn Card and Button primitives (same class recipes as shadcn/ui), so the
// supplied components keep their imports without a full shadcn install.
import * as React from "react";
import { cn } from "./lib";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-3xl py-6", className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 px-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("px-6", className)} {...props} />
);
CardContent.displayName = "CardContent";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default";
  href?: string;
};

export const Button = ({ className, variant = "default", size = "default", href, ...props }: ButtonProps) => {
  const cls = cn(
    "inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/80",
    variant === "ghost" && "text-primary hover:bg-muted",
    variant === "outline" && "border border-border bg-background hover:bg-muted",
    size === "sm" ? "h-11 px-4" : "h-11 px-5",
    className
  );
  if (href) return <a href={href} className={cls}>{props.children}</a>;
  return <button type="button" className={cls} {...props} />;
};
