#!/usr/bin/env node
/**
 * Keeps the Expo web dev server alive. Restarts automatically when port 8081
 * becomes unreachable or the child process exits unexpectedly.
 *
 * Usage: npm run dev:watch
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 8081;
const CHECK_MS = 30_000;
const STARTUP_GRACE_MS = 45_000;

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

let child = null;
let startingAt = 0;
let stopping = false;

function log(message) {
  console.log(`[dev-watch ${new Date().toISOString()}] ${message}`);
}

function isServerUp() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${PORT}/`, (res) => {
      resolve(res.statusCode != null && res.statusCode < 500);
      res.resume();
    });
    req.on('error', () => resolve(false));
    req.setTimeout(4_000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startServer() {
  if (child || stopping) return;

  startingAt = Date.now();
  log(`starting expo web on port ${PORT}...`);

  child = spawn('npx', ['expo', 'start', '--web'], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    log(`expo exited (code=${code ?? 'null'}, signal=${signal ?? 'null'})`);
    child = null;
    startingAt = 0;
  });
}

async function ensureHealthy() {
  if (stopping) return;

  const up = await isServerUp();
  if (up) {
    if (startingAt) startingAt = 0;
    return;
  }

  const booting = startingAt && Date.now() - startingAt < STARTUP_GRACE_MS;
  if (booting) return;

  if (child) {
    log('port unreachable — restarting expo...');
    child.kill('SIGTERM');
    child = null;
    startingAt = 0;
    await new Promise((r) => setTimeout(r, 2_000));
  }

  startServer();
}

function shutdown() {
  stopping = true;
  log('shutting down...');
  if (child) child.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

log(`watching http://localhost:${PORT} (check every ${CHECK_MS / 1000}s)`);
startServer();
setInterval(ensureHealthy, CHECK_MS);
