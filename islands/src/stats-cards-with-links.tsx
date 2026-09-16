"use client";

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as RechartsPrimitive from "recharts";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ───────────────── Card primitives (as supplied) ───────────────── */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        "bg-secondary text-card-foreground flex flex-col gap-6 rounded-3xl py-6",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-slot="card-content" className={cn("px-6", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

/* ───────────────── Stats05: cards with links ───────────────── */

export interface LinkStat {
  name: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  href: string;
  linkText?: string;
  description?: string;
}

export function Stats05({ data, cols = 3 }: { data: LinkStat[]; cols?: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center w-full">
      <dl className={cn("grid grid-cols-1 gap-4 w-full", cols === 3 && "sm:grid-cols-2 lg:grid-cols-3", cols === 2 && "sm:grid-cols-2")}>
        {data.map((item) => (
          <Card key={item.name} className="p-0 gap-0">
            <CardContent className="p-6">
              <dd className="flex items-start justify-between space-x-2">
                <span className="min-w-0 text-sm font-semibold text-foreground">{item.name}</span>
                <span
                  className={cn(
                    "text-xs font-medium text-right shrink-0",
                    item.changeType === "positive"
                      ? "text-primary"
                      : item.changeType === "negative"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {item.change}
                </span>
              </dd>
              <dd className="mt-1 text-3xl font-semibold text-foreground tabular-nums">
                {item.value}
              </dd>
              {item.description ? (
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</dd>
              ) : null}
            </CardContent>
            <CardFooter className="flex justify-end !p-0">
              <a
                href={item.href}
                className="inline-flex min-h-11 items-center px-6 py-3 text-sm font-medium text-primary hover:text-primary/90"
              >
                {item.linkText ?? "Részletek →"}
              </a>
            </CardFooter>
          </Card>
        ))}
      </dl>
    </div>
  );
}

/* ───────────────── Chart container (as supplied) ───────────────── */

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = { config: ChartConfig };
const ChartContext = React.createContext<ChartContextProps | null>(null);

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, c]) => c.theme || c.color);
  if (!colorConfig.length) return null;
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground flex aspect-video justify-center text-xs",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

/* ───────────────── Stats07: radial gauges ───────────────── */

export interface RadialStat {
  key: string; // used for the CSS colour variable
  name: string;
  capacity: number; // 0–100
  detail: string;
  color: string;
}

import { num as hu } from "./lib";

export function Stats07({
  title,
  intro,
  data,
  selected,
  onSelect,
}: {
  title: string;
  intro: React.ReactNode;
  data: RadialStat[];
  selected?: string;
  onSelect?: (key: string) => void;
}) {
  const chartConfig: ChartConfig = Object.fromEntries([
    ...data.map((d) => [d.key, { label: d.name, color: d.color }]),
    ["background", { label: "Background", color: "var(--tw-muted)" }],
  ]);

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full">
        {title ? <h2 className="text-xl font-medium text-foreground">{title}</h2> : null}
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{intro}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((item) => (
            <Card
              key={item.name}
              className={cn("p-4 min-h-[124px] rounded-2xl justify-center transition-colors bg-secondary", onSelect && "cursor-pointer hover:bg-accent", selected === item.key && "bg-primary text-primary-foreground hover:bg-primary")}
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
              aria-pressed={onSelect ? selected === item.key : undefined}
              onClick={onSelect ? () => onSelect(item.key) : undefined}
              onKeyDown={onSelect ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(item.key); } } : undefined}
            >
              <CardContent className="p-0 flex items-center space-x-4">
                <div className="relative flex items-center justify-center">
                  <ChartContainer config={chartConfig} className="h-[80px] w-[80px]">
                    <RechartsPrimitive.RadialBarChart
                      data={[{ ...item, fill: `var(--color-${item.key})` }]}
                      innerRadius={30}
                      outerRadius={38}
                      barSize={8}
                      startAngle={90}
                      endAngle={450}
                    >
                      <RechartsPrimitive.PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                        axisLine={false}
                      />
                      <RechartsPrimitive.RadialBar
                        dataKey="capacity"
                        background={{ fill: "var(--color-background)" }}
                        cornerRadius={10}
                        fill={`var(--color-${item.key})`}
                        angleAxisId={0}
                      />
                    </RechartsPrimitive.RadialBarChart>
                  </ChartContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base font-semibold tabular-nums">
                      {hu(item.capacity)}
                    </span>
                  </div>
                </div>
                <div>
                  <dt className="text-sm font-semibold">{item.name}</dt>
                  <dd className="text-sm opacity-70">{item.detail}</dd>
                </div>
              </CardContent>
            </Card>
          ))}
        </dl>
      </div>
    </div>
  );
}
