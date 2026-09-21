import { profile, nav as navItems, contact as contactCfg, projectsVisible, heroBackground } from './config.js';
import { icon } from './icons.js';
import { renderSections, monogramText } from './sections.js';
import { initHero } from './hero.js';
import { initHeroBackground, backgroundPatterns } from './hero-bg.js';
import { t, ui, locales, getLocale, setLocale } from './i18n.js';

const gsap = window.gsap;
if (gsap && window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ================================================================== Head */

function applyProfile() {
  const locale = getLocale();
  document.documentElement.lang = locale;
  document.title = `${t(profile.name)} | ${t(profile.title)}`;
  $('meta[name="description"]')?.setAttribute('content', t(profile.description));
  $('#nav-name').textContent = t(profile.name);
  $('#nav-mark').textContent = monogramText();
  $('#loader-word').textContent = profile.particleWord;
  $('#hero-scroll').textContent = ui('scrollHint');
  $('#hero-role').textContent = t(profile.roles)[roleIndex];

  // Social rail (hero, fixed bottom-left)
  $('#social-rail').innerHTML =
    profile.socials
      .map(
        (s) =>
          `<a href="${s.href}" aria-label="${t(s.label)}" ${
            s.href.startsWith('mailto:') ? '' : 'target="_blank" rel="noopener noreferrer"'
          }>${icon(s.icon, { size: 20 })}</a>`
      )
      .join('') + '<div class="rail-line"></div>';
}

/* =================================================================== Nav */

// Nav items are keyed by `href` (stable across languages), not by their label.
let activeNav = navItems[0].href;
let drawerOpen = false;

const syncUnderlines = () => {
  // Only the active pill shows its underline.
  $$('.nav-link').forEach((a) => {
    const u = $('.nav-underline', a);
    if (u) u.style.display = a.classList.contains('is-active') ? '' : 'none';
  });
};

function setActive(href) {
  activeNav = href;
  $$('[data-nav]').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === href));
  syncUnderlines();
}

function go(e, href) {
  e.preventDefault();
  closeDrawer();
  setActive(href);
  const id = href.replace('#', '');
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    history.pushState(null, '', href);
  } else if (href === '#hero') {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    history.pushState(null, '', '/');
  }
}

function openDrawer() {
  const drawer = $('#nav-drawer');
  drawerOpen = true;
  drawer.hidden = false;
  $('#nav-toggle').innerHTML = icon('x', { size: 28 });
  document.body.style.overflow = 'hidden';
  if (gsap) {
    const tl = gsap.timeline();
    tl.to(drawer, { y: '0%', duration: 0.8, ease: 'power3.inOut' });
    tl.fromTo(
      $$('a', drawer),
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' },
      '-=0.4'
    );
  } else {
    drawer.style.transform = 'translateY(0)';
  }
}

function closeDrawer() {
  if (!drawerOpen) return;
  const drawer = $('#nav-drawer');
  drawerOpen = false;
  $('#nav-toggle').innerHTML = icon('menu', { size: 28 });
  document.body.style.overflow = '';
  if (gsap) {
    gsap.to(drawer, {
      y: '-100%',
      duration: 0.8,
      ease: 'power3.inOut',
      onComplete: () => { drawer.hidden = true; },
    });
  } else {
    drawer.style.transform = 'translateY(-100%)';
    drawer.hidden = true;
  }
}

/** (Re)builds the nav links and drawer in the current language. Safe to call again. */
function renderNavLinks() {
  $('#nav-links').innerHTML = navItems
    .map(
      (n) =>
        `<a class="nav-link" href="${n.href}" data-nav="${n.href}">${t(n.label)}
         <span class="nav-underline" aria-hidden="true"><i class="haze"></i><i class="edge"></i><i class="core"></i></span></a>`
    )
    .join('');

  $('#nav-drawer').innerHTML = navItems
    .map((n) => `<a href="${n.href}" data-nav="${n.href}">${t(n.label)}</a>`)
    .join('');

  // Fresh anchors each time, so no listener piles up.
  $$('[data-nav]').forEach((a) => a.addEventListener('click', (e) => go(e, a.dataset.nav)));
  setActive(activeNav);
}

