import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "./lib";
import { Card, CardContent, CardHeader, Button } from "./ui";

export interface ExpenseItem {
  category: string;
  percentage: number;
  amount: number;
  color: string; // HSL color string e.g., "221.2 83.2% 53.3%"
}

export interface WeeklyExpenseCardProps {
  title: string;
  dateRange: string;
  data: ExpenseItem[];
  currency?: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  className?: string;
  totalLabel?: string;
  unit?: string;
  locale?: string;
  children?: React.ReactNode;
}

const formatCurrency = (amount: number, currencySymbol: string) => `${currencySymbol}${amount.toFixed(2)}`;

/**
 * A responsive and theme-adaptive card with an animated donut chart and a colour-coded legend.
 */
export const WeeklyExpenseCard = ({
  title,
  dateRange,
  data,
  currency = "$",
  buttonText = "View Report",
  buttonHref,
  onButtonClick,
  className,
  totalLabel = "Total Spent",
  unit,
  locale = "hu-HU",
  children,
}: WeeklyExpenseCardProps) => {
  const reduce = useReducedMotion();
  const fmt = React.useCallback(
    (a: number) =>
      unit !== undefined
        ? `${a.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${unit}`
        : formatCurrency(a, currency),
    [unit, locale, currency]
  );

  const totalAmount = React.useMemo(() => data.reduce((sum, item) => sum + item.amount, 0), [data]);

  const size = 180;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercentage = 0;

  return (
    <Card className={cn("w-full max-w-sm overflow-hidden rounded-3xl bg-card p-4 font-sans", className)}>
      <CardHeader className="flex flex-row items-center justify-between p-2">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold tracking-tight text-card-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{dateRange}</p>
        </div>
        <Button variant="ghost" size="sm" href={buttonHref} onClick={onButtonClick}>
          {buttonText}
        </Button>
      </CardHeader>

      <CardContent className="p-2">
        <div className="relative my-6 flex h-48 w-full items-center justify-center">
          <AnimatePresence>
            <motion.svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: reduce ? 0 : 0.5 } }}
              className="-rotate-90"
            >
              <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="var(--tw-muted)" strokeWidth={strokeWidth} />
              {data.map((item) => {
                const segmentLength = (item.percentage / 100) * circumference;
                const offset = (accumulatedPercentage / 100) * circumference;
                accumulatedPercentage += item.percentage;
                return { item, segmentLength, offset };
              }).reverse().map(({ item, segmentLength, offset }) => {
                return (
                  <motion.circle
                    key={item.category}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={`hsl(${item.color})`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference} ${circumference}`}
                    initial={reduce ? false : { strokeDashoffset: circumference }}
                    animate={{
                      strokeDashoffset: reduce ? circumference - offset - segmentLength : [circumference, circumference - offset - segmentLength],
                      transition: { duration: reduce ? 0 : 0.8, ease: "easeInOut" },
                    }}
                    strokeLinecap="round"
                  />
                );
              })}
            </motion.svg>
          </AnimatePresence>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground">{totalLabel}</span>
            <span className="text-2xl font-bold text-card-foreground tabular-nums">{fmt(totalAmount)}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {data.map((item) => (
            <div key={item.category} className="flex h-24 flex-col justify-end rounded-2xl bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: `hsl(${item.color})` }} aria-hidden="true" />
                <p className="text-sm font-medium text-muted-foreground">{item.category}</p>
              </div>
              <p className="mt-1 text-xl font-bold text-card-foreground tabular-nums">{fmt(item.amount)}</p>
            </div>
          ))}
        </div>
        {children}
      </CardContent>
    </Card>
  );
};
