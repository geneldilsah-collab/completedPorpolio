/**
 * Minimal inline SVG icon set (lucide-style geometry, 24x24 grid).
 * Keeps the page dependency-free — no icon font, no runtime fetch.
 */

const PATHS = {
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  github:
    '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  telegram: '<path d="M21.5 4.5 2.5 11.2l5.6 1.9 2 6.4 3-3.6 5 3.7z"/><path d="m8.1 13.1 10-6.3-6.9 8.1"/>',
  discord:
    '<path d="M18.9 5.6A16.5 16.5 0 0 0 14.8 4.3l-.3.6a13 13 0 0 0-5 0l-.3-.6a16.5 16.5 0 0 0-4.1 1.3C2.4 9.3 1.7 12.9 2 16.4a16.6 16.6 0 0 0 5 2.5l.9-1.5a10.8 10.8 0 0 1-1.7-.8l.4-.3a11.8 11.8 0 0 0 10.1 0l.4.3a10.8 10.8 0 0 1-1.7.8l.9 1.5a16.6 16.6 0 0 0 5-2.5c.4-4.1-.6-7.7-2.4-10.8Z"/><ellipse cx="9" cy="13" rx="1.3" ry="1.6"/><ellipse cx="15" cy="13" rx="1.3" ry="1.6"/>',
  linkedin:
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-11h4v1.5A6 6 0 0 1 16 8z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
  whatsapp:
    '<path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20.5l1.8-5.3A8.5 8.5 0 1 1 21 11.5z"/><path d="M8.8 8.4c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.5l.7 1.7c.1.2 0 .4-.1.5l-.4.5c-.1.2-.2.3 0 .6a6.4 6.4 0 0 0 2.9 2.5c.3.1.4 0 .6-.1l.6-.7c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.4a2 2 0 0 1-1.4 1.8c-.6.2-1.4.2-4-1.2a9 9 0 0 1-3.4-3.6c-.4-1-.4-1.9-.1-2.5z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/><path d="M2 12h20"/>',
  externalLink: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',

  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronUp: '<path d="m18 15-6-6-6 6"/>',
  arrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  messageSquare: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',

  sparkles:
    '<path d="m12 3-1.9 5.8L4 10.5l6.1 1.7L12 18l1.9-5.8L20 10.5l-6.1-1.7z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
  bot: '<rect width="18" height="12" x="3" y="8" rx="2"/><path d="M12 2v6"/><path d="M8 14h.01"/><path d="M16 14h.01"/><path d="M2 14h1"/><path d="M21 14h1"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
  cpu: '<rect width="12" height="12" x="6" y="6" rx="2"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 2v2"/><path d="M15 2v2"/><path d="M9 20v2"/><path d="M15 20v2"/><path d="M2 9h2"/><path d="M2 15h2"/><path d="M20 9h2"/><path d="M20 15h2"/>',
  network:
    '<rect width="6" height="6" x="16" y="16" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><rect width="6" height="6" x="9" y="2" rx="1"/><path d="M5 16v-3h14v3"/><path d="M12 12V8"/>',
  layers:
    '<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  server:
    '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
  workflow:
    '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1 1 0 0 1 1.5 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  component:
    '<path d="M15.5 9.5 12 6l-3.5 3.5L12 13z"/><path d="M18.5 15.5 15 12l3.5-3.5L22 12z"/><path d="M5.5 15.5 2 12l3.5-3.5L9 12z"/><path d="M15.5 18.5 12 15l-3.5 3.5L12 22z"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
};

/**
 * @param {string} name key from PATHS
 * @param {{size?:number, className?:string, strokeWidth?:number}} opts
 */
export function icon(name, opts = {}) {
  const body = PATHS[name] ?? PATHS.globe;
  const size = opts.size ?? 20;
  const cls = opts.className ? ` class="${opts.className}"` : '';
  const sw = opts.strokeWidth ?? 1.8;
  return (
    `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
    `stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" ` +
    `stroke-linejoin="round" aria-hidden="true">${body}</svg>`
  );
}

export const hasIcon = (name) => Object.prototype.hasOwnProperty.call(PATHS, name);
