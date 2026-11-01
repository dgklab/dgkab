(() => {
  // Header border on scroll
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.hidden = !open;
  };
  toggle.addEventListener('click', () => setMenu(mobileNav.hidden));
  mobileNav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  // Tabs
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    revealIn(document.getElementById(tab.getAttribute('aria-controls')));
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(next, true);
    });
  });
  document.querySelectorAll('[data-tab-link]').forEach((a) => {
    a.addEventListener('click', () => selectTab(document.getElementById('tab-' + a.dataset.tabLink)));
  });

  // Reveal features on scroll. Content is only hidden once the observer exists,
  // and a timeout reveals everything if the observer never fires.
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      }), { threshold: 0.15 })
    : null;
  function revealIn(root) {
    root.querySelectorAll('.feature:not(.in)').forEach((f) => (io ? io.observe(f) : f.classList.add('in')));
  }
  if (io) {
    document.documentElement.classList.add('reveal-ready');
    setTimeout(() => document.querySelectorAll('.feature').forEach((f) => f.classList.add('in')), 2500);
  }
  revealIn(document);

  // Stories carousel buttons
  const track = document.querySelector('.story-track');
  document.querySelectorAll('[data-scroll]').forEach((b) => {
    b.addEventListener('click', () => {
      const card = track.querySelector('.story');
      track.scrollBy({ left: Number(b.dataset.scroll) * (card.offsetWidth + 16) * 2, behavior: 'smooth' });
    });
  });

  // Animated stat counters
  const fmt = new Intl.NumberFormat('en-GB');
  const counters = document.querySelectorAll('[data-count]');
  const run = (el) => {
    const target = Number(el.dataset.count);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { el.textContent = fmt.format(target); return; }
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / 1600);
      el.textContent = fmt.format(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (io) {
    const cio = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); }
    }), { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
    setTimeout(() => counters.forEach((c) => { if (c.textContent === '0') { cio.unobserve(c); run(c); } }), 2500);
  } else counters.forEach(run);
})();
