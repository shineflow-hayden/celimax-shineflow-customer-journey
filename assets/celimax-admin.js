(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fields = { product_name: '제품명', area: '구분', action_title: '액션아이템', action_detail: '상세 내용', assignee: '담당자', planned_date: '반영 예정일', is_done: '완료 상태', result: '반영 후 결과', sort_order: '표시 순서', is_deleted: '삭제 상태' };
  const types = { create: '추가', update: '수정', delete: '삭제', restore: '복원', reorder: '순서 변경' };
  const timeFormat = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  let type = 'access', cursor = null, nextCursor = null, previous = [], loading = false, requestId = 0;
  let filter = {};
  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function showLogin(message = '') {
    requestId++;
    $('admin-dashboard').hidden = true;
    $('admin-sign-out').hidden = true;
    $('admin-login').hidden = false;
    $('records-body').replaceChildren();
    $('admin-password').value = '';
    $('admin-login-error').textContent = message;
  }
  async function api(op, params = {}, post = false) {
    const url = '/api/admin?' + new URLSearchParams({ op, ...params });
    let response;
    try { response = await fetch(url, { method: post ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(12000), ...(post ? { headers: { 'Content-Type': 'application/json' }, body: '{}' } : {}) }); }
    catch { throw new Error('서버에 연결하지 못했습니다. 잠시 후 다시 시도해주세요.'); }
    let data;
    try { data = await response.json(); } catch { throw new Error('관리자 기능 설정이 필요합니다. 관리자_적용방법.txt를 확인해주세요.'); }
    if (!response.ok) { const error = new Error(data.error || '기록을 불러오지 못했습니다.'); error.status = response.status; throw error; }
    return data;
  }
  function display(value, field) {
    if (value === null || value === undefined || value === '') return '미입력';
    if (field === 'is_done') return value ? '완료' : '미완료';
    if (field === 'is_deleted') return value ? '삭제됨' : '표시 중';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
  function changes(record) {
    const detail = node('details');
    const keys = Array.isArray(record.changed_fields) ? record.changed_fields : [];
    detail.append(node('summary', `변경 내용 보기 (${keys.length})`));
    const list = node('div', undefined, 'change-list');
    for (const key of keys) {
      const item = node('div', undefined, 'change');
      item.append(node('div', fields[key] || key, 'change-label'));
      const values = node('div', undefined, 'change-values');
      for (const [label, source] of [['변경 전', record.before_values], ['변경 후', record.after_values]]) {
        const block = node('div');
        block.append(node('span', label), node('p', display(source?.[key], key)));
        values.append(block);
      }
      item.append(values); list.append(item);
    }
    detail.append(list); return detail;
  }
  function render(rows) {
    const tr = node('tr');
    const headings = type === 'access' ? ['접속 시간', '이메일', '마켓', '자료', '접속 경로'] : ['변경 시간', '수정자', '마켓', '변경 구분', '액션아이템, 변경 내용'];
    for (const heading of headings) tr.append(node('th', heading));
    $('records-head').replaceChildren(tr);
    const fragment = document.createDocumentFragment();
    for (const record of rows) {
      const row = node('tr');
      const date = new Date(record.occurred_at);
      row.append(node('td', Number.isNaN(date.getTime()) ? '-' : timeFormat.format(date), 'time-cell'));
      const email = node('td', type === 'access' ? record.email : record.actor_email || '미확인', 'email-cell');
      if (type === 'audit' && !record.actor_email) email.append(node('div', '페이지 외 변경 또는 이메일 정보 없음', 'muted'));
      row.append(email);
      const market = node('td'); market.append(node('span', record.market, 'badge' + (record.market === 'JP' ? ' jp' : ''))); row.append(market);
      if (type === 'access') {
        row.append(node('td', record.report_month || '-'));
        const path = node('td', record.event_type === 'login' ? '로그인' : '페이지 접속');
        path.append(node('div', record.path, 'muted')); row.append(path);
      } else {
        row.append(node('td', types[record.event_type] || record.event_type));
        const task = node('td');
        const product = (record.product_name || '').replace(/^\d{4}-\d{2}(?: JP)?\s*\|\s*/, '');
        task.append(node('div', [record.report_month, product].filter(Boolean).join(' / '), 'task-product'), node('span', record.action_title || '(제목 없음)', 'task-title'), changes(record));
        row.append(task);
      }
      fragment.append(row);
    }
    $('records-body').replaceChildren(fragment);
    $('records-empty').hidden = rows.length !== 0;
    $('records-table').hidden = rows.length === 0;
  }
  async function load() {
    const attempt = ++requestId;
    loading = true; nextCursor = null;
    $('records-prev').disabled = true; $('records-next').disabled = true;
    $('records-refresh').disabled = true;
    $('records-status').textContent = '기록을 불러오는 중입니다.';
    $('records-error').hidden = true;
    $('records-body').replaceChildren(); $('records-table').hidden = true; $('records-empty').hidden = true;
    try {
      const result = await api('events', { type, ...filter, ...(cursor ? { before: cursor } : {}) });
      if (attempt !== requestId) return;
      render(result.rows);
      nextCursor = result.next_cursor;
      $('records-status').textContent = result.total === null ? `이번 페이지 ${result.rows.length}건` : cursor ? `이전 페이지 이후 ${result.total.toLocaleString()}건, 이번 페이지 ${result.rows.length}건` : `조회 조건에 맞는 기록 ${result.total.toLocaleString()}건, 이번 페이지 ${result.rows.length}건`;
      $('records-empty').textContent = Object.values(filter).some(Boolean) ? '조회 조건에 맞는 기록이 없습니다.' : '아직 저장된 기록이 없습니다. 기능 적용 후 접속과 변경 내역이 여기에 표시됩니다.';
    } catch (error) {
      if (attempt !== requestId) return;
      if (error.status === 401) { showLogin('관리자 로그인이 만료되었습니다. 다시 로그인해주세요.'); return; }
      $('records-status').textContent = '기록을 불러오지 못했습니다.';
      $('records-error').textContent = error.message; $('records-error').hidden = false;
    } finally {
      if (attempt === requestId) {
        loading = false; $('records-refresh').disabled = false;
        $('records-prev').disabled = !previous.length; $('records-next').disabled = !nextCursor;
        $('records-page').textContent = `${previous.length + 1} 페이지`;
      }
    }
  }
  function dashboard() {
    $('admin-login').hidden = true; $('admin-dashboard').hidden = false; $('admin-sign-out').hidden = false;
    load();
  }
  $('admin-login-form').addEventListener('submit', async event => {
    event.preventDefault(); const button = event.submitter || $('admin-login-form').querySelector('button');
    button.disabled = true; $('admin-login-error').textContent = '';
    try { await window.celimaxAdminLogin($('admin-password').value); $('admin-password').value = ''; dashboard(); }
    catch (error) { $('admin-login-error').textContent = error.message; }
    finally { button.disabled = false; }
  });
  $('admin-sign-out').addEventListener('click', async () => {
    $('admin-sign-out').disabled = true;
    try { await api('logout', {}, true); showLogin('로그아웃되었습니다.'); }
    catch (error) { $('records-error').textContent = error.message; $('records-error').hidden = false; }
    finally { $('admin-sign-out').disabled = false; }
  });
  const tabs = [...document.querySelectorAll('[data-record-type]')];
  function selectTab(tab) {
    if (type === tab.dataset.recordType) return;
    type = tab.dataset.recordType;
    for (const item of tabs) { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; }
    $('admin-records').setAttribute('aria-labelledby', tab.id);
    $('records-title').textContent = type === 'access' ? '접속 기록' : '트래커 변경 기록';
    cursor = null; previous = []; load();
  }
  for (const tab of tabs) {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : tabs[(tabs.indexOf(tab) + 1) % tabs.length]; selectTab(next); next.focus(); }
    });
  }
  $('admin-filters').addEventListener('submit', event => {
    event.preventDefault();
    if ($('filter-start').value && $('filter-end').value && $('filter-start').value > $('filter-end').value) { $('records-error').textContent = '시작일과 종료일을 확인해주세요.'; $('records-error').hidden = false; return; }
    filter = { market: $('filter-market').value, start: $('filter-start').value, end: $('filter-end').value, q: $('filter-query').value.trim() };
    cursor = null; previous = []; load();
  });
  $('filter-reset').addEventListener('click', () => { $('admin-filters').reset(); filter = {}; cursor = null; previous = []; load(); });
  $('records-refresh').addEventListener('click', () => { cursor = null; previous = []; load(); });
  $('records-next').addEventListener('click', () => { if (!loading && nextCursor) { previous.push(cursor); cursor = nextCursor; load(); } });
  $('records-prev').addEventListener('click', () => { if (!loading && previous.length) { cursor = previous.pop(); load(); } });
  api('session').then(dashboard).catch(error => showLogin(error.status === 401 ? '' : error.message));
})();
