/**
 * Locale state and translation helpers.
 *
 * Any text field in config.js / projects.js can be either a plain string
 * (identical in every language) or an object keyed by locale:
 *
 *   title: { ja: 'フルスタックエンジニア', en: 'Full Stack Engineer' }
 *
 * `t()` resolves such a value for the current locale and falls back to
 * English, so a field that has not been translated yet still renders.
 *
 * The chosen language is remembered in localStorage. `?lang=en` in the URL
 * overrides it for a single visit (handy for sharing a link in one language).
 */

export const locales = [
  { code: 'ja', label: 'JA', name: '日本語' },
  { code: 'en', label: 'EN', name: 'English' },
];

/** Language shown on the very first visit. */
export const defaultLocale = 'ja';

const STORAGE_KEY = 'portfolio:lang';
const isLocale = (code) => locales.some((l) => l.code === code);

function resolveInitial() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (isLocale(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    /* storage blocked (private mode etc.) — fall through to the default */
  }
  return defaultLocale;
}

let current = resolveInitial();

export const getLocale = () => current;

/** Returns true when the locale actually changed. */
export function setLocale(code) {
  if (!isLocale(code) || code === current) return false;
  current = code;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* not fatal — the choice just will not persist */
  }
  return true;
}

/** Resolve a translatable value (string or { ja, en } object) for a locale. */
export function t(value, locale = current) {
  if (value && typeof value === 'object' && !Array.isArray(value) && locales.some((l) => l.code in value)) {
    return value[locale] ?? value.en ?? value[locales.find((l) => l.code in value).code];
  }
  return value;
}

/* ------------------------------------------------------------- UI strings
 * Chrome that is not authored in config.js: headings, buttons, labels,
 * form copy. `*text*` inside a heading marks the accent-coloured span.
 */
const UI = {
  en: {
    language: 'Language',
    scrollHint: 'Scroll to Explore',

    aboutTitle: 'About *Me.*',

    techEyebrow: 'Tech stack',
    techTitle: 'My *Technologies*',
    techLead: 'My core stack across web development, e-commerce, business systems, and Web3.',
    legendLabel: 'Proficiency legend',
    proficiency: 'Proficiency',

    projectEyebrow: 'Project',
    projectTitle: 'Selected *Works*',
    projectLead: 'Corporate sites, e-commerce stores, business systems, and Web3 products delivered across {n} projects.',
    filterLabel: 'Filter projects by category',
    all: 'All',
    showMore: 'Show More ({n})',
    showLess: 'Show Less',
    badgeLive: 'Live',
    badgeGithub: 'GitHub',
    badgeGithubTitle: 'Source on GitHub',
    badgePrivate: 'Private',
    badgePrivateTitle: 'Source not publicly shared',
    catProduct: 'Product',
    catOpenSource: 'Open source',
    catConfidential: 'Confidential',
    visitSite: 'Visit site',
    visitAria: 'Visit {name}',
    githubAria: '{name} on GitHub',
    zoomAria: 'Zoom {name} image',
    techStackAria: 'Tech stack',

    contactEyebrow: 'Get in touch',
    contactTitle: "Let's build *something*.",
    contactText:
      'Tell me what you are working on and what "done" looks like. I\'ll reply with an honest read on scope, approach, and timeline.',
    fieldName: 'Name',
    fieldEmail: 'Email',
    fieldMessage: 'Message',
    placeholderName: 'John Doe',
    placeholderEmail: 'john@example.com',
    placeholderMessage: 'Tell me about your project...',
    submit: 'Submit',
    sending: 'Sending...',
    errorNotConfigured: 'Contact form is not configured yet.',
    errorFailed: 'Failed to send message. Please try again.',
    errorNetwork: 'Network error. Please try again.',
    mailFrom: 'From',
  },

  ja: {
    language: '言語',
    scrollHint: 'スクロールして見る',

    aboutTitle: '自己*紹介。*',

    techEyebrow: '技術スタック',
    techTitle: '主な*技術スタック*',
    techLead: 'Web制作、EC、業務システム、Web3にわたる主な技術スタックです。',
    legendLabel: '習熟度の凡例',
    proficiency: '習熟度',

    projectEyebrow: '実績',
    projectTitle: '主な*制作実績*',
    projectLead: '企業サイト、ECサイト、業務システム、Web3プロダクトなど、{n}件の制作実績。',
    filterLabel: 'カテゴリで実績を絞り込む',
    all: 'すべて',
    showMore: 'もっと見る（{n}）',
    showLess: '閉じる',
    badgeLive: '公開中',
    badgeGithub: 'GitHub',
    badgeGithubTitle: 'ソースコードはGitHubで公開',
    badgePrivate: '非公開',
    badgePrivateTitle: 'ソースコードは非公開',
    catProduct: 'プロダクト',
    catOpenSource: 'オープンソース',
    catConfidential: '機密案件',
    visitSite: 'サイトを見る',
    visitAria: '{name} を見る',
    githubAria: '{name} のGitHub',
    zoomAria: '{name} の画像を拡大',
    techStackAria: '使用技術',

    contactEyebrow: 'お問い合わせ',
    contactTitle: '一緒に*何か*つくりましょう。',
    contactText:
      '取り組んでいることと、どこまでできれば「完成」なのかをお聞かせください。範囲・進め方・スケジュールについて、率直な見立てをお返しします。',
    fieldName: 'お名前',
    fieldEmail: 'メールアドレス',
    fieldMessage: 'メッセージ',
    placeholderName: '山田 太郎',
    placeholderEmail: 'taro@example.com',
    placeholderMessage: 'プロジェクトの内容をお聞かせください…',
    submit: '送信する',
    sending: '送信中…',
    errorNotConfigured: 'お問い合わせフォームはまだ設定されていません。',
    errorFailed: '送信に失敗しました。もう一度お試しください。',
    errorNetwork: 'ネットワークエラーが発生しました。もう一度お試しください。',
    mailFrom: '送信者',
  },
};

/** UI string for the current locale; `{key}` placeholders are filled from `vars`. */
export function ui(key, vars) {
  let s = UI[current]?.[key] ?? UI.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
