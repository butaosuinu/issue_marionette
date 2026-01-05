export type ThemeMode = "dark" | "light" | "system";

export type Locale = "ja" | "en";

export type Settings = {
  theme: ThemeMode;
  locale: Locale;
  worktreeBasePath: string;
  claudeCliPath: string;
};
