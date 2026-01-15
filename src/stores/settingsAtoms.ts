import { atom } from "jotai";
import type { Settings, ThemeMode, Locale } from "../types/settings";

const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  locale: "ja",
  worktreeBasePath: "",
  claudeCliPath: "claude",
};

export const settingsAtom = atom<Settings>(DEFAULT_SETTINGS);

export const themeAtom = atom(
  (get) => get(settingsAtom).theme,
  (get, set, theme: ThemeMode) => {
    set(settingsAtom, { ...get(settingsAtom), theme });
  }
);

export const localeAtom = atom(
  (get) => get(settingsAtom).locale,
  (get, set, locale: Locale) => {
    set(settingsAtom, { ...get(settingsAtom), locale });
  }
);

export const resolvedThemeAtom = atom((get) => {
  const theme = get(themeAtom);
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
});
