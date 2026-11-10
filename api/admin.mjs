import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Secrets are read only by this server function. There is no default password.
const COOKIE = '__Host-celimax_admin';
const SESSION_SECONDS = 2 * 60 * 60;
const EMAIL_HASHES = new Set([
  "f8b1ba3109a79d1aad78e6893004ae4e6abcb22a403394d04bde77e3b99451f4",
  "457415f8daf4d1b95642f1a7e133fed779faad2e82eb2d02f19be611c5e4a637",
  "bad5265108c81e9e8b2a212aa4ac62d17db4e9817370404273c876e7474b6fe5",
  "30bdb6403fd62bcb6ee542f2cbfa109bac3f649ff2259c939c796c77ec2c1a39",
  "296eff9f65844c20c57444fe2e641df25e12a1dbf38bedbd5c48dd5da159b0a6",
  "e0da03d90fe998220136d74fd3d379dfaf91234dda434633dc328bc4cbb164dd",
  "b1840edac9ba197df50788b364320d2ce66f8f81995500902f72f78d19c28af8",
  "72a469a7ac83cc377495bf3f39d7c9c433a3f36de7fc345d17a1f01f13851b0d",
  "bc574dfb049c12ec365a93768165ea1ce7f56c13c2d25722f2f99e4ae575c9cf",
  "137812701de478321f87b5293f51b474de1f6445e747e8e6b66489df451811cf",
  "1f0ed1d9ea7aad5dbb5e8a9b6cead2913b8cce84497f3396d6925d7fa0902829",
  "35bfa1d27a373fcec8b445a37d1a64b4c51d183fedb54159fac68294411ad173",
  "64fa3ed2ad8de82862492854b24463ba3fd5e6e73aa022d84329fe24ea7513c5",
  "7f8451128b37fe7d0649adeef56ec35a17fe8dfa81e12bf4ef19ee661b75ce80",
  "224e98880f6d98a560aadc85e49db00ad682fcc1f70ad6de8dcc2ed34c3a5cb6",
  "1dc683ff1be6e7a49eb5e75e2e4914238914487a940ebc4a7e3f2de4fe71eeec",
  "3d248a06d36522e73e58600cfdb710d2a42eea29f321e84ace58d8cb418b742f",
  "e42551f9d9f02608a71dab3e5a7b2c5a63953cb09c406c6740528a58a2596aca",
  "2088ecf5d240ba9faacddb6fce90ddf049e9b2e7f31584889d79dd523d57cf9a",
  "a5daef3e33a7dc50268e81a6e0f6187577dccea73c00b953dd69b828f13ab8d2",
  "9ca2da177d470e7e1c562308acee280f6a6920b5decc03014034eaf663ab8ac1",
  "7a05e4cdd6a4764b5618ca006d70e8bfe532296ef35b9158bc86001ebd6e5531",
  "c3d9ac028fae5b51e7878d013866d8d55c68e7db79e3a24064f0bbd730fdd582",
  "aa7fc4cbd2db98d02dc2dacbc0c5aa3495925a78b913311f44a3375eb9f8755a",
  "c4ae715672860bdfd7e29636def79f821daf78063960ef275c8ca17452448f64",
  "5058ae9c56aadbb944a7dcc6f311edd0b67a99425690758fb6e167d34e584439",
  "59ef3b16bcbfb100b764ab47e01ef4af8eabbfd48a3309bd62dfb0c4addc8379",
  "b5667914552a7db110d21f974ffec8d1cf1dd53d7a5b786efd949009d38769f8",
  "f65d4671bd4923dbac44b5140f085549bbbb807be8be17d013524ebfbf049764",
  "c966b2b9927089d456d27217e9ca908db48dcd39858aeafb9a0e8412b1816419",
  "b83d0c589ec2e5648d4215ffd4ab719394f0bdeb6fb347774574435ac0c878dd",
  "3096f8d894602179234d5327c21a96472c176884a1a6d4041bc276961f81fdfb",
  "5889058999cf541ba488516c04d8c911641552949c5fba8da0719608707a5d0d",
  "5e931078be7f897c8ac3b9059a8adf7302cc0bdfeb9f00f61946d7ba32593862",
  "a02bb8d621d5e7c147eaab608087b368495f07e617b4e28a112614d14fd44cf1",
  "0b46befed2512a42a69cfb4d48ff6c2a094b7b37390dbfd2864f81ccbb2eab61",
  "5bcacb2caac9a00c66343c572021ec21a48ed625d189d131f4c0d69cfc195a57",
  "bc2ce1867e93d3c05f2d4e111f1ba34427d746eeacabc3d30ea15ea40e8bb2e1",
  "688b84ad8da25159646cbce0bc5f3b5f544df763b9252599e0447f4b06c8d852",
  "9277e738bdfc0e10d6e6f24d18af1494ca5736e6d77796d2071f14efebf03094",
  "276b245f6cc0263362745df9c36532b7db31650d2b84343eab900a5a452df33c",
  "e2f0dd2233ce766b1a2364c84b67d539ff2388ec81d0a6c6b88145a35a645956",
  "a34a033dc49fc28300e817d703ff30b5608df3a9f633c83708c4686ea87e1a99",
  "a1a10bfeba0008429fcc106f393d9a89c0b26f80780ce824ebfe555301ecce26",
  "ca82e2d9cf4d7becfe636d82e49fdc2d7a7330ad68f28ce99af22c8e8c283fb4",
  "9479f7c7220ab7c54462531299c8cecb50d23b3ef83f3fef925374aae748304a"
]);
const PATHS = {
  '/': { market: 'US', report_month: '2026-11' },
  '/index.html': { market: 'US', report_month: '2026-11' },
  '/reports/2026-10.html': { market: 'US', report_month: '2026-10' },
  '/reports/2026-11.html': { market: 'US', report_month: '2026-11' },
  '/reports/jp/2026-11.html': { market: 'JP', report_month: '2026-11' }
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
function config() {
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const password = process.env.CELIMAX_ADMIN_PASSWORD;
  const sessionSecret = process.env.CELIMAX_SESSION_SECRET;
  const url = process.env.SUPABASE_URL || 'https://mkuinihocmalpecjunbf.supabase.co';
  if (!secretKey || !password || !sessionSecret || sessionSecret.length < 32) {
    throw new ApiError(503, '관리자 기능 설정이 필요합니다. 관리자_적용방법.txt의 환경 변수를 확인해주세요.');
  }
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)) {
    throw new ApiError(503, 'Supabase 주소 설정을 확인해주세요.');
  }
  return { secretKey, password, sessionSecret, url: url.replace(/\/$/, '') };
}
function digest(text) { return createHash('sha256').update(String(text)).digest(); }
function equal(a, b) { return timingSafeEqual(digest(a), digest(b)); }
function signature(value, cfg) {
  // Rotating either setting also invalidates existing administrator sessions.
  return createHmac('sha256', cfg.sessionSecret).update(digest(cfg.password)).update(value).digest('base64url');
}
function makeSession(cfg) {
  const now = Math.floor(Date.now() / 1000);
  const value = Buffer.from(JSON.stringify({ role: 'admin', iat: now, exp: now + SESSION_SECONDS, nonce: randomBytes(16).toString('hex') })).toString('base64url');
  return value + '.' + signature(value, cfg);
}
function hasSession(request, cfg) {
  try {
    const raw = (request.headers.get('cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
    if (!raw || raw.length > 1024) return false;
    const [value, mac, extra] = raw.split('.');
    if (!value || !mac || extra || !equal(mac, signature(value, cfg))) return false;
    const data = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    return data.role === 'admin' && Number.isInteger(data.iat) && Number.isInteger(data.exp) && data.iat <= now + 10 && data.exp > now && data.exp - data.iat === SESSION_SECONDS;
  } catch { return false; }
}
function cookie(value, maxAge = SESSION_SECONDS) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
function json(data, status = 200, extra = {}) {
  return Response.json(data, { status, headers: {
    'Cache-Control': 'private, no-store, max-age=0',
    'CDN-Cache-Control': 'no-store', 'Vercel-CDN-Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', 'Vary': 'Cookie', ...extra
  } });
}
async function bodyOf(request) {
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) throw new ApiError(415, '요청 형식을 확인해주세요.');
  if (Number(request.headers.get('content-length')) > 4096) throw new ApiError(413, '요청이 너무 깁니다.');
  const text = await request.text();
  if (text.length > 4096) throw new ApiError(413, '요청이 너무 깁니다.');
  try {
    const body = JSON.parse(text);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body;
  } catch { throw new ApiError(400, '요청 내용을 확인해주세요.'); }
}
async function database(cfg, path, options = {}) {
  const headers = { apikey: cfg.secretKey, Accept: 'application/json', ...options.headers };
  if (!cfg.secretKey.startsWith('sb_secret_')) headers.Authorization = 'Bearer ' + cfg.secretKey;
  let response;
  try {
    response = await fetch(cfg.url + '/rest/v1/' + path, { ...options, headers, cache: 'no-store', signal: AbortSignal.timeout(8000) });
  } catch { throw new ApiError(502, '기록 서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.'); }
  if (!response.ok) {
    // Do not echo provider responses, credentials or entered passwords.
    console.error('Celimax activity database request failed', { status: response.status });
    throw new ApiError(503, '기록을 불러오지 못했습니다. 관리자용 SQL과 서버 환경 변수 설정을 확인해주세요.');
  }
  return response;
}
async function rateLimit(request, cfg, kind) {
  // Vercel sets x-forwarded-for at its trusted ingress. Only its HMAC is stored.
  const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim().slice(0, 128);
  const key = createHmac('sha256', cfg.sessionSecret).update(kind + ':' + ip).digest('hex');
  const response = await database(cfg, 'rpc/celimax_activity_rate_limit', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_key: key, p_window_seconds: kind === 'login' ? 900 : 300, p_limit: kind === 'login' ? 10 : 120 })
  });
  if (await response.json() !== true) throw new ApiError(429, '요청이 많습니다. 잠시 후 다시 시도해주세요.');
}
function allowedEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9.-]+$/.test(email)) return null;
  const [local] = email.split('@');
  if (!local || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return null;
  return EMAIL_HASHES.has(digest(email).toString('hex')) ? email : null;
}
function dateBoundary(value, end = false) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new ApiError(400, '조회 날짜를 확인해주세요.');
  const date = new Date(value + 'T00:00:00+09:00');
  if (Number.isNaN(date.getTime()) || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date) !== value) throw new ApiError(400, '조회 날짜를 확인해주세요.');
  if (end) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString();
}
async function events(url, cfg) {
  const type = url.searchParams.get('type') || 'access';
  if (!['access', 'audit'].includes(type)) throw new ApiError(400, '조회 종류를 확인해주세요.');
  const table = type === 'access' ? 'celimax_access_events' : 'celimax_action_audit';
  const select = type === 'access'
    ? 'id,occurred_at,email,event_type,market,report_month,path'
    : 'id,occurred_at,actor_email,actor_kind,task_id,product_name,action_title,market,report_month,event_type,changed_fields,before_values,after_values';
  const params = new URLSearchParams({ select, order: 'id.desc', limit: '51' });
  const start = dateBoundary(url.searchParams.get('start'));
  const end = dateBoundary(url.searchParams.get('end'), true);
  if (start && end && start >= end) throw new ApiError(400, '시작일과 종료일을 확인해주세요.');
  if (start) params.append('occurred_at', 'gte.' + start);
  if (end) params.append('occurred_at', 'lt.' + end);
  const market = url.searchParams.get('market');
  if (market && !['US', 'JP'].includes(market)) throw new ApiError(400, '마켓을 확인해주세요.');
  if (market) params.set('market', 'eq.' + market);
  const before = url.searchParams.get('before');
  if (before && !/^[1-9]\d{0,18}$/.test(before)) throw new ApiError(400, '페이지 정보를 확인해주세요.');
  if (before) params.set('id', 'lt.' + before);
  const query = (url.searchParams.get('q') || '').normalize('NFC').replace(/[^\p{L}\p{N}@._ -]/gu, '').slice(0, 80).trim();
  if (query) {
    const fields = type === 'access' ? ['email', 'path'] : ['actor_email', 'product_name', 'action_title', 'task_id'];
    params.set('or', '(' + fields.map(field => field + '.ilike.*' + query + '*').join(',') + ')');
  }
  const response = await database(cfg, table + '?' + params, { headers: { Prefer: 'count=exact' } });
  const data = await response.json();
  if (!Array.isArray(data)) throw new ApiError(502, '기록 형식을 확인하지 못했습니다.');
  const totalText = (response.headers.get('content-range') || '').split('/')[1];
  const rows = data.slice(0, 50);
  return { rows, has_more: data.length > 50, next_cursor: data.length > 50 ? String(rows.at(-1).id) : null, total: /^\d+$/.test(totalText) ? Number(totalText) : null };
}

