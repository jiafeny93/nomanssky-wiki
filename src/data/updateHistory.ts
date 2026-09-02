/**
 * Update history — the version timeline shown on /recent.
 *
 * One row per major update family, newest first. Every fact here is either
 * from Hello Games' own update pages (nomanssky.com/<name>-update/) or
 * already asserted by our own articles — no invented versions or dates.
 *
 * Localization: update NAMES are proper nouns and stay English everywhere
 * (same rule as data-page item names); the one-line summary is fully
 * translated, keyed by locale.
 */
import type { Locale } from '~/i18n/routing';

export interface UpdateDate {
  year: number;
  /** 1-12, omitted for year-only precision. */
  month?: number;
  /** Omitted when only month precision is verified. */
  day?: number;
}

export interface UpdateRow {
  /** Official version string as Hello Games writes it ("6.50", not "6.5"). */
  version: string;
  /** Update codename — proper noun, kept English in every locale. */
  name: string;
  date: UpdateDate;
  /** false = still rolling out (staged rollout) → shows the live chip. */
  live: boolean;
  /** Follow-up patch versions in this family, e.g. 6.41…6.45.1. */
  patches?: string[];
  summary: Record<Locale, string>;
  /** Up to two of our own articles that cover this update. */
  related?: { category: string; slug: string }[];
  /** Official Hello Games release page for this update. */
  official?: string;
}

