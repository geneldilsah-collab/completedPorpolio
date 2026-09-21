/**
 * Single source of truth for the site's content.
 * Profile, about, and stack live here; the project list lives in ./projects.js.
 *
 * Any text field may be a plain string or a { ja, en } object — see ./i18n.js.
 * The site opens in Japanese; the nav toggle switches to English.
 */

import { projects } from './projects.js';

export { projects };

export const profile = {
  name: 'Susanoo',
  /** Rendered by the particle system in the hero. Short words morph best (3–8 chars). */
  particleWord: 'SUSANOO',
  /** Initials shown in the nav mark and on the About photo card (when no photo is set). */
  monogram: 'HT',
  /** Cycled one at a time under the hero. */
  roles: {
    ja: ['フルスタックエンジニア', 'EC・CMS スペシャリスト', 'ブロックチェーン開発者'],
    en: ['Full Stack Engineer', 'E-commerce & CMS Specialist', 'Blockchain Developer'],
  },
  title: { ja: 'フルスタックエンジニア', en: 'Full Stack Engineer' },
  /** <meta name="description"> */
  description: {
    ja: 'Susanoo — 企業サイト、ECサイト、業務システム、ブロックチェーンプロダクトの開発を手がける、経験12年のフルスタックエンジニア。フリーランス案件・協業のご相談を受け付けています。',
    en: 'Susanoo — full stack engineer with 12 years of experience building corporate sites, e-commerce stores, business systems, and blockchain products. Available for freelance and collaboration.',
  },
  photo: '', // e.g. './images/me.jpg' — falls back to a generated monogram
  email: 'geneldilsah@gmail.com',
  socials: [
    { label: { ja: 'メール', en: 'Email' }, icon: 'mail', href: 'mailto:geneldilsah@gmail.com' },
    { label: 'Chatwork', icon: 'chatwork', href: 'https://www.chatwork.com/miracledayo225' },
  ],
};

/**
 * Animated background behind the hero:
 *   'waves' Silk Waves · 'dots' Ripple Grid · 'network' Constellation
 *   'flow' Flow Field · 'topo' Topographic · 'galaxy' Galaxy 3D · 'ocean' Deep Sea 3D
 * Open the site with ?preview to switch between them live.
 */
export const heroBackground = 'galaxy';

/** `href` must match a section id; it is also the key the scroll-spy uses. */
export const nav = [
  { label: { ja: 'ホーム', en: 'Home' }, href: '#hero' },
  { label: { ja: '自己紹介', en: 'About' }, href: '#about' },
  { label: { ja: 'スキル', en: 'Stack' }, href: '#technology' },
  { label: { ja: '実績', en: 'Project' }, href: '#project' },
  { label: { ja: 'お問い合わせ', en: 'Contact' }, href: '#contact' },
];

export const about = {
  paragraphs: {
    ja: [
      'ウェブサイト、オンラインストア、業務システムの開発に12年携わってきたフルスタックエンジニアです。日本国内および海外の企業に向けて、Web制作からシステム開発、既存サイト・システムのリニューアルまで幅広く手がけてきました。',
      '企業サイト・採用サイト、商品ローンチ向けのランディングページ、クリニック・サロン・法律事務所・大学・地域店舗のサイトなど、さまざまな業種のWebサイトに対応しています。特に、フロントエンドだけでなく、バックエンドやデータベース、API連携まで含め、Webサービス全体を一貫して実装できることを強みとしています。',
      'フロントエンドではHTML / CSS / JavaScriptをベースに、React、Next.jsを用いたWebアプリケーション開発に対応。バックエンドではPHP / Laravel、Python / Djangoを中心に、API開発、認証・権限管理、データベース設計、外部サービス連携など、サービスの裏側まで含めたシステム構築を行っています。',
      'ECではShopify、ecforce、MakeShop、BASE、STORESでのストア構築・カスタマイズに対応し、商品・顧客・注文管理などの機能や外部サービスとの連携まで幅広く対応しています。また、kintoneを活用した顧客管理・予約・会計などの業務システム開発も行っています。',
      'さらに、生成AI・AI APIを活用したWebサービス開発、Solidityによるスマートコントラクト、ERC20 / ERC721 / ERC1155トークン、DeFi・DEX連携などのブロックチェーン開発にも対応。Ethereum、Solana、Polygon、BNB Chain、Fantomなどの環境での開発経験があり、UnityやFlutterを用いたアプリ開発にも携わっています。',
      'Webサイト制作からフロントエンド、バックエンド、データベース、API、外部サービス連携、AI・ブロックチェーンまで、プロジェクトの目的に合わせて幅広い技術領域をカバーできることが強みです。',
    ],
    en: [
      'I am a full-stack engineer with 12 years of experience developing websites, online stores, and business systems. I have worked on everything from web production and system development to the renewal of existing sites and systems for companies in Japan and overseas.',
      'I support a wide range of website types, including corporate sites, recruiting sites, product launch landing pages, and sites for clinics, salons, law firms, universities, and local businesses. My strength is being able to implement the entire web service end-to-end, including frontend, backend, databases, and API integration—not just the visible interface.',
      'On the frontend, I work with HTML, CSS, and JavaScript, and build web applications with React and Next.js. On the backend, I focus on PHP/Laravel and Python/Django to develop APIs, authentication and authorization, database design, and integration with external services, covering the full system behind the product.',
      'For e-commerce, I handle store setup and customization on Shopify, ecforce, MakeShop, BASE, and STORES, including product, customer, and order management functionality and integrations with external services. I also develop business systems using kintone for customer management, reservations, and accounting.',
      'I also support AI-powered web services using generative AI and AI APIs, as well as blockchain development involving Solidity smart contracts, ERC20 / ERC721 / ERC1155 tokens, and DeFi / DEX integrations. I have experience working in Ethereum, Solana, Polygon, BNB Chain, and Fantom environments, and I have also contributed to app development using Unity and Flutter.',
      'My strength is covering a broad range of technical areas—from website creation and frontend/backend development to databases, APIs, external service integrations, AI, and blockchain—according to each project’s goals.',
    ],
  },
  note: {
    ja: 'ランディングページ1枚からECサイト・業務システムの一括開発まで、フリーランス案件および長期的な協業を承っています。',
    en: 'Available for freelance projects and long-term collaboration, from a single landing page to a complete e-commerce or business system.',
  },
  stats: [
    { value: '12+', label: { ja: '経験年数', en: 'Years Exp.' } },
    { value: `${projects.length}`, label: { ja: '公開プロジェクト', en: 'Live Projects' } },
    { value: '10+', label: { ja: '対応プラットフォーム', en: 'Platforms' } },
    { value: 'Web / EC / Web3', label: { ja: '専門領域', en: 'Focus' } },
  ],
};

