// =====================================================
// SCRIPTS — Glass nav, scroll-reveal, cursor particles
// =====================================================
(() => {
  'use strict';

  // ---------- DOM ----------
  const glassNav   = document.querySelector('.glass-nav');
  const burger     = document.querySelector('.glass-nav__burger');
  const mobOverlay = document.querySelector('.mob-overlay');
  const navLinks   = document.querySelectorAll('.glass-nav__links a');
  const mobLinks   = document.querySelectorAll('.mob-overlay a');
  const sections   = document.querySelectorAll('.section, .hero');
  const themeToggle = document.querySelector('.theme-toggle');
  const htmlEl     = document.documentElement;

  // ---------- THEME TOGGLE ----------
  // Restore saved theme or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  htmlEl.setAttribute('data-theme', savedTheme);

  themeToggle?.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });



  // ---------- HERO ENTRANCE (staggered) ----------
  document.querySelectorAll('.anim-in').forEach(el => {
    const delay = parseInt(el.dataset.delay || 0);
    el.style.animationDelay = `${delay}ms`;
  });

  // ---------- MOBILE MENU ----------
  function toggleMob() {
    const open = burger.classList.toggle('open');
    mobOverlay.classList.toggle('open');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger?.addEventListener('click', toggleMob);
  mobLinks.forEach(l => l.addEventListener('click', () => {
    burger.classList.remove('open');
    mobOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      burger?.classList.remove('open');
      mobOverlay?.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // ---------- HIDE NAV ON SCROLL DOWN ----------
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    glassNav.classList.toggle('hide', y > lastY && y > 100);
    lastY = y;
  }, { passive: true });

  // ---------- SCROLL SPY ----------
  const spy = [...sections].filter(s => s.id);
  function updateSpy() {
    const pos = scrollY + innerHeight / 3;
    let cur = '';
    spy.forEach(s => { if (s.offsetTop <= pos) cur = s.id; });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
    });
  }
  window.addEventListener('scroll', updateSpy, { passive: true });
  updateSpy();

  // ---------- SMOOTH SCROLL ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const t = document.querySelector(href);
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + scrollY - 90;
      scrollTo({ top, behavior: 'smooth' });
      history.pushState?.(null, null, href);
    });
  });

  // ---------- SCROLL REVEAL ----------
  const reveals = document.querySelectorAll('.scroll-reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  reveals.forEach(el => io.observe(el));

  // ---------- FLOWING WAVE BACKGROUND (hero only) ----------
  const canvas = document.getElementById('wave-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H;
  let mx = -9999, my = -9999;
  let targetMx = -9999, targetMy = -9999;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const hero = canvas.parentElement;
    W = hero.offsetWidth;
    H = hero.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize);
  addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    targetMx = e.clientX - rect.left;
    targetMy = e.clientY - rect.top;
  });
  addEventListener('mouseleave', () => { targetMx = -9999; targetMy = -9999; });

  // Wave parameters
  const NUM_LINES = 45;       // number of wave lines (tighter band)
  const POINTS = 220;         // points per line (smoothness)
  const BASE_AMP = 70;        // base wave amplitude (bigger mountain peaks)
  const MOUSE_RADIUS = 250;   // radius of mouse influence
  const MOUSE_AMP = 45;       // extra amplitude from mouse

  let time = 0;

  function frame() {
    ctx.clearRect(0, 0, W, H);

    // Smooth mouse
    if (targetMx > -9000) {
      mx += (targetMx - mx) * 0.06;
      my += (targetMy - my) * 0.06;
    } else {
      mx = -9999;
      my = -9999;
    }

    time += 0.003;

    const isDark = htmlEl.getAttribute('data-theme') !== 'light';

    // Center of the wave band — in the lower-center area like the reference
    const centerY = H * 0.65;
    const bandHeight = H * 0.35;

    for (let i = 0; i < NUM_LINES; i++) {
      const t = i / (NUM_LINES - 1);   // 0..1
      // Vertical position of this line in the band
      const lineY = centerY - bandHeight / 2 + t * bandHeight;

      ctx.beginPath();

      for (let p = 0; p <= POINTS; p++) {
        const px = (p / POINTS) * (W + 80) - 40;  // slight overshoot
        const nx = p / POINTS;   // normalized x 0..1

        // Multiple sine waves for dramatic mountain-like peaks
        let wave = Math.sin(nx * 3.8 + time * 1.5 + t * 1.8) * BASE_AMP
                 + Math.sin(nx * 6.5 - time * 1.0 + t * 3.0) * BASE_AMP * 0.4
                 + Math.cos(nx * 2.0 + time * 2.2 + t * 1.0) * BASE_AMP * 0.55
                 + Math.sin(nx * 10 + time * 0.7 + t * 4.5) * BASE_AMP * 0.1;

        // Scale wave: more movement at center of band, less at edges
        const centerDist = Math.abs(t - 0.5) * 2; // 0 at center, 1 at edges
        wave *= 1 - centerDist * 0.5;

        // Mouse influence
        if (mx > -9000) {
          const dxm = px - mx;
          const dym = lineY + wave - my;
          const dm = Math.sqrt(dxm * dxm + dym * dym);
          if (dm < MOUSE_RADIUS) {
            const influence = 1 - dm / MOUSE_RADIUS;
            wave -= influence * influence * MOUSE_AMP;
          }
        }

        const py = lineY + wave;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      // Alpha: stronger at center of band, fainter at edges
      const edgeFade = 1 - Math.pow(Math.abs(t - 0.5) * 2, 1.5);
      const baseAlpha = isDark ? 0.06 + edgeFade * 0.30 : 0.04 + edgeFade * 0.18;

      // Single color purple, shades via alpha
      if (isDark) {
        ctx.strokeStyle = `rgba(168, 85, 247, ${baseAlpha})`;
      } else {
        ctx.strokeStyle = `rgba(124, 58, 237, ${baseAlpha})`;
      }

      ctx.lineWidth = isDark ? 1.0 : 0.8;
      ctx.stroke();
    }

    requestAnimationFrame(frame);
  }

  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) frame();

  // ---------- SLIDE-MASK HERO HEADLINE ----------
  const heroRotating = document.getElementById('hero-rotating');
  const heroNext = document.getElementById('hero-rotating-next');
  const heroWrap = heroRotating?.parentElement;
  
  if (heroRotating && heroNext && heroWrap) {
    const phrases = ["Embedded Systems & IoT.", "Machine Learning Models.", "Intelligent Hardware."];
    let phraseIndex = 0;
    const HOLD_TIME = 3000;
    const TRANSITION_MS = 650;

    function slideNext() {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      heroNext.textContent = phrases[phraseIndex];

      // Trigger slide
      heroWrap.classList.add('sliding');

      setTimeout(() => {
        // Kill transitions so the swap is invisible
        heroRotating.style.transition = 'none';
        heroNext.style.transition = 'none';

        // Swap: put the new phrase in the main span, reset classes
        heroRotating.textContent = phrases[phraseIndex];
        heroNext.textContent = '';
        heroWrap.classList.remove('sliding');

        // Force reflow so the browser applies the reset instantly
        void heroRotating.offsetWidth;

        // Re-enable transitions for the next cycle
        heroRotating.style.transition = '';
        heroNext.style.transition = '';
      }, TRANSITION_MS + 50);
    }

    setInterval(slideNext, HOLD_TIME + TRANSITION_MS);
  }

})();