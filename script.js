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
    initScrollAnimations(document.getElementById('page-inicio'));

  }, 2400);
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
