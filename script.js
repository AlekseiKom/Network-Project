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
  initModeToggle();
  initThemeToggle();
  initBdpMssCalculator();
  initVlsmAndOverlap();
  initUrlParams();
  initBackToTop();
  initNetworkBackground();
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

    // Scroll target into view.
    // Sections are tall — centering them leaves the heading off-screen, so align
    // sections to the top (scroll-margin-top handles header offset); keep centering
    // for smaller targets (cards, accordions) inside sections.
    const isSection = Array.from(sections).includes(targetElem) || targetElem.classList.contains('academic-section');
    targetElem.scrollIntoView({ behavior: 'smooth', block: isSection ? 'start' : 'center' });

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
  const tbody = document.getElementById('ianaPortsBody');

  if (tbody && Array.isArray(window.IANA_PORTS) && !tbody.querySelector('.port-data-row')) {
    tbody.innerHTML = window.IANA_PORTS.map(p =>
      `<tr class="port-data-row" data-port-cat="${p.cat}"><td><code>${p.port}</code></td><td>${p.proto}</td><td><strong>${p.service}</strong></td><td>${p.desc}</td></tr>`
    ).join('');
  }

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
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') closeViewer();
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomAt(window.innerWidth / 2, window.innerHeight / 2, 1.25); }
      else if (e.key === '-') { e.preventDefault(); zoomAt(window.innerWidth / 2, window.innerHeight / 2, 0.8); }
      else if (e.key === '0') { e.preventDefault(); resetView(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); tx += 60; applyTransform(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); tx -= 60; applyTransform(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); ty += 60; applyTransform(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); ty -= 60; applyTransform(); }
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
    if (window.scrollY > 80) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
  btn.addEventListener('click', () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}


/* ==========================================================================
   PRO / BEGINNER MODE TOGGLE (persisted in localStorage)
   ========================================================================== */
function initModeToggle() {
  const modeBtn = document.getElementById('modeToggle');
  if (!modeBtn) return;

  const KEY = 'np-mode'; // 'pro' | 'full'

  function applyMode(mode, persist) {
    document.body.classList.toggle('pro-mode', mode === 'pro');
    modeBtn.setAttribute('aria-pressed', String(mode === 'pro'));
    if (persist) { try { localStorage.setItem(KEY, mode); } catch (e) {} }
  }

  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  applyMode(stored === 'pro' ? 'pro' : 'full', false);

  modeBtn.addEventListener('click', () => {
    const next = document.body.classList.contains('pro-mode') ? 'full' : 'pro';
    applyMode(next, true);
  });
}

/* ==========================================================================
   THEME TOGGLE (DARK / LIGHT) & SVG KEYBOARD A11Y
   ========================================================================== */
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (btn) {
    const KEY = 'np-theme';
    const applyTheme = (theme, persist) => {
      if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
      else document.documentElement.removeAttribute('data-theme');
      btn.setAttribute('aria-pressed', String(theme === 'light'));
      if (persist) { try { localStorage.setItem(KEY, theme); } catch (e) {} }
    };
    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    applyTheme(stored === 'light' ? 'light' : 'dark', false);
    btn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      applyTheme(isLight ? 'dark' : 'light', true);
    });
  }

  // Keyboard a11y for SVG viewer (+ / - / 0)
  document.querySelectorAll('.svg-viewer-modal, .svg-zoom-controls').forEach(el => {
    el.querySelectorAll('button').forEach(b => {
      if (!b.getAttribute('aria-label') && b.title) b.setAttribute('aria-label', b.title);
    });
  });
  document.addEventListener('keydown', (e) => {
    const modal = document.querySelector('.svg-viewer-modal.open, .svg-modal.active');
    if (!modal) return;
    if (e.key === '+' || e.key === '=') modal.querySelector('[data-zoom="in"], .zoom-in-btn')?.click();
    if (e.key === '-') modal.querySelector('[data-zoom="out"], .zoom-out-btn')?.click();
    if (e.key === '0') modal.querySelector('[data-zoom="reset"], .zoom-reset-btn')?.click();
  });
}

/* ==========================================================================
   BDP & MTU/MSS CALCULATOR + URL PARAMS
   ========================================================================== */