export const UPDATE_HISTORY: UpdateRow[] = [
  {
    version: '6.50',
    name: 'Cosmos',
    date: { year: 2026, month: 8, day: 9 },
    live: false,
    summary: {
      en: "The 10th anniversary update: fly between solar systems directly and land on stars with new heat-resistant gear. Rolling out in stages.",
      es: "La actualización del décimo aniversario: vuelo directo entre sistemas solares y aterrizaje en estrellas con nuevo equipo resistente al calor. Se despliega por fases.",
      de: "Das Update zum 10. Jubiläum: direkter Flug zwischen Sonnensystemen und Landung auf Sternen mit neuer hitzebeständiger Ausrüstung. Wird in Phasen ausgerollt.",
      fr: "La mise à jour du 10e anniversaire : vol direct entre systèmes solaires et atterrissage sur les étoiles avec de nouveaux équipements résistants à la chaleur. Déploiement par étapes.",
      pt: "A atualização do 10º aniversário: voo direto entre sistemas solares e pouso em estrelas com novo equipamento resistente ao calor. Sendo lançada em etapas.",
      zh: "十周年更新：星系之间直接飞行，并穿上新耐热装备登陆恒星。正在分阶段推送。",
    },
    related: [
      { category: 'cosmos-update', slug: 'cosmos-update-guide' },
      { category: 'cosmos-update', slug: 'cosmos-new-features' },
    ],
  },
  {
    version: '6.4',
    name: 'The Swarm',
    date: { year: 2026, month: 5 },
    live: true,
    patches: ['6.41', '6.42', '6.43', '6.44', '6.45', '6.45.1'],
    summary: {
      en: "Swarmer ship ambushes, boardable pirate freighters, and Expedition 22 with the Hive of Glass finale.",
      es: "Embuscadas de naves enjambre, cargueros piratas abordables y la Expedición 22 con la Colmena de Cristal como final.",
      de: "Hinterhalte der Schwärmer, enternbare Piratenfrachter und Expedition 22 mit dem Hive-of-Glass-Finale.",
      fr: "Embuscades de vaisseaux essaims, fretteurs pirates abordables et l'Expédition 22 avec la Ruche de verre en point d'orgue.",
      pt: "Embuscas de swarmers, cargueiros piratas que podem ser abordados e a Expedição 22 com a Colmeia de Vidro como final.",
      zh: "蜂群敌舰伏击、可登船夺取的海盗货船，以及以 Hive of Glass 决战收尾的远征 22。",
    },
    related: [
      { category: 'guides', slug: 'swarm-battles-guide' },
      { category: 'expeditions', slug: 'expedition-22' },
    ],
    official: 'https://www.nomanssky.com/swarm-update/',
  },
  {
    version: '6.30',
    name: 'Xeno Arena',
    date: { year: 2026, month: 4, day: 8 },
    live: true,
    patches: ['6.33', '6.34', '6.36'],
    summary: {
      en: "Creature battles: adopt companions, fight turn-based, chase Oceanus's daily worldwide challenge, and edit genetics with Retroviral Pellets.",
      es: "Batallas de criaturas: adopta compañeros, combate por turnos, persigue el desafío diario mundial de Oceanus y edita la genética con Retroviral Pellets.",
      de: "Kreaturenkämpfe: Begleiter adoptieren, rundenbasiert kämpfen, Oceanus' tägliche Globalaufgabe jagen und mit Retroviral Pellets die Genetik bearbeiten.",
      fr: "Combats de créatures : adoptez des compagnons, combattez au tour par tour, relevez le défi quotidien mondial d'Oceanus et modifiez la génétique avec les Retroviral Pellets.",
      pt: "Batalhas de criaturas: adote companheiros, lute por turnos, persiga o desafio diário mundial de Oceanus e edite a genética com Retroviral Pellets.",
      zh: "生物对战：领养同伴、回合制战斗、追逐 Oceanus 的每日全球挑战，并用 Retroviral Pellets 改造基因。",
    },
    related: [
      { category: 'guides', slug: 'pet-battling-guide' },
      { category: 'guides', slug: 'retroviral-pellets' },
    ],
    official: 'https://www.nomanssky.com/xeno-arena-update/',
  },
  {
    version: '6.2',
    name: 'Remnant',
    date: { year: 2026, month: 2 },
    live: true,
    summary: {
      en: "Gravity upgrades for your multi-tool: magnetise, carry, and launch industrial salvage, plus new Colossus modules and Expedition 21.",
      es: "Mejoras de gravedad para la multiherramienta: imantar, cargar y lanzar chatarra industrial, además de nuevos módulos del Colossus y la Expedición 21.",
      de: "Schwerkraft-Upgrades fürs Multiwerkzeug: Industrialschrott magnetisieren, tragen und abschießen, dazu neue Colossus-Module und Expedition 21.",
      fr: "Améliorations gravitationnelles du multi-outil : aimanter, porter et propulser des déchets industriels, plus de nouveaux modules de Colossus et l'Expédition 21.",
      pt: "Melhorias de gravidade para o multiferramenta: magnetizar, carregar e lançar sucata industrial, além de novos módulos do Colossus e a Expedição 21.",
      zh: "多功能工具的引力升级：磁化、搬运、发射工业废料，外加新 Colossus 模块与远征 21。",
    },
    related: [{ category: 'guides', slug: 'new-update-2026' }],
    official: 'https://www.nomanssky.com/remnant-update/',
  },
  {
    version: '6.0',
    name: 'Voyagers',
    date: { year: 2025 },
    live: true,
    summary: {
      en: "Corvette-class ship building: assemble a fully custom, multi-crew starship from hundreds of modules.",
      es: "Construcción de naves clase Corvette: ensambla una nave estelar totalmente personalizada para varios jugadores a partir de cientos de módulos.",
      de: "Schiffsbau der Corvette-Klasse: aus hunderten Modulen ein komplett eigenes Mehrmann-Raumschiff zusammenbauen.",
      fr: "Construction de vaisseaux de classe Corvette : assemblez un vaisseau entièrement personnalisable et multijoueur à partir de centaines de modules.",
      pt: "Construção de naves classe Corvette: monte uma nave estelar totalmente personalizada para vários jogadores a partir de centenas de módulos.",
      zh: "Corvette 级飞船建造：用数百个模块组装一艘完全自定义的多乘员星舰。",
    },
    official: 'https://www.nomanssky.com/voyagers-update/',
  },
];

/**
 * Format a row's date at its verified precision, localized at build time.
 * en→"August 9, 2026" / de→"9. August 2026" / fr→"9 août 2026" /
 * es→"9 de agosto de 2026" / pt→"9 de agosto de 2026"; month-only →
 * "May 2026" etc.; year-only → "2025".
 */
export function formatUpdateDate(date: UpdateDate, locale: Locale): string {
  const loc = locale === 'en' ? 'en-US' : locale;
  if (date.day != null && date.month != null) {
    return new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long', year: 'numeric' }).format(
      new Date(date.year, date.month - 1, date.day),
    );
  }
  if (date.month != null) {
    return new Intl.DateTimeFormat(loc, { month: 'long', year: 'numeric' }).format(
      new Date(date.year, date.month - 1, 1),
    );
  }
  return String(date.year);
}
