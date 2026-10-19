/**
 * INTERACTIVE COMPUTER NETWORKS TEXTBOOK (ИНТЕРАКТИВНЫЙ УЧЕБНИК)
 * script.js - Core UI & Interaction Logic
 * Features: Live Search, ScrollSpy, Code Copy, Progress Bar, Mobile Drawer
 */

document.addEventListener('DOMContentLoaded', () => {
  initProgressBar();
  initLiveSearch();
  initScrollSpy();
  initCodeCopy();
  initMobileMenu();
  initKeyboardShortcuts();
  initCidrCalculator();
  initPortLookup();
  initSvgViewer();
  initCardTools();
});

/* ==========================================================================
   1. READING PROGRESS BAR
   ========================================================================== */
function initProgressBar() {
  const progressBar = document.getElementById('scrollProgressBar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  }, { passive: true });
}

/* ==========================================================================
   2. LIVE SEARCH & FILTERING
   ========================================================================== */
function initLiveSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  const noResultsPanel = document.getElementById('noResultsPanel');
  const cards = document.querySelectorAll('.academic-card, .diagram-card');
  const sections = document.querySelectorAll('.academic-section');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    let totalVisible = 0;

    if (!query) {
      // Show everything
      cards.forEach(card => card.classList.remove('hidden'));
      sections.forEach(sec => sec.classList.remove('hidden'));
      if (noResultsPanel) noResultsPanel.classList.remove('visible');
      return;
    }

    // Filter cards
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const matches = text.includes(query);
      if (matches) {
        card.classList.remove('hidden');
        totalVisible++;
      } else {
        card.classList.add('hidden');
      }
    });

    // Check each section: if all cards inside are hidden, hide section header
    sections.forEach(sec => {
      const visibleChildCards = sec.querySelectorAll('.academic-card:not(.hidden), .diagram-card:not(.hidden)');
      if (visibleChildCards.length === 0) {
        sec.classList.add('hidden');
      } else {
        sec.classList.remove('hidden');
      }
    });

    // Show/hide empty state
    if (noResultsPanel) {
      if (totalVisible === 0) {
        noResultsPanel.classList.add('visible');
      } else {
        noResultsPanel.classList.remove('visible');
      }
    }
  });

  // Clear on Escape
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input'));
      searchInput.blur();
    }
  });
}

/* ==========================================================================
   3. SCROLLSPY (SIDEBAR ACTIVE HIGHLIGHT)
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('.academic-section');
  const navLinks = document.querySelectorAll('.sidebar-nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${id}`) {
            link.classList.add('active');
            // Ensure visible in sidebar viewport
            link.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/* ==========================================================================
   4. COPY CODE SNIPPETS
   ========================================================================== */