export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const op = url.searchParams.get('op') || 'session';
      const site = request.headers.get('sec-fetch-site');
      if (site === 'cross-site') throw new ApiError(403, '이 사이트에서 다시 접속해주세요.');
      if (!['GET', 'POST'].includes(request.method)) return json({ error: '지원하지 않는 요청입니다.' }, 405, { Allow: 'GET, POST' });
      if (request.method === 'POST' && request.headers.get('origin') !== url.origin) throw new ApiError(403, '이 사이트에서 다시 접속해주세요.');
      const cfg = config();
      if (request.method === 'POST' && op === 'login') {
        const body = await bodyOf(request);
        await rateLimit(request, cfg, 'login');
        if (typeof body.password !== 'string' || body.password.length > 254 || !equal(body.password, cfg.password)) throw new ApiError(401, '비밀번호를 확인해주세요.');
        return json({ ok: true }, 200, { 'Set-Cookie': cookie(makeSession(cfg)) });
      }
      if (request.method === 'POST' && op === 'visit') {
        const body = await bodyOf(request);
        const email = allowedEmail(body.email);
        const context = typeof body.path === 'string' && Object.hasOwn(PATHS, body.path) ? PATHS[body.path] : null;
        if (!email || !context || !UUID.test(body.event_id) || !UUID.test(body.session_id) || !['login', 'visit'].includes(body.event_type)) throw new ApiError(400, '접속 정보를 확인해주세요.');
        await rateLimit(request, cfg, 'visit');
        await database(cfg, 'celimax_access_events?on_conflict=event_id', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=minimal' },
          body: JSON.stringify({ event_id: body.event_id, session_id: body.session_id, email, event_type: body.event_type, path: body.path, ...context })
        });
        return json({ ok: true });
      }
      if (request.method === 'POST' && op === 'logout') {
        return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
      }
      if (!hasSession(request, cfg)) throw new ApiError(401, '관리자 로그인이 필요합니다.');
      if (request.method === 'GET' && op === 'session') return json({ ok: true });
      if (request.method === 'GET' && op === 'events') return json(await events(url, cfg));
      throw new ApiError(404, '요청을 찾지 못했습니다.');
    } catch (error) {
      if (!(error instanceof ApiError)) console.error('Celimax activity API failed');
      return json({ error: error instanceof ApiError ? error.message : '처리하지 못했습니다. 잠시 후 다시 시도해주세요.' }, error instanceof ApiError ? error.status : 500);
    }
  }
};
