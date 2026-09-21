/**
 * Renders every below-the-fold section from the config data.
 * Plain string templating — no framework, no build step.
 *
 * Every text field is passed through `t()` so it may be a { ja, en } object;
 * chrome strings (headings, buttons, labels) come from `ui()`.
 */

import { about, profile, proficiencyLegend, technologies, projects, projectCategories, contact, footer } from './config.js';
import { icon } from './icons.js';
import { t, ui } from './i18n.js';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Escapes, then turns `*text*` into an accent span — for the two-tone section headings. */
const rich = (s, cls) => esc(s).replace(/\*(.+?)\*/g, `<span class="${cls}">$1</span>`);

const initials = (name) =>
  String(name)
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

/** Deterministic gradient placeholder so cards look intentional without real art. */
function placeholder(name) {
  const hues = [198, 262, 160, 40, 350, 220];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  // Both shifts must be unsigned: `h >> 3` on a hash above 2^31 yields a
  // negative number, and JS `%` keeps the sign, so the lookup would miss.
  const a = hues[h % hues.length];
  const b = hues[(h >>> 3) % hues.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${a} 72% 95%)"/>
<stop offset="1" stop-color="hsl(${b} 60% 88%)"/>
</linearGradient>
<pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse">
<path d="M40 0H0v40" fill="none" stroke="hsl(${a} 55% 40%)" stroke-opacity=".13"/>
</pattern>
</defs>
<rect width="800" height="500" fill="url(#g)"/>
<rect width="800" height="500" fill="url(#p)"/>
<circle cx="640" cy="120" r="150" fill="hsl(${a} 70% 50%)" fill-opacity=".13"/>
<text x="400" y="250" font-family="Inter,system-ui,sans-serif" font-size="130" font-weight="800"
 fill="hsl(${a} 55% 38%)" fill-opacity=".42" text-anchor="middle" dominant-baseline="central">${esc(initials(name))}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/** Initials for the nav mark and the About card: `profile.monogram`, or derived from the name. */
export const monogramText = () => profile.monogram || initials(t(profile.name, 'en'));

function monogram() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="800" viewBox="0 0 640 800">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#e8f1fb"/><stop offset="1" stop-color="#fbfdff"/></linearGradient></defs>
<rect width="640" height="800" fill="url(#g)"/>
<circle cx="320" cy="330" r="190" fill="#0ea5e9" fill-opacity=".10"/>
<text x="320" y="340" font-family="Inter,system-ui,sans-serif" font-size="200" font-weight="800"
 fill="#0369a1" fill-opacity=".38" text-anchor="middle" dominant-baseline="central">${esc(monogramText())}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const dots = (level, max = 5) =>
  `<span class="dots" aria-hidden="true">${Array.from(
    { length: max },
    (_, i) => `<i class="${i < level ? 'on' : ''}"></i>`
  ).join('')}</span>`;

/* ------------------------------------------------------------------ About */

function renderAbout() {
  const photo = profile.photo || monogram();
  return `
<section class="section" id="about">
  <div class="glow-bg" style="top:-10%;left:-15%"></div>
  <div class="shell">
    <div class="about-grid">
      <div class="about-media reveal">
        <div class="photo-frame">
          <img src="${esc(photo)}" alt="${esc(t(profile.name))}" loading="lazy" decoding="async">
          <div class="photo-caption">
            ${icon('sparkles', { size: 16 })}
            <span>${esc(t(profile.title))}</span>
          </div>
        </div>
      </div>
      <div class="about-copy reveal">
        <h2>${rich(ui('aboutTitle'), 'accent')}</h2>
        <div class="about-text">
          ${t(about.paragraphs).map((p) => `<p>${esc(p)}</p>`).join('')}
        </div>
      </div>
    </div>

    <div class="about-meta reveal">
      <div class="team-note">
        ${icon('users', { size: 20 })}
        <p>${esc(t(about.note))}</p>
      </div>
      <div class="stats-grid">
        ${about.stats
          .map((s) => `<div><h3>${esc(t(s.value))}</h3><p>${esc(t(s.label))}</p></div>`)
          .join('')}
      </div>
    </div>
  </div>
</section>`;
}

/* ------------------------------------------------------------- Technology */

function renderTechnology() {
  return `
<section class="section" id="technology">
  <div class="shell">
    <div class="reveal">
      <p class="eyebrow"><span class="eyebrow-dot"></span>${esc(ui('techEyebrow'))}</p>
      <h2 class="section-title">${rich(ui('techTitle'), 'grad')}</h2>
      <p class="section-lead">${esc(ui('techLead'))}</p>
      <div class="legend" role="list" aria-label="${esc(ui('legendLabel'))}">
        ${proficiencyLegend
          .map(
            (l) =>
              `<div class="legend-item" role="listitem"><span>${esc(t(l.label))}</span>${dots(l.filled)}</div>`
          )
          .join('')}
      </div>
    </div>

    <div class="tech-grid">
      ${technologies
        .map(
          (tech) => `
      <article class="tech-card reveal" data-accent="${esc(tech.accent)}">
        <div class="tech-card-head">
          <div class="tech-icon">${icon(tech.icon, { size: 22, strokeWidth: 1.75 })}</div>
          <h3>${esc(t(tech.title))}</h3>
        </div>
        <div>
          <div class="prof-meta"><span>${esc(ui('proficiency'))}</span><span class="prof-pct">${tech.proficiency}%</span></div>
          <div class="prof-track"><div class="prof-fill" data-width="${tech.proficiency}"></div></div>
        </div>
        <div class="skill-grid">
          ${tech.skills
            .map(
              (s) => `
          <div class="skill-cell">
            <div class="skill-cell-top">
              ${icon(s.icon, { size: 14, strokeWidth: 2 })}
              <span class="skill-name" title="${esc(t(s.name))}">${esc(t(s.name))}</span>
            </div>
            ${dots(s.level)}
          </div>`
            )
            .join('')}
        </div>
        <p class="tech-summary">${esc(t(tech.summary))}</p>
      </article>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

/* --------------------------------------------------------------- Projects */

const badgeOf = (p) => (p.shareUrl === false ? 'private' : p.liveUrl ? 'live' : 'github');
const hasSource = (p) => {
  const l = (p.link || '').trim();
  return !!l && l !== '#';
};

function projectCard(p, i) {
  const kind = badgeOf(p);
  const showLive = kind === 'live' && !!p.liveUrl;
  const showSource = kind === 'github' && hasSource(p);
  const name = t(p.name);
  // Placeholder art is keyed on the English name so the card looks the same in every language.
  const img = p.image || placeholder(t(p.name, 'en'));

  const badge =
    kind === 'live'
      ? `<span class="badge badge-live"><span class="live-dot"></span>${esc(ui('badgeLive'))}</span>`
      : kind === 'github'
        ? `<span class="badge badge-github" title="${esc(ui('badgeGithubTitle'))}">${esc(ui('badgeGithub'))}</span>`
        : `<span class="badge badge-private" title="${esc(ui('badgePrivateTitle'))}">${esc(ui('badgePrivate'))}</span>`;

  const label = t(p.label) || t(projectCategories.find((c) => c.key === p.cat)?.label);
  const category = label
    ? `<span class="card-cat">${esc(label)}</span>`
    : `<span class="card-cat muted">${esc(
        ui(kind === 'live' ? 'catProduct' : kind === 'github' ? 'catOpenSource' : 'catConfidential')
      )}</span>`;

  const footerHtml =
    showLive || showSource
      ? `<div class="card-footer"><div class="card-actions">
        ${
          showLive
            ? `<a class="cta-live" href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer"
                 aria-label="${esc(ui('visitAria', { name: p.visitShort || name }))}"><span class="live-dot"></span>${esc(
                 p.visitShort || ui('visitSite')
               )}</a>`
            : ''
        }
        ${
          showSource
            ? `<a class="cta-github" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer"
                 aria-label="${esc(ui('githubAria', { name }))}" title="GitHub">${icon('github', { size: 19 })}</a>`
            : ''
        }
      </div></div>`
      : '';

  return `
  <article class="project-card" data-index="${i}" data-cat="${esc(p.cat)}">
    <div class="card-image-wrap">
      ${badge}
      <button class="card-zoom" type="button" data-zoom="${esc(img)}" data-zoom-alt="${esc(name)}"
              aria-label="${esc(ui('zoomAria', { name }))}">
        <img src="${esc(img)}" alt="${esc(name)}" loading="lazy" decoding="async">
      </button>
      <div class="card-image-overlay" aria-hidden="true"></div>
    </div>
    <div class="card-body">
      <div>${category}<h3 class="card-title">${esc(name)}</h3></div>
      <p class="card-desc">${esc(t(p.desc))}</p>
      <div class="tech-stack" aria-label="${esc(ui('techStackAria'))}">
        ${p.tools
          .split(',')
          .map((tool, n) => `<span class="pill" data-accent="${(n % 6) + 1}">${esc(tool.trim())}</span>`)
          .join('')}
      </div>
      ${footerHtml}
    </div>
  </article>`;
}

function renderProjects() {
  // Only offer filters that actually have projects behind them.
  const cats = projectCategories
    .map((c) => ({ ...c, count: projects.filter((p) => p.cat === c.key).length }))
    .filter((c) => c.count > 0);

  return `
<section class="section" id="project">
  <div class="glow-bg" style="top:20%;right:-20%"></div>
  <div class="shell">
    <div class="reveal">
      <p class="eyebrow"><span class="eyebrow-dot"></span>${esc(ui('projectEyebrow'))}</p>
      <h2 class="section-title">${rich(ui('projectTitle'), 'grad')}</h2>
      <p class="section-lead">${esc(ui('projectLead', { n: projects.length }))}</p>
    </div>
    <div class="filter-bar reveal" role="tablist" aria-label="${esc(ui('filterLabel'))}">
      <button class="filter-chip is-active" type="button" role="tab" aria-selected="true" data-filter="all">
        ${esc(ui('all'))} <span class="filter-count">${projects.length}</span>
      </button>
      ${cats
        .map(
          (c) => `<button class="filter-chip" type="button" role="tab" aria-selected="false" data-filter="${esc(c.key)}">
        ${esc(t(c.label))} <span class="filter-count">${c.count}</span></button>`
        )
        .join('')}
    </div>
    <div class="project-grid" id="project-grid">${projects.map(projectCard).join('')}</div>
    <div class="show-more-wrap" id="show-more-wrap">
      <button class="show-more" type="button" id="show-more" aria-expanded="false">
        <span>${esc(ui('showMore', { n: 0 }))}</span>${icon('chevronDown', { size: 18 })}
      </button>
    </div>
  </div>
</section>`;
}

/* ---------------------------------------------------------------- Contact */

function renderContact() {
  return `
<section class="contact-section" id="contact">
  <div class="glow-bg" style="bottom:-20%;left:10%"></div>
  <div class="bg-text-wrap" aria-hidden="true"><h2 class="bg-text">CONTACT</h2></div>
  <div class="shell">
    <div class="contact-layout">
      <div class="contact-aside reveal">
        <p class="eyebrow"><span class="eyebrow-dot"></span>${esc(ui('contactEyebrow'))}</p>
        <h2>${rich(ui('contactTitle'), 'grad')}</h2>
        <p>${esc(ui('contactText'))}</p>
        <div class="contact-links">
          ${profile.socials
            .map(
              (s) =>
                `<a class="contact-link" href="${esc(s.href)}" ${
                  s.href.startsWith('mailto:') ? '' : 'target="_blank" rel="noopener noreferrer"'
                }>${icon(s.icon, { size: 18 })}<span>${esc(t(s.label))}</span></a>`
            )
            .join('')}
        </div>
      </div>

      <div class="reveal">
        <form class="glass-card contact-form" id="contact-form" novalidate>
          <div class="form-heading">
            ${icon('messageSquare', { size: 20 })}
            <p>${esc(t(contact.heading))}</p>
          </div>
          <input type="text" name="_honey" class="honey" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="field">
            <label for="name">${esc(ui('fieldName'))}</label>
            <input class="glass-input" type="text" id="name" name="name" placeholder="${esc(ui('placeholderName'))}" required>
          </div>
          <div class="field">
            <label for="email">${esc(ui('fieldEmail'))}</label>
            <input class="glass-input" type="email" id="email" name="email" placeholder="${esc(ui('placeholderEmail'))}" required>
          </div>
          <div class="field">
            <label for="message">${esc(ui('fieldMessage'))}</label>
            <textarea class="glass-input" id="message" name="message" rows="5"
                      placeholder="${esc(ui('placeholderMessage'))}" required></textarea>
          </div>
          <p class="form-error" id="form-error" hidden></p>
          <button class="submit-btn" type="submit" id="submit-btn">
            <span>${esc(ui('submit'))}</span>${icon('send', { size: 18 })}
          </button>
        </form>
      </div>
    </div>
  </div>
</section>`;
}

/* ----------------------------------------------------------------- Footer */

function renderFooter() {
  const year = new Date().getFullYear();
  return `
<footer class="footer">
  <div class="footer-inner">
    <p>&copy; ${year} ${esc(t(profile.name))}. ${esc(t(footer.tagline))}</p>
    <div class="footer-socials">
      ${profile.socials
        .map(
          (s) =>
            `<a class="social-btn" href="${esc(s.href)}" aria-label="${esc(t(s.label))}" ${
              s.href.startsWith('mailto:') ? '' : 'target="_blank" rel="noopener noreferrer"'
            }>${icon(s.icon, { size: 18 })}</a>`
        )
        .join('')}
    </div>
  </div>
</footer>`;
}

export function renderSections(mount) {
  mount.innerHTML = `<div class="sheet">
    ${renderAbout()}
    ${renderTechnology()}
    ${renderProjects()}
    ${renderContact()}
    ${renderFooter()}
  </div>`;
}

export { placeholder };
