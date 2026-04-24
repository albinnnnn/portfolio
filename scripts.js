// =====================================================
// SCRIPTS — Typing effect, ambient particles, wave bg,
// glass nav, scroll-reveal, theme toggle
// =====================================================
(() => {
  "use strict";

  // ---------- LENIS SMOOTH SCROLL ----------
  let lenis;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
    });

    // Lenis 1.1.13 requires a manual raf loop (no autoRaf option)
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // ---------- DOM ----------
  const glassNav = document.querySelector(".glass-nav");
  const burger = document.querySelector(".glass-nav__burger");
  const mobOverlay = document.querySelector(".mob-overlay");
  const navLinks = document.querySelectorAll(".glass-nav__links a");
  const mobLinks = document.querySelectorAll(".mob-overlay a");
  const sections = document.querySelectorAll(".section, .hero, footer#contact");
  const themeToggle = document.querySelector(".theme-toggle");
  const htmlEl = document.documentElement;

  // ---------- NAV CURSOR GLOW ----------
  let navTargetX = 0,
    navTargetY = 0;
  let navCurrentX = 0,
    navCurrentY = 0;
  let navIsHovering = false;
  let autoSweepTime = 0;

  glassNav?.addEventListener("mouseenter", (e) => {
    navIsHovering = true;
    const rect = glassNav.getBoundingClientRect();
    navTargetX = e.clientX - rect.left;
    navTargetY = e.clientY - rect.top;
  });

  glassNav?.addEventListener("mousemove", (e) => {
    if (!navIsHovering) return;
    const rect = glassNav.getBoundingClientRect();
    navTargetX = e.clientX - rect.left;
    navTargetY = e.clientY - rect.top;
  });

  glassNav?.addEventListener("mouseleave", () => {
    navIsHovering = false;
  });

  function navGlowLoop() {
    if (glassNav) {
      if (!navIsHovering) {
        autoSweepTime += 0.006;
        const rect = glassNav.getBoundingClientRect();
        const center = rect.width / 2;
        const sweepAmp = rect.width * 0.45;
        navTargetX = center + Math.sin(autoSweepTime) * sweepAmp;
        navTargetY = rect.height / 2;

        // initialize current pos instantly on first load
        if (navCurrentX === 0 && navCurrentY === 0) {
          navCurrentX = navTargetX;
          navCurrentY = navTargetY;
        }
      }

      const dx = navTargetX - navCurrentX;
      const dy = navTargetY - navCurrentY;

      navCurrentX += dx * 0.045;
      navCurrentY += dy * 0.045;

      glassNav.style.setProperty("--mouse-x", `${navCurrentX}px`);
      glassNav.style.setProperty("--mouse-y", `${navCurrentY}px`);
    }
    requestAnimationFrame(navGlowLoop);
  }
  if (glassNav) requestAnimationFrame(navGlowLoop);

  // ---------- THEME TOGGLE ----------
  const savedTheme = localStorage.getItem("theme") || "dark";
  htmlEl.setAttribute("data-theme", savedTheme);

  themeToggle?.addEventListener("click", () => {
    const current = htmlEl.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    htmlEl.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  // ---------- HERO ENTRANCE (staggered) ----------
  document.querySelectorAll(".anim-in").forEach((el) => {
    const delay = parseInt(el.dataset.delay || 0);
    el.style.animationDelay = `${delay}ms`;
  });

  // ---------- TYPING EFFECT ----------
  const typedEl = document.getElementById("typed-greeting");
  if (typedEl) {
    const text = " cat intro.txt";
    let i = 0;
    function typeChar() {
      if (i < text.length) {
        typedEl.textContent += text[i];
        i++;
        setTimeout(typeChar, 60 + Math.random() * 40);
      }
    }
    setTimeout(typeChar, 800);
  }

  // ---------- SLIDE-MASK HERO TEXT ROTATION ----------
  const heroRotating = document.getElementById("hero-rotating");
  const heroNext = document.getElementById("hero-rotating-next");
  const heroWrap = heroRotating?.closest(".hero-rotating-wrap");

  if (heroRotating && heroNext && heroWrap) {
    const phrases = [
      "Embedded Systems & IoT.",
      "Machine Learning Models.",
      "Intelligent Hardware.",
    ];
    let phraseIndex = 0;
    const HOLD = 3000;
    const SLIDE_MS = 650;

    setInterval(() => {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      heroNext.textContent = phrases[phraseIndex];
      heroWrap.classList.add("sliding");

      setTimeout(() => {
        // Disable transitions so the reset is instant (no visible snap-back)
        heroRotating.style.transition = "none";
        heroNext.style.transition = "none";

        // Update current text and remove sliding state
        heroRotating.textContent = phrases[phraseIndex];
        heroWrap.classList.remove("sliding");

        // Force a reflow so the browser applies the instant reset
        void heroRotating.offsetHeight;

        // Re-enable transitions for the next cycle
        heroRotating.style.transition = "";
        heroNext.style.transition = "";
      }, SLIDE_MS);
    }, HOLD + SLIDE_MS);
  }

  // ---------- MOBILE MENU ----------
  function toggleMob() {
    const open = burger.classList.toggle("open");
    mobOverlay.classList.toggle("open");
    // update accessibility attributes
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    if (mobOverlay)
      mobOverlay.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) {
      document.body.style.overflow = "hidden";
      if (lenis) lenis.stop();
    } else {
      document.body.style.overflow = "";
      if (lenis) lenis.start();
    }
  }
  burger?.addEventListener("click", toggleMob);
  mobLinks.forEach((l) =>
    l.addEventListener("click", () => {
      burger.classList.remove("open");
      mobOverlay.classList.remove("open");
      if (burger) burger.setAttribute("aria-expanded", "false");
      if (mobOverlay) mobOverlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lenis) lenis.start();
    }),
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      burger?.classList.remove("open");
      mobOverlay?.classList.remove("open");
      if (burger) burger.setAttribute("aria-expanded", "false");
      if (mobOverlay) mobOverlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lenis) lenis.start();
    }
  });

  // ---------- HIDE NAV ON SCROLL DOWN ----------
  let lastY = 0;
  let isScrollingTo = false; // flag to prevent nav hide during programmatic scroll
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      if (!isScrollingTo) {
        glassNav.classList.toggle("hide", y > lastY && y > 100);
      }
      lastY = y;
    },
    { passive: true },
  );

  // ---------- SCROLL SPY ----------
  const spy = [...sections].filter((s) => s.id);
  function updateSpy() {
    const pos = scrollY + innerHeight / 3;
    let cur = "";
    spy.forEach((s) => {
      if (s.offsetTop <= pos) cur = s.id;
    });
    // If scrolled to the very bottom, activate the last section (contact)
    if (
      window.innerHeight + Math.ceil(window.scrollY) >=
      document.documentElement.scrollHeight
    ) {
      const lastSection = spy[spy.length - 1];
      if (lastSection) cur = lastSection.id;
    }
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + cur);
    });
  }
  window.addEventListener("scroll", updateSpy, { passive: true });
  updateSpy();

  // ---------- SMOOTH SCROLL ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      e.preventDefault();

      // Show nav and suppress hide during scroll
      glassNav.classList.remove("hide");
      isScrollingTo = true;
      lastY = window.scrollY;

      if (href === "#" || href === "#hero") {
        if (lenis) {
          lenis.scrollTo(0, {
            duration: 1.2,
            onComplete: () => {
              isScrollingTo = false;
              lastY = window.scrollY;
            },
          });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(() => {
            isScrollingTo = false;
            lastY = window.scrollY;
          }, 1200);
        }
        history.pushState?.(null, null, href);
        return;
      }

      const t = document.querySelector(href);
      if (!t) {
        isScrollingTo = false;
        return;
      }

      if (lenis) {
        lenis.scrollTo(t, {
          offset: -90,
          duration: 1.2,
          onComplete: () => {
            isScrollingTo = false;
            lastY = window.scrollY;
          },
        });
      } else {
        const top = t.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: "smooth" });
        setTimeout(() => {
          isScrollingTo = false;
          lastY = window.scrollY;
        }, 1200);
      }
      history.pushState?.(null, null, href);
    });
  });

  // ---------- SCROLL REVEAL ----------
  const reveals = document.querySelectorAll(".scroll-reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -30px 0px" },
  );
  reveals.forEach((el) => io.observe(el));

  // ---------- BACK TO TOP BUTTON ----------
  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      () => {
        backToTop.classList.toggle("visible", window.scrollY > 600);
      },
      { passive: true },
    );

    backToTop.addEventListener("click", () => {
      glassNav.classList.remove("hide");
      isScrollingTo = true;
      lastY = window.scrollY;
      if (lenis) {
        lenis.scrollTo(0, {
          duration: 1.2,
          onComplete: () => {
            isScrollingTo = false;
            lastY = window.scrollY;
          },
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          isScrollingTo = false;
          lastY = window.scrollY;
        }, 1200);
      }
    });
  }

  // ---------- AMBIENT PARTICLE BACKGROUND ----------
  const pCanvas = document.getElementById("particle-canvas");
  if (pCanvas) {
    const pCtx = pCanvas.getContext("2d");
    let pW, pH;
    const particles = [];
    const isSmallScreen = matchMedia("(max-width:600px)").matches;
    const PARTICLE_COUNT = isSmallScreen ? 12 : 50;

    function pResize() {
      pW = pCanvas.width = window.innerWidth;
      pH = pCanvas.height = window.innerHeight;
    }
    pResize();
    window.addEventListener("resize", pResize);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * pW;
        this.y = Math.random() * pH;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > pW) this.speedX *= -1;
        if (this.y < 0 || this.y > pH) this.speedY *= -1;
      }
      draw() {
        const isDark = htmlEl.getAttribute("data-theme") !== "light";
        pCtx.beginPath();
        pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        pCtx.fillStyle = isDark
          ? `rgba(167, 139, 250, ${this.opacity})`
          : `rgba(124, 58, 237, ${this.opacity * 0.6})`;
        pCtx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function drawLines() {
      const isDark = htmlEl.getAttribute("data-theme") !== "light";
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.15;
            pCtx.beginPath();
            pCtx.moveTo(particles[i].x, particles[i].y);
            pCtx.lineTo(particles[j].x, particles[j].y);
            pCtx.strokeStyle = isDark
              ? `rgba(167, 139, 250, ${alpha})`
              : `rgba(124, 58, 237, ${alpha * 0.5})`;
            pCtx.lineWidth = 0.5;
            pCtx.stroke();
          }
        }
      }
    }

    function pFrame() {
      pCtx.clearRect(0, 0, pW, pH);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawLines();
      requestAnimationFrame(pFrame);
    }

    if (
      !matchMedia("(prefers-reduced-motion:reduce)").matches &&
      !isSmallScreen
    )
      pFrame();
  }

  // ---------- FLOWING WAVE BACKGROUND (hero only) ----------
  const canvas = document.getElementById("wave-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H;
  let mx = -9999,
    my = -9999;
  let targetMx = -9999,
    targetMy = -9999;

  let waveVisible = true;
  if ("IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        waveVisible = entries[0].isIntersecting;
      },
      { threshold: 0 },
    );
    const heroEl = document.getElementById("hero");
    if (heroEl) heroObserver.observe(heroEl);
  }

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
  addEventListener("resize", resize);
  addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    targetMx = e.clientX - rect.left;
    targetMy = e.clientY - rect.top;
  });
  addEventListener("mouseleave", () => {
    targetMx = -9999;
    targetMy = -9999;
  });

  const NUM_LINES = 40;
  const POINTS = 200;
  const BASE_AMP = 65;
  const MOUSE_RADIUS = 250;
  const MOUSE_AMP = 40;
  let time = 0;

  function frame() {
    if (!waveVisible) {
      requestAnimationFrame(frame);
      return;
    }
    ctx.clearRect(0, 0, W, H);
    if (targetMx > -9000) {
      mx += (targetMx - mx) * 0.06;
      my += (targetMy - my) * 0.06;
    } else {
      mx = -9999;
      my = -9999;
    }
    time += 0.003;

    const isDark = htmlEl.getAttribute("data-theme") !== "light";
    const centerY = H * 0.65;
    const bandHeight = H * 0.35;

    for (let i = 0; i < NUM_LINES; i++) {
      const t = i / (NUM_LINES - 1);
      const lineY = centerY - bandHeight / 2 + t * bandHeight;
      ctx.beginPath();

      for (let p = 0; p <= POINTS; p++) {
        const px = (p / POINTS) * (W + 80) - 40;
        const nx = p / POINTS;
        let wave =
          Math.sin(nx * 3.8 + time * 1.5 + t * 1.8) * BASE_AMP +
          Math.sin(nx * 6.5 - time * 1.0 + t * 3.0) * BASE_AMP * 0.4 +
          Math.cos(nx * 2.0 + time * 2.2 + t * 1.0) * BASE_AMP * 0.55 +
          Math.sin(nx * 10 + time * 0.7 + t * 4.5) * BASE_AMP * 0.1;
        const centerDist = Math.abs(t - 0.5) * 2;
        wave *= 1 - centerDist * 0.5;
        if (mx > -9000) {
          const dxm = px - mx,
            dym = lineY + wave - my;
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

      const edgeFade = 1 - Math.pow(Math.abs(t - 0.5) * 2, 1.5);
      const baseAlpha = isDark
        ? 0.05 + edgeFade * 0.25
        : 0.03 + edgeFade * 0.15;
      ctx.strokeStyle = isDark
        ? `rgba(167, 139, 250, ${baseAlpha})`
        : `rgba(124, 58, 237, ${baseAlpha})`;
      ctx.lineWidth = isDark ? 1.0 : 0.8;
      ctx.stroke();
    }
    requestAnimationFrame(frame);
  }

  const _isSmall = matchMedia("(max-width:600px)").matches;
  if (!matchMedia("(prefers-reduced-motion:reduce)").matches && !_isSmall)
    frame();
})();