// Scroll spy — walk sections bottom-up and take the first one we're past.
function spy() {
  const probe = window.scrollY + window.innerHeight / 3;
  if (window.scrollY < 100) return setActive(navItems[0].href);
  for (const n of [...navItems].reverse()) {
    const el = document.getElementById(n.href.replace('#', ''));
    if (el && probe >= el.offsetTop) return setActive(n.href);
  }
  setActive(navItems[0].href);
}

/** One-time nav behaviour: drawer toggle, escape key, scroll spy. */
function initNav() {
  const toggle = $('#nav-toggle');
  toggle.innerHTML = icon('menu', { size: 28 });
  toggle.addEventListener('click', () => (drawerOpen ? closeDrawer() : openDrawer()));
  window.addEventListener('keydown', (e) => e.key === 'Escape' && closeDrawer());

  const navEl = $('.nav');
  const syncNavSurface = () => {
    navEl.classList.toggle('is-scrolled', window.scrollY > 40);
    // Fixed elements (social rail) leave the dark hero once the light page scrolls under them.
    document.body.classList.toggle('past-hero', window.scrollY > window.innerHeight * 0.75);
  };
  window.addEventListener('scroll', () => { spy(); syncNavSurface(); }, { passive: true });
  spy();
  syncNavSurface();
}

/* ======================================================= Language toggle */

function initLangToggle() {
  const wrap = $('#lang-toggle');
  wrap.innerHTML = locales
    .map(
      (l) =>
        `<button type="button" data-lang="${l.code}" lang="${l.code}" title="${l.name}" aria-pressed="false">${l.label}</button>`
    )
    .join('');

  const sync = () => {
    wrap.setAttribute('aria-label', ui('language'));
    $$('button', wrap).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === getLocale())));
  };

  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang]');
    if (!btn || !setLocale(btn.dataset.lang)) return;
    renderContent();
    spy();
    sync();
  });
  sync();
}

/* ============================================================ Hero roles */

let roleIndex = 0;

function rotateRoles() {
  const el = $('#hero-role');
  const HOLD = 2500;
  const GAP = 700;
  // Read the roles on every tick so a language switch mid-cycle just works.
  const roles = () => t(profile.roles);

  el.textContent = roles()[roleIndex];

  function cycle() {
    el.classList.add('is-in');
    setTimeout(() => {
      if (roles().length < 2) return;
      el.classList.remove('is-in');
      setTimeout(() => {
        roleIndex = (roleIndex + 1) % roles().length;
        el.textContent = roles()[roleIndex];
        cycle();
      }, GAP);
    }, HOLD);
  }
  cycle();
}

/* ============================================================== Reveals */

function initReveals() {
  // Sections are re-rendered on a language switch; drop triggers bound to the old nodes.
  window.ScrollTrigger?.getAll().forEach((st) => st.kill());

  const els = $$('.reveal');
  if (reduced || !gsap || !window.ScrollTrigger) {
    els.forEach((e) => e.style.opacity = 1);
    $$('.prof-fill').forEach((f) => (f.style.width = `${f.dataset.width}%`));
    return;
  }

  els.forEach((el) => {
    gsap.fromTo(
      el,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      }
    );
  });

  // Proficiency bars fill when their card scrolls in.
  $$('.prof-fill').forEach((fill) => {
    window.ScrollTrigger.create({
      trigger: fill,
      start: 'top 92%',
      once: true,
      onEnter: () => (fill.style.width = `${fill.dataset.width}%`),
    });
  });

  window.ScrollTrigger.refresh();
}

/* ================================================ Project filter + more */

// Kept outside initProjects so a language switch preserves the chosen filter.
const projectState = { filter: 'all', expanded: false };

