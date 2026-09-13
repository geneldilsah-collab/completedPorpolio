/**
 * Hero particle field.
 *
 * 12k points start as a sphere, then morph into the letterforms of
 * `profile.particleWord`. The cloud reacts to the cursor (local repulsion),
 * emits a shockwave ring on click, and drifts back / fades out on scroll.
 */

import * as THREE from 'three';

const COUNT = 12000;
const SPHERE_RADIUS = 12;
// On a light ground the cloud is drawn as dark ink rather than glowing dust:
// additive blending only ever brightens, so it is invisible here, and bloom
// would wash out the near-white background. Normal blending instead.
const BASE_COLOR = new THREE.Color('#13314f');
const HOT_COLOR = new THREE.Color('#0284c7'); // particles under the cursor

/** Evenly distributed points on a sphere (Fibonacci spiral). */
function sphereCloud(count, radius) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Jitter the radius slightly so the shell has depth rather than
    // reading as a hard surface.
    const r = radius * (0.85 + Math.random() * 0.15);
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    out[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    out[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    out[i * 3 + 2] = r * Math.cos(phi);
  }
  return out;
}

/**
 * Rasterise `text` to an offscreen canvas and sample opaque pixels,
 * producing `count` 3D target positions in world units.
 */
function textCloud(text, count, fontSize = 150, targetWidth = 22) {
  const canvas = document.createElement('canvas');
  const probe = canvas.getContext('2d');
  const font = `900 ${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
  probe.font = font;

  const width = Math.max(64, Math.ceil(probe.measureText(text).width) + 60);
  const height = Math.ceil(fontSize * 1.5);
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, width / 2, height / 2);

  const { data } = ctx.getImageData(0, 0, width, height);
  const hits = [];
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if (data[(y * width + x) * 4 + 3] > 128) hits.push(x, y);
    }
  }

  const out = new Float32Array(count * 3);
  if (hits.length === 0) return out; // font never loaded — degrade quietly

  const scale = targetWidth / width;
  const total = hits.length / 2;
  for (let i = 0; i < count; i++) {
    const p = (Math.random() * total) | 0;
    // Jitter within the sampling cell so the cloud reads as scattered dust
    // rather than the 2px lattice it was sampled from.
    out[i * 3] = (hits[p * 2] + Math.random() * 2 - width / 2) * scale;
    out[i * 3 + 1] = -(hits[p * 2 + 1] + Math.random() * 2 - height / 2) * scale;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
  }
  return out;
}

export function initHero({ word = 'DEV', container }) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Probe first: constructing a renderer without WebGL makes three.js log errors.
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) {
    return { start() {}, setTone() {}, supported: false };
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return { start() {}, setTone() {}, supported: false };
  }
  if (!renderer.getContext()) return { start() {}, setTone() {}, supported: false };

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Transparent clear so the topographic background canvas shows through.
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 35);

  const spherePos = sphereCloud(COUNT, SPHERE_RADIUS);
  let textPos = textCloud(word, COUNT);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(spherePos), 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(COUNT * 3).fill(1), 3));

  const material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    sizeAttenuation: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.position.y = 1.5;
  scene.add(points);

  const BASE_SIZE = 0.15; // dark-on-light needs more mass than glowing dust did
  const CLOUD_WIDTH = 24; // widest the cloud gets (text target width + margin)

  /**
   * Scale the cloud so it always fits the viewport rather than guessing from a
   * breakpoint — a narrow phone and a wide desktop both frame the word properly.
   * Point size tracks the scale so particle density stays visually constant.
   */
  function fitToViewport() {
    const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const visibleWidth = visibleHeight * camera.aspect;
    const scale = Math.min(1, (visibleWidth * 0.86) / CLOUD_WIDTH);
    points.scale.setScalar(scale);
    material.size = Math.max(0.05, BASE_SIZE * scale);
  }
  fitToViewport();

  /* ---------------- interaction state ---------------- */

  const morph = { progress: 0 };
  const shock = { value: 0 }; // 1 → 0 after a click
  const offsets = new Float32Array(COUNT * 3); // smoothed per-particle displacement
  const pointer = new THREE.Vector2(0, 0);
  let pointerActive = false;
  const cursorWorld = new THREE.Vector3(1e4, 1e4, 1e4);
  const raycastNear = new THREE.Vector3();
  const raycastDir = new THREE.Vector3();

  function onPointerMove(e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    pointerActive = true;
  }

  function onClick() {
    if (reduced) return;
    shock.value = 1;
    window.gsap?.fromTo(shock, { value: 1 }, { value: 0, duration: 1.5, ease: 'power2.out' });
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('click', onClick);

  /* ---------------- resize ---------------- */

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    fitToViewport();
  }
  window.addEventListener('resize', onResize);
  // Emulated viewport changes and mobile browser-chrome collapse don't always
  // fire `resize`, so observe the container directly as well.
  new ResizeObserver(onResize).observe(container);

  /* ---------------- visibility gating ---------------- */

  let inView = true;
  const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: 0 });
  io.observe(container);

  /* ---------------- frame loop ---------------- */

  const clock = new THREE.Clock();
  const posAttr = geometry.attributes.position;
  const colAttr = geometry.attributes.color;

  function frame() {
    requestAnimationFrame(frame);

    // The canvas is fixed behind the hero only; once scrolled past there is
    // nothing to draw, so skip the work entirely.
    if (!inView) return;

    const t = clock.getElapsedTime();
    const p = morph.progress;
    const scrollY = window.scrollY;

    points.position.z += (scrollY * 0.05 - points.position.z) * 0.1;
    material.opacity = Math.max(0, 1 - Math.max(0, scrollY - 200) / 600);
    if (material.opacity <= 0.001) return;

    // Project the cursor onto the plane the points currently sit on.
    if (p > 0.8 && pointerActive) {
      raycastNear.set(pointer.x, pointer.y, 0.5).unproject(camera);
      raycastDir.copy(raycastNear).sub(camera.position).normalize();
      const dist = (points.position.z - camera.position.z) / raycastDir.z;
      cursorWorld.copy(camera.position).add(raycastDir.clone().multiplyScalar(dist));
    }

    if (p < 0.1) points.rotation.y += 0.002;

    const pos = posAttr.array;
    const col = colAttr.array;
    const ringRadius = (1 - shock.value) * 50;

    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;

      // Base position: sphere → text
      const bx = spherePos[ix] + (textPos[ix] - spherePos[ix]) * p;
      const by = spherePos[iy] + (textPos[iy] - spherePos[iy]) * p;
      const bz = spherePos[iz] + (textPos[iz] - spherePos[iz]) * p;

      let dx = 0;
      let dy = 0;
      let dz = 0;
      let heat = 0;

      if (p > 0.8) {
        const ox = bx - cursorWorld.x;
        const oy = by - cursorWorld.y;
        const dist = Math.sqrt(ox * ox + oy * oy);

        // Cursor repulsion
        if (pointerActive && dist < 12) {
          const f = ((12 - dist) / 12) ** 2;
          const a = Math.atan2(oy, ox);
          dx += Math.cos(a) * f * 6;
          dy += Math.sin(a) * f * 6;
          dz += f * 4;
          heat = f;
        }

        // Expanding shockwave ring from the last click
        if (shock.value > 0.01) {
          const band = Math.abs(dist - ringRadius);
          if (band < 5) {
            const f = (1 - band / 5) * shock.value * 10;
            const a = Math.atan2(oy, ox);
            dx += Math.cos(a) * f;
            dy += Math.sin(a) * f;
            dz += f * 0.5;
            heat = Math.max(heat, f * 0.5);
          }
        }
      }

      // Ease displacement so particles settle instead of snapping
      offsets[ix] += (dx - offsets[ix]) * 0.1;
      offsets[iy] += (dy - offsets[iy]) * 0.1;
      offsets[iz] += (dz - offsets[iz]) * 0.1;

      pos[ix] = bx + offsets[ix];
      pos[iy] = by + offsets[iy];
      pos[iz] = bz + offsets[iz];

      // Idle shimmer — gentle once formed, looser while still a sphere
      if (p > 0.8) {
        pos[ix] += Math.sin(t * 0.5 + pos[iy]) * 0.005;
        pos[iz] += Math.cos(t * 0.3 + pos[ix]) * 0.005;
      } else {
        pos[ix] += Math.sin(t + pos[iy]) * 0.02;
      }

      const k = Math.min(1, heat);
      col[ix] = BASE_COLOR.r + (HOT_COLOR.r - BASE_COLOR.r) * k;
      col[iy] = BASE_COLOR.g + (HOT_COLOR.g - BASE_COLOR.g) * k;
      col[iz] = BASE_COLOR.b + (HOT_COLOR.b - BASE_COLOR.b) * k;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    renderer.render(scene, camera);
  }

  requestAnimationFrame(frame);

  return {
    supported: true,
    /** Light ink over dark scenes (galaxy, deep sea); dark ink over light ones. */
    setTone(tone) {
      BASE_COLOR.set(tone === 'dark' ? '#e0f2fe' : '#13314f');
      HOT_COLOR.set(tone === 'dark' ? '#67e8f9' : '#0284c7');
    },
    /** Kick off the sphere → text morph once the loader has cleared. */
    start() {
      // Re-sample now that webfonts are guaranteed loaded.
      if (document.fonts?.status === 'loaded') {
        textPos = textCloud(word, COUNT);
      }
      if (reduced) {
        morph.progress = 1;
        return;
      }
      if (window.gsap) {
        window.gsap.to(morph, { progress: 1, duration: 2.5, ease: 'power3.inOut', delay: 0.5 });
        window.gsap.to(points.rotation, { x: 0, y: 0, z: 0, duration: 2, ease: 'power3.out' });
      } else {
        morph.progress = 1;
      }
    },
  };
}
