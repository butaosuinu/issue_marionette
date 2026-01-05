import { useAtom } from "jotai";
import { themeAtom } from "../../stores";
import type { ThemeMode } from "../../types";

export const Header = () => {
  const [theme, setTheme] = useAtom(themeAtom);

  const cycleTheme = () => {
    const themes: ReadonlyArray<ThemeMode> = ["dark", "light", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const themeIcon = {
    dark: "🌙",
    light: "☀️",
    system: "💻",
  }[theme];

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
