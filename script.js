(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return sessionStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch {} },
  };
  document.documentElement.classList.add('js');

  // Announcement bar (dismissal remembered for the visit)
  if (store.get('dgk-bar') === 'closed') document.body.classList.remove('has-bar');
  document.querySelector('.topbar-close').addEventListener('click', () => {
    document.body.classList.remove('has-bar');
    store.set('dgk-bar', 'closed');
  });

  // Mobile menu inside the pill nav
  const menuBtn = document.querySelector('.menu-btn');
  const links = document.getElementById('nav-links');
  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('open', open);
  };
  menuBtn.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && links.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
  document.addEventListener('click', (e) => { if (!e.target.closest('.nav')) setMenu(false); });

  // Why-we-exist paragraphs light up as they reach the middle of the screen
  const lines = [...document.querySelectorAll('.fade-lines p')];
  const onScroll = () => {
    const mid = window.innerHeight * 0.62;
    lines.forEach((p) => p.classList.toggle('on', p.getBoundingClientRect().top < mid));
  };
  if (reduce) lines.forEach((p) => p.classList.add('on'));
  else {
    let ticking = false;
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
    onScroll();
  }

  // Outcome carousel buttons
  document.querySelectorAll('[data-scroll]').forEach((b) => {
    b.addEventListener('click', () => {
      const track = document.querySelector(b.dataset.target);
      const card = track.firstElementChild;
      track.scrollBy({ left: Number(b.dataset.scroll) * (card.offsetWidth + 20), behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // Gallery marquee: repeat the pictures once so the loop is seamless
  const gallery = document.querySelector('.gallery-track');
  [...gallery.children].forEach((img) => {
    const copy = img.cloneNode();
    copy.alt = '';
    copy.setAttribute('aria-hidden', 'true');
    gallery.appendChild(copy);
  });
})();
