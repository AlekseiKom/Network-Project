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
  initBackToTop();
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
   2. SMART LIVE SEARCH & KEYWORD DIRECTORY
   ========================================================================== */
function initLiveSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  const dropdown = document.getElementById('searchResultsDropdown');
  const noResultsPanel = document.getElementById('noResultsPanel');
  const cards = document.querySelectorAll('.academic-card, .diagram-card, .tool-card');
  const sections = document.querySelectorAll('.academic-section');

  if (!searchInput) return;

  // Specific high-priority network dictionary
  const KEYWORD_INDEX = [
    // TCP Flags
    { term: 'SYN', title: 'Флаг SYN (Synchronize)', category: 'Флаг TCP', badgeClass: 'badge-tcp', targetId: 'sec-l4', desc: 'Синхронизация номеров ISN, инициирует 3-Way Handshake TCP.' },
    { term: 'ACK', title: 'Флаг ACK (Acknowledgment)', category: 'Флаг TCP', badgeClass: 'badge-tcp', targetId: 'sec-l4', desc: 'Подтверждение получения байтов (поле Acknowledgment Number).' },
    { term: 'FIN', title: 'Флаг FIN (Finish)', category: 'Флаг TCP', badgeClass: 'badge-tcp', targetId: 'sec-l4', desc: 'Инициация корректного закрытия TCP-соединения (4-Way Close).' },
    { term: 'RST', title: 'Флаг RST (Reset)', category: 'Флаг TCP', badgeClass: 'badge-tcp', targetId: 'sec-l4', desc: 'Аварийный немедленный сброс соединения при ошибке или атаке.' },
    { term: 'PSH', title: 'Флаг PSH (Push)', category: 'Флаг TCP', badgeClass: 'badge-tcp', targetId: 'sec-l4', desc: 'Требование немедленно выдать данные приложению без ожидания буфера.' },
    { term: 'URG', title: 'Флаг URG (Urgent)', category: 'Флаг TCP', badgeClass: 'badge-tcp', targetId: 'sec-l4', desc: 'Указатель на срочные внеполосные данные (Urgent Pointer).' },
    { term: 'ECE', title: 'Флаг ECE (ECN-Echo)', category: 'Флаг TCP', badgeClass: 'badge-tcp', targetId: 'sec-l4', desc: 'Явное уведомление от роутера о возникновении затора в канале.' },
    { term: 'CWR', title: 'Флаг CWR (Congestion Window Reduced)', category: 'Флаг TCP', badgeClass: 'badge-tcp', targetId: 'sec-l4', desc: 'Подтверждение отправителя об уменьшении окна cwnd.' },

    // DNS Records
    { term: 'A', title: 'DNS Запись A (IPv4 Address)', category: 'Запись DNS', badgeClass: 'badge-dns', targetId: 'sec-app', desc: 'Преобразует доменное имя в 32-битный IPv4-адрес.' },
    { term: 'AAAA', title: 'DNS Запись AAAA (IPv6 Address)', category: 'Запись DNS', badgeClass: 'badge-dns', targetId: 'sec-app', desc: 'Преобразует доменное имя в 128-битный IPv6-адрес.' },
    { term: 'CNAME', title: 'DNS Запись CNAME (Canonical Name)', category: 'Запись DNS', badgeClass: 'badge-dns', targetId: 'sec-app', desc: 'Канонический псевдоним (алиас) одного домена на другой.' },
    { term: 'MX', title: 'DNS Запись MX (Mail Exchange)', category: 'Запись DNS', badgeClass: 'badge-dns', targetId: 'sec-app', desc: 'Почтовые серверы домена и их приоритеты для протокола SMTP.' },
    { term: 'TXT', title: 'DNS Запись TXT (Text / SPF / DKIM)', category: 'Запись DNS', badgeClass: 'badge-dns', targetId: 'sec-app', desc: 'Текстовая информация: подтверждение прав, SPF, DKIM, DMARC.' },
    { term: 'PTR', title: 'DNS Запись PTR (Pointer / Reverse DNS)', category: 'Запись DNS', badgeClass: 'badge-dns', targetId: 'sec-app', desc: 'Обратное разрешение: сопоставляет IP-адрес с доменным именем.' },
    { term: 'NS', title: 'DNS Запись NS (Name Server)', category: 'Запись DNS', badgeClass: 'badge-dns', targetId: 'sec-app', desc: 'Указывает авторитетные DNS-серверы для делегированной зоны.' },
    { term: 'SOA', title: 'DNS Запись SOA (Start of Authority)', category: 'Запись DNS', badgeClass: 'badge-dns', targetId: 'sec-app', desc: 'Параметры зоны: серийный номер, таймеры обновления и TTL.' },
    { term: 'SRV', title: 'DNS Запись SRV (Service Locator)', category: 'Запись DNS', badgeClass: 'badge-dns', targetId: 'sec-app', desc: 'Указывает хост, порт и протокол для службы (SIP, LDAP, XMPP).' },
    { term: 'CAA', title: 'DNS Запись CAA (Cert Authority Auth)', category: 'Запись DNS', badgeClass: 'badge-dns', targetId: 'sec-app', desc: 'Определяет удостоверяющие центры, имеющие право выпускать SSL.' },

    // Modern Network Stack & Systems
    { term: 'QUIC', title: 'QUIC (RFC 9000) over UDP', category: 'Современный стек', badgeClass: 'badge-modern', targetId: 'card-quic', desc: 'Транспорт веба нового поколения: 1-RTT handshake, без HoL blocking, Connection Migration.' },
    { term: 'HTTP/3', title: 'HTTP/3 (RFC 9114)', category: 'Современный стек', badgeClass: 'badge-modern', targetId: 'card-quic', desc: 'Прикладной протокол поверх QUIC/UDP, заменяющий TCP в современном интернете.' },
    { term: 'io_uring', title: 'io_uring (Linux 5.1+)', category: 'Современный стек', badgeClass: 'badge-modern', targetId: 'card-io-uring', desc: 'Истинный асинхронный I/O: кольцевые буферы SQ/CQ в mmap, режим SQPOLL, Zero-Copy.' },
    { term: 'IPv6', title: 'IPv6 (RFC 8200)', category: 'Современный стек', badgeClass: 'badge-modern', targetId: 'card-ipv6', desc: '128-битная адресация нового поколения: GUA, ULA, Link-Local, без NAT и Broadcast.' },
    { term: 'NDP', title: 'NDP (Neighbor Discovery Protocol)', category: 'Современный стек', badgeClass: 'badge-modern', targetId: 'ipv6-ndp', desc: 'Замена ARP в IPv6: ICMPv6 NS, NA, RS, RA на Solicited-Node Multicast.' },
    { term: 'SLAAC', title: 'SLAAC (Stateless Autoconfig)', category: 'Современный стек', badgeClass: 'badge-modern', targetId: 'ipv6-slaac', desc: 'Автонастройка IPv6 хоста без DHCP-сервера с проверкой DAD.' },
    { term: 'BGP', title: 'BGP-4 (Border Gateway Protocol)', category: 'Маршрутизация', badgeClass: 'badge-term', targetId: 'sec-l3', desc: 'Междоменная маршрутизация Интернета, вектор пути AS-Path, пиринг и транзит.' },
    { term: 'eBGP', title: 'eBGP vs iBGP', category: 'Маршрутизация', badgeClass: 'badge-term', targetId: 'bgp-ebgp-vs-ibgp', desc: 'Внешние сессии между разными AS (TTL=1) vs внутренние сессии iBGP.' },
    { term: 'iBGP', title: 'iBGP (Internal BGP)', category: 'Маршрутизация', badgeClass: 'badge-term', targetId: 'bgp-ebgp-vs-ibgp', desc: 'Внутренний обмен маршрутами внутри AS (TTL=255, Route Reflectors).' },
    { term: 'IXP', title: 'IXP (Internet Exchange Points)', category: 'Маршрутизация', badgeClass: 'badge-term', targetId: 'bgp-peering-ixp', desc: 'Точки обмена трафиком (DE-CIX, MSK-IX): бесплатный взаимный пиринг сетей.' },
    { term: 'RPKI', title: 'RPKI / ROA (Безопасность BGP)', category: 'Маршрутизация', badgeClass: 'badge-term', targetId: 'bgp-bestpath-rpki', desc: 'Криптографическая защита от перехвата префиксов (BGP Hijacking).' },
    { term: 'OSPF', title: 'OSPF v2/v3 (IGP Routing)', category: 'Маршрутизация', badgeClass: 'badge-term', targetId: 'sec-l3', desc: 'Link-State протокол на алгоритме Дейкстры (SPF), Backbone Area 0.' },
    { term: 'CIDR', title: 'Инженерный калькулятор CIDR / VLSM', category: 'Инструмент', badgeClass: 'badge-term', targetId: 'cidrCalculatorWidget', desc: 'Бесклассовая адресация подсетей, маски, wildcard, расчет диапазона хостов.' },
    { term: 'MTU', title: 'MTU & MSS (Path MTU Discovery)', category: 'Метрика', badgeClass: 'badge-term', targetId: 'sec-l4', desc: 'Размеры пакетов, PMTUD, проблема черных дыр ICMP и MSS Clamping.' },
    { term: 'Jitter', title: 'Джиттер (Jitter)', category: 'Метрика', badgeClass: 'badge-term', targetId: 'sec-intro', desc: 'Вариация задержки между пакетами: критична для VoIP, стриминга и онлайн-игр.' },
    { term: 'Packet Loss', title: 'Потери пакетов (Packet Loss)', category: 'Метрика', badgeClass: 'badge-term', targetId: 'sec-intro', desc: 'Доля недоставленных пакетов (%), обрушивающая пропускную способность TCP.' },
    { term: 'Latency', title: 'Задержка (Latency / RTT)', category: 'Метрика', badgeClass: 'badge-term', targetId: 'sec-intro', desc: 'Время доставки пакета туда и обратно (Round-Trip Time).' },
    { term: 'L1', title: 'L1: Физический уровень', category: 'Сетевой стек', badgeClass: 'badge-term', targetId: 'sec-l2', desc: 'Витая пара, оптика SMF/MMF, Wi-Fi 6/7, кодирование NRZ/PAM-4, коллизии.' }
  ];

  let selectedIndex = -1;

  function highlightMatches(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function jumpToTarget(targetId) {
    if (!targetId) return;
    const targetElem = document.getElementById(targetId);
    if (!targetElem) return;

    // Reset card filters to ensure target is visible
    cards.forEach(card => card.classList.remove('hidden'));
    sections.forEach(sec => sec.classList.remove('hidden'));
    if (noResultsPanel) noResultsPanel.classList.remove('visible');

    // If target is inside a collapsed <details>, open it!
    const parentDetails = targetElem.closest('details.academic-accordion') || (targetElem.tagName === 'DETAILS' ? targetElem : null);
    if (parentDetails) {
      parentDetails.open = true;
    }

    // Scroll target into view
    targetElem.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Apply visual pulse highlight
    targetElem.classList.remove('search-target-highlight');
    void targetElem.offsetWidth; // trigger reflow
    targetElem.classList.add('search-target-highlight');

    setTimeout(() => {
      targetElem.classList.remove('search-target-highlight');
    }, 2500);

    // Hide dropdown
    hideDropdown();
    if (searchInput) searchInput.blur();
    closeMobileSearchPanel(false);
  }

  function hideDropdown() {
    if (dropdown) {
      dropdown.classList.remove('visible');
      dropdown.innerHTML = '';
    }
    selectedIndex = -1;
  }

  function renderDropdown(matches, query) {
    if (!dropdown) return;
    if (matches.length === 0) {
      hideDropdown();
      return;
    }

    let html = `<div class="search-results-header"><span>Точные совпадения (${matches.length})</span><span>Быстрый переход</span></div><div class="search-results-list">`;
    matches.forEach((item, idx) => {
      html += `
        <div class="search-result-item ${idx === selectedIndex ? 'selected' : ''}" data-target-id="${item.targetId}" data-index="${idx}" role="option">
          <div class="search-result-top">
            <span class="search-result-title">${highlightMatches(item.title, query)}</span>
            <span class="search-result-badge ${item.badgeClass || ''}">${item.category}</span>
          </div>
          <div class="search-result-desc">${highlightMatches(item.desc, query)}</div>
        </div>
      `;
    });
    html += `</div>
    <div class="search-dropdown-footer">
      <div class="search-shortcut-item"><kbd>↑</kbd><kbd>↓</kbd> <span>выбор</span></div>
      <div class="search-shortcut-item"><kbd>↵</kbd> <span>перейти</span></div>
      <div class="search-shortcut-item"><kbd>Esc</kbd> <span>закрыть</span></div>
    </div>`;

    dropdown.innerHTML = html;
    dropdown.classList.add('visible');

    // Attach click events
    dropdown.querySelectorAll('.search-result-item').forEach(itemElem => {
      itemElem.addEventListener('click', () => {
        const targetId = itemElem.getAttribute('data-target-id');
        jumpToTarget(targetId);
      });
    });
  }

  // Handle Input
  searchInput.addEventListener('input', (e) => {
    const rawVal = e.target.value.trim();
    const query = rawVal.toLowerCase();
    selectedIndex = -1;

    if (!query) {
      hideDropdown();
      cards.forEach(card => card.classList.remove('hidden'));
      sections.forEach(sec => sec.classList.remove('hidden'));
      if (noResultsPanel) noResultsPanel.classList.remove('visible');
      return;
    }

    // 1. Search in structured high-priority dictionary
    const exactMatches = [];
    KEYWORD_INDEX.forEach(item => {
      const termLower = item.term.toLowerCase();
      const titleLower = item.title.toLowerCase();
      const descLower = item.desc.toLowerCase();
      if (termLower === query || termLower.startsWith(query) || titleLower.includes(query) || descLower.includes(query)) {
        exactMatches.push(item);
      }
    });

    // 2. Also search dynamic cards
    cards.forEach(card => {
      const titleElem = card.querySelector('.card-title, .tool-card-title, .diagram-title');
      const titleText = titleElem ? titleElem.textContent.trim() : '';
      const text = card.textContent.toLowerCase();
      if (text.includes(query) && titleText && exactMatches.length < 12) {
        // avoid duplicating if card id already matched
        if (!exactMatches.some(m => m.title === titleText)) {
          const categoryBadge = card.querySelector('.card-category-badge, .tool-badge, .diagram-badge');
          exactMatches.push({
            term: query,
            title: titleText,
            category: categoryBadge ? categoryBadge.textContent.trim() : 'Раздел',
            badgeClass: 'badge-term',
            targetId: card.id || card.closest('section')?.id,
            desc: card.querySelector('p')?.textContent.substring(0, 110) + '...' || ''
          });
        }
      }
    });

    // Filter page cards visibility
    let totalVisible = 0;
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

    sections.forEach(sec => {
      const visibleChildCards = sec.querySelectorAll('.academic-card:not(.hidden), .diagram-card:not(.hidden), .tool-card:not(.hidden)');
      if (visibleChildCards.length === 0) {
        sec.classList.add('hidden');
      } else {
        sec.classList.remove('hidden');
      }
    });

    if (noResultsPanel) {
      if (totalVisible === 0 && exactMatches.length === 0) {
        noResultsPanel.classList.add('visible');
      } else {
        noResultsPanel.classList.remove('visible');
      }
    }

    // Render instant dropdown
    renderDropdown(exactMatches.slice(0, 8), query);
  });

  // Handle Keyboard Navigation in search input
  searchInput.addEventListener('keydown', (e) => {
    const items = dropdown ? dropdown.querySelectorAll('.search-result-item') : [];

    if (e.key === 'ArrowDown') {
      if (items.length > 0) {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        items.forEach((it, idx) => it.classList.toggle('selected', idx === selectedIndex));
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'ArrowUp') {
      if (items.length > 0) {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        items.forEach((it, idx) => it.classList.toggle('selected', idx === selectedIndex));
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Enter') {
      if (items.length > 0) {
        e.preventDefault();
        const chosen = selectedIndex >= 0 ? items[selectedIndex] : items[0];
        if (chosen) {
          const targetId = chosen.getAttribute('data-target-id');
          jumpToTarget(targetId);
        }
      }
    } else if (e.key === 'Escape') {
      searchInput.value = '';
      hideDropdown();
      cards.forEach(card => card.classList.remove('hidden'));
      sections.forEach(sec => sec.classList.remove('hidden'));
      if (noResultsPanel) noResultsPanel.classList.remove('visible');
      searchInput.blur();
      closeMobileSearchPanel(false);
    }
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header-search')) {
      hideDropdown();
    }
  });
}

/* ==========================================================================
   3. SCROLLSPY (SIDEBAR ACTIVE HIGHLIGHT)
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('.academic-section, .tool-card[id], #sec-footer');
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

  // Create or reuse backdrop element with CSS-driven classes
  let backdrop = document.querySelector('.sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  function openSidebar() {
    closeMobileSearchPanel(); // панели взаимоисключающие: drawer закрывает поиск
    sidebar.classList.add('open');
    backdrop.classList.add('active');
    menuBtn.classList.add('active');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('active');
    menuBtn.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  menuBtn.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  backdrop.addEventListener('click', closeSidebar);

  // Close on nav link click in mobile & tablet
  const navLinks = sidebar.querySelectorAll('.sidebar-nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        closeSidebar();
      }
    });
  });

  // Кнопка поиска в шапке — toggle дропдаун-панели (только мобильный viewport, ≤768px)
  const searchBtn = document.getElementById('mobileSearchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      if (mobileSearchIsOpen()) closeMobileSearchPanel();
      else openMobileSearchPanel();
    });
  }

  // Клик вне панели и кнопки поиска закрывает панель
  document.addEventListener('click', (e) => {
    if (!mobileSearchIsOpen()) return;
    const t = e.target;
    if (t.closest && (t.closest('.header-search') || t.closest('#mobileSearchBtn'))) return;
    closeMobileSearchPanel();
  });

  // При выходе из мобильного viewport закрываем drawer и поиск
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) closeSidebar();
    if (!isMobileViewport()) closeMobileSearchPanel();
  });
}

/* ==========================================================================
   5A. MOBILE SEARCH PANEL (dropdown, ≤768px)
   Кнопка #mobileSearchBtn открывает панель поиска под шапкой: JS добавляет/
   убирает .search-open на #siteHeader (стили — в @media в style.css).
   Функции top-level — их вызывают initLiveSearch и initKeyboardShortcuts.
   ========================================================================== */
const MOBILE_SEARCH_MAX_WIDTH = 768; // должен совпадать с @media в style.css

function isMobileViewport() {
  return window.innerWidth <= MOBILE_SEARCH_MAX_WIDTH;
}

function mobileSearchIsOpen() {
  const header = document.getElementById('siteHeader');
  return !!(header && header.classList.contains('search-open'));
}

// Закрытие мобильного drawer извне (логика дублирует closeSidebar в initMobileMenu)
function closeMobileDrawer() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('open');
  const backdrop = document.querySelector('.sidebar-backdrop');
  if (backdrop) backdrop.classList.remove('active');
  const menuBtn = document.getElementById('mobileMenuBtn');
  if (menuBtn) {
    menuBtn.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  document.body.classList.remove('menu-open');
}

function openMobileSearchPanel() {
  if (!isMobileViewport()) {
    // Десктоп: дропдаун-панели нет — просто фокус на инпут в шапке
    const input = document.getElementById('globalSearchInput');
    if (input) { input.focus(); input.select(); }
    return;
  }
  const header = document.getElementById('siteHeader');
  const btn = document.getElementById('mobileSearchBtn');
  const input = document.getElementById('globalSearchInput');
  if (!header || !btn || !input) return;
  closeMobileDrawer(); // панели взаимоисключающие
  header.classList.add('search-open');
  btn.setAttribute('aria-expanded', 'true');
  input.focus();
}

function closeMobileSearchPanel(keepFocus = false) {
  if (!mobileSearchIsOpen()) return; // no-op (в т.ч. на десктопе, где панели нет)
  const header = document.getElementById('siteHeader');
  const btn = document.getElementById('mobileSearchBtn');
  header.classList.remove('search-open');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  if (keepFocus) {
    const input = document.getElementById('globalSearchInput');
    if (input) input.focus();
  }
}

/* ==========================================================================
   6. GLOBAL KEYBOARD SHORTCUTS
   ========================================================================== */
function initKeyboardShortcuts() {
  const searchInput = document.getElementById('globalSearchInput');
  if (!searchInput) return;

  window.addEventListener('keydown', (e) => {
    // Esc — закрыть открытый drawer сайдбара или мобильную панель поиска
    if (e.key === 'Escape') {
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        closeMobileDrawer();
        return;
      }
      if (mobileSearchIsOpen() && document.activeElement !== searchInput) {
        closeMobileSearchPanel();
        return;
      }
    }

    // Проверяем, не вводит ли пользователь текст в другие поля (калькулятор, поиск портов)
    const isEditing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

    // '/' — фокус на поиск, только если пользователь не вводит текст в другое поле
    if (e.key === '/' && !isEditing && document.activeElement !== searchInput) {
      e.preventDefault();
      if (isMobileViewport()) {
        openMobileSearchPanel();
      } else {
        searchInput.focus();
        searchInput.select();
      }
      return;
    }

    // 'Ctrl+K' / 'Cmd+K' — глобальный шорткат поиска отовсюду
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (isMobileViewport()) {
        openMobileSearchPanel();
      } else {
        searchInput.focus();
        searchInput.select();
      }
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

  function update(sourcePrefix) {
    let rawIp = ipInput.value.trim();
    let prefix;
    if (typeof sourcePrefix === 'number' && !isNaN(sourcePrefix)) {
      prefix = sourcePrefix;
    } else {
      prefix = parseInt(prefixSelect.value, 10);
      if (isNaN(prefix)) {
        prefix = parseInt(prefixSlider.value, 10);
      }
    }
    if (isNaN(prefix) || prefix < 0) prefix = 24;
    if (prefix > 32) prefix = 32;

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
    prefixSelect.value = String(prefix);

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
    if (elBcast) {
      if (prefix === 31) {
        elBcast.textContent = 'Отсутствует (PtP / RFC 3021)';
      } else if (prefix === 32) {
        elBcast.textContent = 'Отсутствует (Host-route)';
      } else {
        elBcast.textContent = intToIp(bcastInt);
      }
    }
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

  ipInput.addEventListener('input', () => update());
  prefixSelect.addEventListener('change', (e) => {
    update(parseInt(e.target.value, 10));
  });
  prefixSlider.addEventListener('input', (e) => {
    update(parseInt(e.target.value, 10));
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
    return `Маска /0 означает: всё IPv4-пространство — все ~4,3 млрд адресов принадлежат единому маршруту по умолчанию (Default Route). Отдельных изолированных сетей здесь нет.`;
  }
  if (prefix <= 8) {
    return `Маска /${prefix} — огромная сеть на миллионы адресов (масштаб класса A). Первые ${netBits} бит задают «улицу» (сеть), остальные ${hostBits} — «номер дома».`;
  }
  if (prefix === 32) {
    return `Маска /32 означает: ровно один конкретный хост (${networkIp}). Широковещательного адреса и соседних узлов в такой сети нет (Host Route / Loopback).`;
  }
  if (prefix === 31) {
    return `Маска /31 — прямая связь между двумя сетевыми узлами (Point-to-Point, RFC 3021): всего два адреса (${networkIp} и ${broadcastIp}), и оба назначаются интерфейсам роутеров без потерь на адрес сети и broadcast.`;
  }

  let what;
  if (prefix <= 12) what = 'очень большая сеть для крупной корпорации или провайдера (миллионы адресов)';
  else if (prefix <= 16) what = 'крупная организация, кампус или дата-центр (десятки тысяч устройств)';
  else if (prefix <= 20) what = 'большой филиал или предприятие (от 4 до 32 тысяч адресов)';
  else if (prefix === 24) what = 'типичная офисная или домашняя сеть (до 256 адресов)';
  else if (prefix <= 28) what = 'небольшая команда или отдел (от 16 до 128 адресов)';
  else what = 'точечная группа из нескольких машин (4–8 адресов)';

  const usable = totalHosts - 2;
  return `Маска /${prefix} означает: первые ${netBits} бит адреса — это «улица» (сеть), остальные ${hostBits} — «номер дома». Это ${what}: всего ${totalHosts.toLocaleString('ru-RU')} адресов, из них ${usable.toLocaleString('ru-RU')} можно выдать устройствам. Адрес ${networkIp} называет саму улицу, а ${broadcastIp} — это «крик всем на улице» (широковещательный).`;
}

/* ==========================================================================
   13. BACK TO TOP BUTTON
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  const toggleVisibility = () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

