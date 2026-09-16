import * as React from "react";
import { createRoot } from "react-dom/client";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { lang, num, int, readData, type Area, type District } from "./lib";
import { Dashboard } from "./dashboard";
import { Stats05 } from "./stats-cards-with-links";
import { WeeklyExpenseCard } from "./weekly-expense-card";
import { DistrictMap } from "./map";
import { Timeline } from "./timeline";
import { Testimonials, type Testimonial } from "./testimonials";
import { Reveal, CountUp } from "./motion";
import { CircleProgress } from "./circle-progress";
import { useInView } from "framer-motion";

const D = readData();
const areasDesc = D.alindexek.slice().sort((a, b) => b.ertek - a.ertek);
const valid = D.jarasok.filter((j) => j.valid && j.ertek != null);
const noIndex = D.jarasok.filter((j) => !j.valid);
const gKeys = Object.keys(D.csoportN); // ['lakossági','szolgáltatói','vendég'] or ['residents','businesses','visitors']
const [gRes, gBiz, gVis] = gKeys;

const S =
  lang === "hu"
    ? {
        intro: (<>A mérés <b className="text-foreground font-semibold">1048 ember válaszára</b> épül: helyben élők, nyaralótulajdonosok, turisztikai vállalkozások és vendégek, 2026 nyarán. A Balaton Jó Hely Index értéke <b className="text-foreground font-semibold">64,0 pont</b> a 0–100 skálán — az első mérés, ezért viszonyítási alap.</>),
        dIndex: "Index · 2026", dIndexText: "pont a 0–100 skálán. Az ötven a skála közepe. Alapmérés: a következő évek eredménye ehhez mérhető.",
        dAreas: "Nyolc részterület", dAreasText: "Nem teljesítménygond, hanem egyensúlygond: egyetlen részterület sem közepes. A Percepció 84,4, az Irányítás 46,7 — az egyetlen ötven alatt.",
        dGuests: "A legalacsonyabb érték", dGuestsText: "pont: a turizmus okozta parkolási és forgalmi terhelés a helyiek szerint. A mérés legrosszabb tétele, és a lakossági tételek közül járásonként a legszélesebb sávban szór: Fonyódi 23,3, Marcali 47,8. Helyi ügy, helyi megoldással.",
        dResp: "A lakosság és a turizmus", dRespText: "ponttal támogatja a lakosság, hogy a turizmus maradjon a térség meghatározó fejlesztési iránya. Nem a lakosság a fék: a szolgáltatók 55,1-re teszik a versenypozíciót.",
        dDist: "A tó védelme", dDistText: "pont a tó és a part védelme. Az egyetlen ügy, amiben mindhárom szereplőcsoport és minden járás egyetért, ahonnan van lakossági minta — itt lehet elkezdeni.",
        dGap: "A legnagyobb rés", dGapText: "az önkormányzatok önképe (82) és a lakosság megítélése (47) között arról, figyelembe veszik-e az érdekeiket.",
        areasIntro:
          "Kattints egy részterületre: mit mér, melyik kérdés húzza fel és le, és mit mondanak róla a szereplőcsoportok külön-külön.",
        strongest: "Legerősebb részterület", weakest: "Leggyengébb részterület · az egyetlen ötven alatt",
        legend: ["ötven pont — a skála közepe", "hatvan pont fölött", "ötven és hatvan között", "ötven pont alatt"],
        allValues: `Minden érték a 0–100 skálán, ${D.ev}.`,
        mit: "Mit mér:",
        qHigh: "A legmagasabb értékű kérdés",
        qLow: "A legalacsonyabb értékű kérdés",
        byGroup: "Szereplőcsoportonként",
        ofQuestions: "kérdésből",
        pts: "pont",
        noRes: "lakossági válasz nélkül",
        more: "Részletek →",
        noIndex: (names: string, extra: string) =>
          `Nem készült index: ${names} járás — kevés adat, nem rossz eredmény. ${extra}`,
        noIndexExtra: (j: District) =>
          `A ${j.nev}ból ${j.n[gRes]} lakossági válasz érkezett, szolgáltatói és vendégválasz nélkül; egy nézőpont kevés az indexhez.`,
        gap: "pont rés",
        mapLegend: ["térségi átlag fölött, 2+ pont", "átlag fölött", "átlag alatt", "átlag alatt, 2+ pont"],
        noData: "nincs elég adat",
        gaps: [
          ["Mobilitás", gRes, gBiz, "Ugyanaz az út és parkoló: a látogatónak elfogadható, a helyben élőnek terhelés."],
          ["Környezet", gRes, gVis, "A vendég a rendezett közteret látja, a lakos a tó védelmét hiányolja."],
          ["Versenypozíció", gRes, gBiz, "Fordított irányú: a helyi társadalom nagyobb bizalommal van a turizmus jövője iránt, mint az abból élő ágazat."],
        ] as [string, string, string, string][],
        donutTitle: "Kinek a kezében van",
        donutSub: "A javítható hiány 41%-a helyi, önkormányzati hatáskör, 32%-a országos, és 27% az, amit a térségi turizmusirányítás önállóan mozgathat.",
        donutTotal: "Összesen",
        donutBtn: "Program →",
        donutCats: ["Helyi (önkormányzati)", "Országos", "Térségi"],
        donutUnit: " pont",
        donutText:
          "Ami a településeken múlik: a parkolás és a forgalom kezelése, a helyi döntések ismertsége, a lakosság bevonása, a települési terhelés. A Balaton problématérképe nem illeszkedik egyetlen szereplő hatásköri térképére sem — ezért kell a közös mérce. Ha mind a tizenöt ötven pont alatti kérdés elérné az ötvenet, az index 64,0-ról 65,3-ra emelkedne: az index ezért nem célfüggvény, a tét a mögöttes kérdésekben van.",
      }
    : {
        intro: (<>The measurement rests on <b className="text-foreground font-semibold">1,048 people's answers</b>: residents, second-home owners, tourism businesses and visitors, in summer 2026. The Balaton Good Place Index stands at <b className="text-foreground font-semibold">64.0 points</b> on the 0–100 scale — the first measurement, so a baseline.</>),
        dIndex: "Index · 2026", dIndexText: "points on the 0–100 scale. Fifty is the midpoint. A baseline: the coming years are measured against it.",
        dAreas: "Eight areas", dAreasText: "Not a performance problem but a balance problem: no area is average. Perception 84.4, Governance 46.7 — the only one below fifty.",
        dGuests: "The lowest score", dGuestsText: "points: parking and traffic pressure caused by tourism, as residents see it. The weakest item in the whole survey and, of the resident items, the one that varies most by district: Fonyód 23.3, Marcali 47.8. A local issue with a local fix.",
        dResp: "Residents and tourism", dRespText: "points: residents support tourism remaining the region's defining development direction. Residents are not the brake: businesses rate competitiveness at 55.1.",
        dDist: "Protecting the lake", dDistText: "points for the protection of the lake and its shore. The one issue all three groups and every district with a resident sample agree on — the place to start.",
        dGap: "The widest gap", dGapText: "between how municipalities rate themselves (82) and how residents rate them (47) on taking residents' interests into account.",
        areasIntro:
          "Click an area: what it measures, which question pulls it up and down, and what each stakeholder group says about it.",
        strongest: "Strongest area", weakest: "Weakest area · the only one below fifty",
        legend: ["fifty points — the midpoint of the scale", "above sixty", "between fifty and sixty", "below fifty"],
        allValues: `All values on the 0–100 scale, ${D.ev}.`,
        mit: "What it measures:",
        qHigh: "Highest-scoring question",
        qLow: "Lowest-scoring question",
        byGroup: "By stakeholder group",
        ofQuestions: "questions",
        pts: "points",
        noRes: "without resident responses",
        more: "Details →",
        noIndex: (names: string, extra: string) =>
          `No index: ${names} districts — too little data, not a poor result. ${extra}`,
        noIndexExtra: (j: District) =>
          `${j.n[gRes]} resident responses came from the ${j.nev}, with no business or visitor responses; one perspective is not enough for an index.`,
        gap: "point gap",
        mapLegend: ["2+ points above the regional average", "above average", "below average", "2+ points below"],
        noData: "not enough data",
        gaps: [
          ["Mobility", gRes, gBiz, "The same road and car park: acceptable to the visitor, a burden to the resident."],
          ["Environment", gRes, gVis, "The visitor sees the well-kept public space; the resident misses the protection of the lake."],
          ["Competitive position", gRes, gBiz, "In the opposite direction: local society has more confidence in the future of tourism than the sector that lives from it."],
        ] as [string, string, string, string][],
        donutTitle: "Whose hands it is in",
        donutSub: "41% of the fixable gap is within local, municipal competence, 32% is national, and 27% is what regional tourism management can move on its own.",
        donutTotal: "In total",
        donutBtn: "Programme →",
        donutCats: ["Local (municipal)", "National", "Regional"],
        donutUnit: " points",
        donutText:
          "What depends on the municipalities: managing parking and traffic, awareness of local decisions, involving residents, the pressure on individual settlements. Balaton's map of problems does not match the map of any single actor's competences — which is why a shared yardstick is needed. If all fifteen questions now below 50 reached 50, the index would rise from 64.0 to 65.3: the index is therefore not a target, the stakes are in the underlying questions.",
      };

const esc = (s: string) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));

