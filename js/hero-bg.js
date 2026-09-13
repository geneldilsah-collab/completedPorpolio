/**
 * Hero background — a choice of animated Canvas 2D patterns, including
 * true 3D scenes (perspective camera, depth sorting, fog) rendered on the CPU.
 *
 * Every pattern runs without WebGL, reacts to the cursor (with an autonomous
 * "wander" when the pointer is idle or on touch devices), and answers a click
 * with a ripple. The shared shell handles sizing, the frame-rate cap, pausing
 * when hidden or scrolled away, and thinning the pattern behind the headline.
 *
 * Choose the default with `heroBackground` in config.js; `?bg=<name>` in the
 * URL overrides it, and `?preview` shows an on-page switcher.
 */

/* ------------------------------------------------------------- noise */

const GRAD3 = new Float32Array([
  1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1,
]);

/** 3D simplex noise (Gustavson's algorithm). Returns roughly [-1, 1]. */
function createNoise3D() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  const mod12 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    mod12[i] = perm[i] % 12;
  }
  const F3 = 1 / 3;
  const G3 = 1 / 6;
  const corner = (gi, x, y, z) => {
    let t = 0.6 - x * x - y * y - z * z;
    if (t < 0) return 0;
    t *= t;
    return t * t * (GRAD3[gi] * x + GRAD3[gi + 1] * y + GRAD3[gi + 2] * z);
  };

  return (xin, yin, zin) => {
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const x0 = xin - (i - t);
    const y0 = yin - (j - t);
    const z0 = zin - (k - t);
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 1, 0];
      else if (x0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 0, 1];
      else [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 1, 0, 1];
    } else if (y0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 0, 1, 1];
    else if (x0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 0, 1, 1];
    else [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 1, 1, 0];
    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    return (
      32 *
      (corner(mod12[ii + perm[jj + perm[kk]]] * 3, x0, y0, z0) +
        corner(mod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3, x0 - i1 + G3, y0 - j1 + G3, z0 - k1 + G3) +
        corner(mod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3, x0 - i2 + 2 * G3, y0 - j2 + 2 * G3, z0 - k2 + 2 * G3) +
        corner(mod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3, x0 - 1 + 3 * G3, y0 - 1 + 3 * G3, z0 - 1 + 3 * G3))
    );
  };
}

/* ------------------------------------------------------------ helpers */

const RIPPLE_MS = 2200;

/** Strength (0–1) of every live click ripple's wavefront at a point. */
function rippleAt(S, x, y, width = 60) {
  let total = 0;
  for (const r of S.ripples) {
    const age = (S.now - r.born) / RIPPLE_MS;
    const radius = age * S.maxDim * 0.8;
    const band = (Math.hypot(x - r.x, y - r.y) - radius) / width;
    total += (1 - age) * Math.exp(-band * band);
  }
  return total;
}

/* ---------------------------------------------------------- 3D helpers */

/** Roughly normal sample in about [-1, 1] (sum of three uniforms). */
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

/**
 * Perspective camera orbiting the world origin. Software projection on the CPU,
 * so the 3D scenes run in browsers without WebGL.
 *   project(x, y, z)       world → { x, y, z: camera depth, k: pixels per world unit } | null
 *   unproject(sx, sy, d)   screen point at camera depth d → world [x, y, z]
 */
function camera3D({ distance, yaw, pitch, cx, cy, focal }) {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  return {
    project(x, y, z) {
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;
      const y2 = y * cosP - z1 * sinP;
      const z2 = y * sinP + z1 * cosP + distance;
      if (z2 < 40) return null; // behind or too close to the lens
      const k = focal / z2;
      return { x: cx + x1 * k, y: cy + y2 * k, z: z2, k };
    },
    unproject(sx, sy, depth) {
      const x1 = ((sx - cx) * depth) / focal;
      const y2 = ((sy - cy) * depth) / focal;
      const z2 = depth - distance;
      const y = y2 * cosP + z2 * sinP;
      const z1 = -y2 * sinP + z2 * cosP;
      return [x1 * cosY + z1 * sinY, y, -x1 * sinY + z1 * cosY];
    },
  };
}

