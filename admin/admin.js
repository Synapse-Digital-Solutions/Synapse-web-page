// ── Auth guard ──
const TOKEN = localStorage.getItem('synapse_admin_token');
if (!TOKEN) window.location.href = '/admin/';

// ── State ──
let content = {};

// ── Init ──
loadContent();

async function loadContent() {
  try {
    const res = await fetch('/api/content');
    content = await res.json();
    renderAll();
  } catch {
    showToast('Error al cargar el contenido', 'error');
  }
}

function renderAll() {
  renderHero();
  renderEstadisticas();
  renderServicios();
  renderPrecios();
}

// ── Navigation ──
function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  document.getElementById('nav-' + name)?.classList.add('active');
  document.getElementById('topbar-title').textContent = {
    hero: 'Hero principal',
    estadisticas: 'Estadísticas',
    servicios: 'Servicios',
    precios: 'Precios',
  }[name];
}

// ── Save ──
async function saveSection(key) {
  const btn = document.querySelector(`#panel-${key} .btn-save`);
  const status = document.getElementById(`status-${key}`);

  btn.disabled = true;
  status.textContent = 'Guardando…';
  status.className = 'save-status loading';

  const data = collectSection(key);

  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ key, data })
    });

    if (res.ok) {
      content[key] = data;
      status.textContent = '✓ Guardado';
      status.className = 'save-status ok';
      showToast('Cambios guardados correctamente', 'success');
    } else if (res.status === 401) {
      logout();
    } else {
      throw new Error();
    }
  } catch {
    status.textContent = 'Error al guardar';
    status.className = 'save-status err';
    showToast('No se pudo guardar. Intenta de nuevo.', 'error');
  }

  btn.disabled = false;
  setTimeout(() => { status.className = 'save-status'; }, 3000);
}

// ── Collect form data ──
function collectSection(key) {
  if (key === 'hero') {
    return {
      badge: val('hero-badge'),
      titulo1: val('hero-titulo1'),
      titulo2: val('hero-titulo2'),
      subtitulo: val('hero-subtitulo'),
      btn1: val('hero-btn1'),
      btn2: val('hero-btn2'),
    };
  }

  if (key === 'estadisticas') {
    return getStats();
  }

  if (key === 'servicios') {
    return getServicios();
  }

  if (key === 'precios') {
    return getPrecios();
  }
}

function val(id) {
  return document.getElementById(id)?.value.trim() || '';
}

// ── Hero ──
function renderHero() {
  const h = content.hero || {};
  setVal('hero-badge', h.badge || 'Tecnología que conecta negocios');
  setVal('hero-titulo1', h.titulo1 || 'Tu presencia digital,');
  setVal('hero-titulo2', h.titulo2 || 'redefinida.');
  setVal('hero-subtitulo', h.subtitulo || 'Diseñamos páginas web que convierten y CRMs que organizan tu negocio.');
  setVal('hero-btn1', h.btn1 || 'Ver servicios');
  setVal('hero-btn2', h.btn2 || 'Hablar con nosotros');
}

function setVal(id, v) {
  const el = document.getElementById(id);
  if (el) el.value = v;
}

// ── Estadísticas ──
const DEFAULT_STATS = [
  { valor: '50+', etiqueta: 'Proyectos' },
  { valor: '98%', etiqueta: 'Satisfacción' },
  { valor: '3x',  etiqueta: 'Conversiones' },
  { valor: '24/7', etiqueta: 'Soporte' },
];

function renderEstadisticas() {
  const stats = content.estadisticas || DEFAULT_STATS;
  const container = document.getElementById('stats-list');
  container.innerHTML = '';

  stats.forEach((s, i) => {
    const row = document.createElement('div');
    row.className = 'grid-2 field';
    row.style.marginBottom = '.75rem';
    row.innerHTML = `
      <div class="field" style="margin:0">
        <label>Valor #${i + 1}</label>
        <input type="text" class="stat-valor" value="${esc(s.valor)}" placeholder="50+">
      </div>
      <div class="field" style="margin:0">
        <label>Etiqueta #${i + 1}</label>
        <input type="text" class="stat-etiqueta" value="${esc(s.etiqueta)}" placeholder="Proyectos">
      </div>
    `;
    container.appendChild(row);
  });
}

function getStats() {
  const vals = [...document.querySelectorAll('.stat-valor')].map(el => el.value.trim());
  const labels = [...document.querySelectorAll('.stat-etiqueta')].map(el => el.value.trim());
  return vals.map((v, i) => ({ valor: v, etiqueta: labels[i] || '' }));
}

