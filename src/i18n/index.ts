import { i18n } from "@lingui/core";
import { messages as jaMessages } from "./locales/ja";
import { messages as enMessages } from "./locales/en";

export const locales = {
  ja: "日本語",
  en: "English",
} as const;

export type LocaleKey = keyof typeof locales;

i18n.load({
  ja: jaMessages,
  en: enMessages,
});

i18n.activate("ja");

export { i18n };
