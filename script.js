(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch {} },
  };

  // Announcement bar (dismissal remembered for the visit)
  if (store.get('dgk-bar') !== 'closed') document.body.classList.add('has-bar');
  document.querySelector('.topbar-close').addEventListener('click', () => {
    document.body.classList.remove('has-bar');
    store.set('dgk-bar', 'closed');
  });

  // Pill menu
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
  };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
  document.addEventListener('click', (e) => { if (!menu.hidden && !e.target.closest('.pill-header')) setMenu(false); });

  // Current section name in the pill
  const label = document.querySelector('.pill-label');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) label.textContent = en.target.dataset.label;
    }), { rootMargin: '-50% 0px -50% 0px' });
    document.querySelectorAll('[data-label]').forEach((s) => io.observe(s));
  }

  // Statement: split into words that fill in as you scroll
  const reveal = document.querySelector('.reveal-text');
  const words = [];
  if (!reduce) {
    reveal.innerHTML = reveal.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    words.push(...reveal.querySelectorAll('.w'));
  }
  const statement = document.querySelector('.statement');
  const tiles = [...document.querySelectorAll('.mosaic .m')];

  // Pillars: the one crossing the middle of the screen is active
  const pillars = [...document.querySelectorAll('.pillar')];
  const pillarImgs = [...document.querySelectorAll('.pillar-img')];
  let activePillar = 0;
  const setPillar = (i) => {
    if (i === activePillar) return;
    activePillar = i;
    pillars.forEach((p, n) => p.classList.toggle('is-active', n === i));
    pillarImgs.forEach((p, n) => p.classList.toggle('is-active', n === i));
  };

  const progressBar = document.querySelector('.pill-progress');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    progressBar.style.setProperty('--progress', max > 0 ? (window.scrollY / max).toFixed(4) : 0);

    const r = statement.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh)));
    if (words.length) {
      const fill = Math.min(1, Math.max(0, (p - 0.25) / 0.35)) * words.length;
      words.forEach((w, i) => w.style.setProperty('--o', i < fill ? 1 : 0.2));
    }
    if (!reduce) tiles.forEach((t) => t.style.setProperty('--shift', ((p - 0.5) * 240 * parseFloat(getComputedStyle(t).getPropertyValue('--k') || 0)).toFixed(1)));

    let current = 0;
    pillars.forEach((pl, i) => { if (pl.getBoundingClientRect().top < vh * 0.55) current = i; });
    setPillar(current);
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // Industry tabs
  const tabs = [...document.querySelectorAll('.ind-tabs [role="tab"]')];
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      selectTab(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
    });
  });

  // Insights carousel
  const track = document.querySelector('.insight-track');
  document.querySelectorAll('[data-scroll]').forEach((b) => {
    b.addEventListener('click', () => {
      const card = track.querySelector('.insight');
      track.scrollBy({ left: Number(b.dataset.scroll) * (card.offsetWidth + 24), behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();
