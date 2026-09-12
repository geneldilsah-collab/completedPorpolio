import { profile, nav as navItems, contact as contactCfg } from './config.js';
import { icon } from './icons.js';
import { renderSections } from './sections.js';
import { initHero } from './hero.js';

const gsap = window.gsap;
if (gsap && window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ================================================================== Head */

function applyProfile() {
  document.title = `${profile.name} | ${profile.title}`;
  $('#nav-name').textContent = profile.name;
  $('#nav-mark').textContent = (profile.name.match(/\b\w/g) || ['D']).slice(0, 2).join('').toUpperCase();
  $('#loader-word').textContent = profile.particleWord;

  // Social rail (hero, fixed bottom-left)
  $('#social-rail').innerHTML =
    profile.socials
      .map(
        (s) =>
          `<a href="${s.href}" aria-label="${s.label}" ${
            s.href.startsWith('mailto:') ? '' : 'target="_blank" rel="noopener noreferrer"'
          }>${icon(s.icon, { size: 20 })}</a>`
      )
      .join('') + '<div class="rail-line"></div>';
}

/* =================================================================== Nav */

function buildNav() {
  const links = $('#nav-links');
  const drawer = $('#nav-drawer');

  links.innerHTML = navItems
    .map(
      (n, i) =>
        `<a class="nav-link${i === 0 ? ' is-active' : ''}" href="${n.href}" data-nav="${n.name}">${n.name}
         <span class="nav-underline" aria-hidden="true"><i class="haze"></i><i class="edge"></i><i class="core"></i></span></a>`
    )
    .join('');

  drawer.innerHTML = navItems
    .map((n, i) => `<a href="${n.href}" data-nav="${n.name}"${i === 0 ? ' class="is-active"' : ''}>${n.name}</a>`)
    .join('');

  // Only the active pill shows its underline.
  const syncUnderlines = () => {
    $$('.nav-link').forEach((a) => {
      const u = $('.nav-underline', a);
      if (u) u.style.display = a.classList.contains('is-active') ? '' : 'none';
    });
  };
  syncUnderlines();

  function setActive(name) {
    $$('[data-nav]').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === name));
    syncUnderlines();
  }

  function go(e, href, name) {
    e.preventDefault();
    closeDrawer();
    setActive(name);
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

  $$('[data-nav]').forEach((a) => {
    const item = navItems.find((n) => n.name === a.dataset.nav);
    a.addEventListener('click', (e) => go(e, item.href, item.name));
  });

  // Mobile drawer
  const toggle = $('#nav-toggle');
  let open = false;

  function openDrawer() {
    open = true;
    drawer.hidden = false;
    toggle.innerHTML = icon('x', { size: 28 });
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
    if (!open) return;
    open = false;
    toggle.innerHTML = icon('menu', { size: 28 });
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

  toggle.innerHTML = icon('menu', { size: 28 });
  toggle.addEventListener('click', () => (open ? closeDrawer() : openDrawer()));
  window.addEventListener('keydown', (e) => e.key === 'Escape' && closeDrawer());

  // Scroll spy — walk sections bottom-up and take the first one we're past.
  const order = [...navItems].reverse();
  function spy() {
    const probe = window.scrollY + window.innerHeight / 3;
    if (window.scrollY < 100) return setActive(navItems[0].name);
    for (const n of order) {
      const el = document.getElementById(n.href.replace('#', ''));
      if (el && probe >= el.offsetTop) return setActive(n.name);
    }
    setActive(navItems[0].name);
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();
}

/* ============================================================ Hero roles */

function rotateRoles() {
  const el = $('#hero-role');
  const roles = profile.roles;
  const HOLD = 2500;
  const GAP = 700;
  let i = 0;

  el.textContent = roles[0];

  function cycle() {
    el.classList.add('is-in');
    setTimeout(() => {
      if (roles.length < 2) return;
      el.classList.remove('is-in');
      setTimeout(() => {
        i = (i + 1) % roles.length;
        el.textContent = roles[i];
        cycle();
      }, GAP);
    }, HOLD);
  }
  cycle();
}

/* ============================================================== Reveals */

function initReveals() {
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
}

/* ============================================================ Show more */

function initShowMore() {
  const btn = $('#show-more');
  if (!btn) return;
  const label = $('span', btn);
  let expanded = false;

  btn.addEventListener('click', () => {
    expanded = !expanded;
    const extras = $$('[data-extra]');
    extras.forEach((el) => {
      el.hidden = !expanded;
      if (expanded) el.style.opacity = 1;
    });
    if (expanded && gsap && !reduced) {
      gsap.fromTo(extras, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' });
    }
    label.textContent = expanded ? 'Show Less' : 'Show More';
    btn.setAttribute('aria-expanded', String(expanded));
    btn.querySelector('svg')?.replaceWith(
      new DOMParser().parseFromString(icon(expanded ? 'chevronUp' : 'chevronDown', { size: 18 }), 'image/svg+xml')
        .documentElement
    );
    if (!expanded) $('#project').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    window.ScrollTrigger?.refresh();
  });
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
      <h3>${contactCfg.successTitle}</h3>
      <p>${contactCfg.successBody}</p>
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
      const body = `From: ${data.name} <${data.email}>\n\n${data.message}`;
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(
        contactCfg.subject
      )}&body=${encodeURIComponent(body)}`;
      succeed();
      return;
    }

    const endpoint =
      contactCfg.mode === 'formsubmit'
        ? `https://formsubmit.co/ajax/${profile.email}`
        : contactCfg.endpoint;

    if (!endpoint) return fail('Contact form is not configured yet.');

    btn.disabled = true;
    label.textContent = 'Sending...';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...data,
          user_device: navigator.userAgent,
          _subject: contactCfg.subject,
          _captcha: 'false',
          _template: 'table',
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && (contactCfg.mode !== 'formsubmit' || json?.success)) return succeed();
      fail(typeof json?.message === 'string' ? json.message : 'Failed to send message. Please try again.');
    } catch {
      fail('Network error. Please try again.');
    } finally {
      btn.disabled = false;
      label.textContent = 'Submit';
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

/* ================================================================= Boot */

async function boot() {
  applyProfile();
  renderSections($('#sections'));
  buildNav();
  initShowMore();
  initLightbox();
  initContactForm();
  initBackToTop();
  initReveals();

  const hero = initHero({ word: profile.particleWord, container: $('#hero-canvas') });

  if (!hero.supported) {
    // No WebGL — show a plain typographic hero instead of an empty void.
    $('#hero-canvas').innerHTML =
      `<div style="position:absolute;inset:0;display:grid;place-content:center">
         <h1 style="font-size:clamp(3rem,16vw,10rem);font-weight:900;letter-spacing:-.05em;margin:0;
                    background:linear-gradient(90deg,#0284c7,#13314f);-webkit-background-clip:text;
                    background-clip:text;color:transparent">${profile.particleWord}</h1>
       </div>`;
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
