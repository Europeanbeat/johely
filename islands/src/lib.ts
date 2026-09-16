import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Lang = "hu" | "en";

export const lang: Lang = (document.documentElement.lang || "hu").startsWith("en") ? "en" : "hu";

export const num = (v: number, d = 1) =>
  v.toLocaleString(lang === "hu" ? "hu-HU" : "en-GB", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

export const int = (v: number) => v.toLocaleString(lang === "hu" ? "hu-HU" : "en-GB");

/* The page embeds its data in <script id="adat" type="application/json"> */
export type Area = {
  nev: string;
  ertek: number;
  kerdes: number;
  csoportok: Record<string, number>;
  legjobb: { k: string; cs: string; e: number; n: number };
  leggyengebb: { k: string; cs: string; e: number; n: number };
};
export type District = {
  nev: string;
  ertek: number | null;
  valid: boolean;
  n: Record<string, number>;
  alindexek?: Record<string, number>;
};
export type Data = {
  ev: number;
  index: number;
  alindexek: Area[];
  jarasok: District[];
  csoportN: Record<string, number>;
  kerdes_ossz: number;
  valaszok: number;
};

export function readData(): Data {
  const el = document.getElementById("adat");
  return JSON.parse(el?.textContent || "{}") as Data;
}

declare global {
  interface Window {
    __J?: {
      MIT: Record<string, [string, string]>;
      ONE: Record<string, string>;
      CS: Record<string, string>;
      cleanQ: (s: string) => string;
    };
    __showJaras?: (nev: string) => void;
  }
}
