// Testimonial cards (from the supplied 21st.dev example: no photo, no stars): dark card with a
// large quotation mark, the quote, a rule, "— who" and the role line. Colours mapped to the site.
import * as React from "react";
import { Reveal } from "./motion";

export interface Testimonial {
  quote: string;
  who: string;
  role?: string;
}

export function TestimonialCard({ t, i }: { t: Testimonial; i: number }) {
  return (
    <Reveal i={i} className="h-full">
      <div className="flex h-full flex-col bg-primary text-primary-foreground rounded-2xl px-6 pt-5 pb-6 md:px-7 md:pb-7">
        <span aria-hidden="true" className="block font-serif text-[64px] leading-[0.7] text-[#E7B45B] select-none mb-4">{"\u201D"}</span>
        <p className="font-medium text-[16px] md:text-[17px] leading-[1.5] border-b border-white/25 pb-5 flex-1">{t.quote}</p>
        <p className="mt-4 text-[15px]">{"\u2014 "}{t.who}</p>
        {t.role ? (
          <p className="text-sm font-medium bg-gradient-to-r from-[#E7B45B] via-[#E0724A] to-[#B9D8DC] text-transparent bg-clip-text">{t.role}</p>
        ) : null}
      </div>
    </Reveal>
  );
}

export function Testimonials({ items, eyebrow, note }: { items: Testimonial[]; eyebrow: string; note?: string }) {
  return (
    <div className="flex flex-col gap-5">
      <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-destructive">{eyebrow}</span>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((t, i) => (
          <TestimonialCard key={i} t={t} i={i} />
        ))}
      </div>
      {note ? <p className="text-[14.5px] leading-relaxed text-muted-foreground max-w-[78ch]" dangerouslySetInnerHTML={{ __html: note }} /> : null}
    </div>
  );
}