function initProjects() {
  const grid = $('#project-grid');
  if (!grid) return;
  const cards = $$('.project-card', grid);
  const chips = $$('.filter-chip');
  const wrap = $('#show-more-wrap');
  const btn = $('#show-more');
  const label = $('span', btn);

  function render({ animate = true } = {}) {
    const { filter, expanded } = projectState;
    const matching = cards.filter((c) => filter === 'all' || c.dataset.cat === filter);
    const limit = expanded ? matching.length : projectsVisible;
    const shown = [];

    cards.forEach((c) => {
      const i = matching.indexOf(c);
      const visible = i !== -1 && i < limit;
      if (visible && c.hidden) shown.push(c);
      c.hidden = !visible;
    });

    wrap.hidden = matching.length <= projectsVisible;
    label.textContent = expanded ? ui('showLess') : ui('showMore', { n: matching.length - projectsVisible });
    btn.setAttribute('aria-expanded', String(expanded));
    btn.querySelector('svg')?.replaceWith(
      new DOMParser().parseFromString(icon(expanded ? 'chevronUp' : 'chevronDown', { size: 18 }), 'image/svg+xml')
        .documentElement
    );

    if (animate && gsap && !reduced && shown.length) {
      gsap.fromTo(shown, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'power3.out' });
    }
    window.ScrollTrigger?.refresh();
  }

  const syncChips = () =>
    chips.forEach((c) => {
      const on = c.dataset.filter === projectState.filter;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-selected', String(on));
    });

  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      projectState.filter = chip.dataset.filter;
      projectState.expanded = false;
      syncChips();
      // Every card is re-evaluated, so force the entrance on the whole new set.
      cards.forEach((c) => (c.hidden = true));
      render();
    })
  );

  btn.addEventListener('click', () => {
    projectState.expanded = !projectState.expanded;
    render();
    if (!projectState.expanded) $('#project').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });

  syncChips();
  render({ animate: false });
}

/* ============================================================= Lightbox */

function initLightbox() {
  const box = $('#lightbox');
  const img = $('#lightbox-img');
  $('#lightbox-close').innerHTML = icon('x', { size: 24 });

  function open(src, alt) {
    img.src = src;
    img.alt = alt;
    box.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function close() {
    box.hidden = true;
    img.src = '';
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-zoom]');
    if (trigger) open(trigger.dataset.zoom, trigger.dataset.zoomAlt);
  });
  box.addEventListener('click', close);
  img.addEventListener('click', (e) => e.stopPropagation());
  window.addEventListener('keydown', (e) => e.key === 'Escape' && !box.hidden && close());
}

/* ========================================================= Contact form */

function initContactForm() {
  const form = $('#contact-form');
  const btn = $('#submit-btn');
  const errEl = $('#form-error');
  const label = $('span', btn);

  const fail = (msg) => {
    errEl.textContent = msg;
    errEl.hidden = false;
  };

  function succeed() {
    form.outerHTML = `<div class="glass-card form-success">
      <div class="check">${icon('check', { size: 40, strokeWidth: 2.5 })}</div>
      <h3>${t(contactCfg.successTitle)}</h3>
      <p>${t(contactCfg.successBody)}</p>
    </div>`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.hidden = true;

    if (!form.checkValidity()) return form.reportValidity();
    if (form._honey.value) return; // bot trap

    const data = Object.fromEntries(new FormData(form).entries());
    delete data._honey;

    // No backend configured — hand off to the visitor's mail client.
    if (contactCfg.mode === 'none') {
      const body = `${ui('mailFrom')}: ${data.name} <${data.email}>\n\n${data.message}`;
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(
        t(contactCfg.subject)
      )}&body=${encodeURIComponent(body)}`;
      succeed();
      return;
    }

    const endpoint =
      contactCfg.mode === 'formsubmit'
        ? `https://formsubmit.co/ajax/${profile.email}`
        : contactCfg.endpoint;

    if (!endpoint) return fail(ui('errorNotConfigured'));

    btn.disabled = true;
    label.textContent = ui('sending');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...data,
          user_device: navigator.userAgent,
          _subject: t(contactCfg.subject),
          _captcha: 'false',
          _template: 'table',
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && (contactCfg.mode !== 'formsubmit' || json?.success)) return succeed();
      fail(typeof json?.message === 'string' ? json.message : ui('errorFailed'));
    } catch {
      fail(ui('errorNetwork'));
    } finally {
      btn.disabled = false;
      label.textContent = ui('submit');
    }
  });
}