/* ── 1. Dashboard tiles (replaces the dark facts band) ── */
function DashboardIsland() {
  return (
    <Dashboard
      D={D}
      S={{ intro: S.intro, index: S.dIndex, indexText: S.dIndexText, areas: S.dAreas, areasText: S.dAreasText, guests: S.dGuests, guestsText: S.dGuestsText, responses: S.dResp, responsesText: S.dRespText, districts: S.dDist, districtsText: S.dDistText, gap: S.dGap, gapText: S.dGapText }}
    />
  );
}

/* ── 2. Eight areas as a bento: the two ends big, the six middle ones compact, a scale bar on each ── */
function Scale({ v, tone }: { v: number; tone: "dark" | "grey" | "accent" }) {
  const track = tone === "grey" ? "bg-white" : "bg-white/20";
  const fill = tone === "grey" ? (v < 50 ? "bg-destructive" : v < 60 ? "bg-ring" : "bg-primary") : "bg-white";
  return (
    <div className={`relative h-2 w-full rounded-full ${track}`} aria-hidden="true">
      <span className={`absolute left-0 top-0 h-2 rounded-full ${fill}`} style={{ width: `${v}%` }} />
      <span className="absolute top-[-4px] h-4 w-[2px] rounded-full bg-[#D9A03C]" style={{ left: "50%" }} />
    </div>
  );
}

