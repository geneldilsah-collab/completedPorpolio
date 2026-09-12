/**
 * Renders every below-the-fold section from the config data.
 * Plain string templating — no framework, no build step.
 */

import { about, profile, proficiencyLegend, technologies, projects, projectsVisible, contact, footer } from './config.js';
import { icon } from './icons.js';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Deterministic gradient placeholder so cards look intentional without real art. */
function placeholder(name) {
  const hues = [198, 262, 160, 40, 350, 220];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const a = hues[h % hues.length];
  const b = hues[(h >> 3) % hues.length];
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${a} 70% 18%)"/>
<stop offset="1" stop-color="hsl(${b} 65% 9%)"/>
</linearGradient>
<pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse">
<path d="M40 0H0v40" fill="none" stroke="hsl(${a} 70% 60%)" stroke-opacity=".12"/>
</pattern>
</defs>
<rect width="800" height="500" fill="url(#g)"/>
<rect width="800" height="500" fill="url(#p)"/>
<circle cx="640" cy="120" r="150" fill="hsl(${a} 80% 55%)" fill-opacity=".14"/>
<text x="400" y="250" font-family="Inter,system-ui,sans-serif" font-size="130" font-weight="800"
 fill="hsl(${a} 60% 78%)" fill-opacity=".5" text-anchor="middle" dominant-baseline="central">${esc(initials)}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function monogram(name) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="800" viewBox="0 0 640 800">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#0b2237"/><stop offset="1" stop-color="#060d1a"/></linearGradient></defs>
<rect width="640" height="800" fill="url(#g)"/>
<circle cx="320" cy="330" r="190" fill="#38bdf8" fill-opacity=".10"/>
<text x="320" y="340" font-family="Inter,system-ui,sans-serif" font-size="200" font-weight="800"
 fill="#7dd3fc" fill-opacity=".55" text-anchor="middle" dominant-baseline="central">${esc(initials)}</text>
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
  const photo = profile.photo || monogram(profile.name);
  return `
<section class="section" id="about">
  <div class="glow-bg" style="top:-10%;left:-15%"></div>
  <div class="shell">
    <div class="about-grid">
      <div class="about-media reveal">
        <div class="photo-frame">
          <img src="${esc(photo)}" alt="${esc(profile.name)}" loading="lazy" decoding="async">
          <div class="photo-caption">
            ${icon('sparkles', { size: 16 })}
            <span>${esc(profile.title)}</span>
          </div>
        </div>
      </div>
      <div class="about-copy reveal">
        <h2>About <span class="accent">Me.</span></h2>
        <div class="about-text">
          ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
        </div>
      </div>
    </div>

    <div class="about-meta reveal">
      <div class="team-note">
        ${icon('users', { size: 20 })}
        <p>${esc(about.note)}</p>
      </div>
      <div class="stats-grid">
        ${about.stats
          .map((s) => `<div><h3>${esc(s.value)}</h3><p>${esc(s.label)}</p></div>`)
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
      <p class="eyebrow"><span class="eyebrow-dot"></span>Tech stack</p>
      <h2 class="section-title">My <span class="grad">Technologies</span></h2>
      <p class="section-lead">My core stack across AI, full-stack development, infrastructure, data, and security.</p>
      <div class="legend" role="list" aria-label="Proficiency legend">
        ${proficiencyLegend
          .map(
            (l) =>
              `<div class="legend-item" role="listitem"><span>${esc(l.label)}</span>${dots(l.filled)}</div>`
          )
          .join('')}
      </div>
    </div>

    <div class="tech-grid">
      ${technologies
        .map(
          (t) => `
      <article class="tech-card reveal" data-accent="${esc(t.accent)}">
        <div class="tech-card-head">
          <div class="tech-icon">${icon(t.icon, { size: 22, strokeWidth: 1.75 })}</div>
          <h3>${esc(t.title)}</h3>
        </div>
        <div>
          <div class="prof-meta"><span>Proficiency</span><span class="prof-pct">${t.proficiency}%</span></div>
          <div class="prof-track"><div class="prof-fill" data-width="${t.proficiency}"></div></div>
        </div>
        <div class="skill-grid">
          ${t.skills
            .map(
              (s) => `
          <div class="skill-cell">
            <div class="skill-cell-top">
              ${icon(s.icon, { size: 14, strokeWidth: 2 })}
              <span class="skill-name" title="${esc(s.name)}">${esc(s.name)}</span>
            </div>
            ${dots(s.level)}
          </div>`
            )
            .join('')}
        </div>
        <p class="tech-summary">${esc(t.summary)}</p>
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
  const img = p.image || placeholder(p.name);

  const badge =
    kind === 'live'
      ? `<span class="badge badge-live"><span class="live-dot"></span>Live</span>`
      : kind === 'github'
        ? `<span class="badge badge-github" title="Source on GitHub">GitHub</span>`
        : `<span class="badge badge-private" title="Source not publicly shared">Private</span>`;

  const category = p.cat
    ? `<span class="card-cat">${esc(p.cat)}</span>`
    : `<span class="card-cat muted">${kind === 'live' ? 'Product' : kind === 'github' ? 'Open source' : 'Confidential'}</span>`;

  const footerHtml =
    showLive || showSource
      ? `<div class="card-footer"><div class="card-actions">
        ${
          showLive
            ? `<a class="cta-live" href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer"
                 aria-label="Visit ${esc(p.visitShort || p.name)}"><span class="live-dot"></span>${esc(p.visitShort || 'Visit site')}</a>`
            : ''
        }
        ${
          showSource
            ? `<a class="cta-github" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer"
                 aria-label="${esc(p.name)} on GitHub" title="GitHub">${icon('github', { size: 19 })}</a>`
            : ''
        }
      </div></div>`
      : '';

  return `
  <article class="project-card reveal" data-index="${i}" ${i >= projectsVisible ? 'data-extra="1" hidden' : ''}>
    <div class="card-image-wrap">
      ${badge}
      <button class="card-zoom" type="button" data-zoom="${esc(img)}" data-zoom-alt="${esc(p.name)}"
              aria-label="Zoom ${esc(p.name)} image">
        <img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy" decoding="async">
      </button>
      <div class="card-image-overlay" aria-hidden="true"></div>
    </div>
    <div class="card-body">
      <div>${category}<h3 class="card-title">${esc(p.name)}</h3></div>
      <p class="card-desc">${esc(p.desc)}</p>
      <div class="tech-stack" aria-label="Tech stack">
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
  const more = projects.length > projectsVisible;
  return `