function initBdpMssCalculator() {
  const bwEl = document.getElementById('bdpBandwidth');
  const rttEl = document.getElementById('bdpRtt');
  const mtuEl = document.getElementById('bdpMtu');
  const tunEl = document.getElementById('bdpTunnel');
  const ipVerEl = document.getElementById('bdpIpVer');
  const outEl = document.getElementById('bdpResults');
  if (!bwEl || !rttEl || !mtuEl || !tunEl || !ipVerEl || !outEl) return;

  function calc() {
    const bwMbps = Math.max(0.1, Number(bwEl.value) || 100);
    const rttMs = Math.max(0.1, Number(rttEl.value) || 40);
    const baseMtu = Math.max(576, Number(mtuEl.value) || 1500);
    const tunOverhead = Number(tunEl.value) || 0;
    const ipHeader = Number(ipVerEl.value) || 20;
    const bdpBytes = Math.round((bwMbps * 1e6 * (rttMs / 1000)) / 8);
    const effMtu = baseMtu - tunOverhead;
    const mss = effMtu - ipHeader - 20;
    outEl.innerHTML = `
      <div class="bdp-stat"><span>BDP (TCP Window / RWIN):</span><strong>${bdpBytes.toLocaleString('ru-RU')} байт (${(bdpBytes / 1024).toFixed(1)} КБ)</strong></div>
      <div class="bdp-stat"><span>Эффективный MTU:</span><strong>${effMtu} байт</strong></div>
      <div class="bdp-stat"><span>Реальный TCP MSS:</span><strong>${mss} байт</strong></div>
    `;
  }
  [bwEl, rttEl, mtuEl, tunEl, ipVerEl].forEach(el => el.addEventListener('input', calc));
  calc();
}

function initUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const cidr = params.get('cidr');
  const q = params.get('q');
  if (cidr) {
    const parts = cidr.split('/');
    const ipEl = document.getElementById('cidrIpInput');
    const prefEl = document.getElementById('cidrPrefixSelect');
    if (ipEl && parts[0]) {
      ipEl.value = parts[0];
      if (prefEl && parts[1]) prefEl.value = parts[1];
      ipEl.dispatchEvent(new Event('input', { bubbles: true }));
      if (prefEl) prefEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  if (q) {
    const searchEl = document.getElementById('searchInput') || document.getElementById('portLookupSearch');
    if (searchEl) {
      searchEl.value = q;
      searchEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

/* ==========================================================================
   VLSM / SUBNET SPLITTER, OVERLAP CHECK & EXTENDED ADDRESS SCOPE
   ========================================================================== */
function initVlsmAndOverlap() {
  const ipInput = document.getElementById('cidrIpInput');
  const prefixSelect = document.getElementById('cidrPrefixSelect');
  const targetSelect = document.getElementById('vlsmTargetPrefix');
  const vlsmOut = document.getElementById('vlsmResults');
  const overlapA = document.getElementById('overlapCidrA');
  const overlapB = document.getElementById('overlapCidrB');
  const overlapOut = document.getElementById('overlapResult');
  const scopeEl = document.getElementById('calcResScope');

  const parseIp = (str) => {
    const p = String(str || '').trim().split('.');
    if (p.length !== 4) return null;
    let n = 0;
    for (let i = 0; i < 4; i++) {
      if (!/^\d{1,3}$/.test(p[i])) return null;
      const v = Number(p[i]);
      if (v < 0 || v > 255) return null;
      n = (n * 256) + v;
    }
    return n >>> 0;
  };
  const intToIp = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
  const parseCidr = (str) => {
    const parts = String(str || '').trim().split('/');
    if (parts.length !== 2) return null;
    const ip = parseIp(parts[0]);
    const prefix = Number(parts[1]);
    if (ip === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;
    const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
    const net = (ip & mask) >>> 0;
    return { ip, prefix, net, bcast: (net | (~mask >>> 0)) >>> 0 };
  };

  function updateVlsm() {
    if (!ipInput || !prefixSelect || !targetSelect || !vlsmOut) return;
    const ip = parseIp(ipInput.value);
    const basePrefix = Number(prefixSelect.value);
    if (ip !== null && scopeEl) {
      const a = (ip >>> 24) & 255, b = (ip >>> 16) & 255;
      if (a === 100 && b >= 64 && b <= 127) scopeEl.textContent = 'CGNAT (100.64.0.0/10, RFC 6598)';
      else if (a === 169 && b === 254) scopeEl.textContent = 'Link-Local / APIPA (169.254.0.0/16)';
      else if (a === 127) scopeEl.textContent = 'Loopback (127.0.0.0/8)';
      else if (a >= 224 && a <= 239) scopeEl.textContent = 'Multicast (224.0.0.0/4)';
    }
    const targetPrefix = Number(targetSelect.value);
    if (ip === null || targetPrefix <= basePrefix || targetPrefix > 30) {
      vlsmOut.innerHTML = `<div class="vlsm-empty">Выберите целевой префикс больше текущего (/${basePrefix}) и до /30.</div>`;
      return;
    }
    const count = Math.min(16, Math.pow(2, targetPrefix - basePrefix));
    const baseMask = basePrefix === 0 ? 0 : (0xFFFFFFFF << (32 - basePrefix)) >>> 0;
    const baseNet = (ip & baseMask) >>> 0;
    const step = Math.pow(2, 32 - targetPrefix);
    let html = '';
    for (let i = 0; i < count; i++) {
      const sNet = (baseNet + i * step) >>> 0;
      const sBcast = (sNet + step - 1) >>> 0;
      html += `<div class="vlsm-row"><code>${intToIp(sNet)}/${targetPrefix}</code><span>Usable: ${intToIp((sNet + 1) >>> 0)} – ${intToIp((sBcast - 1) >>> 0)}</span><span>Bcast: ${intToIp(sBcast)}</span></div>`;
    }
    vlsmOut.innerHTML = html;
  }

  function updateOverlap() {
    if (!overlapA || !overlapB || !overlapOut) return;
    const a = parseCidr(overlapA.value);
    const b = parseCidr(overlapB.value);
    if (!a || !b) {
      overlapOut.textContent = 'Введите две корректные сети в формате CIDR (например, 10.0.0.0/16).';
      overlapOut.className = 'overlap-result-box overlap-warn';
      return;
    }
    const overlaps = a.net <= b.bcast && b.net <= a.bcast;
    if (!overlaps) {
      overlapOut.textContent = `✅ Не пересекаются: ${intToIp(a.net)}/${a.prefix} и ${intToIp(b.net)}/${b.prefix} изолированы.`;
      overlapOut.className = 'overlap-result-box overlap-ok';
    } else if (a.net === b.net && a.prefix === b.prefix) {
      overlapOut.textContent = `⚠️ Идентичные подсети: ${intToIp(a.net)}/${a.prefix}.`;
      overlapOut.className = 'overlap-result-box overlap-bad';
    } else if (a.net <= b.net && a.bcast >= b.bcast) {
      overlapOut.textContent = `⚠️ Пересекаются: ${intToIp(b.net)}/${b.prefix} входит в ${intToIp(a.net)}/${a.prefix}.`;
      overlapOut.className = 'overlap-result-box overlap-bad';
    } else {
      overlapOut.textContent = `⚠️ Пересекаются: ${intToIp(a.net)}/${a.prefix} входит в ${intToIp(b.net)}/${b.prefix}.`;
      overlapOut.className = 'overlap-result-box overlap-bad';
    }
  }

  if (ipInput) ipInput.addEventListener('input', updateVlsm);
  if (prefixSelect) prefixSelect.addEventListener('change', updateVlsm);
  if (targetSelect) targetSelect.addEventListener('change', updateVlsm);
  if (overlapA) overlapA.addEventListener('input', updateOverlap);
  if (overlapB) overlapB.addEventListener('input', updateOverlap);
  updateVlsm();
  updateOverlap();
}

/* ==========================================================================
   NETWORK TOPOLOGY BACKGROUND (Canvas: роутеры с пульсацией + пакеты по проводам)
   Чтобы откатиться на статичный blueprint, закомментируй вызов initNetworkBackground()
   и раскомментируй блок BACKGROUND VARIANT: BLUEPRINT в style.css.
   ========================================================================== */
function initNetworkBackground() {
  const canvas = document.getElementById('networkBgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let nodes = [];
  let edges = [];
  let packets = [];
  let rafId = null;
  let lastTime = 0;

  function buildTopology() {
    const isDesktop = width >= 1024;
    const isMobile = width < 640;

    const routerCoords = isMobile
      ? [
          { x: 0.25, y: 0.28 },
          { x: 0.76, y: 0.68 }
        ]
      : [
          { x: 0.16, y: 0.26 },
          { x: 0.52, y: 0.48 },
          { x: 0.84, y: 0.28 },
          { x: 0.24, y: 0.78 },
          { x: 0.78, y: 0.76 }
        ];

    nodes = [];
    edges = [];
    packets = [];

    routerCoords.forEach((rc, idx) => {
      nodes.push({
        x: rc.x * width,
        y: rc.y * height,
        type: 'router',
        radius: isDesktop ? 7 : 5.5,
        pulsePhase: idx * 1.35
      });
    });

    for (let i = 0; i < routerCoords.length; i++) {
      for (let j = i + 1; j < routerCoords.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.hypot(dx, dy) < Math.max(width, height) * 0.62) {
          edges.push({ a: i, b: j, backbone: true });
        }
      }
    }

    const satellitesPerRouter = isMobile ? 3 : isDesktop ? 5 : 4;
    const routerCount = nodes.length;
    for (let r = 0; r < routerCount; r++) {
      const router = nodes[r];
      for (let s = 0; s < satellitesPerRouter; s++) {
        const angle = (Math.PI * 2 * s) / satellitesPerRouter + r * 0.55 + (Math.random() - 0.5) * 0.35;
        const dist = (isMobile ? 95 : 130) + Math.random() * (isDesktop ? 130 : 75);
        const nx = Math.max(24, Math.min(width - 24, router.x + Math.cos(angle) * dist));
        const ny = Math.max(24, Math.min(height - 24, router.y + Math.sin(angle) * dist));
        const nodeIdx = nodes.length;
        nodes.push({
          x: nx,
          y: ny,
          type: 'host',
          radius: isDesktop ? 3.2 : 2.6,
          pulsePhase: Math.random() * Math.PI * 2
        });
        edges.push({ a: r, b: nodeIdx, backbone: false });
      }
    }

    const packetCount = isMobile ? 14 : isDesktop ? 36 : 22;
    for (let i = 0; i < packetCount; i++) {
      const edge = edges[Math.floor(Math.random() * edges.length)];
      if (!edge) continue;
      packets.push({
        edge,
        t: Math.random(),
        dir: Math.random() > 0.5 ? 1 : -1,
        speed: (edge.backbone ? 0.16 : 0.24) + Math.random() * 0.22,
        size: edge.backbone ? 2.8 : 2.1
      });
    }
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildTopology();
    if (prefersReducedMotion) render(0);
  }

  function render(now) {
    const dt = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016;
    lastTime = now;
    const timeSec = now * 0.001;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    ctx.clearRect(0, 0, width, height);

    const wireColor = isLight ? 'rgba(29, 78, 216, 0.34)' : 'rgba(59, 130, 246, 0.16)';
    const backboneColor = isLight ? 'rgba(29, 78, 216, 0.52)' : 'rgba(96, 165, 250, 0.26)';
    const hostColor = isLight ? 'rgba(29, 78, 216, 0.72)' : 'rgba(96, 165, 250, 0.45)';
    const routerCore = isLight ? 'rgba(29, 78, 216, 0.85)' : 'rgba(96, 165, 250, 0.85)';
    const routerRing = isLight ? 'rgba(37, 99, 235, ' : 'rgba(56, 189, 248, ';
    const packetColor = isLight ? 'rgba(29, 78, 216, 0.95)' : 'rgba(125, 211, 252, 0.95)';
    const packetGlow = isLight ? 'rgba(29, 78, 216, 0.62)' : 'rgba(56, 189, 248, 0.45)';

    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      const na = nodes[e.a];
      const nb = nodes[e.b];
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = e.backbone ? backboneColor : wireColor;
      ctx.lineWidth = e.backbone ? 1.4 : 1;
      ctx.stroke();
    }

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (n.type === 'router') {
        const pulse = (timeSec * 0.55 + n.pulsePhase) % 1;
        const ringRadius = n.radius + pulse * 28;
        const ringAlpha = (1 - pulse) * 0.42;

        ctx.beginPath();
        ctx.arc(n.x, n.y, ringRadius, 0, Math.PI * 2);
        const visibleRingAlpha = isLight ? Math.min(0.78, ringAlpha * 1.65) : ringAlpha;
        ctx.strokeStyle = `${routerRing}${visibleRingAlpha.toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? 'rgba(37, 99, 235, 0.24)' : 'rgba(59, 130, 246, 0.2)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = routerCore;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = hostColor;
        ctx.fill();
      }
    }

    if (!prefersReducedMotion) {
      for (let i = 0; i < packets.length; i++) {
        const p = packets[i];
        p.t += p.dir * p.speed * dt;
        if (p.t > 1 || p.t < 0) {
          p.edge = edges[Math.floor(Math.random() * edges.length)] || p.edge;
          p.dir = Math.random() > 0.5 ? 1 : -1;
          p.t = p.dir > 0 ? 0 : 1;
        }

        const na = nodes[p.edge.a];
        const nb = nodes[p.edge.b];
        const px = na.x + (nb.x - na.x) * p.t;
        const py = na.y + (nb.y - na.y) * p.t;

        const tailT = Math.max(0, Math.min(1, p.t - p.dir * 0.08));
        const tx = na.x + (nb.x - na.x) * tailT;
        const ty = na.y + (nb.y - na.y) * tailT;

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(px, py);
        ctx.strokeStyle = packetGlow;
        ctx.lineWidth = p.size * 1.4;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = packetColor;
        ctx.fill();
      }
    }

    if (!prefersReducedMotion && document.visibilityState !== 'hidden') {
      rafId = requestAnimationFrame(render);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    } else if (!prefersReducedMotion && !rafId) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(render);
    }
  });

  window.addEventListener('resize', resize);
  resize();
  if (!prefersReducedMotion) {
    rafId = requestAnimationFrame(render);
  }
}
