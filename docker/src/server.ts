import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';

import { Pool } from 'pg';
import express from 'express';
import {
  ARC, VerID, OpenProduct,
  OpenProductStandplaatsvergunning,
  InMemory, PostgreSql,
} from '@gemeentenijmegen/attestatie-registratie-component';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function loadFlowsConfig(): Record<string, { flowUuid: string }> {
  const configPath = path.resolve(process.env.FLOWS_CONFIG_PATH ?? './flows.json');
  const stat = fs.existsSync(configPath) ? fs.statSync(configPath) : null;
  if (!stat || !stat.isFile()) {
    throw new Error(
      `Flows config not found at: ${configPath}\n` +
      'Run: cp flows.example.json flows.json  — then fill in your VerID flow UUIDs.',
    );
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

async function waitForDatabase(pool: Pool, retries = 5, delay = 2000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Database connection successful.');
      return;
    } catch (err: any) {
      console.log(`Database connection failed (attempt ${i + 1}/${retries}): ${err.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error(`Failed to connect to database after ${retries} attempts.`);
}

// ---------------------------------------------------------------------------
// Fake OpenProduct server (used when OPENPRODUCT_MODE=fake)
// ---------------------------------------------------------------------------

const FAKE_PRODUCTS: Record<string, unknown> = {
  '12126e1e-9bc1-4a30-b73e-5b5aa4ce8bc4': {
    uuid: '12126e1e-9bc1-4a30-b73e-5b5aa4ce8bc4',
    url: 'http://localhost:9876/producten/12126e1e-9bc1-4a30-b73e-5b5aa4ce8bc4',
    naam: 'Vergunning langs de 4-daagse route',
    start_datum: '2026-01-20',
    eind_datum: '2026-01-31',
    aanmaak_datum: '2026-01-19T14:51:20.505685+01:00',
    update_datum: '2026-01-19T14:51:20.505699+01:00',
    producttype: {
      uuid: 'e9522583-d61f-4232-8268-d1596a94bf2d',
      code: 'TEST-4D',
      uniforme_product_naam: 'standplaatsvergunning',
    },
    eigenaren: [{ uuid: '1dbe98d5-118e-4143-8e24-f5c866efc799', bsn: '999999333' }],
    dataobject: { location: 'St. Annastraat 250 6525 HA NIJMEGEN' },
  },
};

function startFakeOpenProduct(port: number): Promise<{ server: http.Server; baseUrl: string }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Handle PATCH (write-back) silently — just acknowledge
      if (req.method === 'PATCH') {
        console.log(`  [FakeOpenProduct] PATCH ${req.url} (acknowledged, not persisted)`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{}');
        return;
      }

      console.log(`  [FakeOpenProduct] ${req.method} ${req.url}`);
      const uuid = req.url?.split('/').pop();
      const product = uuid ? FAKE_PRODUCTS[uuid] : undefined;
      if (product) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(product));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ detail: 'Not found' }));
      }
    });
    server.listen(port, () => resolve({ server, baseUrl: `http://localhost:${port}` }));
    server.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const port = parseInt(process.env.PORT ?? '3000', 10);
  const openProductMode = (process.env.OPENPRODUCT_MODE ?? 'fake').toLowerCase();
  const fakePort = parseInt(process.env.FAKE_OPENPRODUCT_PORT ?? '9876', 10);

  const flows = loadFlowsConfig();
  console.log(`Loaded flows: ${Object.keys(flows).join(', ')}`);

  // OpenProduct source setup
  let openProductBaseUrl: string;
  let openProductToken: string;

  if (openProductMode === 'fake') {
    const fake = await startFakeOpenProduct(fakePort);
    openProductBaseUrl = fake.baseUrl;
    openProductToken = 'fake-token';
    console.log(`\nFake OpenProduct API on ${openProductBaseUrl}`);
    console.log('Available products:');
    for (const [uuid, p] of Object.entries(FAKE_PRODUCTS)) {
      console.log(`  ${uuid}  ${(p as any).naam}`);
    }
  } else {
    openProductBaseUrl = requireEnv('OPENPRODUCT_BASE_URL');
    openProductToken = requireEnv('OPENPRODUCT_API_TOKEN');
    console.log(`Using real OpenProduct API at ${openProductBaseUrl}`);
  }

  // Store setup
  const databaseUrl = process.env.DATABASE_URL;
  let store: any;
  let pool: Pool | undefined;

  if (databaseUrl) {
    console.log(`Using PostgreSql store with connection to ${databaseUrl.split('@')[1]}`);
    pool = new Pool({ connectionString: databaseUrl });
    await waitForDatabase(pool);
    store = new PostgreSql({ pool });
  } else {
    console.log('Using InMemory store (no DATABASE_URL provided)');
    store = new InMemory();
  }

  // ARC instance
  const arc = new ARC({
    provider: new VerID(
      {
        issuerUri: requireEnv('VERID_ISSUER_URL'),
        redirectUri: requireEnv('ARC_CALLBACK_ENDPOINT'),
        clientSecret: requireEnv('VERID_CLIENT_SECRET'),
      },
      flows,
    ),
    store,
    sources: [new OpenProduct({ baseUrl: openProductBaseUrl, apiToken: openProductToken })],
    attestations: [new OpenProductStandplaatsvergunning()],
  });

  arc.on('issuance', async (event) => {
    console.log(`[ARC] issuance → ${event.status} (id: ${event.sessionId})`, event.context);
  });

  // Express server
  const app = express();
  app.use(express.json());

  const publicDir = path.join(__dirname, '..', 'public', openProductMode === 'fake' ? 'demo' : 'prod');
  app.use(express.static(publicDir));

  app.get('/done', (_req, res) => {
    res.sendFile(path.join(publicDir, 'done.html'));
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // GET /products — list of demo products for the portal (demo mode only)
  if (openProductMode === 'fake') {
    app.get('/products', (_req, res) => {
      const list = Object.values(FAKE_PRODUCTS).map((p: any) => ({
        id: p.uuid,
        naam: p.naam,
        type: p.producttype.uniforme_product_naam,
      }));
      res.json(list);
    });
  }

  // Debug endpoints
  app.get('/debug/overview-data', async (_req, res) => {
    try {
      // 1. Get products (from fake data or database)
      let products: any[] = [];
      if (openProductMode === 'fake') {
        products = Object.values(FAKE_PRODUCTS).map((p: any) => ({
          id: p.uuid,
          naam: p.naam,
          type: p.producttype.uniforme_product_naam,
        }));
      }

      // 2. Get database data
      let sessions: any[] = [];
      let callbacks: any[] = [];
      if (pool) {
        const sResult = await pool.query('SELECT * FROM arc_sessions ORDER BY expires_at DESC NULLS LAST');
        const cResult = await pool.query('SELECT * FROM arc_callbacks ORDER BY expires_at DESC NULLS LAST');
        sessions = sResult.rows;
        callbacks = cResult.rows;
      }

      // 3. Merge: ensure all products from DB are included even if not in fake list
      const dbProductIds = new Set([
        ...sessions.map(s => s.product_id),
        ...callbacks.map(c => c.product_id)
      ]);

      for (const id of dbProductIds) {
        if (!products.find(p => p.id === id)) {
          products.push({ id, naam: 'Unknown Product', type: 'Unknown' });
        }
      }

      const overview = products.map(p => ({
        ...p,
        sessions: sessions.filter(s => s.product_id === p.id),
        callbacks: callbacks.filter(c => c.product_id === p.id),
      }));

      return res.json(overview);
    } catch (err: any) {
      console.error('[GET /debug/overview-data] Error:', err.message);
      return res.status(500).json({
        error: err.message,
        code: err.code,
        type: err.name
      });
    }
  });

  app.post('/debug/revoke', async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: 'Missing sessionId' });
      }
      console.log(`[POST /debug/revoke] sessionId=${sessionId}`);
      await arc.revoke({ sessionId });
      return res.json({ status: 'revoked', sessionId });
    } catch (err: any) {
      console.error('[POST /debug/revoke] Error:', err.message);
      return res.status(500).json({
        error: err.message,
        code: err.code,
        type: err.name
      });
    }
  });

  app.get('/debug', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'demo', 'debug.html'));
  });

  // POST /start — begin issuance flow
  // Body: { id: string, source?: string }
  app.post('/start', async (req, res) => {
    try {
      const id: string | undefined = req.body?.id;
      const source: string = req.body?.source ?? 'openproduct';

      if (!id) {
        res.status(400).json({ error: 'Missing required field: id' });
        return;
      }

      console.log(`[POST /start] source=${source} id=${id}`);
      const result = await arc.issue({ source, id });


      // This ID will be used for revocation requests
      console.log(`[POST /start] Issued UUID for revocation: ${result.sessionId}`);

      if (result.type === 'oauth') {
        res.json({ url: result.url, sessionId: result.sessionId });
      } else {
        res.json(result);
      }
    } catch (err: any) {
      console.error('[POST /start] Error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /callback — OAuth redirect from VerID
  app.get('/callback', async (req, res) => {
    try {
      console.log('[GET /callback] query:', req.query);
      const searchParams = new URLSearchParams(
        Object.entries(req.query).map(([k, v]) => [k, String(v)]) as [string, string][],
      );
      const result = await arc.provider.callback(searchParams);

      const redirectBase = process.env.ARC_REDIRECT_URL ?? '/';
      const sep = redirectBase.includes('?') ? '&' : '?';
      res.redirect(302, `${redirectBase}${sep}status=${result.success}`);
    } catch (err: any) {
      console.error('[GET /callback] Error:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  app.listen(port, () => {
    console.log(`\nARC server running on http://localhost:${port}`);
    console.log('  POST /start     — begin issuance (body: { id, source? })');
    console.log('  GET  /callback  — OAuth redirect from VerID');
    console.log('  GET  /debug     — product attestation overview');
    console.log('  GET  /health    — health check\n');
  });
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