function initCodeCopy() {
  document.addEventListener('click', async (e) => {
    const copyBtn = e.target.closest('.code-copy-btn');
    if (!copyBtn) return;

    const codeWrapper = copyBtn.closest('.code-block-wrapper');
    if (!codeWrapper) return;

    const codeElem = codeWrapper.querySelector('pre code') || codeWrapper.querySelector('pre');
    if (!codeElem) return;

    const textToCopy = codeElem.innerText;

    try {
      await navigator.clipboard.writeText(textToCopy);
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = '<span>✓</span> Скопировано!';
      copyBtn.classList.add('copied');

      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  });
}

/* ==========================================================================
   5. MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');

  if (!menuBtn || !sidebar) return;

  // Create backdrop element
  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  backdrop.style.cssText = `
    position: fixed;
    top: 72px;
    left: 0;
    width: 100vw;
    height: calc(100vh - 72px);
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    z-index: 98;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  `;
  document.body.appendChild(backdrop);

  function openSidebar() {
    sidebar.classList.add('open');
    backdrop.style.opacity = '1';
    backdrop.style.pointerEvents = 'auto';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.style.opacity = '0';
    backdrop.style.pointerEvents = 'none';
  }

  menuBtn.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  backdrop.addEventListener('click', closeSidebar);

  // Close on nav link click in mobile
  const navLinks = sidebar.querySelectorAll('.sidebar-nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        closeSidebar();
      }
    });
  });
}

/* ==========================================================================
   6. GLOBAL KEYBOARD SHORTCUTS
   ========================================================================== */
function initKeyboardShortcuts() {
  const searchInput = document.getElementById('globalSearchInput');
  if (!searchInput) return;

  window.addEventListener('keydown', (e) => {
    // '/' or 'Ctrl+K' / 'Cmd+K' to focus search
    if ((e.key === '/' && document.activeElement !== searchInput) || 
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });
}

/* ==========================================================================
   7. INTERACTIVE CIDR / VLSM SUBNET CALCULATOR
   ========================================================================== */
function initCidrCalculator() {
  const ipInput = document.getElementById('cidrIpInput');
  const prefixSelect = document.getElementById('cidrPrefixSelect');
  const prefixSlider = document.getElementById('cidrPrefixSlider');
  const sliderLabel = document.getElementById('cidrSliderLabel');

  if (!ipInput || !prefixSelect || !prefixSlider) return;

  // Output elements
  const elNet = document.getElementById('calcResNetwork');
  const elBcast = document.getElementById('calcResBroadcast');
  const elMask = document.getElementById('calcResMask');
  const elWildcard = document.getElementById('calcResWildcard');
  const elRange = document.getElementById('calcResRange');
  const elHosts = document.getElementById('calcResHosts');
  const elScope = document.getElementById('calcResScope');
  const elBinIp = document.getElementById('calcBinIp');
  const elBinMask = document.getElementById('calcBinMask');
  const resPlain = document.getElementById('calcResPlainText');

  // Валидация ввода: плашка с ошибкой + подсветка поля IP
  const errorBox = document.getElementById('cidrError');
  const errorMsg = errorBox ? errorBox.querySelector('.calc-error-msg') : null;

  function ipToInt(ipStr) {
    const parts = ipStr.trim().split('.');
    if (parts.length !== 4) return null;
    let res = 0;
    for (let i = 0; i < 4; i++) {
      // Строгий формат октета: только цифры (без пробелов, знаков и «хвостов» вроде «5x»)
      if (!/^\d{1,3}$/.test(parts[i])) return null;
      const n = parseInt(parts[i], 10);
      if (n > 255) return null;
      res = (res << 8) | n;
    }
    return (res >>> 0);
  }

  function ipErrorMessage(rawIp) {
    if (!rawIp) return 'Введите IPv4-адрес';
    const parts = rawIp.split('.');
    if (parts.length !== 4) return 'Ожидается формат a.b.c.d — четыре октета, разделённые точками';
    for (const p of parts) {
      if (!/^\d{1,3}$/.test(p)) return `Некорректный октет «${p}» — допустимы только цифры`;
      if (parseInt(p, 10) > 255) return `Октет ${p} вне диапазона 0–255`;
    }
    return null;
  }

  function intToIp(intVal) {
    return [
      (intVal >>> 24) & 255,
      (intVal >>> 16) & 255,
      (intVal >>> 8) & 255,
      intVal & 255
    ].join('.');
  }

  function intToBinary(intVal) {
    const b = (intVal >>> 0).toString(2).padStart(32, '0');
    return `${b.slice(0, 8)}.${b.slice(8, 16)}.${b.slice(16, 24)}.${b.slice(24, 32)}`;
  }

  function getScope(intVal) {
    const o1 = (intVal >>> 24) & 255;
    const o2 = (intVal >>> 16) & 255;
    if (o1 === 10) return 'Приватный (RFC 1918, Класс A)';
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return 'Приватный (RFC 1918, Класс B)';
    if (o1 === 192 && o2 === 168) return 'Приватный (RFC 1918, Класс C)';
    if (o1 === 127) return 'Loopback (127.0.0.0/8)';
    if (o1 === 100 && o2 >= 64 && o2 <= 127) return 'CGNAT (RFC 6598)';
    if (o1 === 169 && o2 === 254) return 'Link-Local (APIPA)';
    if (o1 >= 224 && o1 <= 239) return 'Multicast (Класс D)';
    if (o1 >= 240) return 'Experimental (Класс E)';
    return 'Публичный (Internet Routable)';
  }

  function update() {
    let rawIp = ipInput.value.trim();
    let prefix = parseInt(prefixSelect.value, 10);
    let prefixError = null;

    // If user pasted CIDR notation e.g. 192.168.1.50/26
    if (rawIp.includes('/')) {
      const tokens = rawIp.split('/');
      rawIp = tokens[0].trim();
      const pRaw = (tokens[1] || '').trim();
      if (pRaw !== '') {
        const p = parseInt(pRaw, 10);
        if (/^\d{1,2}$/.test(pRaw) && p >= 0 && p <= 32) {
          prefix = p;
        } else {
          prefixError = `Некорректный префикс «/${pRaw}» — допустимо /0…/32`;
        }
      }
    }

    if (sliderLabel) sliderLabel.textContent = `/${prefix}`;
    prefixSlider.value = prefix;
    prefixSelect.value = prefix;

    const ipInt = ipToInt(rawIp);
    const ipError = ipInt === null ? ipErrorMessage(rawIp) : null;

    // Состояние валидации: плашка с ошибкой + подсветка поля ввода
    if (errorMsg) {
      errorMsg.textContent = ipError || prefixError || '';
      errorBox.classList.toggle('visible', !!(ipError || prefixError));
    }
    ipInput.classList.toggle('calc-input-invalid', !!ipError);

    if (ipInt === null) {
      // Сбрасываем все результаты, чтобы не оставались «старые» значения
      [elNet, elBcast, elMask, elWildcard, elRange, elHosts, elScope, elBinIp, elBinMask, resPlain]
        .forEach(el => { if (el) el.textContent = '—'; });
      return;
    }

    const maskInt = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
    const wildcardInt = (~maskInt) >>> 0;
    const netInt = (ipInt & maskInt) >>> 0;
    const bcastInt = (netInt | wildcardInt) >>> 0;

    const totalIps = Math.pow(2, 32 - prefix);
    let usableHosts = 0;
    let firstHostInt = 0;
    let lastHostInt = 0;

    if (prefix === 32) {
      usableHosts = 1;
      firstHostInt = netInt;
      lastHostInt = netInt;
    } else if (prefix === 31) {
      usableHosts = 2; // RFC 3021
      firstHostInt = netInt;
      lastHostInt = bcastInt;
    } else {
      usableHosts = totalIps - 2;
      firstHostInt = netInt + 1;
      lastHostInt = bcastInt - 1;
    }

    if (elNet) elNet.textContent = `${intToIp(netInt)} /${prefix}`;
    if (elBcast) elBcast.textContent = intToIp(bcastInt);
    if (elMask) elMask.textContent = `${intToIp(maskInt)} (0x${maskInt.toString(16).toUpperCase()})`;
    if (elWildcard) elWildcard.textContent = intToIp(wildcardInt);
    if (elRange) elRange.textContent = `${intToIp(firstHostInt)} — ${intToIp(lastHostInt)}`;
    if (elHosts) elHosts.textContent = `${usableHosts.toLocaleString()} полезных (из ${totalIps.toLocaleString()})`;
    if (elScope) elScope.textContent = getScope(ipInt);
    if (elBinIp) elBinIp.textContent = intToBinary(ipInt);

    // Plain-language explanation for beginners
    if (resPlain) {
      resPlain.textContent = describeCidrInPlainWords(prefix, intToIp(netInt), intToIp(bcastInt), totalIps);
    }
    if (elBinMask) elBinMask.textContent = intToBinary(maskInt);
  }

  ipInput.addEventListener('input', update);
  prefixSelect.addEventListener('change', (e) => {
    prefixSlider.value = e.target.value;
    update();
  });
  prefixSlider.addEventListener('input', (e) => {
    prefixSelect.value = e.target.value;
    update();
  });

  // Run on start
  update();
}

/* ==========================================================================
   8. INTERACTIVE WELL-KNOWN PORTS DIRECTORY
   ========================================================================== */
function initPortLookup() {
  const searchInput = document.getElementById('portLookupSearch');
  const filterBtns = document.querySelectorAll('.port-filter-btn');
  const tableRows = document.querySelectorAll('.port-data-row');

  if (!searchInput || !tableRows.length) return;

  let currentCategory = 'all';

  function filterTable() {
    const query = searchInput.value.trim().toLowerCase();

    tableRows.forEach(row => {
      const cat = row.getAttribute('data-port-cat');
      const text = row.textContent.toLowerCase();

      const matchesQuery = !query || text.includes(query);
      const matchesCat = currentCategory === 'all' || cat === currentCategory;

      if (matchesQuery && matchesCat) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  searchInput.addEventListener('input', filterTable);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'all';
      filterTable();
    });
  });
}

/* ==========================================================================
   9. SVG FULLSCREEN VIEWER (тап по диаграмме → полноэкранный zoom/pan)
   Мобильные: pinch-zoom + перетаскивание; десктоп: колесо мыши + drag.
   Двойной тап / dblclick — сброс к исходному размеру или зум ×2.
   ========================================================================== */
function initSvgViewer() {
  const containers = document.querySelectorAll('.svg-container');
  if (!containers.length) return;

  let overlay, stage, closeBtn;
  let scale = 1, tx = 0, ty = 0;
  let fitScale = 1;
  const pointers = new Map();
  let pinchDist = 0, pinchScale = 1;
  let lastTapAt = 0, tapX = 0, tapY = 0;

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'svg-viewer';
    overlay.innerHTML =
      '<button class="svg-viewer-close" type="button" aria-label="Закрыть просмотр">✕</button>' +
      '<div class="svg-viewer-stage"></div>' +
      '<span class="svg-viewer-hint">щипок / колесо — масштаб · перетаскивание — сдвиг · двойной тап — сброс</span>';
    stage = overlay.querySelector('.svg-viewer-stage');
    closeBtn = overlay.querySelector('.svg-viewer-close');
    document.body.appendChild(overlay);

    closeBtn.addEventListener('click', closeViewer);
    overlay.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    overlay.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeViewer();
    });
  }

  function applyTransform() {
    stage.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  // Вписать SVG во вьюпорт с отступами по краям
  function resetView() {
    const svg = stage.querySelector('svg');
    if (!svg || !svg.viewBox) return;
    const w = svg.viewBox.baseVal.width, h = svg.viewBox.baseVal.height;
    const pad = Math.min(24, window.innerWidth * 0.06);
    fitScale = Math.min((window.innerWidth - pad * 2) / w, (window.innerHeight - pad * 2) / h);
    scale = fitScale;
    tx = (window.innerWidth - w * scale) / 2;
    ty = (window.innerHeight - h * scale) / 2;
    applyTransform();
  }

  function openViewer(sourceSvg) {
    if (!overlay) buildOverlay();
    stage.innerHTML = '';
    const clone = sourceSvg.cloneNode(true);
    clone.removeAttribute('width');
    clone.style.width = `${sourceSvg.viewBox.baseVal.width}px`;
    clone.style.height = 'auto';
    stage.appendChild(clone);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    resetView();
  }

  function closeViewer() {
    if (!overlay || !overlay.classList.contains('open')) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function clampScale(s) {
    return Math.min(Math.max(s, fitScale * 0.5), fitScale * 8);
  }

  // Зум с фиксацией точки (cx, cy) на экране
  function zoomAt(cx, cy, factor) {
    const ns = clampScale(scale * factor);
    const k = ns / scale;
    tx = cx - (cx - tx) * k;
    ty = cy - (cy - ty) * k;
    scale = ns;
    applyTransform();
  }

  function onPointerDown(e) {
    if (!overlay.classList.contains('open')) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDist = Math.hypot(b.x - a.x, b.y - a.y);
      pinchScale = scale;
    } else if (pointers.size === 1) {
      // Двойной тап: сброс к fit или зум ×2 в точке тапа
      const now = Date.now();
      if (now - lastTapAt < 300 && Math.hypot(e.clientX - tapX, e.clientY - tapY) < 24) {
        if (scale > fitScale * 1.25) resetView();
        else zoomAt(e.clientX, e.clientY, 2);
        lastTapAt = 0;
      } else {
        lastTapAt = now;
        tapX = e.clientX;
        tapY = e.clientY;
      }
    }
  }

  function onPointerMove(e) {
    if (!overlay.classList.contains('open') || !pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1) {
      // Перетаскивание одним пальцем / мышью
      tx += e.clientX - prev.x;
      ty += e.clientY - prev.y;
      applyTransform();
    } else if (pointers.size === 2 && pinchDist > 0) {
      // Pinch-zoom двумя пальцами с фиксацией середины жеста
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      if (dist > 0) {
        zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, (pinchScale * (dist / pinchDist)) / scale);
      }
    }
  }

  function onPointerUp(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchDist = 0;
  }

  function onWheel(e) {
    if (!overlay.classList.contains('open')) return;
    e.preventDefault();
    zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.12 : 1 / 1.12);
  }

  // Тап по диаграмме на странице (без скролла) → открыть полноэкранный просмотр
  containers.forEach((c) => {
    const svg = c.querySelector('svg');
    if (!svg) return;
    let downX = 0, downY = 0;
    c.addEventListener('pointerdown', (e) => {
      downX = e.clientX;
      downY = e.clientY;
    });
    c.addEventListener('pointerup', (e) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) < 8) openViewer(svg);
    });
  });

  window.addEventListener('resize', () => {
    if (overlay && overlay.classList.contains('open')) resetView();
  });
}



