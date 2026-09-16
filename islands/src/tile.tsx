import * as React from "react";
import { cn } from "./lib";

export type Tone = "dark" | "grey" | "accent" | "light";

const TONE: Record<Tone, string> = {
  dark: "bg-primary text-primary-foreground",
  grey: "bg-secondary text-foreground",
  accent: "bg-destructive text-white",
  light: "bg-card text-foreground border border-border",
};

/* The pill label in the tile's top-left corner, as in the reference */
export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "tile-label flex w-full items-center rounded-full border border-current/40 px-4 py-2.5 text-[13px] font-medium leading-none opacity-80",
        className
      )}
    >
      {children}
    </span>
  );
}

/* One dashboard tile: pill top-left, big figure bottom-left, description bottom-right */
export function Tile({
  tone = "light",
  label,
  className,
  children,
  onClick,
  pressed,
  role,
}: {
  tone?: Tone;
  label?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  pressed?: boolean;
  role?: string;
}) {
  return (
    <div
      className={cn(
        "tile relative flex flex-col justify-between gap-6 rounded-3xl p-6 md:p-7 min-h-[168px] transition-[transform,background-color]",
        TONE[tone],
        onClick && "cursor-pointer",
        pressed && "ring-2 ring-[#D9A03C]",
        className
      )}
      onClick={onClick}
      role={role}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? pressed : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
    >
      {label ? <Pill>{label}</Pill> : <span />}
      {children}
    </div>
  );
}

/* Big figure + description row used at the bottom of most tiles */
export function Figure({
  value,
  prefix,
  suffix,
  text,
  size = "lg",
  align = "row",
}: {
  value: React.ReactNode;
  prefix?: string;
  suffix?: string;
  text?: React.ReactNode;
  size?: "lg" | "xl" | "md";
  align?: "row" | "col";
}) {
  const num =
    size === "xl"
      ? "text-[76px] md:text-[96px]"
      : size === "lg"
      ? "text-[56px] md:text-[68px]"
      : "text-[40px] md:text-[48px]";
  return (
    <div className={cn("flex gap-4", align === "row" ? "flex-row items-end justify-between flex-wrap" : "flex-col items-start")}>
      <div className={cn("figure-value font-medium leading-none tracking-[-0.04em] tabular-nums", num)}>
        {prefix ? <span className="opacity-60">{prefix}</span> : null}
        {value}
        {suffix ? <span className="text-[0.45em] font-medium opacity-70 ml-1">{suffix}</span> : null}
      </div>
      {text ? <p className={cn("figure-text text-[14px] leading-snug opacity-80 max-w-[34ch]", align === "row" && "text-right")}>{text}</p> : null}
    </div>
  );
}
