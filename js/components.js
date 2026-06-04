/* ═══════════════════════════════════════════════════
   COMPONENTS.JS — Chase Pittman Portfolio
   Loads shared components and wires up:
     · Theme (light/dark) with localStorage persistence
     · Navbar scroll tint + gold border
     · Sidebar open/close
     · Spotify widget (expanded/collapsed with auto-collapse)
═══════════════════════════════════════════════════ */


/* ══════════════════════════════════════════════════
   1. THEME — applied BEFORE anything renders
══════════════════════════════════════════════════ */

(function applyThemeEarly() {
  if (localStorage.getItem('cp-theme') === 'light')
    document.documentElement.setAttribute('data-theme', 'light');
})();


/* ══════════════════════════════════════════════════
   2. COMPONENT LOADER
══════════════════════════════════════════════════ */

async function loadComponent(placeholderId, componentPath) {
  const placeholder = document.getElementById(placeholderId);
  if (!placeholder) return;
  try {
    const res = await fetch(componentPath);
    if (!res.ok) throw new Error(`Failed to load ${componentPath}`);
    placeholder.outerHTML = await res.text();
  } catch (err) {
    console.warn(`[components.js] ${err.message}`);
  }
}


/* ══════════════════════════════════════════════════
   3. NAVBAR
══════════════════════════════════════════════════ */

function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ══════════════════════════════════════════════════
   4. SIDEBAR
══════════════════════════════════════════════════ */

function initSidebar() {
  const hamburger   = document.getElementById('hamburger');
  const sidebar     = document.getElementById('sidebar');
  const overlay     = document.getElementById('overlay');
  const pageWrapper = document.getElementById('page-wrapper');
  if (!hamburger || !sidebar) return;

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    hamburger.classList.add('active');
    if (pageWrapper) {
      pageWrapper.style.transform = `translateX(${sidebar.offsetWidth}px)`;
      pageWrapper.style.filter    = 'blur(2px)';
    }
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    hamburger.classList.remove('active');
    if (pageWrapper) {
      pageWrapper.style.transform = 'translateX(0)';
      pageWrapper.style.filter    = 'blur(0)';
    }
  }

  hamburger.addEventListener('click', () =>
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar()
  );
  if (overlay) overlay.addEventListener('click', closeSidebar);
  document.querySelectorAll('.sidebar a').forEach(l => l.addEventListener('click', closeSidebar));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });
}


/* ══════════════════════════════════════════════════
   5. THEME TOGGLE
══════════════════════════════════════════════════ */

function initThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('cp-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('cp-theme', 'light');
    }
  });
}


/* ══════════════════════════════════════════════════
   6. SPOTIFY WIDGET
      · Slides in after SPOTIFY_DELAY ms
      · Auto-collapses after SPOTIFY_EXPAND_MS ms
      · Toggle button lets user override at any time
      · State persists via localStorage (cp-spotify)
══════════════════════════════════════════════════ */

function initSpotify() {
  const widget = document.getElementById('spotify-widget');
  const toggle = document.getElementById('spotify-toggle');
  if (!widget || !toggle) return;

  const SPOTIFY_DELAY      = 4000;  // ms before widget appears
  const SPOTIFY_EXPAND_MS  = 3800;  // ms before auto-collapse

  let userTookControl = false;

  // Restore collapsed preference across pages
  const wasCollapsed = localStorage.getItem('cp-spotify-collapsed') === 'true';

  setTimeout(() => {
    if (userTookControl) return;
    widget.classList.remove('hidden');
    widget.classList.add('visible');

    // Auto-collapse after a few seconds unless user already interacted
    setTimeout(() => {
      if (!userTookControl) {
        widget.classList.add('collapsed');
        localStorage.setItem('cp-spotify-collapsed', 'true');
      }
    }, SPOTIFY_EXPAND_MS);
  }, SPOTIFY_DELAY);

  // If they previously collapsed it, start collapsed when it appears
  if (wasCollapsed) {
    setTimeout(() => {
      if (!userTookControl) widget.classList.add('collapsed');
    }, SPOTIFY_DELAY + 50);
  }

  toggle.addEventListener('click', () => {
    userTookControl = true;
    widget.classList.remove('hidden');
    widget.classList.add('visible');
    const isCollapsed = widget.classList.toggle('collapsed');
    localStorage.setItem('cp-spotify-collapsed', isCollapsed ? 'true' : 'false');
  });
}


/* ══════════════════════════════════════════════════
   7. BOOT
══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadComponent('navbar-placeholder',       '/components/navbar.html'),
    loadComponent('sidebar-placeholder',      '/components/sidebar.html'),
    loadComponent('theme-toggle-placeholder', '/components/theme-toggle.html'),
    loadComponent('spotify-placeholder',      '/components/spotify.html'),
  ]);

  initNavbar();
  initSidebar();
  initThemeToggle();
  initSpotify();
});
