/**
 * Single source of truth for every piece of content on the site.
 * Edit this file to make the portfolio yours — nothing else needs to change.
 */

export const profile = {
  name: 'Your Name',
  /** Rendered by the particle system in the hero. Short words morph best (3–8 chars). */
  particleWord: 'DEV',
  /** Cycled one at a time under the hero. */
  roles: ['AI & Full Stack Engineer', 'Systems Engineer'],
  title: 'AI & Full Stack Engineer',
  photo: '', // e.g. '/images/me.jpg' — falls back to a generated monogram
  email: 'you@example.com',
  socials: [
    { label: 'Email', icon: 'mail', href: 'mailto:you@example.com' },
    { label: 'GitHub', icon: 'github', href: 'https://github.com/your-handle' },
    { label: 'Telegram', icon: 'telegram', href: 'https://t.me/your-handle' },
    { label: 'Discord', icon: 'discord', href: 'https://discord.com/users/000000000' },
    { label: 'LinkedIn', icon: 'linkedin', href: 'https://linkedin.com/in/your-handle' },
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
    'I build production software across the whole stack — AI systems, backend services, and the interfaces that sit on top of them.',
    'My work spans LLM-backed products, retrieval pipelines, and agent architectures, alongside the less glamorous parts that make them hold up: queueing, caching, observability, and API design that survives contact with real traffic.',
    'On the systems side I have shipped high-concurrency backends, data pipelines, protocol and API integrations, and automation infrastructure built to run unattended.',
    'I care about software that is measured rather than assumed — instrumented, load-tested, and simple enough that the next person can change it safely.',
  ],
  note: 'Available for freelance work and collaboration, from early-stage prototypes through to production systems.',
  stats: [
    { value: '7+', label: 'Years Exp.' },
    { value: '20+', label: 'Projects' },
    { value: 'AI / Infra', label: 'Focus' },
    { value: 'Remote', label: 'Working' },
  ],
};

export const proficiencyLegend = [
  { label: 'Novice', filled: 1 },
  { label: 'Basic', filled: 2 },
  { label: 'Competent', filled: 3 },
  { label: 'Advanced', filled: 4 },
  { label: 'Mastery', filled: 5 },
];

export const technologies = [
  {
    title: 'AI / LLM',
    accent: 'purple',
    icon: 'sparkles',
    proficiency: 90,
    summary:
      'Production AI systems — agents, retrieval pipelines, and LLM features wired into real products and APIs.',
    skills: [
      { name: 'Anthropic', level: 5, icon: 'sparkles' },
      { name: 'OpenAI', level: 5, icon: 'bot' },
      { name: 'AI Agents', level: 5, icon: 'bot' },
      { name: 'RAG Systems', level: 4, icon: 'database' },
      { name: 'Evals', level: 4, icon: 'gauge' },
      { name: 'Prompt Engineering', level: 5, icon: 'code' },
    ],
  },
  {
    title: 'Languages & Backend',
    accent: 'orange',
    icon: 'terminal',
    proficiency: 88,
    summary:
      'High-performance backends and services in Python, Go, and Rust — APIs, workers, and scalable system design.',
    skills: [
      { name: 'Python', level: 5, icon: 'code' },
      { name: 'Go', level: 4, icon: 'terminal' },
      { name: 'Rust', level: 4, icon: 'cpu' },
      { name: 'REST / gRPC', level: 5, icon: 'network' },
      { name: 'PostgreSQL', level: 5, icon: 'database' },
      { name: 'Redis / Queues', level: 4, icon: 'layers' },
    ],
  },
  {
    title: 'Frontend & Mobile',
    accent: 'cyan',
    icon: 'component',
    proficiency: 85,
    summary:
      'Modern web and mobile surfaces with React, Next.js, and React Native — fast UIs, SSR, and production-ready products.',
    skills: [
      { name: 'React (Next.js)', level: 5, icon: 'component' },
      { name: 'TypeScript', level: 5, icon: 'code' },
      { name: 'React Native', level: 4, icon: 'smartphone' },
      { name: 'SSR & Routing', level: 4, icon: 'network' },
      { name: 'WebGL / Three.js', level: 4, icon: 'sparkles' },
      { name: 'Design Systems', level: 4, icon: 'layers' },
    ],
  },
  {
    title: 'Infrastructure',
    accent: 'indigo',
    icon: 'server',
    proficiency: 87,
    summary:
      'Deploying and operating services — containers, CI/CD, infrastructure as code, and the monitoring that keeps them honest.',
    skills: [
      { name: 'Docker', level: 5, icon: 'layers' },
      { name: 'Kubernetes', level: 4, icon: 'server' },
      { name: 'Terraform', level: 4, icon: 'workflow' },
      { name: 'CI/CD', level: 5, icon: 'workflow' },
      { name: 'AWS / GCP', level: 4, icon: 'server' },
      { name: 'Observability', level: 4, icon: 'gauge' },
    ],
  },
  {
    title: 'Data & Automation',
    accent: 'green',
    icon: 'workflow',
    proficiency: 86,
    summary:
      'Pipelines and orchestration — ingestion, transformation, scheduled jobs, and end-to-end workflow automation.',
    skills: [
      { name: 'ETL Pipelines', level: 5, icon: 'workflow' },
      { name: 'Airflow', level: 4, icon: 'workflow' },
      { name: 'Web Scraping', level: 5, icon: 'network' },
      { name: 'Pandas / Polars', level: 4, icon: 'database' },
      { name: 'Event Streaming', level: 4, icon: 'layers' },
      { name: 'Scheduling', level: 5, icon: 'gauge' },
    ],
  },
  {
    title: 'Security & Performance',
    accent: 'rose',
    icon: 'shield',
    proficiency: 84,
    summary:
      'Hardening and profiling — authentication, threat modelling, load testing, and low-level performance work.',
    skills: [
      { name: 'Auth / OAuth', level: 5, icon: 'shield' },
      { name: 'Threat Modelling', level: 4, icon: 'shield' },
      { name: 'Load Testing', level: 4, icon: 'gauge' },
      { name: 'Profiling', level: 4, icon: 'cpu' },
      { name: 'Secrets Management', level: 5, icon: 'shield' },
      { name: 'Caching Strategy', level: 5, icon: 'layers' },
    ],
  },
];