/* ==========================================================================
   11. CARD TOOLS: favorites & copy link (injected into card headers)
   ========================================================================== */
const FAVORITES_KEY = 'network-project-favorites';

function initCardTools() {
  const cards = document.querySelectorAll('.academic-card, .diagram-card');
  if (!cards.length) return;

  let favs = new Set();
  try {
    const raw = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    if (Array.isArray(raw)) favs = new Set(raw);
  } catch (e) { /* ignore */ }

  cards.forEach((card) => {
    // Stable ID: own id, or generated from the parent section + position
    let cardId = card.id;
    if (!cardId) {
      const sec = card.closest('.academic-section');
      const secId = (sec && sec.id) ? sec.id : 'section';
      const siblings = Array.from((sec || document).querySelectorAll('.academic-card, .diagram-card'));
      cardId = `${secId}-card-${siblings.indexOf(card) + 1}`;
    }

    const header = card.querySelector('.card-header');
    if (!header) return;

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    // Favorite toggle (persisted in localStorage)
    const favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.className = 'card-action-btn' + (favs.has(cardId) ? ' active' : '');
    favBtn.title = 'В избранное / убрать из избранного';
    favBtn.textContent = favs.has(cardId) ? '★' : '☆';
    favBtn.addEventListener('click', () => {
      if (favs.has(cardId)) {
        favs.delete(cardId);
        favBtn.classList.remove('active');
        favBtn.textContent = '☆';
      } else {
        favs.add(cardId);
        favBtn.classList.add('active');
        favBtn.textContent = '★';
      }
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
      } catch (e) { /* ignore */ }
    });

    // Copy link to this card (works with file:// too — keeps current URL, swaps hash)
    const linkBtn = document.createElement('button');
    linkBtn.type = 'button';
    linkBtn.className = 'card-action-btn';
    linkBtn.title = 'Скопировать ссылку на этот блок';
    linkBtn.textContent = '🔗';
    linkBtn.addEventListener('click', () => {
      const url = location.href.split('#')[0] + '#' + cardId;
      copyTextToClipboard(url).then((ok) => {
        if (ok) {
          linkBtn.classList.add('copied');
          linkBtn.textContent = '✓';
          setTimeout(() => {
            linkBtn.classList.remove('copied');
            linkBtn.textContent = '🔗';
          }, 1500);
        }
      });
    });

    actions.appendChild(favBtn);
    actions.appendChild(linkBtn);
    header.appendChild(actions);
  });
}

