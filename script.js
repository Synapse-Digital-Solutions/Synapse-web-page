/* ═══════════════════════════════════════
   SPLASH
═══════════════════════════════════════ */
window.addEventListener('load', () => {
  setTimeout(() => {

    const splash = document.getElementById('splash');
    const navbar = document.getElementById('navbar');

    if (splash) splash.classList.add('hide');
    if (navbar) navbar.classList.add('visible');

    startHeroAnimations();
    initParticles();
    initScrollAnimations(document.getElementById('page-inicio'));
    initCounters(document.getElementById('page-inicio'));

  }, 4000);
});


/* ═══════════════════════════════════════
   ANIMACIONES DEL HERO
═══════════════════════════════════════ */
function startHeroAnimations() {
  // Textos del hero
  const heroEls = document.querySelectorAll(
    '.hero-badge, .hero-h1 .line span, .hero-p, .hero-actions, .hero-stats'
  );
  heroEls.forEach(el => {
    el.style.animationPlayState = 'running';
  });

  // Dashboard derecho
  const heroRight = document.querySelector('.hero-right');
  if (heroRight) heroRight.style.animationPlayState = 'running';

  // Barras del chart
  document.querySelectorAll('.bar').forEach(el => {
    el.style.animationPlayState = 'running';
  });

  // Pipeline fills
  document.querySelectorAll('.p-fill').forEach(el => {
    el.style.animationPlayState = 'running';
  });

  // Donut segments
  document.querySelectorAll('.donut-seg').forEach(el => {
    el.style.animationPlayState = 'running';
  });
}


/* ═══════════════════════════════════════
   CAMBIO DE PÁGINA (SPA)
═══════════════════════════════════════ */
function showService(sectionId) {
  showPage('servicios');
  setTimeout(() => {
    const target = document.getElementById(sectionId);
    const page   = document.getElementById('page-servicios');
    if (target && page) {
      page.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
  }, 120);
}

function showPage(name) {
  // Ocultar todas las páginas
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });

  // Quitar active de todos los links
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active');
  });

  // Mostrar la página destino
  const target = document.getElementById('page-' + name);
  target.classList.add('active');
  target.scrollTop = 0;

  // Marcar link activo en el nav
  const activeLink = document.querySelector(`.nav-links a[data-page="${name}"]`);
  if (activeLink) activeLink.classList.add('active');

  // Arrancar animaciones de scroll de esa página
  setTimeout(() => {
    initScrollAnimations(target);
  }, 80);
}


/* ═══════════════════════════════════════
   PARTÍCULAS — HERO CANVAS
═══════════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  const COUNT  = 55;
  const MAX_DIST = 130;
  let   particles = [];
  let   animId;

  function resize() {
    const hero = canvas.parentElement;
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r:  Math.random() * 1.5 + 0.8,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Conectar partículas cercanas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }

    // Dibujar puntos
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.fill();
    });

    // Mover
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });

    animId = requestAnimationFrame(draw);
  }

  // Pausar cuando la página de inicio no esté activa
  const pageInicio = document.getElementById('page-inicio');
  const pageObserver = new MutationObserver(() => {
    if (pageInicio.classList.contains('active')) {
      if (!animId) draw();
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  });
  pageObserver.observe(pageInicio, { attributes: true, attributeFilter: ['class'] });

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  resize();
  createParticles();
  draw();
}


/* ═══════════════════════════════════════
   CONTADORES ANIMADOS — SECCIÓN NÚMEROS
═══════════════════════════════════════ */
function initCounters(pageEl) {
  const nums = pageEl.querySelectorAll('.nstat-num[data-target]');
  if (!nums.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      animateCounter(entry.target);
    });
  }, { threshold: 0.5, root: pageEl });

  nums.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1800;
  const start    = performance.now();

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.round(easeOut(progress) * target);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}


/* ═══════════════════════════════════════
   ANIMACIONES DE SCROLL (por página)
═══════════════════════════════════════ */
function initScrollAnimations(pageEl) {
  const elements = pageEl.querySelectorAll('.anim:not(.in)');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    root: pageEl   // <- observa dentro de la página, no del window
  });

  elements.forEach(el => observer.observe(el));
}
