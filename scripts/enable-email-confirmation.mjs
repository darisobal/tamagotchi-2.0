#!/usr/bin/env node
/**
 * Enables email confirmation on an existing Supabase project.
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/enable-email-confirmation.mjs
 *
 * Reads EXPO_PUBLIC_SUPABASE_URL from .env to find the project ref.
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ENV_PATH = join(ROOT, '.env');

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const API = 'https://api.supabase.com/v1';

if (!TOKEN) {
  console.error(`
Missing SUPABASE_ACCESS_TOKEN.

1. Sign in at https://supabase.com/dashboard
2. Open https://supabase.com/dashboard/account/tokens
3. Generate a token, then run:

   SUPABASE_ACCESS_TOKEN=sbp_your_token node scripts/enable-email-confirmation.mjs
`);
  process.exit(1);
}

if (!existsSync(ENV_PATH)) {
  console.error(`Missing ${ENV_PATH}. Run npm run setup:supabase first.`);
  process.exit(1);
}

const envText = readFileSync(ENV_PATH, 'utf8');
const urlMatch = envText.match(/^EXPO_PUBLIC_SUPABASE_URL=(.+)$/m);
if (!urlMatch) {
  console.error('EXPO_PUBLIC_SUPABASE_URL not found in .env');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const refMatch = supabaseUrl.match(/^https:\/\/([^.]+)\.supabase\.co\/?$/);
if (!refMatch) {
  console.error(`Could not parse project ref from: ${supabaseUrl}`);
  process.exit(1);
}

const ref = refMatch[1];

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

async function main() {
  const redirectUrls = [
    'tamagotchi://auth-callback',
    'http://localhost:8081/auth-callback',
    'http://127.0.0.1:8081/auth-callback',
    'exp://127.0.0.1:8081/--/auth-callback',
    'exp://localhost:8081/--/auth-callback',
  ].join(',');

  console.log(`Enabling email confirmation for project "${ref}"...`);
  await api(`/projects/${ref}/config/auth`, {
    method: 'PATCH',
    body: JSON.stringify({
      mailer_autoconfirm: false,
      external_email_enabled: true,
      site_url: 'http://localhost:8081',
      uri_allow_list: redirectUrls,
    }),
  });

  console.log('Done.');
  console.log('Redirect URLs configured:', redirectUrls);
  console.log(`Dashboard: https://supabase.com/dashboard/project/${ref}/auth/url-configuration`);
}

main().catch((err) => {
  console.error('\nFailed:', err.message ?? err);
  process.exit(1);
});