function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true, () => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
  document.body.removeChild(ta);
  return ok;
}


/* ==========================================================================
   12. CIDR PLAIN-LANGUAGE EXPLANATION (beginner mode)
   ========================================================================== */
function describeCidrInPlainWords(prefix, networkIp, broadcastIp, totalHosts) {
  const netBits = prefix;
  const hostBits = 32 - prefix;

  if (prefix === 0) {
    return `Маска /0 означает: всё IPv4-пространство — все ~4,3 млрд адресов принадлежат одной «улице». Отдельных сетей здесь нет.`;
  }
  if (prefix <= 8) {
    return `Маска /${prefix} — огромная сеть на миллионы адресов (масштаб класса A). Первые ${netBits} бит задают «улицу» (сеть), остальные ${hostBits} — «номер дома».`;
  }
  if (prefix === 32) {
    return `Маска /32 означает: ровно один адрес (${networkIp}) для одного устройства. Соседей и широковещания здесь нет.`;
  }
  if (prefix >= 31) {
    return `Маска /${prefix} — точечная связь между двумя устройствами: всего два адреса — ${networkIp} и ${broadcastIp}.`;
  }

  let what;
  if (prefix <= 12) what = 'очень большая сеть для крупной корпорации или провайдера';
  else if (prefix <= 16) what = 'крупная организация, кампус или дата-центр — десятки тысяч устройств';
  else if (prefix === 24) what = 'типичная домашняя или офисная сеть';
  else if (prefix <= 28) what = 'небольшая команда или лаборатория: десяток-другой устройств';
  else what = 'очень маленькая группа устройств — хватает на несколько машин';

  const usable = totalHosts - 2;
  return `Маска /${prefix} означает: первые ${netBits} бит адреса — это «улица» (сеть), остальные ${hostBits} — «номер дома». Это ${what}: всего ${totalHosts.toLocaleString('ru-RU')} адресов, из них ${usable.toLocaleString('ru-RU')} можно выдать устройствам. Адрес ${networkIp} называет саму улицу, а ${broadcastIp} — это «крик всем на улице» (широковещательный).`;
}
