/* ====================================
   main.js — UI interactions
   ==================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Header scroll ───────────────────
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ─── Burger menu ─────────────────────
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('nav');
  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
    const isOpen = nav.classList.contains('open');
    burger.setAttribute('aria-expanded', isOpen);
  });
  // Close on nav link click
  nav.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });

  // ─── Scroll reveal ───────────────────
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          // Stagger siblings
          const siblings = [...e.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
          const idx = siblings.indexOf(e.target);
          e.target.style.transitionDelay = `${Math.min(idx * 0.08, 0.4)}s`;
          e.target.classList.add('visible');
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  reveals.forEach(el => revealObserver.observe(el));

  // ─── Counter animation ───────────────
  const counters = document.querySelectorAll('.stat-card__num[data-target]');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el     = e.target;
        const target = parseInt(el.dataset.target, 10);
        const dur    = 1800;
        const step   = 16;
        const inc    = target / (dur / step);
        let current  = 0;
        const timer  = setInterval(() => {
          current = Math.min(current + inc, target);
          el.textContent = Math.floor(current);
          if (current >= target) clearInterval(timer);
        }, step);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach(el => counterObserver.observe(el));

  // ─── Works filter ────────────────────
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards  = document.querySelectorAll('.work-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      workCards.forEach(card => {
        const cat = card.dataset.category;
        if (filter === 'all' || cat === filter) {
          card.classList.remove('hidden');
          card.classList.add('reveal', 'visible');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ─── Reviews slider ──────────────────
  const track    = document.getElementById('reviewsTrack');
  const cards    = track.querySelectorAll('.review-card');
  const prevBtn  = document.getElementById('reviewsPrev');
  const nextBtn  = document.getElementById('reviewsNext');
  const dotsWrap = document.getElementById('reviewsDots');

  let current     = 0;
  let perView     = getPerView();
  let maxIndex    = Math.max(0, cards.length - perView);

  function getPerView() {
    if (window.innerWidth < 768)  return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const total = maxIndex + 1;
    for (let i = 0; i < total; i++) {
      const d = document.createElement('button');
      d.className = 'reviews__dot' + (i === current ? ' active' : '');
      d.setAttribute('aria-label', `Отзыв ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIndex));
    const cardWidth = cards[0].offsetWidth + 24; // gap = 24
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    dotsWrap.querySelectorAll('.reviews__dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Touch/drag support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
  });

  // Auto-play
  let autoPlay = setInterval(() => goTo(current < maxIndex ? current + 1 : 0), 5000);
  track.addEventListener('mouseenter', () => clearInterval(autoPlay));
  track.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => goTo(current < maxIndex ? current + 1 : 0), 5000);
  });

  function init() {
    perView   = getPerView();
    maxIndex  = Math.max(0, cards.length - perView);
    current   = 0;
    buildDots();
    goTo(0);
  }

  window.addEventListener('resize', init);
  init();

  // ─── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

});
