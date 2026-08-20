/**
 * i18n routing — the single source of truth for supported locales.
 *
 * 👉 APPLY TEMPLATE: When adding/removing a language, sync THREE places:
 *   1. Here — locales array
 *   2. src/locales/<locale>.json — actual file must exist (can be `{}` to start)
 *   3. src/content/<locale>/ — directory must exist (can be empty)
 *
 * URL strategy (as-needed prefix):
 *   - English (default) has NO prefix: /bosses/emberfang
 *   - Other locales ARE prefixed:     /ja/bosses/emberfang
 *
 * This is configured in astro.config.ts via `i18n.routing.prefixDefaultLocale: false`.
 */

export const locales = ['en', 'es', 'de', 'fr', 'pt'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** English label for each locale (used in language switcher). */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  pt: 'Português',
};

/**
 * Open Graph locale tags (og:locale / og:locale:alternate) require the
 * `language_TERRITORY` format (e.g. "es_ES") — a bare "es" is malformed and
 * some social crawlers ignore it. Territory picks the largest audience for
 * each language (pt → pt_BR).
 */
export const OG_LOCALE_MAP: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  de: 'de_DE',
  fr: 'fr_FR',
  pt: 'pt_BR',
};

/** Whether the given locale is the default (English, no URL prefix). */
export function isDefaultLocale(locale: string): boolean {
  return locale === defaultLocale;
}

/** Type guard: narrow an arbitrary string to Locale. */
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Locales whose text is CJK (no word spaces). Reading-time and other
 * text metrics must go by character count for these, not word count.
 * Listed as plain strings so unconfigured locales don't widen `Locale` —
 * a CJK entry here lights up automatically the day it joins `locales`.
 */
const CJK_LOCALES: readonly string[] = ['ja', 'zh', 'zh-tw', 'ko'];

/** Whether the locale's text should be measured in characters (CJK). */
export function isCJKLocale(locale: string): boolean {
  return CJK_LOCALES.includes(locale);
}