/* =========================================================== Back to top */

function initBackToTop() {
  const btn = $('#back-to-top');
  btn.innerHTML = icon('arrowUp', { size: 20 });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
  window.addEventListener(
    'scroll',
    () => btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8),
    { passive: true }
  );
}

/* ===================================================== Background picker */

/** `?preview` only: a small switcher for trying each hero background live. */
function initBackgroundPicker(background) {
  const panel = document.createElement('div');
  panel.className = 'bg-picker';
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', 'Hero background');
  panel.innerHTML =
    '<span class="bg-picker-title">Background</span>' +
    backgroundPatterns
      .map((p) => `<button type="button" data-bg="${p.key}">${p.label}</button>`)
      .join('');
  document.body.appendChild(panel);

  const sync = () =>
    $$('button', panel).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.bg === background.pattern)));

  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-bg]');
    if (!btn) return;
    e.stopPropagation();
    background.setPattern(btn.dataset.bg);
    const url = new URL(location.href);
    url.searchParams.set('bg', btn.dataset.bg);
    history.replaceState(null, '', url);
    sync();
  });
  panel.addEventListener('pointerdown', (e) => e.stopPropagation());
  sync();
}

/* ================================================================= Boot */

/** Everything whose text depends on the language. Runs at boot and on every toggle. */
function renderContent() {
  applyProfile();
  renderSections($('#sections'));
  renderNavLinks();
  initProjects();
  initContactForm();
  initReveals();
}

async function boot() {
  renderContent();
  initNav();
  initLangToggle();
  initLightbox();
  initBackToTop();

  const params = new URLSearchParams(location.search);
  let hero = null;
  let heroTone = 'light';
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  // Dark scenes (galaxy, deep sea) switch the hero's text and word to light colours.
  const applySceneTone = (tone, scene) => {
    heroTone = tone;
    document.body.classList.toggle('hero-dark', tone === 'dark');
    themeMeta?.setAttribute('content', scene?.themeColor || '#f6f8fc');
    hero?.setTone(tone);
  };
  const background = initHeroBackground($('#hero-canvas'), params.get('bg') || heroBackground, {
    onScene: applySceneTone,
  });
  if (params.has('preview')) initBackgroundPicker(background);
  hero = initHero({ word: profile.particleWord, container: $('#hero-canvas') });
  hero.setTone(heroTone);

  if (!hero.supported) {
    // No WebGL — show a plain typographic hero instead of an empty void.
    // Append, don't replace: the animated background canvas lives in this container too.
    $('#hero-canvas').insertAdjacentHTML(
      'beforeend',
      `<div class="hero-fallback"><h1 class="hero-fallback-word">${profile.particleWord}</h1></div>`
    );
  }

  // Fonts must be ready before the particle text is sampled.
  await Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((r) => setTimeout(r, 2500)),
  ]);

  // Brief, honest loading beat — then hand over to the morph.
  const fill = $('#loader-fill');
  const pct = $('#loader-pct');
  let p = 0;
  const tick = setInterval(() => {
    p = Math.min(100, p + 8 + Math.random() * 14);
    fill.style.width = `${p}%`;
    pct.textContent = `${Math.round(p)}%`;
    if (p >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        document.body.classList.add('ready');
        hero.start();
        rotateRoles();
        // Honour a deep link once the intro has settled.
        const hash = location.hash.replace('#', '');
        if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, 110);
}

boot();
