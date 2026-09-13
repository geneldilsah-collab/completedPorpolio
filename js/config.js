/**
 * Single source of truth for the site's content.
 * Profile, about, and stack live here; the project list lives in ./projects.js.
 */

import { projects } from './projects.js';

export { projects };

export const profile = {
  name: 'Yukio Amamoto',
  /** Rendered by the particle system in the hero. Short words morph best (3–8 chars). */
  particleWord: 'YUKIO',
  /** Cycled one at a time under the hero. */
  roles: ['Full Stack Engineer', 'E-commerce & CMS Specialist', 'Blockchain Developer'],
  title: 'Full Stack Engineer',
  photo: '', // e.g. './images/me.jpg' — falls back to a generated monogram
  email: 'you@example.com', // TODO: your contact address
  socials: [
    { label: 'Email', icon: 'mail', href: 'mailto:you@example.com' }, // TODO
    { label: 'GitHub', icon: 'github', href: 'https://github.com/your-handle' }, // TODO
    { label: 'LinkedIn', icon: 'linkedin', href: 'https://linkedin.com/in/your-handle' }, // TODO
  ],
};

export const nav = [
  { name: 'Home', href: '#hero' },
  { name: 'About', href: '#about' },
  { name: 'Stack', href: '#technology' },
  { name: 'Project', href: '#project' },
  { name: 'Contact', href: '#contact' },
];

export const about = {
  paragraphs: [
    'I am a full-stack engineer with 12 years of experience delivering websites, online stores, and business systems for companies across Japan and overseas.',
    'My work covers the full range of what a business needs on the web: corporate and recruiting sites, landing pages for product launches, and sites for clinics, salons, law firms, universities, and local shops.',
    'On the commerce side I build and customise stores on Shopify, ecforce, MakeShop, BASE, and STORES. On the systems side I develop customer management, reservation, and accounting tools with PHP, Python, Django, and kintone.',
    'I also develop blockchain products — smart contracts in Solidity, ERC20 / ERC721 / ERC1155 tokens, DeFi and DEX integrations — across Ethereum, Solana, Polygon, BNB Chain, and Fantom, as well as apps with Unity and Flutter.',
  ],
  note: 'Available for freelance projects and long-term collaboration, from a single landing page to a complete e-commerce or business system.',
  stats: [
    { value: '12+', label: 'Years Exp.' },
    { value: `${projects.length}`, label: 'Live Projects' },
    { value: '10+', label: 'Platforms' },
    { value: 'Web / EC / Web3', label: 'Focus' },
  ],
};

export const proficiencyLegend = [
  { label: 'Novice', filled: 1 },
  { label: 'Basic', filled: 2 },
  { label: 'Competent', filled: 3 },
  { label: 'Advanced', filled: 4 },
  { label: 'Mastery', filled: 5 },
];

