#!/usr/bin/env node
/**
 * VideoMill — Deployment Validation Script
 * ─────────────────────────────────────────
 * Kjør: npm run validate
 *
 * Verifiserer at prosjektet er "Deployment Ready" i henhold til:
 *   - ISO 27001 (A.8.10, A.5.9, A.8.24)
 *   - NIS2 artikkel 21 (risikostyring, tilgangskontroll, kryptografi)
 *   - Zero Trust-prinsippet
 *
 * Exit code:  0 = alle kontroller bestått
 *             1 = én eller flere kritiske kontroller feilet
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// ─────────────────────────────────────
// Farger for terminal-output
// ─────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',
  gray:   '\x1b[90m',
};

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '').replace(/^\/([A-Z]:)/, '$1');

let passed = 0;
let warned = 0;
let failed = 0;

function pass(msg)  { console.log(`  ${C.green}✔${C.reset} ${msg}`); passed++; }
function warn(msg)  { console.log(`  ${C.yellow}⚠${C.reset} ${msg}`); warned++; }
function fail(msg)  { console.log(`  ${C.red}✖${C.reset} ${msg}`); failed++; }
function section(title) {
  console.log(`\n${C.bold}${C.cyan}▸ ${title}${C.reset}`);
}

// ─────────────────────────────────────
// Hjelpere
// ─────────────────────────────────────
function readText(relPath) {
  const abs = join(ROOT, relPath);
  return existsSync(abs) ? readFileSync(abs, 'utf8') : null;
}

function fileExists(relPath) {
  return existsSync(join(ROOT, relPath));
}

/**
 * Samler alle kildefiler rekursivt, ekskluderer node_modules og dist.
 */
function collectSourceFiles(dir, exts = ['.ts', '.tsx', '.js', '.mjs']) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    if (['node_modules', 'dist', '.git', 'scripts'].includes(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectSourceFiles(full, exts));
    } else if (exts.includes(extname(entry))) {
      results.push(full);
    }
  }
  return results;
}

// ─────────────────────────────────────
// SJEKK 1 — Hardkodede hemmeligheter
// ─────────────────────────────────────
section('SEC-01 · Hardkodede hemmeligheter (ISO 27001 A.8.10 / NIS2 Art.21)');