/* A score out of 100 as a ring (CircleProgress); animates when it scrolls into view */
function ScoreRing({ v, size, stroke, onDark, band }: { v: number; size: number; stroke: number; onDark: boolean; band?: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const color = onDark
    ? () => "stroke-white"
    : band
    ? (p: number) => (p < 0.5 ? "stroke-destructive" : p < 0.6 ? "stroke-ring" : "stroke-primary")
    : () => "stroke-primary";
  return (
    <div ref={ref} className="shrink-0">
      <CircleProgress
        value={inView ? v : 0}
        maxValue={100}
        size={size}
        strokeWidth={stroke}
        animationDuration={1100}
        getColor={color}
        trackClassName={onDark ? "stroke-white/25" : "stroke-white"}
        aria-label={`${num(v)} / 100`}
      />
    </div>
  );
}

function AreaTile({ a, tone, label, big, selected, onSelect, gloss, q, qLabel }: {
  a: Area; tone: "dark" | "grey" | "accent"; label: string; big?: boolean; selected: boolean; onSelect: () => void; gloss: string; q?: { k: string; cs: string; e: number; n: number }; qLabel?: string;
}) {
  const J = window.__J;
  const cls = tone === "dark" ? "bg-primary text-primary-foreground" : tone === "accent" ? "bg-destructive text-white" : "bg-secondary text-foreground";
  const sub = tone === "grey" ? "text-muted-foreground" : "opacity-85";
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-expanded={selected}
      aria-controls={selected ? "area-details" : undefined}
      onClick={onSelect}
      className={`area-tile flex h-full w-full flex-col justify-between gap-5 rounded-3xl text-left transition-[box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${cls} ${big ? "p-7 md:p-8 min-h-[300px]" : "p-5 md:p-6 min-h-[200px]"} ${selected ? "ring-2 ring-[#D9A03C]" : ""}`}
    >
      <span className="area-label flex w-full items-center rounded-full border border-current/40 px-4 py-2 text-[13px] font-medium leading-tight opacity-85">{label}</span>
      <span className="flex flex-col gap-1">
        <span className="flex items-center gap-4">
          <ScoreRing v={a.ertek} size={big ? 84 : 56} stroke={big ? 8 : 6} onDark={tone !== "grey"} band />
          <span className={`${big ? "text-[64px] md:text-[80px]" : "text-[44px]"} font-medium leading-none tracking-[-0.04em] tabular-nums`}><CountUp value={a.ertek} /></span>
        </span>
        <span className={`${big ? "text-xl" : "text-[15px] md:text-base"} font-semibold mt-1 [overflow-wrap:anywhere]`}>{a.nev}</span>
        <span className={`text-[14px] ${sub}`}>{gloss}</span>
      </span>
      {big && q && J ? (
        <span className={`text-[14px] leading-snug ${sub} max-w-[46ch]`}>
          <span className="block text-[12px] font-semibold uppercase tracking-[0.08em] opacity-70 mb-1">{qLabel}</span>
          {J.cleanQ(q.k)} <span className="whitespace-nowrap opacity-80">· {J.CS[q.cs]} · {num(q.e)}</span>
        </span>
      ) : null}
    </button>
  );
}

