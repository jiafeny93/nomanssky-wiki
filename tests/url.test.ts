import { describe, it, expect } from 'vitest';
import {
  localizePath,
  listPath,
  detailPath,
  homeUrl,
  localeFromPath,
} from '~/lib/url';
import { locales, defaultLocale, type Locale } from '~/i18n/routing';

/**
 * Non-default-locale coverage is driven by the routing config: when the
 * site is single-locale there is nothing to prefix (those blocks skip),
 * and the day a second locale is added they run again automatically —
 * no hardcoded 'ja' residue like the old version had.
 *
 * All HTML paths carry a trailing slash ("/starships/") — the canonical
 * URL form on this site (CF Pages 308s the slashless form).
 */
const secondLocale = locales.find((l): l is Locale => l !== defaultLocale);

describe('url helpers', () => {
  describe('localizePath', () => {
    it('returns the slashed path for the default locale (en)', () => {
      expect(localizePath('/bosses', 'en')).toBe('/bosses/');
      expect(localizePath('/bosses/emberfang', 'en')).toBe('/bosses/emberfang/');
    });

    describe.skipIf(!secondLocale)('non-default locales', () => {
      it('prepends the locale prefix', () => {
        const l = secondLocale as Locale;
        expect(localizePath('/bosses', l)).toBe(`/${l}/bosses/`);
        expect(localizePath('/bosses/emberfang', l)).toBe(`/${l}/bosses/emberfang/`);
        expect(localizePath('about', l)).toBe(`/${l}/about/`);
      });
    });

    it('ensures leading slash on input without one', () => {
      expect(localizePath('about', 'en')).toBe('/about/');
    });

    it('keeps "/" as the bare root for every locale (no "//")', () => {
      expect(localizePath('/', 'en')).toBe('/');
      if (secondLocale) expect(localizePath('/', secondLocale)).toBe(`/${secondLocale}/`);
    });
  });

  describe('homeUrl', () => {
    it('returns / for default locale', () => {
      expect(homeUrl('en')).toBe('/');
    });
    it.skipIf(!secondLocale)('returns the prefixed root for non-default locale', () => {
      expect(homeUrl(secondLocale as Locale)).toBe(`/${secondLocale}/`);
    });
  });

  describe('listPath', () => {
    it('builds the correct list URL for the default locale', () => {
      expect(listPath('bosses', 'en')).toBe('/bosses/');
      expect(listPath('codes', 'en')).toBe('/codes/');
    });
    it.skipIf(!secondLocale)('prefixes non-default locales', () => {
      expect(listPath('bosses', secondLocale as Locale)).toBe(`/${secondLocale}/bosses/`);
    });
  });

  describe('detailPath', () => {
    it('builds the correct article URL for the default locale', () => {
      expect(detailPath('bosses', 'emberfang', 'en')).toBe('/bosses/emberfang/');
      expect(detailPath('guides', 'early-game/beginner', 'en')).toBe(
        '/guides/early-game/beginner/',
      );
    });

    it.skipIf(!secondLocale)('prefixes and handles nested slugs for non-default locales', () => {
      const l = secondLocale as Locale;
      expect(detailPath('bosses', 'emberfang', l)).toBe(`/${l}/bosses/emberfang/`);
      expect(detailPath('guides', 'early-game/beginner', l)).toBe(
        `/${l}/guides/early-game/beginner/`,
      );
    });
  });

  describe('localeFromPath', () => {
    it('falls back to the default locale for unknown prefixes (single-locale site)', () => {
      // 'xx' is never a configured locale, so a path carrying that prefix
      // resolves to the default-locale fallback — whatever locales exist.
      expect(localeFromPath('/xx/bosses/emberfang')).toBe('en');
      expect(localeFromPath('/xx')).toBe('en');
    });

    it('returns the default locale when no prefix is present', () => {
      expect(localeFromPath('/bosses/emberfang')).toBe('en');
      expect(localeFromPath('/')).toBe('en');
      expect(localeFromPath('')).toBe('en');
    });
  });
});
