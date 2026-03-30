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

  // Animaciones de mockups al entrar a servicios
  if (name === 'servicios') {
    setTimeout(() => initMockupAnimations(), 150);
  }
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


/* ═══════════════════════════════════════
   ANIMACIONES DE MOCKUPS
═══════════════════════════════════════ */
function initMockupAnimations() {
  // Contador animado para KPIs del CRM
  function animateCounter(el, target, suffix, duration) {
    const start = performance.now();
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = suffix === '%' || suffix === ''
        ? Math.round(eased * target)
        : Math.round(eased * target);
      el.textContent = (suffix === '$' ? '$' + value.toLocaleString() : value + suffix);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  // Observer para el browser mockup
  const browserMock = document.querySelector('.mb-browser');
  if (browserMock) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          browserMock.classList.add('mock-browser-animated');
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    obs.observe(browserMock);
  }

  // Observer para el CRM mockup
  const crmMock = document.querySelector('.mb-dashboard');
  if (crmMock) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          crmMock.classList.add('mock-crm-animated');

          // Animar KPIs
          const kpiBig = crmMock.querySelectorAll('.mb-kpi-big');
          // [0] Ingresos $48,200  [1] Leads 127  [2] Tasa 82%
          setTimeout(() => animateCounter(kpiBig[0], 48200, '$', 1200), 300);
          setTimeout(() => animateCounter(kpiBig[1], 127,   '',  900), 400);
          setTimeout(() => animateCounter(kpiBig[2], 82,    '%', 1000), 500);

          // Restaurar clases de color (el counter las sobreescribe con textContent)
          setTimeout(() => {
            kpiBig[0].textContent = '$48,200';
            kpiBig[1].textContent = '127';
            kpiBig[2].textContent = '82%';
          }, 1700);

          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    obs.observe(crmMock);
  }
}

/* ═══════════════════════════════════════
   FORMULARIO DE CONTACTO → WHATSAPP
═══════════════════════════════════════ */
async function enviarWhatsApp() {
  const nombre   = document.getElementById('cf-nombre').value.trim();
  const empresa  = document.getElementById('cf-empresa').value.trim();
  const email    = document.getElementById('cf-email').value.trim();
  const telefono = document.getElementById('cf-telefono').value.trim();
  const servicio = document.getElementById('cf-servicio').value;
  const mensaje  = document.getElementById('cf-mensaje').value.trim();

  if (!nombre)   { alert('Por favor ingresa tu nombre.'); return; }
  if (!servicio) { alert('Por favor selecciona un servicio.'); return; }

  const btn = document.querySelector('.btn-submit');
  btn.disabled = true;
  btn.textContent = 'Enviando…';

  // ── WhatsApp ──────────────────────────────────────
  let texto = `Hola, soy *${nombre}*`;
  if (empresa) texto += ` de *${empresa}*`;
  texto += `.\n\n`;
  texto += `*Servicio de interés:* ${servicio}\n`;
  if (email)    texto += `*Email:* ${email}\n`;
  if (telefono) texto += `*Teléfono:* ${telefono}\n`;
  if (mensaje)  texto += `\n*Mensaje:* ${mensaje}`;

  window.open(`https://wa.me/523314816421?text=${encodeURIComponent(texto)}`, '_blank');

  // ── Email vía Formspree ───────────────────────────
  const FORMSPREE_ID = 'mkoprgwq';
  try {
    await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre, empresa, email, telefono, servicio,
        mensaje: mensaje || '(sin descripción)',
        _subject: `Nuevo contacto de ${nombre} — Synapse`
      })
    });
  } catch (e) {
    // El WhatsApp ya abrió; el email falla silenciosamente
  }

  // ── Pantalla de éxito ─────────────────────────────
  const cform = document.querySelector('.cform');
  cform.innerHTML = `
    <div class="form-success">
      <div class="form-success-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div class="form-success-title">¡Solicitud enviada!</div>
      <div class="form-success-sub">Recibimos tu mensaje. Te respondemos en menos de 24 horas con una propuesta personalizada.</div>
    </div>
  `;
}