export const proficiencyLegend = [
  { label: { ja: '初級', en: 'Novice' }, filled: 1 },
  { label: { ja: '基礎', en: 'Basic' }, filled: 2 },
  { label: { ja: '実務', en: 'Competent' }, filled: 3 },
  { label: { ja: '上級', en: 'Advanced' }, filled: 4 },
  { label: { ja: '熟練', en: 'Mastery' }, filled: 5 },
];

/** Self-assessed levels — adjust these to match your own view of your skills. */
export const technologies = [
  {
    title: { ja: 'Web制作・CMS', en: 'Web Development & CMS' },
    accent: 'cyan',
    icon: 'component',
    proficiency: 95,
    summary: {
      ja: 'WordPress、Craft CMS、Wix、STUDIOを使った企業サイト・採用サイト・ランディングページの制作。デザインに応じてフルスクラッチでも対応します。',
      en: 'Corporate sites, recruiting sites, and landing pages built on WordPress, Craft CMS, Wix, and STUDIO, or hand-coded where the design demands it.',
    },
    skills: [
      { name: 'HTML / CSS / JS', level: 5, icon: 'code' },
      { name: 'WordPress', level: 5, icon: 'layers' },
      { name: 'Craft CMS', level: 4, icon: 'layers' },
      { name: 'Wix / STUDIO', level: 5, icon: 'component' },
      { name: 'React / Next.js', level: 4, icon: 'component' },
      { name: { ja: 'ランディングページ', en: 'Landing Pages' }, level: 5, icon: 'sparkles' },
    ],
  },
  {
    title: { ja: 'バックエンド・業務システム', en: 'Backend & Systems' },
    accent: 'orange',
    icon: 'server',
    proficiency: 90,
    summary: {
      ja: 'PHPとPythonによるサーバーサイドアプリケーションと社内システムの開発 — 顧客管理、予約、会計など。',
      en: 'Server-side applications and internal systems — customer management, reservations, and accounting — in PHP and Python.',
    },
    skills: [
      { name: 'PHP / Laravel', level: 5, icon: 'code' },
      { name: 'Python', level: 5, icon: 'terminal' },
      { name: 'Django', level: 4, icon: 'server' },
      { name: 'MySQL / PostgreSQL', level: 4, icon: 'database' },
      { name: { ja: 'REST API', en: 'REST APIs' }, level: 5, icon: 'network' },
      { name: { ja: 'CRMシステム', en: 'CRM Systems' }, level: 4, icon: 'users' },
    ],
  },
  {
    title: { ja: 'ECプラットフォーム', en: 'E-commerce Platforms' },
    accent: 'green',
    icon: 'layers',
    proficiency: 92,
    summary: {
      ja: '食品・美容・ライフスタイル・小売ブランドのオンラインストア — 国内主要ECプラットフォームでのテーマ開発、カスタマイズ、運用。',
      en: 'Online stores for food, beauty, lifestyle, and retail brands — theme development, customisation, and operations on Japan’s major EC platforms.',
    },
    skills: [
      { name: 'Shopify', level: 5, icon: 'layers' },
      { name: 'ecforce', level: 4, icon: 'layers' },
      { name: 'MakeShop', level: 5, icon: 'layers' },
      { name: 'BASE', level: 5, icon: 'layers' },
      { name: 'STORES', level: 4, icon: 'layers' },
      { name: { ja: '決済', en: 'Payments' }, level: 4, icon: 'shield' },
    ],
  },
  {
    title: { ja: '業務アプリ・自動化', en: 'Business Apps & Automation' },
    accent: 'indigo',
    icon: 'workflow',
    proficiency: 85,
    summary: {
      ja: '既存の業務フローに合わせた業務アプリケーション — kintoneアプリ、予約・申込フロー、チームが使っているツール同士の連携。',
      en: 'Business applications that fit existing workflows: kintone apps, reservation and booking flows, and integrations between the tools a team already uses.',
    },
    skills: [
      { name: 'kintone', level: 4, icon: 'workflow' },
      { name: { ja: '予約システム', en: 'Reservation Systems' }, level: 4, icon: 'gauge' },
      { name: { ja: '会計システム', en: 'Accounting Systems' }, level: 4, icon: 'database' },
      { name: { ja: 'サロン向けシステム', en: 'Salon Systems' }, level: 4, icon: 'users' },
      { name: { ja: 'API連携', en: 'API Integrations' }, level: 5, icon: 'network' },
      { name: { ja: 'データ移行', en: 'Data Migration' }, level: 4, icon: 'database' },
    ],
  },
  {
    title: 'Blockchain / Web3',
    accent: 'purple',
    icon: 'cpu',
    proficiency: 88,
    summary: {
      ja: 'スマートコントラクトとdApps — トークン規格、DeFi・DEX連携、ウォレットとコントラクトをつなぐWebフロントエンド。',
      en: 'Smart contracts and dApps: token standards, DeFi and DEX integrations, and the web front ends that connect wallets to contracts.',
    },
    skills: [
      { name: 'Solidity', level: 5, icon: 'code' },
      { name: 'ERC20 / 721 / 1155', level: 5, icon: 'layers' },
      { name: 'Hardhat / Truffle', level: 4, icon: 'terminal' },
      { name: 'Web3.js / Ethers.js', level: 5, icon: 'network' },
      { name: 'DeFi / DEX / Uniswap', level: 4, icon: 'workflow' },
      { name: 'EVM Chains / Solana', level: 4, icon: 'cpu' },
    ],
  },
  {
    title: { ja: 'アプリ・ゲーム', en: 'Apps & Games' },
    accent: 'rose',
    icon: 'smartphone',
    proficiency: 80,
    summary: {
      ja: 'Flutterによるクロスプラットフォームのモバイルアプリと、Unityによるゲーム開発。プロトタイプからストア公開まで。',
      en: 'Cross-platform mobile apps with Flutter and game development with Unity, from prototype to store release.',
    },
    skills: [
      { name: 'Flutter', level: 4, icon: 'smartphone' },
      { name: 'Dart', level: 4, icon: 'code' },
      { name: 'Unity', level: 4, icon: 'sparkles' },
      { name: 'C#', level: 4, icon: 'code' },
      { name: 'iOS / Android', level: 4, icon: 'smartphone' },
      { name: { ja: 'WebGLビルド', en: 'WebGL Builds' }, level: 3, icon: 'cpu' },
    ],
  },
];

