import { useSyncExternalStore } from "react";
export type Settings = {
  music: number;
  sound: number;
  voice: number;
  reducedMotion: boolean;
  quality: "low" | "high";
  reminder: number;
  assistance: boolean;
};
export type Profile = {
  id: string;
  name: string;
  done: number[];
  stars: number;
  colour: string;
  fin: "round" | "pointy";
  sticker: string;
  suit: string;
  playSeconds: number;
};
export type Save = { profiles: Profile[]; active: string; settings: Settings };
const fresh = (name = "Nihara", id = "captain-1"): Profile => ({
  id,
  name,
  done: [],
  stars: 0,
  colour: "#ad9af4",
  fin: "round",
  sticker: "⭐",
  suit: "#f4be76",
  playSeconds: 0,
});
const defaults: Settings = {
  music: 0.15,
  sound: 0.4,
  voice: 0.8,
  reducedMotion: false,
  quality: "high",
  reminder: 0,
  assistance: true,
};
export function parseSave(raw: string | null): Save {
  try {
    const x = JSON.parse(raw || "null");
    if (!x || !Array.isArray(x.profiles)) throw Error();
    const profiles = x.profiles
      .slice(0, 4)
      .map((p: Partial<Profile>, i: number) => {
        const base = fresh(
          typeof p.name === "string"
            ? p.name.slice(0, 18)
            : "Captain " + (i + 1),
          "captain-" + (i + 1),
        );
        const done = [
          ...new Set(
            Array.isArray(p.done)
              ? p.done.filter(
                  (id: unknown) =>
                    Number.isInteger(id) && Number(id) > 0 && Number(id) <= 50,
                )
              : [],
          ),
        ];
        return {
          ...base,
          done,
          stars: done.length * 3,
          colour: ["#ad9af4", "#f4be76", "#79d8cc", "#f499b9"].includes(
            p.colour || "",
          )
            ? p.colour!
            : base.colour,
          fin: p.fin === "pointy" ? ("pointy" as const) : ("round" as const),
          sticker: ["⭐", "🌙", "🌸", "🚀"].includes(p.sticker || "")
            ? p.sticker!
            : base.sticker,
          suit: ["#f4be76", "#79d8cc", "#ad9af4"].includes(p.suit || "")
            ? p.suit!
            : base.suit,
          playSeconds:
            typeof p.playSeconds === "number" && Number.isFinite(p.playSeconds)
              ? Math.max(0, p.playSeconds)
              : 0,
        };
      });
    if (!profiles.length) throw Error();
    const s = x.settings || {};
    const settings = { ...defaults };
    for (const key of ["music", "sound", "voice"] as const)
      if (typeof s[key] === "number" && Number.isFinite(s[key]))
        settings[key] = Math.max(0, Math.min(1, s[key]));
    settings.reducedMotion = !!s.reducedMotion;
    settings.assistance = s.assistance !== false;
    settings.quality = s.quality === "low" ? "low" : "high";
    settings.reminder = [0, 5, 10, 15].includes(s.reminder) ? s.reminder : 0;
    return {
      profiles,
      active: profiles.some((p: Profile) => p.id === x.active)
        ? x.active
        : profiles[0].id,
      settings,
    };
  } catch {
    return {
      profiles: [fresh()],
      active: "captain-1",
      settings: { ...defaults },
    };
  }
}
let saved: Save;
let storageAvailable = true;
try {
  saved = parseSave(localStorage.getItem("nihara-space-v1"));
} catch {
  saved = parseSave(null);
  storageAvailable = false;
}
const listeners = new Set<() => void>();
function persist() {
  try {
    localStorage.setItem("nihara-space-v1", JSON.stringify(saved));
  } catch {
    storageAvailable = false;
  }
  listeners.forEach((f) => f());
}
export const store = {
  get: () => saved,
  subscribe: (f: () => void) => {
    listeners.add(f);
    return () => {
      listeners.delete(f);
    };
  },
  profile: () => saved.profiles.find((p) => p.id === saved.active)!,
  updateProfile: (patch: Partial<Profile>) => {
    saved = {
      ...saved,
      profiles: saved.profiles.map((p) =>
        p.id === saved.active ? { ...p, ...patch } : p,
      ),
    };
    persist();
  },
  complete: (id: number) => {
    if (!Number.isInteger(id) || id < 1 || id > 50) return;
    const p = store.profile();
    if (!p.done.includes(id))
      store.updateProfile({ done: [...p.done, id], stars: p.stars + 3 });
  },
  settings: (patch: Partial<Settings>) => {
    saved = { ...saved, settings: { ...saved.settings, ...patch } };
    persist();
  },
  switch: (id: string) => {
    if (saved.profiles.some((p) => p.id === id)) {
      saved = { ...saved, active: id };
      persist();
    }
  },
  add: () => {
    if (saved.profiles.length < 4) {
      const p = fresh(
        "Captain " + (saved.profiles.length + 1),
        "captain-" + (saved.profiles.length + 1),
      );
      saved = { ...saved, profiles: [...saved.profiles, p], active: p.id };
      persist();
    }
  },
  reset: () => {
    const p = store.profile();
    saved = {
      ...saved,
      profiles: saved.profiles.map((v) =>
        v.id === p.id ? fresh(p.name, p.id) : v,
      ),
    };
    persist();
  },
  get storageAvailable() {
    return storageAvailable;
  },
};
export function useSave() {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}
