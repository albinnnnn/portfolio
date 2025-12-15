  // ==========================
  // Smooth Scroll for Anchor Links
  // ==========================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ==========================
  // Scroll Spy (Home Tab Fix Included)
  // ==========================
  const sections = document.querySelectorAll('main section, header');
  const navLinks = document.querySelectorAll('.top-nav a');

  const scrollSpy = () => {
    let current = sections[0].getAttribute('id'); // default to Home

    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      // section is near top of viewport
      if (sectionTop <= 100) { 
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', scrollSpy);
  window.addEventListener('load', scrollSpy); // also update active on page load

  // Optional: ensure Home link is active at the very top
  window.addEventListener('scroll', () => {
    if (window.scrollY === 0) {
      navLinks.forEach(link => link.classList.remove('active'));
      const homeLink = document.querySelector('.top-nav a[href="#home"]');
      if (homeLink) homeLink.classList.add('active');
    }
  });

  // ==========================
  // Animated Counters
  // ==========================
  const counters = document.querySelectorAll('.stat-number');
  const speed = 200; // lower = faster

  const animateCounters = () => {
    counters.forEach(counter => {
      const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / speed;

        if (count < target) {
          counter.innerText = Math.ceil(count + increment);
          setTimeout(updateCount, 20);
        } else {
          counter.innerText = target;
        }
      };
      updateCount();
    });
  };

  // Animate counters when stats section is visible
  const statsSection = document.querySelector('#stats');
  let statsAnimated = false;
  if (statsSection) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          animateCounters();
          statsAnimated = true;
        }
      });
    }, { threshold: 0.5 });
    observer.observe(statsSection);
  }
