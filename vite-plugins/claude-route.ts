// Dev-server route POST /api/explain. Runs `claude -p` on this laptop's logged-in account to explain one flagged
// item in plain words. Off by default: set FT_CLAUDE=1 to turn it on. Every error, timeout or missing login returns
// { fallback: true } so the screen shows the engine's own text. The engine's flags are recomputed here; nothing the
// browser sends is trusted beyond the city and item ID.
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, ViteDevServer } from 'vite';
import type { CityRun } from '../src/contract/types';
import { CITIES } from '../src/contract/types';
import { buildPrompt, parseCliEnvelope, parseModelJson, ruleIdsFor, SYSTEM_PROMPT, validate } from '../src/assist/core';
import { EXPLAIN_PATH, type ExplainRequest, type ExplainResponse } from '../src/assist/types';

const TIMEOUT_MS = 30_000;
const MAX_BODY = 1_000;
const ITEM_ID = /^[a-z0-9-]{1,40}$/;
const FALLBACK: ExplainResponse = { fallback: true };

const CLAUDE_ARGS = [
  '-p',
  '--output-format', 'json',
  '--tools', '',
  '--safe-mode',
  '--no-session-persistence',
  '--model', 'sonnet',
  '--system-prompt', SYSTEM_PROMPT,
];

export function runClaude(prompt: string, timeoutMs = TIMEOUT_MS): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', CLAUDE_ARGS, { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
    let out = '';
    let err = '';
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`claude timed out after ${timeoutMs} ms`));
    }, timeoutMs);
    child.stdout.on('data', (d: Buffer) => (out += d.toString()));
    child.stderr.on('data', (d: Buffer) => (err += d.toString()));
    child.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(out);
      else reject(new Error(`claude exited ${code}: ${err.slice(0, 500) || out.slice(0, 500)}`));
    });
    child.stdin.end(prompt);
  });
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (d: Buffer) => {
      body += d.toString();
      if (body.length > MAX_BODY) reject(new Error('request body too large'));
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function parseRequest(body: string): ExplainRequest | null {
  try {
    const { city, itemId } = JSON.parse(body) as Partial<ExplainRequest>;
    if (!CITIES.includes(city as ExplainRequest['city']) || typeof itemId !== 'string' || !ITEM_ID.test(itemId)) {
      return null;
    }
    return { city: city as ExplainRequest['city'], itemId };
  } catch {
    return null;
  }
}

async function loadExcerpts(root: string, sourceIds: string[]): Promise<Record<string, string>> {
  const index = JSON.parse(await readFile(path.join(root, 'data/sources/index.json'), 'utf8')) as {
    id: string;
    file: string | null;
  }[];
  const entries = await Promise.all(
    sourceIds.map(async (id) => {
      const file = index.find((s) => s.id === id)?.file;
      if (!file) return null;
      return [id, await readFile(path.join(root, file), 'utf8')] as const;
    }),
  );
  return Object.fromEntries(entries.filter((e) => e !== null));
}

async function explainItem(server: ViteDevServer, req: ExplainRequest): Promise<ExplainResponse> {
  const api = (await server.ssrLoadModule('/src/contract/api.ts')) as { runCheck: (c: string) => CityRun };
  const run = api.runCheck(req.city);
  const allowed = ruleIdsFor(run.flags, req.itemId);
  if (allowed.length === 0) return FALLBACK;
  const flags = run.flags.filter((f) => f.itemId === req.itemId);
  const sourceIds = [...new Set(flags.flatMap((f) => f.citations.map((c) => c.sourceId)))];
  const excerpts = await loadExcerpts(server.config.root, sourceIds);
  const prompt = buildPrompt({ cityName: run.name, itemId: req.itemId, flags, excerpts });
  const text = parseCliEnvelope(await runClaude(prompt));
  if (text === null) throw new Error('claude returned an error result');
  return validate(parseModelJson(text), req.itemId, allowed);
}

function send(res: ServerResponse, body: ExplainResponse): void {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export function claudeRoute(): Plugin {
  const cache = new Map<string, ExplainResponse>();
  return {
    name: 'fast-track-claude-route',
    apply: 'serve',
    configureServer(server) {
      const enabled = process.env.FT_CLAUDE === '1';
      server.middlewares.use(EXPLAIN_PATH, (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        void (async () => {
          let key = 'unparsed';
          try {
            if (!enabled) return send(res, FALLBACK);
            const parsed = parseRequest(await readBody(req));
            if (!parsed) return send(res, FALLBACK);
            key = `${parsed.city}:${parsed.itemId}`;
            const hit = cache.get(key);
            if (hit) return send(res, hit);
            const result = await explainItem(server, parsed);
            if (!result.fallback) cache.set(key, result);
            else console.warn(`[explain] ${key}: no valid points from Claude, falling back`);
            send(res, result);
          } catch (err) {
            console.warn(`[explain] ${key}: falling back to the engine's text`, err);
            send(res, FALLBACK);
          }
        })();
      });
    },
  };
}