// ── Servicios ──
const DEFAULT_SERVICIOS = [
  {
    numero: '01',
    titulo: 'Páginas Web de Alto Impacto',
    descripcion: 'Diseñamos sitios que comunican lo que tu negocio es, no solo cómo se ve.',
    features: [
      'Diseño único a tu medida — sin plantillas genéricas',
      'Optimización SEO desde el día uno',
      'Velocidad de carga máxima en todos los dispositivos',
      'Integración con redes sociales, WhatsApp y CRM',
      'Panel de métricas y analítica incluido',
    ],
    pills: ['Landing Pages', 'E-commerce', 'Corporativo', 'SEO', 'Portafolios'],
  },
  {
    numero: '02',
    titulo: 'CRM a la Medida',
    descripcion: 'Olvídate de las hojas de cálculo y el caos. Te damos un sistema hecho exactamente para tu flujo de trabajo.',
    features: [
      'Pipeline visual de ventas personalizable',
      'Seguimiento automático de leads y oportunidades',
      'Reportes y dashboards en tiempo real',
      'Automatizaciones de tareas y recordatorios',
      'Integración con WhatsApp, email y más',
    ],
    pills: ['Pipeline', 'Automatización', 'Reportes', 'Integraciones', 'Multi-usuario'],
  },
  {
    numero: '03',
    titulo: 'Estrategia Digital Completa',
    descripcion: 'No solo construimos — te acompañamos. Analizamos tu negocio y definimos qué herramientas necesitas.',
    features: [
      'Diagnóstico digital de tu negocio actual',
      'Hoja de ruta personalizada con prioridades claras',
      'Selección y configuración de herramientas tech',
      'Capacitación a tu equipo incluida',
      'Soporte continuo y ajustes post-lanzamiento',
    ],
    pills: ['Consultoría', 'Análisis', 'Soporte', 'Escalabilidad'],
  },
];

function renderServicios() {
  const servicios = content.servicios || DEFAULT_SERVICIOS;
  const container = document.getElementById('servicios-list');
  container.innerHTML = '';

  servicios.forEach((s, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = i;
    card.innerHTML = `
      <div class="card-title">
        <span class="card-title-dot" style="background:${['var(--purple)','var(--blue)','var(--cyan)'][i]}"></span>
        ${esc(s.numero)} · ${esc(s.titulo)}
      </div>
      <div class="field">
        <label>Título del servicio</label>
        <input type="text" class="svc-titulo" value="${esc(s.titulo)}">
      </div>
      <div class="field">
        <label>Descripción</label>
        <textarea class="svc-descripcion">${esc(s.descripcion)}</textarea>
      </div>
      <div class="field">
        <label>Características (una por línea)</label>
        <textarea class="svc-features" rows="6">${s.features.join('\n')}</textarea>
      </div>
      <div class="field">
        <label>Tags / Pills</label>
        ${buildTagsEditor('svc-pills-' + i, s.pills)}
        <div class="tags-hint">Escribe y presiona Enter o coma para agregar</div>
      </div>
      <div class="save-row">
        <button class="btn-save" onclick="saveServicio(${i})">Guardar servicio</button>
        <span class="save-status" id="status-svc-${i}"></span>
      </div>
    `;
    container.appendChild(card);
    initTagsEditor('svc-pills-' + i);
  });
}

function getServicios() {
  const cards = [...document.querySelectorAll('#servicios-list .card')];
  return cards.map((card, i) => ({
    numero: DEFAULT_SERVICIOS[i]?.numero || String(i + 1).padStart(2, '0'),
    titulo: card.querySelector('.svc-titulo').value.trim(),
    descripcion: card.querySelector('.svc-descripcion').value.trim(),
    features: card.querySelector('.svc-features').value.split('\n').map(l => l.trim()).filter(Boolean),
    pills: getTagsFromEditor('svc-pills-' + i),
  }));
}

async function saveServicio(index) {
  const btn = document.querySelector(`#servicios-list .card:nth-child(${index + 1}) .btn-save`);
  const status = document.getElementById(`status-svc-${index}`);

  btn.disabled = true;
  status.textContent = 'Guardando…';
  status.className = 'save-status loading';

  const data = getServicios();

  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ key: 'servicios', data })
    });

    if (res.ok) {
      content.servicios = data;
      status.textContent = '✓ Guardado';
      status.className = 'save-status ok';
      showToast('Servicio guardado correctamente', 'success');
    } else if (res.status === 401) {
      logout();
    } else {
      throw new Error();
    }
  } catch {
    status.textContent = 'Error al guardar';
    status.className = 'save-status err';
    showToast('No se pudo guardar. Intenta de nuevo.', 'error');
  }

  btn.disabled = false;
  setTimeout(() => { status.className = 'save-status'; }, 3000);
}

// ── Precios ──
const DEFAULT_PRECIOS = [
  {
    nombre: 'Básico',
    precio: '$8,500',
    descripcion: 'Ideal para negocios que necesitan presencia web profesional.',
    features: ['Landing page de hasta 5 secciones', 'Diseño responsivo', 'SEO básico', 'Formulario de contacto', '1 ronda de revisiones'],
    destacado: false,
  },
  {
    nombre: 'Profesional',
    precio: '$15,000',
    descripcion: 'Para empresas que quieren impacto real y más páginas.',
    features: ['Hasta 8 páginas', 'Diseño premium a medida', 'SEO avanzado', 'Integración WhatsApp', 'Blog o catálogo', '3 rondas de revisiones', 'Soporte 30 días'],
    destacado: true,
  },
  {
    nombre: 'Empresarial',
    precio: 'A cotizar',
    descripcion: 'Solución completa con CRM, estrategia y soporte continuo.',
    features: ['Todo lo del plan Profesional', 'CRM a la medida', 'Estrategia digital', 'Automatizaciones', 'Soporte continuo', 'Capacitación del equipo'],
    destacado: false,
  },
];