const hexCache = new Map();
const hexToRgb = (hex) => {
  if (!hexCache.has(hex)) {
    const n = parseInt(hex.slice(1), 16);
    hexCache.set(hex, [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
  }
  return hexCache.get(hex);
};

/** Blend two hex colours; used for depth fog (distant things take the water's colour). */
function mixColor(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)}, ${Math.round(A[1] + (B[1] - A[1]) * t)}, ${Math.round(A[2] + (B[2] - A[2]) * t)})`;
}

/**
 * Screen-space fish silhouette for a fish at a 3D position heading along a 3D
 * direction. Its projected length foreshortens as it turns toward the camera.
 */
function fishShape(cam, [x, y, z], [dx, dy, dz], len, wag) {
  const m = Math.hypot(dx, dy, dz) || 1;
  const ux = dx / m;
  const uy = dy / m;
  const uz = dz / m;
  const c = cam.project(x, y, z);
  const head = cam.project(x + ux * len, y + uy * len, z + uz * len);
  const tail = cam.project(x - ux * len, y - uy * len, z - uz * len);
  if (!c || !head || !tail) return null;

  const width = len * 0.36 * c.k;
  const L = Math.hypot(head.x - tail.x, head.y - tail.y) / 2;
  const path = new Path2D();
  if (L < width * 0.6) {
    // Swimming straight at or away from the camera: almost all you see is the body.
    path.ellipse(c.x, c.y, width * 0.8, width * 0.8, 0, 0, Math.PI * 2);
    return { path, z: c.z };
  }
  const vx = (head.x - tail.x) / (2 * L);
  const vy = (head.y - tail.y) / (2 * L);
  const nx = -vy;
  const ny = vx;
  const wg = wag * width * 0.5;
  const P = (along, across) => [c.x + vx * along + nx * across, c.y + vy * along + ny * across];

  const nose = P(L, 0);
  const back = P(-L * 0.55, wg * 0.4);
  path.moveTo(...nose);
  path.quadraticCurveTo(...P(0, width), ...back);
  path.quadraticCurveTo(...P(0, -width), ...nose);
  path.moveTo(...back);
  path.lineTo(...P(-L * 1.05, width * 1.05 + wg));
  path.lineTo(...P(-L * 0.8, wg * 0.6));
  path.lineTo(...P(-L * 1.05, -width * 1.05 + wg));
  path.closePath();
  return { path, z: c.z };
}

/* ============================================================ patterns */

const PATTERNS = {
  /* ---------------------------------------------------------- waves */
  waves: {
    label: 'Silk Waves',
    frame(S) {
      const { ctx, w, h, time, follow } = S;
      ctx.clearRect(0, 0, w, h);
      const LINES = 22;
      const STEP = 8;
      ctx.strokeStyle = S.gradient;
      ctx.lineCap = 'round';

      for (let i = 0; i < LINES; i++) {
        const p = i / (LINES - 1);
        const base = h * (0.06 + p * 0.9);
        ctx.globalAlpha = 0.08 + 0.26 * Math.sin(p * Math.PI);
        ctx.lineWidth = i % 5 === 0 ? 1.5 : 1;
        ctx.beginPath();
        for (let x = -STEP; x <= w + STEP; x += STEP) {
          let y =
            base +
            80 * S.noise(x * 0.0014, i * 0.09, time * 0.09) +
            22 * Math.sin(x * 0.0035 + time * 0.8 + i * 0.42);

          // Lines part around the cursor: above it lift, below it sink.
          const dx = x - follow.x;
          const dy = base - follow.y;
          const g = Math.exp(-(dx * dx) / 45000) * Math.exp(-(dy * dy) / 90000);
          y += (dy < 0 ? -1 : 1) * 95 * g;

          y += 34 * rippleAt(S, x, base) * Math.sin(x * 0.04);
          if (x === -STEP) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    },
  },

  /* ----------------------------------------------------------- dots */
  dots: {
    label: 'Ripple Grid',
    frame(S) {
      const { ctx, w, h, time, follow } = S;
      ctx.clearRect(0, 0, w, h);
      const GAP = 24;
      const ALPHAS = [0.2, 0.34, 0.52, 0.72];
      const buckets = ALPHAS.map(() => new Path2D());
      const offX = (w % GAP) / 2;
      const offY = (h % GAP) / 2;

      for (let gy = offY; gy <= h; gy += GAP) {
        for (let gx = offX; gx <= w; gx += GAP) {
          const dx = gx - follow.x;
          const dy = gy - follow.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;

          // Rings travel outward from the cursor like drops on water.
          const wave = Math.sin(d * 0.05 - time * 3) * Math.exp(-d / 460);
          const ambient = S.noise(gx * 0.004, gy * 0.004, time * 0.12);
          const rip = rippleAt(S, gx, gy, 55);

          const v = Math.max(0, 0.45 + 0.42 * wave + 0.22 * ambient + 0.9 * rip);
          const radius = 0.9 + 2.3 * Math.min(v, 1.4);
          const shift = (wave * 3.5 + rip * 6) / d;
          const x = gx + dx * shift;
          const y = gy + dy * shift;

          const b = buckets[Math.min(3, Math.floor(v * 2.6))];
          b.moveTo(x + radius, y);
          b.arc(x, y, radius, 0, Math.PI * 2);
        }
      }

      ctx.fillStyle = S.gradient;
      buckets.forEach((path, i) => {
        ctx.globalAlpha = ALPHAS[i];
        ctx.fill(path);
      });
    },
  },

  /* -------------------------------------------------------- network */
  network: {
    label: 'Constellation',
    resize(S) {
      const count = Math.max(50, Math.min(160, Math.round((S.w * S.h) / 11000)));
      this.nodes = Array.from({ length: count }, () => {
        const a = Math.random() * Math.PI * 2;
        const speed = 10 + Math.random() * 18; // px per second
        return {
          x: Math.random() * S.w,
          y: Math.random() * S.h,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          bvx: Math.cos(a) * speed,
          bvy: Math.sin(a) * speed,
          r: 1.8 + Math.random() * 1.8,
        };
      });
    },
    frame(S) {
      const { ctx, w, h, dt, follow } = S;
      const nodes = this.nodes;
      ctx.clearRect(0, 0, w, h);
      const LINK = 175;
      const REACH = 240;
      const PAD = 40;

      for (const n of nodes) {
        const dx = follow.x - n.x;
        const dy = follow.y - n.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < REACH) {
          // Gentle gravity toward the cursor.
          const f = (1 - d / REACH) * 55;
          n.vx += (dx / d) * f * dt;
          n.vy += (dy / d) * f * dt;
        }
        const rip = rippleAt(S, n.x, n.y, 80);
        if (rip > 0.02) {
          for (const r of S.ripples) {
            const rd = Math.hypot(n.x - r.x, n.y - r.y) || 1;
            n.vx += ((n.x - r.x) / rd) * rip * 260 * dt;
            n.vy += ((n.y - r.y) / rd) * rip * 260 * dt;
          }
        }
        // Ease back to each node's own drift.
        n.vx += (n.bvx - n.vx) * 0.6 * dt;
        n.vy += (n.bvy - n.vy) * 0.6 * dt;
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < -PAD) n.x = w + PAD;
        else if (n.x > w + PAD) n.x = -PAD;
        if (n.y < -PAD) n.y = h + PAD;
        else if (n.y > h + PAD) n.y = -PAD;
      }

      const ALPHAS = [0.14, 0.28, 0.46];
      const links = ALPHAS.map(() => new Path2D());
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const k = 1 - Math.sqrt(d2) / LINK;
            const path = links[Math.min(2, Math.floor(k * 3))];
            path.moveTo(a.x, a.y);
            path.lineTo(b.x, b.y);
          }
        }
        const cd = Math.hypot(a.x - follow.x, a.y - follow.y);
        if (cd < REACH) {
          const path = links[Math.min(2, Math.floor((1 - cd / REACH) * 3))];
          path.moveTo(a.x, a.y);
          path.lineTo(follow.x, follow.y);
        }
      }

      ctx.strokeStyle = S.gradient;
      ctx.lineWidth = 1.1;
      links.forEach((path, i) => {
        ctx.globalAlpha = ALPHAS[i];
        ctx.stroke(path);
      });

      const dotsPath = new Path2D();
      for (const n of nodes) {
        dotsPath.moveTo(n.x + n.r, n.y);
        dotsPath.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      }
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = S.gradient;
      ctx.fill(dotsPath);
    },
  },

  /* ----------------------------------------------------------- flow */
  flow: {
    label: 'Flow Field',
    warmup: 60, // simulate trails up front for the reduced-motion still frame
    resize(S) {
      const count = Math.max(260, Math.min(750, Math.round((S.w * S.h) / 2400)));
      this.particles = Array.from({ length: count }, () => this.spawn(S, {}));
      S.ctx.clearRect(0, 0, S.w, S.h);
    },
    spawn(S, p) {
      p.x = Math.random() * S.w;
      p.y = Math.random() * S.h;
      p.life = 60 + Math.random() * 180;
      return p;
    },
    frame(S) {
      const { ctx, w, h, time, dt, follow } = S;

      // Fade the previous frame instead of clearing it: that leaves the trails.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';

      const path = new Path2D();
      const SPEED = 62 * dt * 2; // px per frame at the capped rate
      for (const p of this.particles) {
        const a = S.noise(p.x * 0.0021, p.y * 0.0021, time * 0.07) * Math.PI * 2.2;
        let vx = Math.cos(a);
        let vy = Math.sin(a);

        // A vortex forms around the cursor.
        const dx = p.x - follow.x;
        const dy = p.y - follow.y;
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.exp(-(d * d) / (2 * 130 * 130));
        vx = vx * (1 - k) + (-dy / d) * k * 1.8;
        vy = vy * (1 - k) + (dx / d) * k * 1.8;

        const rip = rippleAt(S, p.x, p.y, 70);
        if (rip > 0.02) {
          vx += (dx / d) * rip * 3;
          vy += (dy / d) * rip * 3;
        }

        const nx = p.x + vx * SPEED;
        const ny = p.y + vy * SPEED;
        path.moveTo(p.x, p.y);
        path.lineTo(nx, ny);
        p.x = nx;
        p.y = ny;
        p.life -= 1;
        if (p.life < 0 || nx < -10 || nx > w + 10 || ny < -10 || ny > h + 10) this.spawn(S, p);
      }

      ctx.strokeStyle = S.gradient;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      ctx.stroke(path);
    },
  },

  /* ------------------------------------------------------ galaxy (3D) */
  galaxy: {
    label: 'Galaxy 3D',
    scene: {
      tone: 'dark',
      background: 'radial-gradient(120% 95% at 50% 45%, #1e1b4b 0%, #0b1026 45%, #03040c 100%)',
      themeColor: '#05060f',
    },
    fade: 0.3, // the headline sits over the star at the centre — keep it visible
    DIST: 1750,

    resize(S) {
      const R = 1000;
      this.R = R;
      const count = Math.max(1800, Math.min(3200, Math.round((S.w * S.h) / 450)));
      this.stars = Array.from({ length: count }, (_, i) => {
        if (i < count * 0.14) {
          // Central bulge: a squashed sphere of older stars.
          const r = Math.abs(gauss()) * 170;
          const a = Math.random() * Math.PI * 2;
          const b = Math.acos(2 * Math.random() - 1);
          return { r: r * Math.sin(b), theta: a, y: r * Math.cos(b) * 0.6, size: 1 + Math.random() * 1.3, tone: 2 };
        }
        // Disk: three logarithmic spiral arms, thicker toward the centre.
        const r = R * (0.08 + 0.92 * Math.pow(Math.random(), 0.8));
        const arm = ((Math.random() * 3) | 0) * ((Math.PI * 2) / 3);
        return {
          r,
          theta: arm + Math.log(r / (R * 0.08)) / Math.tan(0.28) + gauss() * 0.35,
          y: gauss() * (12 + 60 * (1 - r / R)),
          size: 0.7 + Math.random() * 1.6,
          tone: (Math.random() * 2) | 0,
        };
      });

      this.clouds = Array.from({ length: 70 }, () => {
        const r = R * (0.12 + 0.85 * Math.random());
        const arm = ((Math.random() * 3) | 0) * ((Math.PI * 2) / 3);
        return {
          r,
          theta: arm + Math.log(r / (R * 0.08)) / Math.tan(0.28) + gauss() * 0.2,
          size: 90 + Math.random() * 130,
          color: ['rgba(99, 102, 241, 0.28)', 'rgba(56, 189, 248, 0.2)', 'rgba(236, 72, 153, 0.16)'][(Math.random() * 3) | 0],
        };
      });

      // Distant background stars far beyond the galaxy; they twinkle and barely move.
      this.farStars = Array.from({ length: 280 }, () => ({
        fx: Math.random(),
        fy: Math.random(),
        s: 0.4 + Math.random() * 1.1,
        tw: Math.random() * Math.PI * 2,
      }));

      // Original planets on inclined 3D orbits. Kepler's third law: T ∝ a^1.5.
      const specs = [
        { a: 190, size: 16, incl: 0.1, node: 0.4, colors: ['#e0f2fe', '#0284c7'] },
        { a: 290, size: 22, incl: -0.16, node: 1.9, colors: ['#ede9fe', '#6d28d9'] },
        { a: 410, size: 20, incl: 0.22, node: 3.1, colors: ['#ccfbf1', '#0f766e'], moon: true },
        { a: 560, size: 36, incl: -0.08, node: 5.0, colors: ['#dbeafe', '#1d4ed8'], ring: true },
        { a: 720, size: 26, incl: 0.18, node: 2.4, colors: ['#fce7f3', '#9d174d'] },
        { a: 880, size: 18, incl: -0.24, node: 4.2, colors: ['#e0e7ff', '#4338ca'] },
      ];
      const T0 = 14; // seconds for the innermost orbit
      this.planets = specs.map((p, i) => ({
        ...p,
        omega: (Math.PI * 2) / (T0 * Math.pow(p.a / specs[0].a, 1.5)),
        theta: i * 2.1 + Math.random(),
      }));
    },

    /** A point on a planet's orbit in world space: ellipse plane tilted by incl, turned by node. */
    orbitPoint(p, theta) {
      const ox = p.a * Math.cos(theta);
      const oz = p.a * Math.sin(theta);
      const y = -oz * Math.sin(p.incl);
      const z1 = oz * Math.cos(p.incl);
      return [ox * Math.cos(p.node) - z1 * Math.sin(p.node), y, ox * Math.sin(p.node) + z1 * Math.cos(p.node)];
    },

    frame(S) {
      const { ctx, w, h, dt, time, follow } = S;
      ctx.clearRect(0, 0, w, h);

      // The camera slowly circles the galaxy; the cursor tilts and swings it.
      const cam = camera3D({
        distance: this.DIST,
        yaw: time * 0.035 + (follow.x / w - 0.5) * 0.7,
        pitch: 0.5 + (follow.y / h - 0.5) * 0.35,
        cx: w / 2,
        cy: h * 0.47,
        focal: h * 1.05,
      });
      const near = this.DIST - this.R;
      const depthOf = (zc) => Math.min(1, Math.max(0, (zc - near) / (2 * this.R)));

      // Far starfield: a tiny parallax shift sells the distance.
      const far = new Path2D();
      const shiftX = (follow.x / w - 0.5) * -24;
      const shiftY = (follow.y / h - 0.5) * -14;
      for (const fs of this.farStars) {
        const x = fs.fx * w + shiftX;
        const y = fs.fy * h + shiftY;
        const r = fs.s * (0.75 + 0.25 * Math.sin(time * 1.7 + fs.tw));
        far.moveTo(x + r, y);
        far.arc(x, y, r, 0, Math.PI * 2);
      }
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = '#e2e8f0';
      ctx.fill(far);

      // Nebula clouds along the arms give the disk body between the stars.
      for (const cl of this.clouds) {
        cl.theta -= (55 / (cl.r + 60)) * dt;
        const q = cam.project(cl.r * Math.cos(cl.theta), 0, cl.r * Math.sin(cl.theta));
        if (!q) continue;
        const rad = cl.size * q.k;
        const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, rad);
        g.addColorStop(0, cl.color);
        g.addColorStop(1, 'rgba(129, 140, 248, 0)');
        ctx.globalAlpha = 0.5 * (1 - depthOf(q.z) * 0.6);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(q.x, q.y, rad, rad * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stars with differential rotation: inner orbits are faster, so the arms wind.
      const TONES = ['#e0f2fe', '#c7d2fe', '#fbcfe8'];
      const ALPHAS = [0.95, 0.62, 0.3]; // near → far
      const buckets = TONES.map(() => [new Path2D(), new Path2D(), new Path2D()]);
      for (const st of this.stars) {
        st.theta -= (55 / (st.r + 60)) * dt;
        const p = cam.project(st.r * Math.cos(st.theta), st.y, st.r * Math.sin(st.theta));
        if (!p) continue;
        let { x, y } = p;
        const rip = rippleAt(S, x, y, 80);
        if (rip > 0.02) {
          for (const r of S.ripples) {
            const rd = Math.hypot(x - r.x, y - r.y) || 1;
            x += ((x - r.x) / rd) * rip * 26;
            y += ((y - r.y) / rd) * rip * 26;
          }
        }
        const size = Math.max(0.5, Math.min(3.6, st.size * p.k * 1.9));
        const path = buckets[st.tone][Math.min(2, Math.floor(depthOf(p.z) * 3))];
        path.moveTo(x + size, y);
        path.arc(x, y, size, 0, Math.PI * 2);
      }
      buckets.forEach((bands, t) => {
        ctx.fillStyle = TONES[t];
        bands.forEach((path, b) => {
          ctx.globalAlpha = ALPHAS[b];
          ctx.fill(path);
        });
      });

      // Orbit paths, fading with depth.
      ctx.strokeStyle = '#c7d2fe';
      ctx.lineWidth = 1;
      for (const p of this.planets) {
        let prev = null;
        for (let i = 0; i <= 72; i++) {
          const q = cam.project(...this.orbitPoint(p, (i / 72) * Math.PI * 2));
          if (q && prev) {
            ctx.globalAlpha = 0.24 * (1 - depthOf(q.z) * 0.75);
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
          prev = q;
        }
      }

      // Bodies are depth-sorted so nearer planets pass in front of the star and each other.
      const bodies = [];
      const sun = cam.project(0, 0, 0);
      if (sun) {
        bodies.push({
          z: sun.z,
          draw: () => {
            const r = 70 * sun.k;
            const glow = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, r * 4);
            glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            glow.addColorStop(0.18, 'rgba(186, 230, 253, 0.8)');
            glow.addColorStop(0.45, 'rgba(129, 140, 248, 0.25)');
            glow.addColorStop(1, 'rgba(129, 140, 248, 0)');
            ctx.globalAlpha = 1;
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, r * 4, 0, Math.PI * 2);
            ctx.fill();
          },
        });
      }

      for (const p of this.planets) {
        p.theta += p.omega * dt;
        const pos = this.orbitPoint(p, p.theta);
        const q = cam.project(...pos);
        if (!q) continue;
        const fog = 1 - depthOf(q.z) * 0.45;

        bodies.push({
          z: q.z,
          draw: () => {
            const r = p.size * q.k;

            // Fading trail along the orbit behind the planet.
            ctx.lineCap = 'round';
            ctx.strokeStyle = p.colors[1];
            ctx.lineWidth = Math.max(1, r * 0.7);
            let prev = q;
            for (let k = 1; k <= 10; k++) {
              const t = cam.project(...this.orbitPoint(p, p.theta - 0.035 * k));
              if (!t) break;
              ctx.globalAlpha = 0.28 * (1 - k / 11) * fog;
              ctx.beginPath();
              ctx.moveTo(prev.x, prev.y);
              ctx.lineTo(t.x, t.y);
              ctx.stroke();
              prev = t;
            }

            // Ring in its own tilted plane: the far half is drawn behind the planet.
            const ringHalves = p.ring ? this.ringPaths(cam, pos, p.size * 1.9, q.z) : null;
            if (ringHalves) {
              ctx.strokeStyle = p.colors[1];
              ctx.lineWidth = Math.max(1, 5 * q.k);
              ctx.globalAlpha = 0.45 * fog;
              ctx.stroke(ringHalves.back);
            }

            // Shaded sphere, lit from the star.
            const toSun = sun ? Math.hypot(sun.x - q.x, sun.y - q.y) || 1 : 1;
            const hx = sun ? q.x + ((sun.x - q.x) / toSun) * r * 0.5 : q.x - r * 0.3;
            const hy = sun ? q.y + ((sun.y - q.y) / toSun) * r * 0.5 : q.y - r * 0.3;
            const shade = ctx.createRadialGradient(hx, hy, r * 0.05, q.x, q.y, r * 1.05);
            shade.addColorStop(0, p.colors[0]);
            shade.addColorStop(0.55, p.colors[1]);
            shade.addColorStop(1, '#020617');
            ctx.globalAlpha = fog;
            ctx.fillStyle = shade;
            ctx.beginPath();
            ctx.arc(q.x, q.y, r, 0, Math.PI * 2);
            ctx.fill();

            if (ringHalves) {
              ctx.globalAlpha = 0.6 * fog;
              ctx.stroke(ringHalves.front);
            }
          },
        });

        if (p.moon) {
          const ma = time * 1.6;
          const m = cam.project(pos[0] + Math.cos(ma) * p.size * 2.6, pos[1] + Math.sin(ma) * p.size * 0.8, pos[2] + Math.sin(ma) * p.size * 2.6);
          if (m) {
            bodies.push({
              z: m.z,
              draw: () => {
                ctx.globalAlpha = fog;
                ctx.fillStyle = '#cbd5e1';
                ctx.beginPath();
                ctx.arc(m.x, m.y, Math.max(1.5, 6 * m.k), 0, Math.PI * 2);
                ctx.fill();
              },
            });
          }
        }
      }

      bodies.sort((a, b) => b.z - a.z).forEach((body) => body.draw());
    },

    /** Split a planet's ring into the half behind it and the half in front of it. */
    ringPaths(cam, [px, py, pz], radius, planetZ) {
      const back = new Path2D();
      const front = new Path2D();
      const TILT = 1.15;
      let prev = null;
      for (let i = 0; i <= 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const lx = Math.cos(a) * radius;
        const lz = Math.sin(a) * radius;
        const q = cam.project(px + lx, py + lz * Math.sin(TILT) * 0.5, pz + lz * Math.cos(TILT));
        if (q && prev) {
          const path = (q.z + prev.z) / 2 > planetZ ? back : front;
          path.moveTo(prev.x, prev.y);
          path.lineTo(q.x, q.y);
        }
        prev = q;
      }
      return { back, front };
    },
  },

  /* ---------------------------------------------------- deep sea (3D) */
  ocean: {
    label: 'Deep Sea 3D',
    scene: {
      tone: 'dark',
      background: 'linear-gradient(180deg, #0e7490 0%, #0b4f6c 30%, #083450 62%, #041627 100%)',
      themeColor: '#0b4f6c',
    },
    fade: 0.35,
    DIST: 1400,
    BOX: { x: 950, y: 420, z: 650 }, // swimmable volume (world units); y grows downward

    resize(S) {
      const B = this.BOX;
      const rand = (m) => (Math.random() * 2 - 1) * m;
      const count = Math.max(45, Math.min(90, Math.round((S.w * S.h) / 17000)));
      this.fish = Array.from({ length: count }, () => {
        const a = Math.random() * Math.PI * 2;
        return {
          x: rand(B.x), y: rand(B.y * 0.8), z: rand(B.z),
          vx: Math.cos(a) * 80, vy: rand(10), vz: Math.sin(a) * 80,
          len: 32 + Math.random() * 22,
          tone: (Math.random() * 3) | 0,
          phase: Math.random() * 10,
        };
      });
      // Large fish cruising far back in the haze.
      this.big = Array.from({ length: 3 }, (_, i) => ({
        x: rand(B.x), y: -120 + i * 150, z: 380 + Math.random() * 260,
        dir: Math.random() < 0.5 ? -1 : 1,
        len: 150 + Math.random() * 60,
        speed: 32 + Math.random() * 16,
        phase: Math.random() * 10,
      }));
      this.snow = Array.from({ length: 320 }, () => ({ x: rand(1200), y: rand(520), z: rand(950), s: 0.6 + Math.random() }));
      this.kelp = Array.from({ length: 14 }, () => ({
        x: rand(1100), z: rand(750), height: 260 + Math.random() * 380, phase: Math.random() * 10,
      }));
      this.bubbles = Array.from({ length: 40 }, () => this.newBubble(true));
    },

    newBubble(anywhere) {
      const B = this.BOX;
      return {
        x: (Math.random() * 2 - 1) * B.x,
        y: anywhere ? (Math.random() * 2 - 1) * B.y : B.y + 40,
        z: (Math.random() * 2 - 1) * B.z,
        r: 3 + Math.random() * 7,
        speed: 40 + Math.random() * 70,
        wob: Math.random() * 10,
      };
    },

    frame(S) {
      const { ctx, w, h, dt, time, follow } = S;
      const B = this.BOX;
      ctx.clearRect(0, 0, w, h);

      // Sunlit glow just under the surface; the depth colour itself is the scene background.
      const depthTint = ctx.createLinearGradient(0, 0, 0, h * 0.4);
      depthTint.addColorStop(0, 'rgba(165, 243, 252, 0.22)');
      depthTint.addColorStop(1, 'rgba(165, 243, 252, 0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = depthTint;
      ctx.fillRect(0, 0, w, h);

      // Light shafts from the surface.
      for (let i = 0; i < 6; i++) {
        const bx = w * (0.06 + i * 0.18) + Math.sin(time * 0.15 + i * 1.7) * 60;
        const shimmer = 0.5 + 0.5 * S.noise(i * 3.1, time * 0.25, 0);
        const shaft = ctx.createLinearGradient(0, 0, 0, h * 0.95);
        shaft.addColorStop(0, `rgba(186, 230, 253, ${0.22 * shimmer})`);
        shaft.addColorStop(1, 'rgba(186, 230, 253, 0)');
        ctx.fillStyle = shaft;
        ctx.beginPath();
        ctx.moveTo(bx - 20, 0);
        ctx.lineTo(bx + 20, 0);
        ctx.lineTo(bx + 240, h * 0.95);
        ctx.lineTo(bx + 40, h * 0.95);
        ctx.closePath();
        ctx.fill();
      }

      // Camera drifts gently; the cursor swings it for parallax.
      const cam = camera3D({
        distance: this.DIST,
        yaw: Math.sin(time * 0.05) * 0.14 + (follow.x / w - 0.5) * 0.8,
        pitch: -0.06 + (follow.y / h - 0.5) * 0.32,
        cx: w / 2,
        cy: h * 0.5,
        focal: h * 1.0,
      });
      const near = this.DIST - B.z;
      const fogOf = (zc) => Math.min(1, Math.max(0, (zc - near) / (2 * B.z + 500)));

      // The cursor becomes a predator at the depth of the school's centre.
      const predator = cam.unproject(follow.x, follow.y, this.DIST);
      for (const r of S.ripples) if (!r.world) r.world = cam.unproject(r.x, r.y, this.DIST);

      // ---- simulate the school: 3D boids ----
      const VIEW = 200;
      const SEP = 80;
      for (const f of this.fish) {
        let ax = 0, ay = 0, az = 0, cx = 0, cy = 0, cz = 0, sx = 0, sy = 0, sz = 0, n = 0;
        for (const o of this.fish) {
          if (o === f) continue;
          const dx = o.x - f.x, dy = o.y - f.y, dz = o.z - f.z;
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < VIEW * VIEW) {
            n++;
            ax += o.vx; ay += o.vy; az += o.vz;
            cx += o.x; cy += o.y; cz += o.z;
            if (d2 < SEP * SEP) {
              const d = Math.sqrt(d2) || 1;
              sx -= dx / d; sy -= dy / d; sz -= dz / d;
            }
          }
        }
        let fx = 0, fy = 0, fz = 0;
        if (n) {
          fx = (ax / n - f.vx) * 0.8 + (cx / n - f.x) * 0.35 + sx * 90;
          fy = (ay / n - f.vy) * 0.8 + (cy / n - f.y) * 0.35 + sy * 90;
          fz = (az / n - f.vz) * 0.8 + (cz / n - f.z) * 0.35 + sz * 90;
        }
        const wander = S.noise(f.x * 0.0015, f.z * 0.0015, time * 0.15) * Math.PI * 2;
        fx += Math.cos(wander) * 30;
        fz += Math.sin(wander) * 30;
        fy += S.noise(f.z * 0.002, time * 0.2, 5) * 14;

        let fleeing = false;
        const px = f.x - predator[0], py = f.y - predator[1], pz = f.z - predator[2];
        const pd = Math.hypot(px, py, pz) || 1;
        if (pd < 300) {
          const k = (1 - pd / 300) * 900;
          fx += (px / pd) * k; fy += (py / pd) * k; fz += (pz / pd) * k;
          fleeing = true;
        }
        for (const r of S.ripples) {
          const age = (S.now - r.born) / RIPPLE_MS;
          const rx = f.x - r.world[0], ry = f.y - r.world[1], rz = f.z - r.world[2];
          const rd = Math.hypot(rx, ry, rz) || 1;
          const band = (rd - age * 1500) / 140;
          const k = (1 - age) * Math.exp(-band * band) * 1600;
          if (k > 20) {
            fx += (rx / rd) * k; fy += (ry / rd) * k; fz += (rz / rd) * k;
            fleeing = true;
          }
        }

        // Keep inside the volume with soft walls.
        const wall = (v, m) => (v < -m ? (-m - v) * 4 : v > m ? (m - v) * 4 : 0);
        fx += wall(f.x, B.x); fy += wall(f.y, B.y * 0.85); fz += wall(f.z, B.z);

        f.vx += fx * dt; f.vy += fy * dt; f.vz += fz * dt;
        f.vy *= 0.98; // fish mostly swim level
        const speed = Math.hypot(f.vx, f.vy, f.vz) || 1;
        const clamped = Math.min(fleeing ? 360 : 125, Math.max(50, speed));
        f.vx = (f.vx / speed) * clamped; f.vy = (f.vy / speed) * clamped; f.vz = (f.vz / speed) * clamped;
        f.x += f.vx * dt; f.y += f.vy * dt; f.z += f.vz * dt;
        f.phase += clamped * dt * 0.09;
      }

      for (const b of this.big) {
        b.x += b.dir * b.speed * dt;
        b.phase += dt * 1.8;
        if (b.dir > 0 && b.x > B.x + 500) b.x = -B.x - 500;
        if (b.dir < 0 && b.x < -B.x - 500) b.x = B.x + 500;
      }

      // ---- collect everything with a depth, then paint far → near ----
      const items = [];

      for (const k of this.kelp) {
        const pts = [];
        for (let s = 0; s <= 12; s++) {
          const t = s / 12;
          const sway = Math.sin(time * 0.7 + k.phase + t * 2.4) * t * t * 60;
          const q = cam.project(k.x + sway, B.y + 60 - t * k.height, k.z + Math.cos(time * 0.5 + k.phase) * t * 25);
          if (q) pts.push(q);
        }
        if (pts.length < 2) continue;
        const zMid = pts[(pts.length / 2) | 0].z;
        items.push({
          z: zMid,
          draw: () => {
            const fog = fogOf(zMid);
            ctx.strokeStyle = mixColor('#2dd4bf', '#0b4f6c', fog * 0.85);
            ctx.globalAlpha = 0.6 * (1 - fog * 0.5);
            ctx.lineCap = 'round';
            for (let i = 1; i < pts.length; i++) {
              ctx.lineWidth = Math.max(1.2, 16 * pts[i].k * (1 - (i / pts.length) * 0.7));
              ctx.beginPath();
              ctx.moveTo(pts[i - 1].x, pts[i - 1].y);
              ctx.lineTo(pts[i].x, pts[i].y);
              ctx.stroke();
            }
          },
        });
      }

      for (const b of this.big) {
        const dir = [b.dir, 0, 0];
        const drawn = fishShape(cam, [b.x, b.y + Math.sin(b.phase * 0.5) * 12, b.z], dir, b.len, Math.sin(b.phase));
        if (drawn) {
          items.push({
            z: drawn.z,
            draw: () => {
              ctx.fillStyle = '#01111f';
              ctx.globalAlpha = 0.45 * (1 - fogOf(drawn.z) * 0.5);
              ctx.fill(drawn.path);
            },
          });
        }
      }

      const TONES = ['#e0f2fe', '#a5f3fc', '#c7d2fe'];
      for (const f of this.fish) {
        const drawn = fishShape(cam, [f.x, f.y, f.z], [f.vx, f.vy, f.vz], f.len, Math.sin(f.phase));
        if (!drawn) continue;
        items.push({
          z: drawn.z,
          draw: () => {
            const fog = fogOf(drawn.z);
            ctx.fillStyle = mixColor(TONES[f.tone], '#0b4f6c', fog * 0.8);
            ctx.globalAlpha = 0.9 - fog * 0.55;
            ctx.fill(drawn.path);
          },
        });
      }

      // Marine snow and bubbles: tiny, so batched into far and near layers around the fish.
      const farDust = new Path2D();
      const nearDust = new Path2D();
      for (const p of this.snow) {
        p.y += 7 * dt;
        p.x += S.noise(p.x * 0.002, p.z * 0.002, time * 0.08) * 12 * dt;
        if (p.y > 520) p.y = -520;
        const q = cam.project(p.x, p.y, p.z);
        if (!q) continue;
        const r = Math.max(0.5, p.s * q.k * 1.8);
        const path = q.z > this.DIST ? farDust : nearDust;
        path.moveTo(q.x + r, q.y);
        path.arc(q.x, q.y, r, 0, Math.PI * 2);
      }

      for (const r of S.ripples) {
        if (!r.bubbled) {
          r.bubbled = true;
          for (let i = 0; i < 16; i++) {
            const b = this.newBubble(false);
            b.x = r.world[0] + (Math.random() - 0.5) * 80;
            b.y = r.world[1] + Math.random() * 40;
            b.z = r.world[2] + (Math.random() - 0.5) * 80;
            this.bubbles.push(b);
          }
        }
      }
      const bubblePath = new Path2D();
      for (let i = this.bubbles.length - 1; i >= 0; i--) {
        const b = this.bubbles[i];
        b.y -= b.speed * dt;
        b.x += Math.sin(time * 2 + b.wob) * 14 * dt;
        if (b.y < -B.y - 80) {
          if (this.bubbles.length > 40) this.bubbles.splice(i, 1);
          else Object.assign(b, this.newBubble(false));
          continue;
        }
        const q = cam.project(b.x, b.y, b.z);
        if (!q) continue;
        const r = Math.max(1, b.r * q.k);
        bubblePath.moveTo(q.x + r, q.y);
        bubblePath.arc(q.x, q.y, r, 0, Math.PI * 2);
      }

      ctx.fillStyle = '#e0f2fe';
      ctx.globalAlpha = 0.22;
      ctx.fill(farDust);

      items.sort((a, b) => b.z - a.z).forEach((it) => it.draw());

      ctx.fillStyle = '#e0f2fe';
      ctx.globalAlpha = 0.5;
      ctx.fill(nearDust);
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.1;
      ctx.globalAlpha = 0.55;
      ctx.stroke(bubblePath);
    },
  },

  /* ----------------------------------------------------------- topo */
  topo: {
    label: 'Topographic',
    resize(S) {
      this.CELL = 14;
      this.cols = Math.ceil(S.w / this.CELL) + 1;
      this.rows = Math.ceil(S.h / this.CELL) + 1;
      this.field = new Float32Array(this.cols * this.rows);
    },
    frame(S) {
      const { ctx, w, h, time, follow } = S;
      const { CELL, cols, rows, field } = this;
      const LEVEL_MIN = -1.05;
      const STEP = 0.13;
      const LEVELS = 24;
      // Edges: 0 top, 1 right, 2 bottom, 3 left. Corner bits: TL 8, TR 4, BR 2, BL 1.
      const SEG = [[], [3, 2], [2, 1], [3, 1], [0, 1], [0, 1, 3, 2], [0, 2], [0, 3],
        [0, 3], [0, 2], [0, 3, 1, 2], [0, 1], [3, 1], [1, 2], [3, 2], []];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const px = col * CELL;
          const py = row * CELL;
          const dx = px - follow.x;
          const dy = py - follow.y;
          field[row * cols + col] =
            S.noise(px / 520, py / 520, time * 0.055) +
            1.15 * Math.exp(-(dx * dx + dy * dy) / 44100) +
            0.55 * rippleAt(S, px, py, 70);
        }
      }

      const paths = Array.from({ length: LEVELS }, () => new Path2D());
      const edge = (e, x, y, tl, tr, br, bl, L) =>
        e === 0 ? [x + ((L - tl) / (tr - tl)) * CELL, y]
          : e === 1 ? [x + CELL, y + ((L - tr) / (br - tr)) * CELL]
            : e === 2 ? [x + ((L - bl) / (br - bl)) * CELL, y + CELL]
              : [x, y + ((L - tl) / (bl - tl)) * CELL];

      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols - 1; col++) {
          const x = col * CELL;
          const y = row * CELL;
          const tl = field[row * cols + col];
          const tr = field[row * cols + col + 1];
          const br = field[(row + 1) * cols + col + 1];
          const bl = field[(row + 1) * cols + col];
          const first = Math.max(0, Math.ceil((Math.min(tl, tr, br, bl) - LEVEL_MIN) / STEP));
          const last = Math.min(LEVELS - 1, Math.floor((Math.max(tl, tr, br, bl) - LEVEL_MIN) / STEP));
          for (let li = first; li <= last; li++) {
            const L = LEVEL_MIN + li * STEP;
            const seg = SEG[(tl > L ? 8 : 0) | (tr > L ? 4 : 0) | (br > L ? 2 : 0) | (bl > L ? 1 : 0)];
            for (let s = 0; s < seg.length; s += 2) {
              const [ax, ay] = edge(seg[s], x, y, tl, tr, br, bl, L);
              const [bx, by] = edge(seg[s + 1], x, y, tl, tr, br, bl, L);
              paths[li].moveTo(ax, ay);
              paths[li].lineTo(bx, by);
            }
          }
        }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = S.gradient;
      ctx.lineCap = 'round';
      paths.forEach((path, li) => {
        const index = li % 4 === 0;
        ctx.globalAlpha = index ? 0.3 : 0.13;
        ctx.lineWidth = index ? 1.3 : 0.9;
        ctx.stroke(path);
      });
    },
  },
};

export const backgroundPatterns = Object.entries(PATTERNS).map(([key, p]) => ({ key, label: p.label }));

/* ============================================================== shell */

const FPS = 30;

/**
 * @param {HTMLElement} container
 * @param {string} initial   pattern key
 * @param {{ onScene?: (tone: 'light'|'dark', scene?: object) => void }} [hooks]
 *   onScene fires whenever the active pattern's backdrop changes, so the page can
 *   switch hero text to light colours over dark scenes.
 */
export function initHeroBackground(container, initial = 'waves', { onScene } = {}) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.id = 'hero-bg';
  canvas.setAttribute('aria-hidden', 'true');
  container.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return { setPattern() {}, stop() {} };

  const S = {
    ctx,
    noise: createNoise3D(),
    w: 0,
    h: 0,
    maxDim: 0,
    dpr: 1,
    now: 0,
    time: 0,
    dt: 1 / FPS,
    follow: { x: 0, y: 0 },
    ripples: [],
    gradient: null,
  };
  const target = { x: 0, y: 0 };
  let lastPointer = -Infinity;
  let fade = null;
  let pattern = PATTERNS[initial] ? initial : 'waves';

  function applyScene() {
    const scene = PATTERNS[pattern].scene;
    container.style.background = scene?.background || '';
    onScene?.(scene?.tone || 'light', scene);
  }

  function resize() {
    S.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    S.w = container.clientWidth;
    S.h = container.clientHeight;
    S.maxDim = Math.max(S.w, S.h);
    canvas.width = Math.round(S.w * S.dpr);
    canvas.height = Math.round(S.h * S.dpr);
    canvas.style.width = `${S.w}px`;
    canvas.style.height = `${S.h}px`;
    ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);

    S.gradient = ctx.createLinearGradient(0, 0, S.w, S.h);
    S.gradient.addColorStop(0, '#0284c7');
    S.gradient.addColorStop(0.55, '#2563eb');
    S.gradient.addColorStop(1, '#6d28d9');

    // Thin the pattern behind the headline so the word stays legible.
    const cx = S.w / 2;
    const cy = S.h * 0.46;
    fade = ctx.createRadialGradient(cx, cy, 0, cx, cy, S.maxDim * 0.42);
    fade.addColorStop(0, 'rgba(0,0,0,0.8)');
    fade.addColorStop(0.55, 'rgba(0,0,0,0.35)');
    fade.addColorStop(1, 'rgba(0,0,0,0)');

    PATTERNS[pattern].resize?.(S);
  }

  function step(now) {
    S.dt = Math.min(0.1, S.now ? (now - S.now) / 1000 : 1 / FPS);
    S.now = now;
    S.time = now / 1000;

    if (now - lastPointer > 2500) {
      // Idle or touch-only: the focus point drifts on a slow Lissajous path.
      target.x = S.w * (0.5 + 0.34 * Math.sin(S.time * 0.13));
      target.y = S.h * (0.5 + 0.3 * Math.sin(S.time * 0.21 + 1.3));
    }
    S.follow.x += (target.x - S.follow.x) * 0.07;
    S.follow.y += (target.y - S.follow.y) * 0.07;

    const live = S.ripples.filter((r) => now - r.born < RIPPLE_MS);
    S.ripples.length = 0;
    S.ripples.push(...live);

    ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    PATTERNS[pattern].frame(S);

    // Scenes with something to see behind the headline can soften the fade.
    ctx.globalAlpha = PATTERNS[pattern].fade ?? 1;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, S.w, S.h);
    ctx.globalCompositeOperation = 'source-over';
  }

  function stillFrame() {
    const warm = PATTERNS[pattern].warmup || 1;
    const t0 = performance.now();
    for (let i = 0; i < warm; i++) step(t0 + (i * 1000) / FPS);
  }

  function onPointerMove(e) {
    target.x = e.clientX;
    target.y = e.clientY;
    lastPointer = performance.now();
  }
  function onPointerDown(e) {
    if (reduced || window.scrollY > S.h) return;
    S.ripples.push({ x: e.clientX, y: e.clientY, born: performance.now() });
    if (S.ripples.length > 4) S.ripples.shift();
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });

  const stats = { pattern, frames: 0, totalMs: 0 };
  let raf = 0;
  let last = 0;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (document.hidden || window.scrollY > S.h * 1.1) return;
    if (now - last < 1000 / FPS - 1) return;
    last = now;
    const t0 = performance.now();
    step(now);
    stats.frames++;
    stats.totalMs += performance.now() - t0;
  }

  resize();
  applyScene();
  S.follow.x = target.x = S.w * 0.5;
  S.follow.y = target.y = S.h * 0.5;
  new ResizeObserver(() => {
    resize();
    if (reduced) stillFrame();
  }).observe(container);

  if (reduced) stillFrame();
  else raf = requestAnimationFrame(loop);

  window.__heroBgStats = stats; // performance checks: average ms per drawn frame

  return {
    get pattern() {
      return pattern;
    },
    setPattern(name) {
      if (!PATTERNS[name] || name === pattern) return;
      pattern = name;
      applyScene();
      ctx.clearRect(0, 0, S.w, S.h);
      PATTERNS[pattern].resize?.(S);
      Object.assign(stats, { pattern, frames: 0, totalMs: 0 });
      if (reduced) stillFrame();
    },
    stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
    },
  };
}
