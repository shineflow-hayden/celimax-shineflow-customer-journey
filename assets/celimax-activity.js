(() => {
  'use strict';
  const API = '/api/admin';
  const SESSION_KEY = 'celimax-activity-session-v1';
  let context = null;
  function id() {
    if (window.crypto.randomUUID) return window.crypto.randomUUID();
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (Number(c) ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(c) / 4).toString(16));
  }
  async function api(op, body) {
    if (!/^https?:$/.test(window.location.protocol)) throw new Error('웹사이트에서 이용해주세요.');
    let response;
    try {
      response = await fetch(API + '?op=' + op, { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
    } catch { throw new Error('서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.'); }
    let data;
    try { data = await response.json(); } catch { throw new Error('관리자 기능 설정이 필요합니다. 관리자_적용방법.txt를 확인해주세요.'); }
    if (!response.ok) throw new Error(data.error || '요청을 처리하지 못했습니다.');
    return data;
  }
  window.celimaxAdminLogin = password => api('login', { password });
  window.celimaxRecordAccess = (email, eventType) => {
    let session;
    try { session = sessionStorage.getItem(SESSION_KEY); } catch (_) {}
    if (!/^[0-9a-f-]{36}$/i.test(session || '')) session = id();
    try { sessionStorage.setItem(SESSION_KEY, session); } catch (_) {}
    context = { email, session };
    const event = { email, event_type: eventType, event_id: id(), session_id: session, path: window.location.pathname };
    // Logging failure does not interrupt report viewing or tracker saving.
    api('visit', event).catch(() => {});
  };
  window.celimaxAuditHeaders = () => context ? { 'x-client-info': 'celimax-audit-v1:' + btoa(JSON.stringify(context)) } : {};
  window.celimaxClearAccessContext = () => {
    context = null;
    try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
  };
})();
