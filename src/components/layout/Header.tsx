import { useAtom } from "jotai";
import { themeAtom } from "../../stores";
import type { ThemeMode } from "../../types";

const THEME_CYCLE: Record<ThemeMode, ThemeMode> = {
  dark: "light",
  light: "system",
  system: "dark",
};

const THEME_ICONS: Record<ThemeMode, string> = {
  dark: "🌙",
  light: "☀️",
  system: "💻",
};

export const Header = () => {
  const [theme, setTheme] = useAtom(themeAtom);

  const cycleTheme = () => {
    const { [theme]: nextTheme } = THEME_CYCLE;
    setTheme(nextTheme);
  };

  const { [theme]: themeIcon } = THEME_ICONS;

  return (
    <header className="flex h-12 items-center justify-between border-b border-gray-700 bg-gray-800 px-4">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-gray-100">
          issue_marionette
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={cycleTheme}
          className="rounded p-2 text-gray-400 hover:bg-gray-700 hover:text-gray-100"
          title={`Theme: ${theme}`}
        >
          {themeIcon}
        </button>
      </div>
    </header>
  );
};