/** Cards shown before the "Show More" button reveals the rest. */
export const projectsVisible = 6;

/**
 * Each project renders a card. Badge logic:
 *   shareUrl === false  → "Private"
 *   liveUrl present     → "Live"   (+ visit button)
 *   link present        → "GitHub" (+ source button)
 */
export const projects = [
  {
    name: 'Retrieval Platform',
    cat: 'AI Product',
    desc: 'Document ingestion and hybrid retrieval service backing an LLM assistant — chunking, embeddings, reranking, and citation-accurate answers over private corpora.',
    tools: 'Python, FastAPI, pgvector, Anthropic, React',
    image: '',
    link: '',
    liveUrl: 'https://example.com',
    visitShort: 'Retrieval Platform',
  },
  {
    name: 'Agent Orchestrator',
    cat: 'AI Infrastructure',
    desc: 'Runtime for long-running tool-using agents: durable task state, step-level retries, budget caps, and a live trace viewer for debugging runs after the fact.',
    tools: 'TypeScript, Node.js, Redis, WebSockets',
    image: '',
    link: 'https://github.com/your-handle/agent-orchestrator',
    visitShort: 'Agent Orchestrator',
  },
  {
    name: 'Realtime Analytics Pipeline',
    cat: 'Data Engineering',
    desc: 'Event ingestion pipeline handling sustained high-cardinality traffic, with exactly-once semantics, rollup materialisation, and sub-second dashboard queries.',
    tools: 'Go, Kafka, ClickHouse, Terraform',
    image: '',
    link: 'https://github.com/your-handle/analytics-pipeline',
    visitShort: 'Analytics Pipeline',
  },
  {
    name: 'Trading Telemetry Dashboard',
    cat: 'Full Stack',
    desc: 'Operator dashboard for a distributed fleet — live metrics over SSE, historical drill-down, alert routing, and role-scoped access for external partners.',
    tools: 'Next.js, TypeScript, PostgreSQL, Grafana',
    image: '',
    link: '',
    liveUrl: 'https://example.com',
    visitShort: 'Telemetry Dashboard',
  },
  {
    name: 'Protocol Client',
    cat: 'Systems',
    desc: 'High-throughput client for a binary wire protocol: zero-copy parsing, connection pooling, backpressure handling, and a fuzz-tested decoder.',
    tools: 'Rust, Tokio, Protobuf',
    image: '',
    link: 'https://github.com/your-handle/protocol-client',
    visitShort: 'Protocol Client',
  },
  {
    name: 'Client Automation Suite',
    cat: 'Automation',
    desc: 'Internal automation platform built under contract. Source is not publicly shared due to client confidentiality and ongoing commercial use.',
    tools: 'Python, Playwright, Celery, PostgreSQL',
    image: '',
    link: '#',
    shareUrl: false,
    visitShort: 'Automation Suite',
  },
  {
    name: 'Design System',
    cat: 'Frontend',
    desc: 'Accessible component library with themed tokens, dark mode, and visual regression tests — consumed by four product teams from one versioned package.',
    tools: 'React, TypeScript, Storybook, Vitest',
    image: '',
    link: 'https://github.com/your-handle/design-system',
    visitShort: 'Design System',
  },
  {
    name: 'Edge Cache Layer',
    cat: 'Infrastructure',
    desc: 'Regional read-through cache sitting in front of a write-heavy API, cutting p99 latency substantially while keeping invalidation correct under concurrent writes.',
    tools: 'Go, Redis, Kubernetes, OpenTelemetry',
    image: '',
    link: 'https://github.com/your-handle/edge-cache',
    visitShort: 'Edge Cache',
  },
  {
    name: 'Mobile Companion App',
    cat: 'Mobile',
    desc: 'Cross-platform companion app with offline-first sync, push notifications, and biometric auth against the same API as the web client.',
    tools: 'React Native, Expo, SQLite, REST API',
    image: '',
    link: 'https://github.com/your-handle/companion-app',
    visitShort: 'Companion App',
  },
];

export const contact = {
  heading: "Have a project idea or a question? Let's discuss.",
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
  successBody: "I've received your details. I'll get back to you as soon as possible.",
};

export const footer = {
  tagline: 'Designed and built from scratch.',
};