/** Self-assessed levels — adjust these to match your own view of your skills. */
export const technologies = [
  {
    title: 'Web Development & CMS',
    accent: 'cyan',
    icon: 'component',
    proficiency: 95,
    summary:
      'Corporate sites, recruiting sites, and landing pages built on WordPress, Craft CMS, Wix, and STUDIO, or hand-coded where the design demands it.',
    skills: [
      { name: 'HTML / CSS / JS', level: 5, icon: 'code' },
      { name: 'WordPress', level: 5, icon: 'layers' },
      { name: 'Craft CMS', level: 4, icon: 'layers' },
      { name: 'Wix / STUDIO', level: 5, icon: 'component' },
      { name: 'React / Next.js', level: 4, icon: 'component' },
      { name: 'Landing Pages', level: 5, icon: 'sparkles' },
    ],
  },
  {
    title: 'Backend & Systems',
    accent: 'orange',
    icon: 'server',
    proficiency: 90,
    summary:
      'Server-side applications and internal systems — customer management, reservations, and accounting — in PHP and Python.',
    skills: [
      { name: 'PHP / Laravel', level: 5, icon: 'code' },
      { name: 'Python', level: 5, icon: 'terminal' },
      { name: 'Django', level: 4, icon: 'server' },
      { name: 'MySQL / PostgreSQL', level: 4, icon: 'database' },
      { name: 'REST APIs', level: 5, icon: 'network' },
      { name: 'CRM Systems', level: 4, icon: 'users' },
    ],
  },
  {
    title: 'E-commerce Platforms',
    accent: 'green',
    icon: 'layers',
    proficiency: 92,
    summary:
      'Online stores for food, beauty, lifestyle, and retail brands — theme development, customisation, and operations on Japan’s major EC platforms.',
    skills: [
      { name: 'Shopify', level: 5, icon: 'layers' },
      { name: 'ecforce', level: 4, icon: 'layers' },
      { name: 'MakeShop', level: 5, icon: 'layers' },
      { name: 'BASE', level: 5, icon: 'layers' },
      { name: 'STORES', level: 4, icon: 'layers' },
      { name: 'Payments', level: 4, icon: 'shield' },
    ],
  },
  {
    title: 'Business Apps & Automation',
    accent: 'indigo',
    icon: 'workflow',
    proficiency: 85,
    summary:
      'Business applications that fit existing workflows: kintone apps, reservation and booking flows, and integrations between the tools a team already uses.',
    skills: [
      { name: 'kintone', level: 4, icon: 'workflow' },
      { name: 'Reservation Systems', level: 4, icon: 'gauge' },
      { name: 'Accounting Systems', level: 4, icon: 'database' },
      { name: 'Salon Systems', level: 4, icon: 'users' },
      { name: 'API Integrations', level: 5, icon: 'network' },
      { name: 'Data Migration', level: 4, icon: 'database' },
    ],
  },
  {
    title: 'Blockchain / Web3',
    accent: 'purple',
    icon: 'cpu',
    proficiency: 88,
    summary:
      'Smart contracts and dApps: token standards, DeFi and DEX integrations, and the web front ends that connect wallets to contracts.',
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
    title: 'Apps & Games',
    accent: 'rose',
    icon: 'smartphone',
    proficiency: 80,
    summary:
      'Cross-platform mobile apps with Flutter and game development with Unity, from prototype to store release.',
    skills: [
      { name: 'Flutter', level: 4, icon: 'smartphone' },
      { name: 'Dart', level: 4, icon: 'code' },
      { name: 'Unity', level: 4, icon: 'sparkles' },
      { name: 'C#', level: 4, icon: 'code' },
      { name: 'iOS / Android', level: 4, icon: 'smartphone' },
      { name: 'WebGL Builds', level: 3, icon: 'cpu' },
    ],
  },
];

/** Cards shown per filter before "Show More". */
export const projectsVisible = 9;

/** Filter chips, in display order. `key` matches `cat` on each project. */
export const projectCategories = [
  { key: 'corporate', label: 'Corporate & Business' },
  { key: 'ecommerce', label: 'E-commerce' },
  { key: 'lp', label: 'Landing Pages' },
  { key: 'systems', label: 'Web Apps & Systems' },
  { key: 'cms', label: 'CMS & No-code' },
  { key: 'web3', label: 'Blockchain / Web3' },
  { key: 'apps', label: 'Apps & Games' },
];

export const contact = {
  heading: "Have a project in mind? Let's talk.",
  /**
   * Where the form posts.
   *   'formsubmit' → https://formsubmit.co/ajax/<your email>, no backend needed.
   *   'custom'     → set endpoint to your own JSON POST handler.
   *   'none'       → no network call; the form falls back to a mailto: link.
   */
  mode: 'none',
  endpoint: '',
  subject: 'New portfolio contact message',
  successTitle: 'Message Sent!',
  successBody: "Thank you for reaching out. I'll get back to you as soon as possible.",
};

export const footer = {
  tagline: 'Full Stack Engineer.',
};
