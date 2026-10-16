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

  function ipToInt(ipStr) {
    const parts = ipStr.trim().split('.');
    if (parts.length !== 4) return null;
    let res = 0;
    for (let i = 0; i < 4; i++) {
      const n = parseInt(parts[i], 10);
      if (isNaN(n) || n < 0 || n > 255) return null;
      res = (res << 8) | n;
    }
    return (res >>> 0);
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

    // If user pasted CIDR notation e.g. 192.168.1.50/26
    if (rawIp.includes('/')) {
      const tokens = rawIp.split('/');
      rawIp = tokens[0].trim();
      const p = parseInt(tokens[1], 10);
      if (!isNaN(p) && p >= 0 && p <= 32) {
        prefix = p;
        prefixSelect.value = p;
        prefixSlider.value = p;
      }
    }

    if (sliderLabel) sliderLabel.textContent = `/${prefix}`;
    prefixSlider.value = prefix;
    prefixSelect.value = prefix;

    const ipInt = ipToInt(rawIp);
    if (ipInt === null) {
      if (elNet) elNet.textContent = 'Некорректный IPv4';
      if (elBcast) elBcast.textContent = '—';
      if (elRange) elRange.textContent = '—';
      if (elHosts) elHosts.textContent = '—';
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

