// Dev-server route POST /api/explain. Runs `claude -p` on this laptop's logged-in account to explain one flagged
// item in plain words. Off by default: set FT_CLAUDE=1 to turn it on. Every error, timeout or missing login returns
// { fallback: true } so the screen shows the engine's own text. The engine's flags are recomputed here; nothing the
// browser sends is trusted beyond the city and item ID.
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, ViteDevServer } from 'vite';
import type { CityRun } from '../src/contract/types.ts';
import { CITIES } from '../src/contract/types.ts';
import { buildPrompt, numbersIn, parseCliEnvelope, parseModelJson, ruleIdsFor, SYSTEM_PROMPT, validate } from '../src/assist/core.ts';
import { buildPlanPrompt, contactsFor, PLAN_SYSTEM_PROMPT, validatePlan, type PlanInput } from '../src/assist/plan-core.ts';
import {
  EXPLAIN_PATH,
  PLAN_PATH,
  type ExplainRequest,
  type ExplainResponse,
  type PlanResponse,
} from '../src/assist/types.ts';
import type { City, Contact, Phase, Step } from '../src/contract/types.ts';

const TIMEOUT_MS = 30_000;
const PLAN_TIMEOUT_MS = 120_000;
const MAX_BODY = 1_000;
const ITEM_ID = /^[a-z0-9-]{1,40}$/;
const FALLBACK: ExplainResponse = { fallback: true };

function claudeArgs(systemPrompt: string): string[] {
  return [
    '-p',
    '--output-format', 'json',
    '--tools', '',
    '--safe-mode',
    '--no-session-persistence',
    '--model', 'sonnet',
    '--system-prompt', systemPrompt,
  ];
}

export function runClaude(prompt: string, systemPrompt = SYSTEM_PROMPT, timeoutMs = TIMEOUT_MS): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', claudeArgs(systemPrompt), { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
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
  return validate(parseModelJson(text), req.itemId, allowed, new Set(numbersIn(JSON.stringify(flags))));
}

interface AssistApi {
  runCheck: (c: City) => CityRun;
  getSteps: (p: CityRun['pathway']) => Step[];
  getTimeline: (p: CityRun['pathway']) => Phase[];
  getEscalation: () => Contact;
}

async function planCity(server: ViteDevServer, city: City): Promise<PlanResponse> {
  const api = (await server.ssrLoadModule('/src/contract/api.ts')) as AssistApi;
  const run = api.runCheck(city);
  const base = { run, steps: api.getSteps(run.pathway), timeline: api.getTimeline(run.pathway), escalation: api.getEscalation() };
  const cites = [
    ...run.flags.flatMap((f) => f.citations),
    ...contactsFor(base).map((c) => c.citation),
    ...base.steps.flatMap((s) => (s.citation ? [s.citation] : [])),
    ...base.timeline.flatMap((t) => (t.citation ? [t.citation] : [])),
  ];
  const excerpts = await loadExcerpts(server.config.root, [...new Set(cites.map((c) => c.sourceId))]);
  const input: PlanInput = { ...base, excerpts };
  const text = parseCliEnvelope(await runClaude(buildPlanPrompt(input), PLAN_SYSTEM_PROMPT, PLAN_TIMEOUT_MS));
  if (text === null) throw new Error('claude returned an error result');
  return validatePlan(parseModelJson(text), input);
}

function parseCity(body: string): City | null {
  try {
    const { city } = JSON.parse(body) as { city?: unknown };
    return CITIES.includes(city as City) ? (city as City) : null;
  } catch {
    return null;
  }
}

function send(res: ServerResponse, body: ExplainResponse | PlanResponse): void {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function postOnly(req: IncomingMessage, res: ServerResponse): boolean {
  if (req.method === 'POST') return true;
  res.statusCode = 405;
  res.end();
  return false;
}

export function claudeRoute(): Plugin {
  const cache = new Map<string, ExplainResponse>();
  const plans = new Map<City, Promise<PlanResponse>>();

  function plan(server: ViteDevServer, city: City): Promise<PlanResponse> {
    const hit = plans.get(city);
    if (hit) return hit;
    const p = planCity(server, city)
      .catch((err: unknown) => {
        console.warn(`[plan] ${city}: falling back to the plain data`, err);
        return { fallback: true } as const;
      })
      .then((r) => {
        if (r.fallback) {
          plans.delete(city);
          console.warn(`[plan] ${city}: no valid plan from Claude, falling back`);
        }
        return r;
      });
    plans.set(city, p);
    return p;
  }

  return {
    name: 'fast-track-claude-route',
    apply: 'serve',
    configureServer(server) {
      const enabled = process.env.FT_CLAUDE === '1';
      if (enabled) {
        // Warm every city's plan at start so the live demo never waits.
        server.httpServer?.once('listening', () => {
          for (const city of CITIES) void plan(server, city);
        });
      }
      server.middlewares.use(PLAN_PATH, (req, res) => {
        if (!postOnly(req, res)) return;
        void (async () => {
          try {
            if (!enabled) return send(res, FALLBACK);
            const city = parseCity(await readBody(req));
            send(res, city ? await plan(server, city) : FALLBACK);
          } catch (err) {
            console.warn('[plan] request failed, falling back', err);
            send(res, FALLBACK);
          }
        })();
      });
      server.middlewares.use(EXPLAIN_PATH, (req, res) => {
        if (!postOnly(req, res)) return;
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