function Areas() {
  const [sel, setSel] = React.useState<string | null>(null);
  const J = window.__J;
  const sorted = D.alindexek.slice().sort((x, y) => y.ertek - x.ertek);
  const top = sorted[0], bottom = sorted[sorted.length - 1], mid = sorted.slice(1, -1);
  const gloss = (x: Area) => (J?.MIT[x.nev] || ["", ""])[0];
  const a: Area | undefined = D.alindexek.find((x) => x.nev === sel);
  const panel = a && J ? (
    <div className="panel open area-details" id="area-details" role="region" aria-label={a.nev} style={{ borderBottom: 0 }}>
      <div className="inner">
        <div>
          <p className="mit"><b>{S.mit}</b> {(J.MIT[a.nev] || ["", ""])[1]}</p>
          <p className="one">{J.ONE[a.nev] || ""}</p>
          <div className="q"><b>{S.qHigh}</b>{J.cleanQ(a.legjobb.k)} <span className="chip">{J.CS[a.legjobb.cs]} · {num(a.legjobb.e)} {S.pts}</span></div>
          <div className="q"><b>{S.qLow}</b>{J.cleanQ(a.leggyengebb.k)} <span className="chip">{J.CS[a.leggyengebb.cs]} · {num(a.leggyengebb.e)} {S.pts}</span></div>
        </div>
        <div className="grp">
          <span className="chip">{S.byGroup} · {a.kerdes} {S.ofQuestions}</span>
          {Object.keys(a.csoportok).map((k) => (
            <div key={k}><span>{J.CS[k]}</span><b className="num">{num(a.csoportok[k])}</b></div>
          ))}
        </div>
      </div>
    </div>
  ) : null;
  const toggle = (nev: string) => setSel((s) => (s === nev ? null : nev));
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Reveal i={0}><AreaTile a={top} tone="dark" big label={S.strongest} gloss={gloss(top)} q={top.legjobb} qLabel={S.qHigh} selected={sel === top.nev} onSelect={() => toggle(top.nev)} /></Reveal>
        <Reveal i={1}><AreaTile a={bottom} tone="accent" big label={S.weakest} gloss={gloss(bottom)} q={bottom.leggyengebb} qLabel={S.qLow} selected={sel === bottom.nev} onSelect={() => toggle(bottom.nev)} /></Reveal>
      </div>
      {(sel === top.nev || sel === bottom.nev) && panel}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {mid.map((x, i) => (
          <Reveal key={x.nev} i={i + 2}><AreaTile a={x} tone="grey" label={x.ertek >= 60 ? S.legend[1] : x.ertek >= 50 ? S.legend[2] : S.legend[3]} gloss={gloss(x)} selected={sel === x.nev} onSelect={() => toggle(x.nev)} /></Reveal>
        ))}
      </div>
      <div className="bars" style={{ marginTop: 16 }}>
        {sel !== top.nev && sel !== bottom.nev && panel}
        <div className="legend">
          <span><i className="sw" style={{ background: "var(--ochre)", height: 2 }}></i>{S.legend[0]}</span>
          <span><i className="sw"></i>{S.legend[1]}</span>
          <span><i className="sw" style={{ background: "var(--teal)" }}></i>{S.legend[2]}</span>
          <span><i className="sw" style={{ background: "var(--clay)" }}></i>{S.legend[3]}</span>
          <span style={{ marginLeft: "auto" }}>{S.allValues}</span>
        </div>
      </div>
    </div>
  );
}

