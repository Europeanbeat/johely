import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { Tile, Figure, Pill } from "./tile";
import { Reveal, CountUp } from "./motion";
import { motion, useReducedMotion } from "framer-motion";
import { Car } from "lucide-react";
import { lang, num, int, type Data } from "./lib";

type Strings = {
  intro: React.ReactNode;
  index: string;
  indexText: string;
  areas: string;
  areasText: string;
  guests: string;
  guestsText: string;
  responses: string;
  responsesText: string;
  districts: string;
  districtsText: string;
  gap: string;
  gapText: string;
};

/* The pie in the dark tile: the index as a share of the 0–100 scale, like the reference's slice */
function IndexPie({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const data = [
    { name: "index", value },
    { name: "rest", value: 100 - value },
  ];
  return (
    <div className="h-[200px] w-[200px] md:h-[230px] md:w-[230px] mx-auto my-2" aria-hidden="true">
      <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
        <RechartsPrimitive.PieChart>
          <RechartsPrimitive.Pie
            data={data}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            innerRadius={0}
            outerRadius="100%"
            stroke="#0E4A57"
            strokeWidth={6}
            isAnimationActive={!reduce}
            animationDuration={900}
          >
            <RechartsPrimitive.Cell fill="#B5562F" />
            <RechartsPrimitive.Cell fill="#ffffff" />
          </RechartsPrimitive.Pie>
        </RechartsPrimitive.PieChart>
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  );
}

export function Dashboard({ D, S }: { D: Data; S: Strings }) {
  const reduce = useReducedMotion();
  const areas = D.alindexek.slice().sort((a, b) => b.ertek - a.ertek);
  const top = areas[0], bottom = areas[areas.length - 1];
  const gKeys = Object.keys(D.csoportN);

  return (
    <div className="flex flex-col gap-8">
      {/* intro sentence with mixed emphasis, as in the reference */}
      <p className="dashboard-intro text-[22px] md:text-[30px] leading-[1.3] tracking-[-0.01em] text-muted-foreground max-w-[42ch]">{S.intro}</p>

      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* dark tile with the pie */}
        <Reveal i={0} className="md:col-span-4 md:row-span-2"><Tile tone="dark" label={S.index} className="h-full min-h-[380px]">
          <IndexPie value={D.index} />
          <Figure value={<CountUp value={D.index} />} text={S.indexText} size="lg" />
        </Tile></Reveal>

        {/* grey wide tile: the spread */}
        <Reveal i={1} className="md:col-span-8"><Tile tone="grey" label={S.areas} className="dashboard-spread h-full">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <Figure value={<><CountUp value={top.ertek} /> → <CountUp value={bottom.ertek} /></>} size="lg" />
            <div className="flex flex-col items-end gap-3">
              <div className="flex gap-1.5 items-end h-14 relative" role="img" aria-label={areas.map((a) => `${a.nev} ${num(a.ertek)}`).join(", ")}>
                <span className="absolute left-0 right-0 border-t border-dashed border-ring/70" style={{ bottom: "50%" }} />
                {areas.map((a, i) => (
                  <motion.div key={a.nev} title={`${a.nev}: ${num(a.ertek)}`} className={`w-2.5 rounded-full ${a.ertek < 50 ? "bg-destructive" : "bg-primary"}`}
                    initial={reduce ? false : { height: "8%" }} whileInView={{ height: `${a.ertek}%` }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }} />
                ))}
              </div>
              <p className="text-[14px] leading-snug opacity-80 max-w-[38ch] text-right">{S.areasText}</p>
            </div>
          </div>
        </Tile></Reveal>

        {/* accent wide tile: the lowest item of the survey (parking and traffic pressure) */}
        <Reveal i={2} className="md:col-span-8"><Tile tone="accent" label={<><Car className="h-4 w-4 mr-2 shrink-0" aria-hidden="true" />{S.guests}</>} className="h-full">
          <Figure value={<CountUp value={32.4} />} text={S.guestsText} size="lg" />
        </Tile></Reveal>

        {/* row of three */}
        <Reveal i={3} className="md:col-span-4"><Tile tone="light" label={S.responses} className="h-full">
          <Figure value={<CountUp value={77.2} />} text={S.responsesText} size="md" align="col" />
        </Tile></Reveal>
        <Reveal i={4} className="md:col-span-4"><Tile tone="grey" label={S.districts} className="h-full">
          <Figure value={<CountUp value={33.2} />} text={S.districtsText} size="md" align="col" />
        </Tile></Reveal>
        <Reveal i={5} className="md:col-span-4"><Tile tone="dark" label={S.gap} className="h-full">
          <Figure value="35" suffix={lang === "hu" ? "pont" : "pts"} text={S.gapText} size="md" align="col" />
        </Tile></Reveal>
      </div>
      <p className="dashboard-note text-sm font-medium text-foreground">
        {lang === "hu"
          ? `Érvényes válaszok: ${gKeys.map((k) => `${k} ${D.csoportN[k]}`).join(" · ")}. Minden érték a 0–100 skálán, ${D.ev}.`
          : `Valid responses: ${gKeys.map((k) => `${k} ${D.csoportN[k]}`).join(" · ")}. All values on the 0–100 scale, ${D.ev}.`}
      </p>
    </div>
  );
}

export { Pill };
