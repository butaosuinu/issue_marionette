import { useAtom, useAtomValue } from "jotai";
import { themeAtom } from "../../stores/settingsAtoms";
import { isAuthenticatedAtom } from "../../stores/authAtoms";
import { LoginButton } from "../auth/LoginButton";
import { UserMenu } from "../auth/UserMenu";
import type { ThemeMode } from "../../types/settings";
import { Button } from "../ui/Button";

const AuthSection = () => {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return <LoginButton />;
};

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
        <Button variant="ghost" className="p-2" onClick={cycleTheme} title={`Theme: ${theme}`}>
          {themeIcon}
        </Button>
        <AuthSection />
      </div>
    </header>
  );
};
