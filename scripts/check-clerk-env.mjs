import fs from 'fs';

function loadDotenv(p) {
  if (!fs.existsSync(p)) return {};
  const out = {};
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i === -1) continue;
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[line.slice(0, i).trim()] = v;
  }
  return out;
}

function band(key) {
  if (!key) return { present: false };
  const envBand = key.includes('_live_') || key.startsWith('pk_live') || key.startsWith('sk_live')
    ? 'live'
    : key.includes('_test_') || key.startsWith('pk_test') || key.startsWith('sk_test')
      ? 'test'
      : 'unknown';
  return {
    present: true,
    envBand,
    len: key.length,
    fingerprint: `${key.slice(0, 8)}…${key.slice(-6)}`,
  };
}

const backend = loadDotenv('backend/.env');
const fe = fs.existsSync('frontend/.env.local')
  ? loadDotenv('frontend/.env.local')
  : loadDotenv('frontend/.env');

const sk = backend.CLERK_SECRET_KEY;
const pkBack = backend.CLERK_PUBLISHABLE_KEY || backend.VITE_CLERK_PUBLISHABLE_KEY;
const pkFront = fe.VITE_CLERK_PUBLISHABLE_KEY || fe.CLERK_PUBLISHABLE_KEY;

const skB = band(sk);
const pkBackB = band(pkBack);
const pkFrontB = band(pkFront);

const hasFrontPk = !!(pkFront && String(pkFront).trim());
const hasSk = !!(sk && String(sk).trim());

let problem = null;
if (!hasFrontPk) problem = 'frontend missing VITE_CLERK_PUBLISHABLE_KEY (frontend/.env or frontend/.env.local)';
else if (!hasSk) problem = 'backend missing CLERK_SECRET_KEY';
else if (
  skB.envBand !== 'unknown' &&
  pkFrontB.envBand !== 'unknown' &&
  skB.envBand !== pkFrontB.envBand
)
  problem = 'test/live mismatch: CLERK_SECRET_KEY and frontend publishable key are from different environments';
else if (
  pkBack &&
  pkFront &&
  String(pkBack).trim() !== String(pkFront).trim()
)
  problem =
    'backend CLERK_PUBLISHABLE_KEY does not equal frontend VITE_CLERK_PUBLISHABLE_KEY (they must be the same pk_* from one Clerk app for sanity checks)';
else problem = null;

console.log(
  JSON.stringify(
    {
      backendSecret: skB,
      backendOptionalPublishable: pkBackB,
      frontendPublishable: pkFrontB,
      frontendEnvFile: fs.existsSync('frontend/.env.local') ? 'frontend/.env.local' : 'frontend/.env',
      problem,
      fix: [
        'Open Clerk Dashboard → API Keys and copy the same application’s keys.',
        'backend/.env: CLERK_SECRET_KEY=sk_…',
        'frontend/.env (or .env.local): VITE_CLERK_PUBLISHABLE_KEY=pk_…',
        'Optional: set backend CLERK_PUBLISHABLE_KEY to the same pk_ as the frontend so startup logs can warn on mismatch.',
      ],
    },
    null,
    2
  )
);
