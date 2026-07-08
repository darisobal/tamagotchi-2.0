#!/usr/bin/env node
/**
 * Creates a Supabase project, applies schema, enables email confirmation,
 * and writes .env for the Tamagotchi app.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/setup-supabase.mjs
 *
 * Get a token: https://supabase.com/dashboard/account/tokens
 */

import { readFileSync, writeFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SCHEMA_PATH = join(ROOT, 'supabase', 'schema.sql');
const ENV_PATH = join(ROOT, '.env');

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const API = 'https://api.supabase.com/v1';
const PROJECT_NAME = process.env.SUPABASE_PROJECT_NAME ?? 'tamagotchi';
const REGION = process.env.SUPABASE_REGION ?? 'eu-central-1';

if (!TOKEN) {
  console.error(`
Missing SUPABASE_ACCESS_TOKEN.

1. Sign in at https://supabase.com/dashboard
2. Open https://supabase.com/dashboard/account/tokens
3. Generate a token, then run:

   SUPABASE_ACCESS_TOKEN=sbp_your_token node scripts/setup-supabase.mjs
`);
  process.exit(1);
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(typeof data === 'object' ? JSON.stringify(data) : data);
  }
  return data;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getOrganizationId() {
  const orgs = await api('/organizations');
  if (!orgs?.length) {
    throw new Error('No Supabase organization found. Create one at https://supabase.com/dashboard');
  }
  console.log(`Using organization: ${orgs[0].name} (${orgs[0].id})`);
  return orgs[0].id;
}

async function findOrCreateProject(orgId) {
  const projects = await api('/projects');
  const existing = projects.find((p) => p.name === PROJECT_NAME);
  if (existing) {
    console.log(`Project "${PROJECT_NAME}" already exists (${existing.id})`);
    return existing.id;
  }

  const dbPassword = randomBytes(24).toString('base64url');
  console.log(`Creating project "${PROJECT_NAME}" in ${REGION}...`);
  const created = await api('/projects', {
    method: 'POST',
    body: JSON.stringify({
      organization_id: orgId,
      name: PROJECT_NAME,
      region: REGION,
      db_pass: dbPassword,
    }),
  });
  console.log(`Created project ref: ${created.id}`);
  return created.id;
}

async function waitForProject(ref) {
  for (let i = 0; i < 60; i++) {
    const project = await api(`/projects/${ref}`);
    const status = project.status;
    process.stdout.write(`\rProject status: ${status}   `);
    if (status === 'ACTIVE_HEALTHY') {
      console.log('\nProject is ready.');
      return project;
    }
    if (status === 'INACTIVE' || status === 'UNKNOWN') {
      throw new Error(`Project failed with status: ${status}`);
    }
    await sleep(5000);
  }
  throw new Error('Timed out waiting for project to become active');
}

async function getAnonKey(ref) {
  const keys = await api(`/projects/${ref}/api-keys?reveal=true`);
  const anon =
    keys.find((k) => k.name === 'anon' || k.type === 'legacy' && k.name === 'anon') ??
    keys.find((k) => k.type === 'publishable') ??
    keys.find((k) => k.api_key?.startsWith('eyJ'));
  if (!anon?.api_key) {
    throw new Error(`Could not find anon key. Keys: ${JSON.stringify(keys.map((k) => k.name))}`);
  }
  return anon.api_key;
}

async function runSchema(ref, sql) {
  console.log('Applying schema.sql...');
  try {
    await api(`/projects/${ref}/database/query`, {
      method: 'POST',
      body: JSON.stringify({ query: sql }),
    });
    console.log('Schema applied.');
  } catch (err) {
    console.warn('Management API SQL failed — apply manually in SQL Editor:');
    console.warn(String(err));
    console.warn(`https://supabase.com/dashboard/project/${ref}/sql/new`);
  }
}

async function configureEmailConfirmation(ref) {
  const redirectUrls = [
    'tamagotchi://auth-callback',
    'http://localhost:8081/auth-callback',
    'http://127.0.0.1:8081/auth-callback',
    'exp://127.0.0.1:8081/--/auth-callback',
    'exp://localhost:8081/--/auth-callback',
  ].join(',');

  console.log('Enabling email confirmation...');
  try {
    await api(`/projects/${ref}/config/auth`, {
      method: 'PATCH',
      body: JSON.stringify({
        mailer_autoconfirm: false,
        external_email_enabled: true,
        site_url: 'http://localhost:8081',
        uri_allow_list: redirectUrls,
      }),
    });
    console.log('Email confirmation enabled.');
    console.log('Redirect URLs:', redirectUrls);
  } catch (err) {
    console.warn('Could not patch auth config automatically.');
    console.warn('Enable manually: Authentication → Providers → Email → Confirm email ON');
    console.warn('Add redirect URLs under Authentication → URL Configuration');
    console.warn(String(err));
  }
}

async function main() {
  const orgId = await getOrganizationId();
  const ref = await findOrCreateProject(orgId);
  await waitForProject(ref);
  const anonKey = await getAnonKey(ref);
  const url = `https://${ref}.supabase.co`;
  const sql = readFileSync(SCHEMA_PATH, 'utf8');

  await runSchema(ref, sql);
  await configureEmailConfirmation(ref);

  const env = `# Generated by scripts/setup-supabase.mjs
EXPO_PUBLIC_SUPABASE_URL=${url}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
`;
  writeFileSync(ENV_PATH, env);
  console.log(`
Done! Wrote ${ENV_PATH}

  URL: ${url}
  Dashboard: https://supabase.com/dashboard/project/${ref}

Restart the app: npm run web
Then sign up at http://localhost:8081/auth
`);
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message ?? err);
  process.exit(1);
});
