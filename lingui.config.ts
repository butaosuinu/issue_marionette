import type { LinguiConfig } from "@lingui/conf";

const config: LinguiConfig = {
  locales: ["ja", "en"],
  sourceLocale: "ja",
  catalogs: [
    {
      path: "<rootDir>/src/i18n/locales/{locale}",
      include: ["src"],
    },
  ],
  format: "po",
};

export default config;
