import * as React from "react";
import L from "leaflet";
import geo from "./data/jarasok.geojson";
import lake from "./data/balaton.geojson";
import { lang, num, type District } from "./lib";

type Props = {
  districts: District[];
  index: number;
  selected: string;
  onSelect: (nev: string) => void;
  strings: { legend: string[]; noData: string; noRes: string; pts: string };
};

const BAND = {
  c1: "#0E4A57", // 2+ above
  c2: "#63A8B5", // above
  c3: "#B9D8DC", // below
  c4: "#B5562F", // 2+ below
};

function bandOf(d: number) {
  return d >= 2 ? "c1" : d > 0 ? "c2" : d > -2 ? "c3" : "c4";
}

/* Hungarian district names in the GeoJSON; the EN page uses "X district" */
const toHu = (nev: string) => nev.replace(/ district$/, " járás").replace(/^Keszthely /, "Keszthelyi ").replace(/^Balatonfüred /, "Balatonfüredi ").replace(/^Fonyód /, "Fonyódi ").replace(/^Veszprém /, "Veszprémi ").replace(/^Balatonalmádi /, "Balatonalmádi ").replace(/^Siófok /, "Siófoki ").replace(/^Tapolca /, "Tapolcai ").replace(/^Ajka /, "Ajkai ").replace(/^Marcali /, "Marcali ").replace(/^Nagykanizsa /, "Nagykanizsai ").replace(/^Tab /, "Tabi ");

export function DistrictMap({ districts, index, selected, onSelect, strings }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const layersRef = React.useRef<Record<string, L.Path>>({});
  const selRef = React.useRef(selected);
  selRef.current = selected;

  React.useEffect(() => {
    if (!ref.current) return;
    const byHu: Record<string, District> = {};
    districts.forEach((d) => (byHu[toHu(d.nev)] = d));

    const map = L.map(ref.current, {
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
      zoomSnap: 0.25,
    });
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, OpenStreetMap contributors',
      maxZoom: 16,
    }).addTo(map);

    const style = (nev: string, active: boolean): L.PathOptions => {
      const d = byHu[nev];
      if (!d || !d.valid || d.ertek == null) {
        return { color: "#9AAAB0", weight: 1, dashArray: "4 3", fillColor: "#D5DDDB", fillOpacity: 0.35 };
      }
      const b = bandOf(d.ertek - index);
      return {
        color: active ? "#D9A03C" : "#ffffff",
        weight: active ? 3 : 1.5,
        fillColor: BAND[b],
        fillOpacity: active ? 0.9 : 0.72,
      };
    };

    const layer = L.geoJSON(geo as GeoJSON.FeatureCollection, {
      style: (f) => style(f?.properties?.nev, f?.properties?.nev === toHu(selRef.current)),
      onEachFeature: (f, lyr) => {
        const nev: string = f.properties.nev;
        const d = byHu[nev];
        layersRef.current[nev] = lyr as L.Path;
        const label = d?.valid && d.ertek != null
          ? `<span class="mapchip"><b>${num(d.ertek)}</b> ${nev.replace(" járás", "")}${(d.n[Object.keys(d.n)[0]] || 0) < 15 ? "*" : ""}</span>`
          : `<span class="mapchip mapchip-na">${nev.replace(" járás", "")} · ${strings.noData}</span>`;
        const OFF: Record<string, [number, number]> = { "Ajkai járás": [-70, -30], "Veszprémi járás": [40, -34], "Tabi járás": [46, 26], "Fonyódi járás": [-6, 8], "Balatonalmádi járás": [26, -14] };
        (lyr as L.Path).bindTooltip(label, { permanent: true, direction: "center", className: "maplabel", opacity: 1, offset: L.point(...(OFF[nev] || [0, 0])) });
        lyr.on("mouseover", () => { if (nev !== toHu(selRef.current)) (lyr as L.Path).setStyle({ fillOpacity: 0.9, weight: 2 }); });
        lyr.on("mouseout", () => (lyr as L.Path).setStyle(style(nev, nev === toHu(selRef.current))));
        lyr.on("click", () => { if (d?.valid) onSelect(d.nev); });
      },
    }).addTo(map);

    // The lake drawn on top so districts visibly stop at the shore
    const water = L.geoJSON(lake as GeoJSON.FeatureCollection, {
      interactive: false,
      style: { color: "#C6D6DE", weight: 1, fillColor: "#E3ECF1", fillOpacity: 1 },
    }).addTo(map);

    // Labels for tiny districts overlap the lake; nudge the lake-side ones by fitting bounds with padding
    map.fitBounds(layer.getBounds(), { padding: [12, 12] });
    map.setMaxBounds(layer.getBounds().pad(0.4));

    const apply = () => {
      Object.entries(layersRef.current).forEach(([nev, lyr]) => lyr.setStyle(style(nev, nev === toHu(selRef.current))));
      const sel = layersRef.current[toHu(selRef.current)];
      if (sel) sel.bringToFront();
      water.bringToFront();
    };
    apply();
    (window as unknown as { __mapSelect?: (n: string) => void }).__mapSelect = (n: string) => { selRef.current = n; apply(); };

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(ref.current);
    return () => { ro.disconnect(); map.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    (window as unknown as { __mapSelect?: (n: string) => void }).__mapSelect?.(selected);
  }, [selected]);

  return (
    <div>
      <div ref={ref} className="districtmap rounded-xl overflow-hidden border border-border" style={{ height: "clamp(320px, 46vw, 520px)" }} aria-label={lang === "hu" ? "Járási térkép" : "District map"} />
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
        <span className="inline-flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-sm" style={{ background: BAND.c1 }} />{strings.legend[0]}</span>
        <span className="inline-flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-sm" style={{ background: BAND.c2 }} />{strings.legend[1]}</span>
        <span className="inline-flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-sm" style={{ background: BAND.c3 }} />{strings.legend[2]}</span>
        <span className="inline-flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-sm" style={{ background: BAND.c4 }} />{strings.legend[3]}</span>
        <span className="inline-flex items-center gap-2"><i className="inline-block h-3 w-3 rounded-sm border border-dashed border-[#9AAAB0] bg-[#D5DDDB]/40" />{strings.noData}</span>
        <span>* {strings.noRes}</span>
      </div>
    </div>
  );
}