function renderPrecios() {
  const precios = content.precios || DEFAULT_PRECIOS;
  const container = document.getElementById('precios-list');
  container.innerHTML = '';

  precios.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-title">
        <span class="card-title-dot" style="background:${p.destacado ? 'var(--purple)' : 'var(--muted)'}"></span>
        Plan ${esc(p.nombre)} ${p.destacado ? '<span style="color:var(--purple);font-size:.7rem;margin-left:.5rem">★ Destacado</span>' : ''}
      </div>
      <div class="grid-2">
        <div class="field">
          <label>Nombre del plan</label>
          <input type="text" class="precio-nombre" value="${esc(p.nombre)}">
        </div>
        <div class="field">
          <label>Precio</label>
          <input type="text" class="precio-valor" value="${esc(p.precio)}" placeholder="$15,000 o 'A cotizar'">
        </div>
      </div>
      <div class="field">
        <label>Descripción corta</label>
        <input type="text" class="precio-desc" value="${esc(p.descripcion)}">
      </div>
      <div class="field">
        <label>Características incluidas (una por línea)</label>
        <textarea class="precio-features" rows="6">${p.features.join('\n')}</textarea>
      </div>
      <div class="field">
        <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer">
          <input type="checkbox" class="precio-destacado" ${p.destacado ? 'checked' : ''} style="width:auto;margin:0">
          Marcar como plan destacado (resaltado visualmente)
        </label>
      </div>
      <div class="save-row">
        <button class="btn-save" onclick="savePrecio(${i})">Guardar plan</button>
        <span class="save-status" id="status-precio-${i}"></span>
      </div>
    `;
    container.appendChild(card);
  });
}

function getPrecios() {
  const cards = [...document.querySelectorAll('#precios-list .card')];
  return cards.map(card => ({
    nombre: card.querySelector('.precio-nombre').value.trim(),
    precio: card.querySelector('.precio-valor').value.trim(),
    descripcion: card.querySelector('.precio-desc').value.trim(),
    features: card.querySelector('.precio-features').value.split('\n').map(l => l.trim()).filter(Boolean),
    destacado: card.querySelector('.precio-destacado').checked,
  }));
}

async function savePrecio(index) {
  const btn = document.querySelector(`#precios-list .card:nth-child(${index + 1}) .btn-save`);
  const status = document.getElementById(`status-precio-${index}`);

  btn.disabled = true;
  status.textContent = 'Guardando…';
  status.className = 'save-status loading';

  const data = getPrecios();

  try {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ key: 'precios', data })
    });

    if (res.ok) {
      content.precios = data;
      status.textContent = '✓ Guardado';
      status.className = 'save-status ok';
      showToast('Plan guardado correctamente', 'success');
    } else if (res.status === 401) {
      logout();
    } else {
      throw new Error();
    }
  } catch {
    status.textContent = 'Error al guardar';
    status.className = 'save-status err';
    showToast('No se pudo guardar. Intenta de nuevo.', 'error');
  }

  btn.disabled = false;
  setTimeout(() => { status.className = 'save-status'; }, 3000);
}

// ── Tags editor ──
function buildTagsEditor(id, tags) {
  const tagsHtml = (tags || []).map(t =>
    `<span class="tag">${esc(t)}<span class="tag-remove" onclick="removeTag(this)">×</span></span>`
  ).join('');
  return `
    <div class="tags-editor" id="${id}" onclick="this.querySelector('.tag-input').focus()">
      ${tagsHtml}
      <input class="tag-input" type="text" placeholder="Agregar…">
    </div>
  `;
}

function initTagsEditor(id) {
  const container = document.getElementById(id);
  if (!container) return;
  const input = container.querySelector('.tag-input');
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = input.value.trim().replace(/,$/, '');
      if (val) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `${esc(val)}<span class="tag-remove" onclick="removeTag(this)">×</span>`;
        container.insertBefore(tag, input);
        input.value = '';
      }
    }
    if (e.key === 'Backspace' && !input.value) {
      const tags = container.querySelectorAll('.tag');
      if (tags.length) tags[tags.length - 1].remove();
    }
  });
}

function removeTag(el) {
  el.parentElement.remove();
}

function getTagsFromEditor(id) {
  const container = document.getElementById(id);
  if (!container) return [];
  return [...container.querySelectorAll('.tag')].map(t => t.childNodes[0].textContent.trim());
}

// ── Toast ──
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ── Logout ──
function logout() {
  localStorage.removeItem('synapse_admin_token');
  window.location.href = '/admin/';
}

// ── Utils ──
function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
