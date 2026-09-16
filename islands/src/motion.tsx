import * as React from "react";
import { motion, useInView, useMotionValue, animate, useReducedMotion } from "framer-motion";
import { num } from "./lib";

/* Rise-in on first view, with an optional stagger index */
export function Reveal({ children, i = 0, className }: { children: React.ReactNode; i?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 8) * 0.06 }}
    >
      {children}
    </motion.div>
  );
}

/* Number that counts up from 0 when it enters the viewport */
export function CountUp({ value, decimals = 1, className, duration = 1.4 }: { value: number; decimals?: number; className?: string; duration?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [text, setText] = React.useState(reduce ? num(value, decimals) : num(0, decimals));
  React.useEffect(() => {
    if (!inView) return;
    if (reduce) { setText(num(value, decimals)); return; }
    const c = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setText(num(v, decimals)) });
    return () => c.stop();
  }, [inView, value, decimals, duration, reduce, mv]);
  return <span ref={ref} className={className}><span className="sr-only">{num(value, decimals)}</span><span aria-hidden="true">{text}</span></span>;
}