<section class="section" id="project">
  <div class="glow-bg" style="top:20%;right:-20%"></div>
  <div class="shell">
    <div class="reveal">
      <p class="eyebrow"><span class="eyebrow-dot"></span>Project</p>
      <h2 class="section-title">Selected <span class="grad">Works</span></h2>
      <p class="section-lead">A curated set of product, infrastructure, and AI projects.</p>
    </div>
    <div class="project-grid">${projects.map(projectCard).join('')}</div>
    ${
      more
        ? `<div class="show-more-wrap">
             <button class="show-more" type="button" id="show-more" aria-expanded="false">
               <span>Show More</span>${icon('chevronDown', { size: 18 })}
             </button>
           </div>`
        : ''
    }
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
        <p class="eyebrow"><span class="eyebrow-dot"></span>Get in touch</p>
        <h2>Let's build <span class="grad">something</span>.</h2>
        <p>Tell me what you are working on and what "done" looks like. I'll reply with an honest read on scope, approach, and timeline.</p>
        <div class="contact-links">
          ${profile.socials
            .map(
              (s) =>
                `<a class="contact-link" href="${esc(s.href)}" ${
                  s.href.startsWith('mailto:') ? '' : 'target="_blank" rel="noopener noreferrer"'
                }>${icon(s.icon, { size: 18 })}<span>${esc(s.label)}</span></a>`
            )
            .join('')}
        </div>
      </div>

      <div class="reveal">
        <form class="glass-card contact-form" id="contact-form" novalidate>
          <div class="form-heading">
            ${icon('messageSquare', { size: 20 })}
            <p>${esc(contact.heading)}</p>
          </div>
          <input type="text" name="_honey" class="honey" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="field">
            <label for="name">Name</label>
            <input class="glass-input" type="text" id="name" name="name" placeholder="John Doe" required>
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input class="glass-input" type="email" id="email" name="email" placeholder="john@example.com" required>
          </div>
          <div class="field">
            <label for="message">Message</label>
            <textarea class="glass-input" id="message" name="message" rows="5"
                      placeholder="Tell me about your project..." required></textarea>
          </div>
          <p class="form-error" id="form-error" hidden></p>
          <button class="submit-btn" type="submit" id="submit-btn">
            <span>Submit</span>${icon('send', { size: 18 })}
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
    <p>&copy; ${year} ${esc(profile.name)}. ${esc(footer.tagline)}</p>
    <div class="footer-socials">
      ${profile.socials
        .map(
          (s) =>
            `<a class="social-btn" href="${esc(s.href)}" aria-label="${esc(s.label)}" ${
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