const SECRET_PATTERNS = [
  { pattern: /eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}/,         label: 'JWT/Supabase-nøkkel (eyJ...)' },
  { pattern: /sk_live_[A-Za-z0-9]{20,}/,                            label: 'Stripe live-nøkkel (sk_live_)' },
  { pattern: /sk_test_[A-Za-z0-9]{20,}/,                            label: 'Stripe test-nøkkel (sk_test_)' },
  { pattern: /N8N_SECRET\s*=\s*["'][^"']{8,}/,                      label: 'Hardkodet N8N_SECRET' },
  { pattern: /const\s+\w*[Ss]ecret\w*\s*=\s*["'][^"']{8,}/,        label: 'Hardkodet secret-variabel' },
  { pattern: /https?:\/\/[a-z0-9]+-\d{4,5}\.proxy\.runpod\.net/,   label: 'RunPod pod-URL i kildekode' },
  { pattern: /\d{12}-[a-z0-9]+\.apps\.googleusercontent\.com/,      label: 'Google Client ID hardkodet' },
  { pattern: /(?<![A-Z_])API_KEY\s*=\s*["'][^"']{8,}/,             label: 'Hardkodet API_KEY' },
  // Ekskluderer i18n-oversettelsesnøkler (f.eks. password: 'Passord') — kun rene tilordninger
  { pattern: /(?:const|let|var)\s+\w*[Pp]assword\w*\s*=\s*["'][^"']{4,}/,  label: 'Hardkodet passord-variabel' },
];

const srcFiles = collectSourceFiles(join(ROOT, 'src'));
srcFiles.push(...collectSourceFiles(join(ROOT, 'supabase')));

let secretsFound = false;
for (const file of srcFiles) {
  const content = readFileSync(file, 'utf8');
  const relFile = file.replace(ROOT, '').replace(/\\/g, '/');
  for (const { pattern, label } of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      fail(`${label} — ${relFile}`);
      secretsFound = true;
    }
  }
}
if (!secretsFound) pass('Ingen hardkodede hemmeligheter funnet i kildefilene');

// ─────────────────────────────────────
// SJEKK 2 — .env-filer i repo
// ─────────────────────────────────────
section('SEC-02 · .env-filer ikke i repo (ISO 27001 A.8.10)');

const ENV_FILES_TO_CHECK = ['.env', '.env.local', '.env.production', '.env.staging', '.env.development'];
const gitignoreContent = readText('.gitignore') ?? '';
let envFilesFound = false;
for (const f of ENV_FILES_TO_CHECK) {
  if (fileExists(f)) {
    // Sjekk om filen er dekket av .gitignore og om den inneholder reelle verdier
    const isIgnored = gitignoreContent.split('\n').some(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#') && (f.includes(trimmed) || trimmed.includes(f.replace('./', '')));
    });
    const content = readText(f) ?? '';
    const hasRealValues = /^[A-Z_]+=(?!<|https?:\/\/<)[^\s#].{5,}/m.test(content);
    if (!isIgnored) {
      fail(`.env-fil ikke i .gitignore: ${f}`);
      envFilesFound = true;
    } else if (hasRealValues) {
      warn(`.env-fil med verdier eksisterer (er gitignored, men ikke for versjonskontroll): ${f}`);
    } else {
      pass(`.env-fil er gitignored og inneholder kun placeholder-verdier: ${f}`);
    }
  }
}
if (!envFilesFound && ENV_FILES_TO_CHECK.every(f => !fileExists(f))) pass('Ingen .env-filer funnet i prosjektrot');

// ─────────────────────────────────────
// SJEKK 3 — .gitignore dekning
// ─────────────────────────────────────
section('SEC-03 · .gitignore dekning (NIS2 Art.21)');

const gitignore = readText('.gitignore') ?? '';
const requiredIgnores = ['.env', '.env.local', 'node_modules', 'dist', 'supabase/.env'];
for (const entry of requiredIgnores) {
  if (gitignore.includes(entry)) {
    pass(`.gitignore dekker: ${entry}`);
  } else {
    fail(`.gitignore mangler oppføring for: ${entry}`);
  }
}

// ─────────────────────────────────────
// SJEKK 4 — .env.example eksisterer
// ─────────────────────────────────────
section('SEC-04 · Miljøvariabeldokumentasjon (ISO 27001 A.5.9)');

if (fileExists('.env.example')) {
  pass('.env.example eksisterer');
  const example = readText('.env.example') ?? '';
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_GOOGLE_CLIENT_ID',
    'N8N_HEADER_AUTH_VALUE',
    'RUNPOD_API_KEY',
    'ALLOWED_ORIGIN',
  ];
  for (const v of requiredVars) {
    if (example.includes(v)) {
      pass(`  .env.example dokumenterer: ${v}`);
    } else {
      warn(`  .env.example mangler dokumentasjon for: ${v}`);
    }
  }
} else {
  fail('.env.example mangler — kjør migrasjonsprosedyren på nytt');
}

// ─────────────────────────────────────
// SJEKK 5 — vercel.json sikkerhetsheadere
// ─────────────────────────────────────
section('SEC-05 · HTTP Sikkerhetsheadere (NIS2 Art.21 / HSTS)');

const vercelJson = readText('vercel.json');
if (!vercelJson) {
  fail('vercel.json mangler');
} else {
  const vercel = JSON.parse(vercelJson);
  const headers = JSON.stringify(vercel);
  const requiredHeaders = [
    { key: 'Content-Security-Policy',       label: 'CSP' },
    { key: 'Strict-Transport-Security',     label: 'HSTS (TLS 1.3-enforcement)' },
    { key: 'X-Frame-Options',               label: 'X-Frame-Options (Clickjacking)' },
    { key: 'X-Content-Type-Options',        label: 'X-Content-Type-Options (MIME sniffing)' },
    { key: 'Referrer-Policy',               label: 'Referrer-Policy' },
    { key: 'Permissions-Policy',            label: 'Permissions-Policy' },
  ];
  for (const { key, label } of requiredHeaders) {
    if (headers.includes(key)) {
      pass(`Header satt: ${label}`);
    } else {
      fail(`Manglende sikkerhetsheader: ${label} (${key})`);
    }
  }
  if (vercel.rewrites?.some(r => r.destination === '/index.html')) {
    pass('SPA-rewrite (index.html fallback) konfigurert');
  } else {
    fail('vercel.json mangler SPA-rewrite til /index.html');
  }
}

// ─────────────────────────────────────
// SJEKK 6 — Supabase RLS
// ─────────────────────────────────────
section('SEC-06 · Row Level Security (ISO 27001 A.5.15 / Zero Trust)');

const sqlFiles = collectSourceFiles(join(ROOT, 'supabase', 'migrations'), ['.sql']);
let rlsIssues = false;

for (const sqlFile of sqlFiles) {
  const sql = readFileSync(sqlFile, 'utf8');
  const relFile = sqlFile.replace(ROOT, '').replace(/\\/g, '/');
  const tables = [...sql.matchAll(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+(\w+)/gi)].map(m => m[1]);
  for (const table of tables) {
    const rlsEnabled = new RegExp(`ENABLE ROW LEVEL SECURITY`, 'i').test(sql);
    if (!rlsEnabled) {
      fail(`Tabell '${table}' i ${relFile} — ENABLE ROW LEVEL SECURITY ikke funnet`);
      rlsIssues = true;
    }
  }
}
if (sqlFiles.length === 0) {
  warn('Ingen SQL-migrasjoner funnet under supabase/migrations/');
} else if (!rlsIssues) {
  pass(`RLS-kontroll OK i ${sqlFiles.length} migrasjonsfil(er)`);
}

// ─────────────────────────────────────
// SJEKK 7 — CORS i Edge Functions
// ─────────────────────────────────────
section('SEC-07 · CORS Zero Trust (NIS2 Art.21 / Zero Trust)');

const edgeFunctions = collectSourceFiles(join(ROOT, 'supabase', 'functions'), ['.ts']);
let wildcardCors = false;
for (const fn of edgeFunctions) {
  const content = readFileSync(fn, 'utf8');
  const relFile = fn.replace(ROOT, '').replace(/\\/g, '/');
  if (/Allow-Origin.*"\s*\*\s*"/.test(content)) {
    fail(`Wildcard CORS ("*") funnet i Edge Function: ${relFile}`);
    wildcardCors = true;
  }
}
if (!wildcardCors && edgeFunctions.length > 0) {
  pass(`Ingen wildcard CORS funnet i ${edgeFunctions.length} Edge Function(er)`);
} else if (edgeFunctions.length === 0) {
  warn('Ingen Edge Functions funnet under supabase/functions/');
}

// ─────────────────────────────────────
// SJEKK 8 — VITE_-prefix på klientvariabler
// ─────────────────────────────────────
section('SEC-08 · VITE_-prefix sikkerhetsregel (ISO 27001 A.8.10)');

let viteLeaks = false;
for (const file of srcFiles) {
  const content = readFileSync(file, 'utf8');
  const relFile = file.replace(ROOT, '').replace(/\\/g, '/');
  // SERVICE_ROLE, private key eller hemmelighet som IKKE er i supabase/functions
  if (!relFile.includes('supabase/functions')) {
    if (/VITE_.*SERVICE_ROLE|VITE_.*PRIVATE|VITE_.*SECRET(?!_KEY_LABEL)/i.test(content)) {
      fail(`Sensitiv nøkkel med VITE_-prefix (synlig i nettleser): ${relFile}`);
      viteLeaks = true;
    }
  }
}
if (!viteLeaks) pass('Ingen sensitive nøkler eksponert med VITE_-prefix');

// ─────────────────────────────────────
// SJEKK 9 — supabaseClient singleton brukes
// ─────────────────────────────────────
section('SEC-09 · Supabase singleton-pattern (arkitekturkrav)');

let directCreateClient = false;
for (const file of srcFiles) {
  const relFile = file.replace(ROOT, '').replace(/\\/g, '/');
  // Edge Functions får lov å opprette sin egen klient
  if (relFile.includes('supabase/functions')) continue;
  const content = readFileSync(file, 'utf8');
  if (/createClient\s*\(/.test(content) && !relFile.includes('supabaseClient')) {
    fail(`createClient() kalt direkte utenfor supabaseClient.ts: ${relFile}`);
    directCreateClient = true;
  }
}
if (!directCreateClient) pass('Supabase singleton brukes konsekvent (ingen direkte createClient-kall)');

// ─────────────────────────────────────
// SJEKK 10 — TypeScript og build-konfig
// ─────────────────────────────────────
section('SEC-10 · Konfigurasjonsfiler (deployment-infrastruktur)');

const requiredFiles = [
  { path: 'vite.config.ts',          label: 'vite.config.ts' },
  { path: 'tsconfig.json',           label: 'tsconfig.json' },
  { path: 'tsconfig.app.json',       label: 'tsconfig.app.json' },
  { path: 'vercel.json',             label: 'vercel.json' },
  { path: '.env.example',            label: '.env.example' },
  { path: '.gitignore',              label: '.gitignore' },
  { path: 'src/lib/supabaseClient.ts', label: 'src/lib/supabaseClient.ts (singleton)' },
  { path: 'supabase/functions/trigger-n8n/index.ts', label: 'Edge Function: trigger-n8n' },
];

for (const { path: p, label } of requiredFiles) {
  if (fileExists(p)) {
    pass(`Fil finnes: ${label}`);
  } else {
    fail(`Manglende fil: ${label}`);
  }
}

// ─────────────────────────────────────
// SAMMENDRAG
// ─────────────────────────────────────
const total = passed + warned + failed;
console.log('\n' + '─'.repeat(60));
console.log(`${C.bold}SAMMENDRAG — VideoMill Deployment Validation${C.reset}`);
console.log('─'.repeat(60));
console.log(`  ${C.green}✔ Bestått:${C.reset}  ${passed}`);
console.log(`  ${C.yellow}⚠ Advarsel:${C.reset} ${warned}`);
console.log(`  ${C.red}✖ Feilet:${C.reset}   ${failed}`);
console.log(`  Totalt:     ${total} kontroller`);
console.log('─'.repeat(60));

if (failed === 0 && warned === 0) {
  console.log(`\n${C.green}${C.bold}✔ DEPLOYMENT READY — Alle kontroller bestått.${C.reset}\n`);
} else if (failed === 0) {
  console.log(`\n${C.yellow}${C.bold}⚠ DEPLOYMENT READY MED ADVARSLER — ${warned} advarsel(er). Vurder før push.${C.reset}\n`);
} else {
  console.log(`\n${C.red}${C.bold}✖ IKKE DEPLOYMENT READY — ${failed} kritisk(e) feil må fikses.${C.reset}\n`);
  console.log(`${C.gray}  Kjør skriptet på nytt etter utbedring: npm run validate${C.reset}\n`);
}

// ─────────────────────────────────────
// NIS2 DEPLOYMENT CHECKLIST (output)
// ─────────────────────────────────────
console.log(`${C.bold}${C.cyan}NIS2 / ISO 27001 — MANUELL SJEKKLISTE${C.reset}`);
console.log('─'.repeat(60));
const checklist = [
  ['SEC', 'Hemmeligheter rotert etter eksponeringshendelse (ViraNode-secret)'],
  ['SEC', 'VITE_GOOGLE_CLIENT_ID satt i Vercel Dashboard → Environment Variables'],
  ['SEC', 'VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY satt i Vercel'],
  ['SEC', 'ALLOWED_ORIGIN satt i Supabase Edge Function Secrets'],
  ['SEC', 'N8N_HEADER_AUTH_VALUE satt i Supabase Edge Function Secrets (min. 32 tegn)'],
  ['SEC', 'RUNPOD_API_KEY og RUNPOD_ENDPOINT_ID satt i Supabase Secrets'],
  ['AUTH', 'Supabase → Auth → URL Configuration: Site URL = Vercel production URL'],
  ['AUTH', 'Supabase → Auth → Redirect URLs: Legg til https://<app>.vercel.app/**'],
  ['AUTH', 'Google Cloud Console: Redirect URI registrert for OAuth-app'],
  ['RLS', 'Supabase → Database → RLS: Verifiser at alle tabeller har aktiv policy'],
  ['RLS', 'Supabase → SQL Editor: Test at anon-bruker IKKE kan lese andres data'],
  ['CORS', 'n8n: Header Credential opprettet med samme verdi som N8N_HEADER_AUTH_VALUE'],
  ['CORS', 'n8n: Webhook-node satt til å kreve Header Authentication'],
  ['TLS', 'Vercel-deployment bruker HTTPS (TLS 1.3) — verifiser i nettleser-padlock'],
  ['LOG', 'Supabase → Logs → API Logs: Bekreft at feilede auth-forsøk logges'],
  ['LOG', 'Vercel → Analytics: Aktivert for produksjonsmiljøet'],
];

checklist.forEach(([category, item], i) => {
  const num = String(i + 1).padStart(2, '0');
  console.log(`  ${C.gray}[${num}]${C.reset} ${C.yellow}[${category}]${C.reset} ${item}`);
});

console.log('\n' + '─'.repeat(60));
console.log(`${C.gray}  Dato: ${new Date().toLocaleDateString('nb-NO', { day: '2-digit', month: 'long', year: 'numeric' })}${C.reset}`);
console.log(`${C.gray}  Versjon: VideoMill v2.0 — NIS2 compliance audit trail${C.reset}\n`);

process.exit(failed > 0 ? 1 : 0);
