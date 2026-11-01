// CDP smoke-test: Network-Project мобильная шапка (бургер → X, компактный режим Pro/Новичок)
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PAGE = 'file:///c:/Users/Lep4i/Desktop/My%20GitHub/Network-Project/index.html';
const PORT = 9377;
const SHOT_DIR = process.env.TEMP + '\\network-header-shots';

let failures = 0;
function check(name, cond, extra = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'} — ${name}${extra ? ` :: ${extra}` : ''}`);
  if (!cond) failures++;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await mkdir(SHOT_DIR, { recursive: true });
const proc = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TEMP}\\np-header-profile`,
    '--no-first-run',
    '--no-default-browser-check',
    PAGE,
  ],
  { stdio: ['ignore', 'pipe', 'pipe'] },
);
let stderr = '';
proc.stderr.on('data', (d) => (stderr += d));

// ждём CDP-таргет страницы
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(250);
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    target = list.find((t) => t.type === 'page' && t.url.startsWith('file://'));
  } catch {}
}
if (!target) {
  console.error('CDP target not found\n', stderr.slice(-2000));
  proc.kill();
  process.exit(2);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
let idc = 0;
const pending = new Map();
const events = [];
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = ++idc;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id);
    pending.delete(m.id);
    m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result);
  } else events.push(m);
};
await new Promise((r) => (ws.onopen = r));

await send('Runtime.enable');
await send('Page.enable');
await send('Log.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });

for (let i = 0; i < 40; i++) {
  try {
    const r = await send('Runtime.evaluate', { expression: 'document.readyState', returnByValue: true });
    if (r.result.value === 'complete') break;
  } catch {}
  await sleep(250);
}
await sleep(900); // settle: шрифты, SVG-фон

async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
async function shot(name, h = 260) {
  const r = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 375, height: h, scale: 1 } });
  await writeFile(`${SHOT_DIR}\\${name}`, Buffer.from(r.data, 'base64'));
}

/* ============ 1. Шапка @375px: нет переполнения/наложений ============ */
const m1 = await ev(`(() => {
  const hi = document.querySelector('.header-inner');
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, right: b.right, cy: b.top + b.height / 2, w: b.width }; };
  const els = { brand: r(document.querySelector('.header-brand')), mode: r(document.getElementById('modeToggle')),
                searchBtn: r(document.querySelector('.mobile-search-btn')), burger: r(document.getElementById('mobileMenuBtn')) };
  return { overflow: hi.scrollWidth - hi.clientWidth, vw: innerWidth, els,
    modeOptDisplay: getComputedStyle(document.querySelector('.mode-opt')).display,
    iconProOpacity: getComputedStyle(document.querySelector('.mode-icon-pro')).opacity,
    iconFullOpacity: getComputedStyle(document.querySelector('.mode-icon-full')).opacity,
    // display:none убивает иконки независимо от opacity — проверяем и реальный размер
    iconFullBox: (() => { const b = document.querySelector('.mode-icon-full').getBoundingClientRect(); return Math.round(b.width); })(),
    iconProBox: (() => { const b = document.querySelector('.mode-icon-pro').getBoundingClientRect(); return Math.round(b.width); })(),
    ariaLabel: document.getElementById('modeToggle').getAttribute('aria-label') || null,
  };
})()`);

check('нет горизонтального переполнения шапки @375', m1.overflow <= 1, `overflow=${m1.overflow}px`);
for (const [n, r] of Object.entries(m1.els)) check(`${n} влезает в viewport`, r.x >= -0.5 && r.right <= m1.vw + 0.5, JSON.stringify(r));
{
  const names = Object.keys(m1.els);
  let overlap = null;
  for (let i = 0; i < names.length; i++)
    for (let j = i + 1; j < names.length; j++) {
      const a = m1.els[names[i]], b = m1.els[names[j]];
      if (a.x < b.right && b.x < a.right) overlap = `${names[i]}×${names[j]}`;
    }
  check('элементы шапки не накладываются', !overlap, overlap || 'ok');
}
check('кнопки выровнены по вертикальному центру', Math.max(...Object.values(m1.els).map((r) => r.cy)) - Math.min(...Object.values(m1.els).map((r) => r.cy)) <= 1);
check('текст Pro/Новичок скрыт на мобильном', m1.modeOptDisplay === 'none');
check('по умолчанию иконка «Новичок» видна (размер > 0), Pro скрыта', m1.iconFullOpacity === '1' && m1.iconFullBox > 8 && m1.iconProOpacity === '0');
check('aria-label у компактной кнопки есть', !!m1.ariaLabel);
/* ============ 2. Бургер: закрытое состояние (3 горизонтальные линии) ============ */
async function lineGeom() {
  return ev(`(() => {
    const svg = document.querySelector('.mobile-menu-btn svg');
    const sr = svg.getBoundingClientRect();
    const s = sr.width / 24;
    return { s, lines: [...svg.querySelectorAll('line')].map((l) => {
      const r = l.getBoundingClientRect();
      return { w: r.width, h: r.height, cx: r.left + r.width / 2 - sr.left, cy: r.top + r.height / 2 - sr.top };
    }) };
  })()`);
}

const closed1 = await lineGeom();
{
  const L = closed1.lines;
  check('3 линии горизонтальны (закрыто)', L.every((l) => l.w > 12 * closed1.s && l.h < 4 * closed1.s));
  check('порядок линий верх/середина/низ', L[0].cy < L[1].cy - 1 && L[1].cy < L[2].cy - 1, JSON.stringify(L.map((l) => +l.cy.toFixed(1))));
  const expect = [6, 12, 18].map((u) => u * closed1.s);
  check('линии на своих местах (y=6/12/18)', L.every((l, i) => Math.abs(l.cy - expect[i]) <= 0.8), JSON.stringify(L.map((l) => `${(l.cy / closed1.s).toFixed(1)}u`)));
}
await shot('1-mobile-closed.png');

/* ============ 3. Бургер: открытое состояние (X посередине кнопки) ============ */
await ev(`document.getElementById('mobileMenuBtn').click()`);
await sleep(500);
const open = await lineGeom();
const m2 = await ev(`({
  sidebarOpen: document.getElementById('sidebar').classList.contains('open'),
  bodyMenuOpen: document.body.classList.contains('menu-open'),
  backdropActive: !!document.querySelector('.sidebar-backdrop')?.classList.contains('active'),
  btnActive: document.getElementById('mobileMenuBtn').classList.contains('active'),
  midOpacity: getComputedStyle(document.querySelectorAll('.mobile-menu-btn svg line')[1]).opacity,
})`);

check('сайдбар открылся', m2.sidebarOpen && m2.bodyMenuOpen && m2.backdropActive);
{
  const [top, ,bot] = open.lines; // lines[0]=верхняя, lines[2]=нижняя (средняя скрыта)
  check('диагонали пересекаются в центре кнопки', Math.abs(top.cx - 12 * open.s) <= 0.7 && Math.abs(top.cy - 12 * open.s) <= 0.7 && Math.abs(bot.cx - 12 * open.s) <= 0.7 && Math.abs(bot.cy - 12 * open.s) <= 0.7, JSON.stringify({ top: [top.cx.toFixed(1), top.cy.toFixed(1)], bot: [bot.cx.toFixed(1), bot.cy.toFixed(1)], center: (12 * open.s).toFixed(1) }));
  const diag = Math.SQRT2 / 2; // стороны bbox диагонали длиной 18u
  check('диагонали корректной длины (~45°)', [top, bot].every((l) => Math.abs(l.w - 18 * diag * open.s) <= 0.9 && Math.abs(l.h - 18 * diag * open.s) <= 0.9), JSON.stringify([top, bot].map((l) => `${l.w.toFixed(1)}x${l.h.toFixed(1)}`)));
  check('средняя линия скрыта', m2.midOpacity === '0');
}
await shot('2-mobile-burger-open.png');

/* ============ 4. Повторный клик — обратно в 3 линии ============ */
await ev(`document.getElementById('mobileMenuBtn').click()`);
await sleep(500);
const closed2 = await lineGeom();
const m3 = await ev(`({
  sidebarOpen: document.getElementById('sidebar').classList.contains('open'),
  bodyMenuOpen: document.body.classList.contains('menu-open'),
})`);
check('сайдбар закрылся', !m3.sidebarOpen && !m3.bodyMenuOpen);
{
  const L = closed2.lines;
  check('линии вернулись в горизонталь', L.every((l) => l.w > 12 * closed2.s && l.h < 4 * closed2.s));
  check('позиции линий как до открытия', Math.abs(L[0].cy - closed1.lines[0].cy) <= 0.6 && Math.abs(L[2].cy - closed1.lines[2].cy) <= 0.6);
}
/* ============ 5. Компактный режим Pro/Новичок: переключение и поведение ============ */
await ev(`document.getElementById('modeToggle').click()`);
await sleep(400);
const m4 = await ev(`({
  proMode: document.body.classList.contains('pro-mode'),
  ariaPressed: document.getElementById('modeToggle').getAttribute('aria-pressed'),
  iconProOpacity: getComputedStyle(document.querySelector('.mode-icon-pro')).opacity,
  iconFullOpacity: getComputedStyle(document.querySelector('.mode-icon-full')).opacity,
  iconProBox: (() => { const b = document.querySelector('.mode-icon-pro').getBoundingClientRect(); return Math.round(b.width); })(),
  beginnerHidden: (() => { const el = document.querySelector('.beginner-content'); return el ? getComputedStyle(el).display === 'none' : true; })(),
})`);
check('pro-mode включился', m4.proMode && m4.ariaPressed === 'true');
check('иконка сменилась на «Pro» (молния, размер > 0)', m4.iconProOpacity === '1' && m4.iconProBox > 8 && m4.iconFullOpacity === '0');
check('в pro-режиме .beginner-content скрыт', m4.beginnerHidden);
await shot('3-mobile-mode-pro.png');

await ev(`document.getElementById('modeToggle').click()`);
await sleep(400);
const m5 = await ev(`({
  proMode: document.body.classList.contains('pro-mode'),
  iconProOpacity: getComputedStyle(document.querySelector('.mode-icon-pro')).opacity,
  iconFullOpacity: getComputedStyle(document.querySelector('.mode-icon-full')).opacity,
})`);
check('повторный клик возвращает режим «Новичок»', !m5.proMode && m5.iconFullOpacity === '1' && m5.iconProOpacity === '0');

/* ============ 6. Ультра-узкий viewport @360px ============ */
await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 740, deviceScaleFactor: 2, mobile: true });
await sleep(400);
const m6 = await ev(`(() => {
  const hi = document.querySelector('.header-inner');
  const r = (s) => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.left, right: b.right }; };
  return { overflow: hi.scrollWidth - hi.clientWidth, vw: innerWidth,
    els: { brand: r('.header-brand'), mode: r('#modeToggle'), searchBtn: r('.mobile-search-btn'), burger: r('#mobileMenuBtn') } };
})()`);
check('нет переполнения шапки @360', m6.overflow <= 1, `overflow=${m6.overflow}px`);
for (const [n, r] of Object.entries(m6.els)) check(`@360 ${n} влезает`, r.x >= -0.5 && r.right <= m6.vw + 0.5, JSON.stringify(r));

/* ============ 7. Ошибки консоли/JS за весь сценарий ============ */
const jsExceptions = [];
const consoleErrors = [];
for (const e of events) {
  if (e.method === 'Runtime.exceptionThrown') jsExceptions.push(JSON.stringify(e.params.exceptionDetails?.exception?.description || e.params).slice(0, 200));
  if (e.method === 'Log.entryAdded' && e.params.entry.level === 'error') consoleErrors.push(String(e.params.entry.text).slice(0, 200));
}
check('нет JS-исключений', jsExceptions.length === 0, jsExceptions.join(' | '));
check('нет ошибок в консоли/логировании', consoleErrors.length === 0, consoleErrors.join(' | '));

console.log(`\nСкриншоты: ${SHOT_DIR}`);
ws.close();
proc.kill();
process.exit(failures ? 1 : 0);