/* shared district selection between the cards island and the map island */
const selListeners = new Set<(n: string) => void>();
let selNev = valid.slice().sort((a, b) => (b.ertek as number) - (a.ertek as number))[0]?.nev ?? "";
function selectDistrict(nev: string, scroll = false) {
  selNev = nev;
  selListeners.forEach((fn) => fn(nev));
  window.__showJaras?.(nev);
  if (scroll && window.innerWidth < 820) document.getElementById("jdetail")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
}
function useSelected() {
  const [s, setS] = React.useState(selNev);
  React.useEffect(() => { selListeners.add(setS); return () => { selListeners.delete(setS); }; }, []);
  return s;
}

/* ── 6. Real map ── */
function MapIsland() {
  const sel = useSelected();
  return (
    <DistrictMap
      districts={D.jarasok}
      index={D.index}
      selected={sel}
      onSelect={(n) => selectDistrict(n, true)}
      strings={{ legend: S.mapLegend, noData: S.noData, noRes: S.noRes, pts: S.pts }}
    />
  );
}

/* ── 3. Districts: one row of equal tiles under the map; the detail card stays ── */
function Districts() {
  const sel = useSelected();
  const pick = (nev: string) => selectDistrict(nev, true);
  const withRes = noIndex.filter((j) => (j.n[gRes] || 0) > 0);
  const ordered = valid.slice().sort((x, y) => x.nev.localeCompare(y.nev, lang === "hu" ? "hu" : "en"));
  const short = (n: string) => n.replace(lang === "hu" ? " járás" : " district", "");
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {ordered.map((j, i) => {
          const d = (j.ertek as number) - D.index;
          const band = d >= 2 ? "up" : d <= -2 ? "down" : "mid";
          const pressed = sel === j.nev;
          const Icon = band === "mid" ? Minus : d >= 0 ? ArrowUpRight : ArrowDownRight;
          const surface = pressed
            ? "bg-primary text-primary-foreground"
            : band === "up" ? "bg-primary/90 text-primary-foreground"
            : band === "down" ? "bg-destructive text-white"
            : "bg-secondary text-foreground";
          const sub = pressed || band !== "mid" ? "opacity-80" : "text-muted-foreground";
          return (
            <Reveal key={j.nev} i={i}><button
              type="button"
              aria-pressed={pressed}
              onClick={() => pick(j.nev)}
              className={`flex h-full w-full flex-col justify-between gap-3 rounded-2xl p-4 min-h-[124px] text-left transition-[box-shadow,transform] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${surface} ${pressed ? "ring-2 ring-[#D9A03C]" : ""}`}
            >
              <span className="text-[13px] font-semibold leading-tight">
                {short(j.nev)}{(j.n[gRes] || 0) < 15 ? "*" : ""}
              </span>
              <span className="flex items-end justify-between gap-2">
                <span>
                <span className="block text-[34px] font-medium leading-none tracking-[-0.03em] tabular-nums"><CountUp value={j.ertek as number} /></span>
                <span className={`mt-1.5 flex items-center gap-1 text-[12px] whitespace-nowrap ${sub}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {(d >= 0 ? "+" : "−") + num(Math.abs(d))} {S.pts}
                </span>
                </span>
                <ScoreRing v={j.ertek as number} size={36} stroke={4} onDark={pressed || band !== "mid"} />
              </span>
            </button></Reveal>
          );
        })}
      </div>
      <p className="text-[13px] text-muted-foreground">
        {S.noIndex(noIndex.map((j) => short(j.nev)).join(", "), withRes.length ? S.noIndexExtra(withRes[0]) : "")}
        {" "}* {S.noRes}.
      </p>
    </div>
  );
}

/* ── 4. The three perspective gaps as link cards ── */
function Gaps() {
  const byN: Record<string, Record<string, number>> = {};
  D.alindexek.forEach((x) => (byN[x.nev] = x.csoportok));
  return (
    <Stats05
      cols={1}
      data={S.gaps.map(([nev, a, b, txt]) => {
        const d = Math.abs(byN[nev][a] - byN[nev][b]);
        return {
          name: nev,
          value: `${Math.round(d)} ${S.gap}`,
          change: `${a} ${Math.round(byN[nev][a])} · ${b} ${Math.round(byN[nev][b])}`,
          changeType: "neutral" as const,
          description: txt,
          href: "#eredmenyek",
          linkText: S.more,
        };
      })}
    />
  );
}

/* ── 5. Competence split as the donut card (replaces the gold card) ── */
function Donut() {
  return (
    <WeeklyExpenseCard
      title={S.donutTitle}
      dateRange={S.donutSub}
      totalLabel={S.donutTotal}
      buttonText={S.donutBtn}
      buttonHref="#program"
      unit={S.donutUnit}
      locale={lang === "hu" ? "hu-HU" : "en-GB"}
      className="max-w-none bg-secondary"
      data={[
        { category: S.donutCats[0], percentage: 41, amount: 0.53, color: "191 72% 20%" },
        { category: S.donutCats[1], percentage: 32, amount: 0.41, color: "17 59% 45%" },
        { category: S.donutCats[2], percentage: 27, amount: 0.35, color: "190 36% 55%" },
      ]}
    >
      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{S.donutText}</p>
    </WeeklyExpenseCard>
  );
}

/* ── 7. Timeline: reads the original .tl entries from the page, renders the scroll timeline ── */
function TimelineIsland() {
  const src = document.querySelector<HTMLElement>(".tl");
  if (!src) return null;
  const entries = [...src.children].map((el) => {
    const num = el.querySelector(".num");
    const title = num?.textContent?.trim() ?? "";
    const now = !!num?.classList.contains("now");
    const strong = el.querySelector("strong")?.textContent ?? "";
    const ps = [...el.querySelectorAll("p")].map((p) => p.innerHTML);
    return {
      title,
      now,
      content: (
        <div className="rounded-3xl bg-secondary p-6 md:p-8 max-w-2xl">
          <p className="text-lg md:text-xl font-semibold text-foreground mb-2">{strong}</p>
          {ps.map((h, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: h }} />
          ))}
        </div>
      ),
    };
  });
  src.classList.add("taken");
  return <Timeline data={entries} />;
}

/* ── 8. Respondent quotes as testimonial cards; the text comes from the hidden .quote card ── */
function QuotesIsland() {
  const src = document.querySelector<HTMLElement>(".card.quote");
  if (!src) return null;
  const eyebrow = src.querySelector(".eyebrow")?.textContent?.trim() ?? "";
  const items: Testimonial[] = [];
  const q = src.querySelector(":scope > .q")?.textContent?.trim();
  const chip = src.querySelector(":scope > .chip")?.textContent?.trim() ?? "";
  if (q) {
    const [who, ...role] = chip.split("·").map((x) => x.trim());
    items.push({ quote: q, who, role: role.join(" · ") || undefined });
  }
  src.querySelectorAll(".qq > div").forEach((d) => {
    const t = d.querySelector("p")?.textContent?.trim();
    if (t) items.push({ quote: t, who: d.querySelector(".chip")?.textContent?.trim() ?? "" });
  });
  const note = [...src.querySelectorAll(":scope > p")].filter((p) => !p.classList.contains("q")).map((p) => p.innerHTML).join(" ");
  return <Testimonials items={items} eyebrow={eyebrow} note={note} />;
}

const mounts: [string, React.ReactNode][] = [
  ["island-dashboard", <DashboardIsland />],
  ["island-areas", <Areas />],
  ["island-districts", <Districts />],
  ["island-gaps", <Gaps />],
  ["island-donut", <Donut />],
  ["island-map", <MapIsland />],
  ["island-timeline", <TimelineIsland />],
  ["island-quotes", <QuotesIsland />],
];
mounts.forEach(([id, node]) => {
  const el = document.getElementById(id);
  if (el) createRoot(el).render(node);
});