/** Cards shown per filter before "Show More". */
export const projectsVisible = 9;

/** Filter chips, in display order. `key` matches `cat` on each project. */
export const projectCategories = [
  { key: 'corporate', label: { ja: '企業・ビジネス', en: 'Corporate & Business' } },
  { key: 'ecommerce', label: { ja: 'EC・通販', en: 'E-commerce' } },
  { key: 'lp', label: { ja: 'ランディングページ', en: 'Landing Pages' } },
  { key: 'systems', label: { ja: 'Webアプリ・システム', en: 'Web Apps & Systems' } },
  { key: 'cms', label: { ja: 'CMS・ノーコード', en: 'CMS & No-code' } },
  { key: 'web3', label: 'Blockchain / Web3' },
  { key: 'apps', label: { ja: 'アプリ・ゲーム', en: 'Apps & Games' } },
];

export const contact = {
  heading: { ja: 'プロジェクトのご相談はこちらから。', en: "Have a project in mind? Let's talk." },
  /**
   * Where the form posts.
   *   'formsubmit' → https://formsubmit.co/ajax/<your email>, no backend needed.
   *   'custom'     → set endpoint to your own JSON POST handler.
   *   'none'       → no network call; the form falls back to a mailto: link.
   */
  mode: 'none',
  endpoint: '',
  subject: { ja: 'ポートフォリオサイトからのお問い合わせ', en: 'New portfolio contact message' },
  successTitle: { ja: '送信しました！', en: 'Message Sent!' },
  successBody: {
    ja: 'お問い合わせありがとうございます。できるだけ早くご返信いたします。',
    en: "Thank you for reaching out. I'll get back to you as soon as possible.",
  },
};

export const footer = {
  tagline: { ja: 'フルスタックエンジニア', en: 'Full Stack Engineer.' },
};
