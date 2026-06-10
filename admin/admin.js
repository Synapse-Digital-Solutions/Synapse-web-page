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
  renderPromociones();
  renderBanner();
  renderGaleria();
  renderNosotros();
  renderContacto();
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
    promociones: 'Promociones',
    banner: 'Banner superior',
    galeria: 'Galería',
    nosotros: 'Nosotros',
    contacto: 'Contacto',
  }[name];
}

// ── Save ──
async function saveSection(key) {
  const btns = [...document.querySelectorAll(`#panel-${key} .btn-save`)];
  const statuses = [...document.querySelectorAll(`#panel-${key} #status-${key}`)];

  btns.forEach(b => b.disabled = true);
  statuses.forEach(s => { s.textContent = 'Guardando…'; s.className = 'save-status loading'; });

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
      statuses.forEach(s => { s.textContent = '✓ Guardado'; s.className = 'save-status ok'; });
      showToast('Cambios guardados correctamente', 'success');
    } else if (res.status === 401) {
      logout();
    } else {
      throw new Error();
    }
  } catch {
    statuses.forEach(s => { s.textContent = 'Error al guardar'; s.className = 'save-status err'; });
    showToast('No se pudo guardar. Intenta de nuevo.', 'error');
  }

  btns.forEach(b => b.disabled = false);
  setTimeout(() => { statuses.forEach(s => s.className = 'save-status'); }, 3000);
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

  if (key === 'promociones') {
    return getPromociones().filter(p => p.titulo || p.descripcion || p.imagen_url);
  }

  if (key === 'galeria') {
    return getGaleria().filter(g => g.url);
  }

  if (key === 'banner') {
    return {
      activo: document.getElementById('banner-activo').checked,
      texto: val('banner-texto'),
      link: val('banner-link'),
    };
  }

  if (key === 'nosotros') {
    return {
      mision: val('nosotros-mision'),
      valores: getValores(),
    };
  }

  if (key === 'contacto') {
    return {
      telefono1: val('contacto-telefono1'),
      telefono2: val('contacto-telefono2'),
      email: val('contacto-email'),
      ubicacion: val('contacto-ubicacion'),
    };
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
  { valor: '50+', etiqueta: 'Proyectos entregados' },
  { valor: '98%', etiqueta: 'Satisfacción del cliente' },
  { valor: '3x',  etiqueta: 'Más conversiones promedio' },
  { valor: '24h', etiqueta: 'Tiempo de respuesta' },
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
      <div class="field">
        <label>Imagen del servicio (opcional — si no se sube, se muestra la ilustración por defecto)</label>
        ${buildImageUploader('svc-img-' + i, s.imagen_url)}
      </div>
      <div class="save-row">
        <button class="btn-save" onclick="saveServicio(${i})">Guardar servicio</button>
        <span class="save-status" id="status-svc-${i}"></span>
      </div>
    `;
    container.appendChild(card);
    initTagsEditor('svc-pills-' + i);
    initImageUploader('svc-img-' + i);
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
    imagen_url: getUploaderUrl('svc-img-' + i),
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

// ── Upload de medios ──
async function uploadFile(file) {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': file.type,
      'X-Filename': file.name,
      'Authorization': `Bearer ${TOKEN}`
    },
    body: file
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al subir el archivo');
  }
  const data = await res.json();
  return data.url;
}

function buildImageUploader(id, currentUrl, accept = 'image/*') {
  const isVideo = currentUrl && /\.(mp4|webm|mov)$/i.test(currentUrl);
  const previewHtml = currentUrl
    ? (isVideo
        ? `<video src="${esc(currentUrl)}" muted></video>`
        : `<img src="${esc(currentUrl)}" alt="">`)
    : `<span class="img-placeholder">Sin archivo</span>`;
  return `
    <div class="img-uploader" id="${id}" data-url="${esc(currentUrl || '')}">
      <div class="img-preview">${previewHtml}</div>
      <input type="file" class="img-file-input" accept="${accept}">
      <span class="img-upload-status"></span>
    </div>
  `;
}

function initImageUploader(id) {
  const container = document.getElementById(id);
  if (!container) return;
  const input = container.querySelector('.img-file-input');
  const status = container.querySelector('.img-upload-status');
  const preview = container.querySelector('.img-preview');

  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    status.textContent = 'Subiendo…';
    status.className = 'img-upload-status';
    try {
      const url = await uploadFile(file);
      container.dataset.url = url;
      const isVideo = file.type.startsWith('video/');
      preview.innerHTML = isVideo
        ? `<video src="${esc(url)}" muted></video>`
        : `<img src="${esc(url)}" alt="">`;
      status.textContent = '✓ Subido';
      status.className = 'img-upload-status ok';
    } catch (e) {
      status.textContent = e.message || 'Error al subir';
      status.className = 'img-upload-status err';
    }
  });
}

function getUploaderUrl(id) {
  return document.getElementById(id)?.dataset.url || '';
}

// ── Promociones ──
function renderPromociones() {
  const promos = content.promociones || [];
  const container = document.getElementById('promociones-list');
  container.innerHTML = '';

  promos.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-title">
        <span class="card-title-dot" style="background:var(--purple)"></span>
        Promoción ${i + 1}
      </div>
      <div class="field">
        <label>Título</label>
        <input type="text" class="promo-titulo" value="${esc(p.titulo)}">
      </div>
      <div class="field">
        <label>Descripción</label>
        <textarea class="promo-descripcion">${esc(p.descripcion)}</textarea>
      </div>
      <div class="field">
        <label>Enlace (opcional)</label>
        <input type="text" class="promo-link" value="${esc(p.link)}" placeholder="https://...">
      </div>
      <div class="field">
        <label>Imagen</label>
        ${buildImageUploader('promo-img-' + i, p.imagen_url)}
      </div>
      <button class="btn-remove-item" onclick="removePromocion(${i})">Eliminar promoción</button>
      <div class="save-row">
        <button class="btn-save" onclick="saveSection('promociones')">Guardar cambios</button>
        <span class="save-status" id="status-promociones"></span>
      </div>
    `;
    container.appendChild(card);
    initImageUploader('promo-img-' + i);
  });
}

function getPromociones() {
  const cards = [...document.querySelectorAll('#promociones-list .card')];
  return cards.map((card, i) => ({
    titulo: card.querySelector('.promo-titulo').value.trim(),
    descripcion: card.querySelector('.promo-descripcion').value.trim(),
    link: card.querySelector('.promo-link').value.trim(),
    imagen_url: getUploaderUrl('promo-img-' + i),
  }));
}

function addPromocion() {
  content.promociones = getPromociones();
  content.promociones.push({ titulo: '', descripcion: '', link: '', imagen_url: '' });
  renderPromociones();
}

function removePromocion(index) {
  const promos = getPromociones();
  promos.splice(index, 1);
  content.promociones = promos;
  renderPromociones();
}

// ── Banner ──
function renderBanner() {
  const b = content.banner || {};
  document.getElementById('banner-activo').checked = !!b.activo;
  setVal('banner-texto', b.texto || '');
  setVal('banner-link', b.link || '');
}

// ── Galería ──
function renderGaleria() {
  const items = content.galeria || [];
  const container = document.getElementById('galeria-list');
  container.innerHTML = '';

  items.forEach((g, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-title">
        <span class="card-title-dot" style="background:var(--cyan)"></span>
        Elemento ${i + 1}
      </div>
      <div class="field">
        <label>Foto o video</label>
        ${buildImageUploader('gal-img-' + i, g.url, 'image/*,video/*')}
      </div>
      <div class="field">
        <label>Descripción (opcional)</label>
        <input type="text" class="gal-caption" value="${esc(g.caption)}">
      </div>
      <button class="btn-remove-item" onclick="removeGaleriaItem(${i})">Eliminar elemento</button>
      <div class="save-row">
        <button class="btn-save" onclick="saveSection('galeria')">Guardar cambios</button>
        <span class="save-status" id="status-galeria"></span>
      </div>
    `;
    container.appendChild(card);
    initImageUploader('gal-img-' + i);
  });
}

function getGaleria() {
  const cards = [...document.querySelectorAll('#galeria-list .card')];
  return cards.map((card, i) => {
    const url = getUploaderUrl('gal-img-' + i);
    return {
      url,
      tipo: /\.(mp4|webm|mov)$/i.test(url) ? 'video' : 'imagen',
      caption: card.querySelector('.gal-caption').value.trim(),
    };
  });
}

function addGaleriaItem() {
  content.galeria = getGaleria();
  content.galeria.push({ url: '', tipo: 'imagen', caption: '' });
  renderGaleria();
}

function removeGaleriaItem(index) {
  const items = getGaleria();
  items.splice(index, 1);
  content.galeria = items;
  renderGaleria();
}

// ── Nosotros ──
const DEFAULT_VALORES = [
  { titulo: '', desc: '' },
  { titulo: '', desc: '' },
  { titulo: '', desc: '' },
];

function renderNosotros() {
  const n = content.nosotros || {};
  setVal('nosotros-mision', n.mision || '');

  const valores = (n.valores && n.valores.length === 3) ? n.valores : DEFAULT_VALORES;
  const container = document.getElementById('valores-list');
  container.innerHTML = '';

  valores.forEach((v, i) => {
    const row = document.createElement('div');
    row.className = 'field';
    row.style.borderTop = i > 0 ? '1px solid var(--border)' : '';
    row.style.paddingTop = i > 0 ? '1rem' : '';
    row.innerHTML = `
      <label>Valor ${i + 1} — Título</label>
      <input type="text" class="valor-titulo" value="${esc(v.titulo)}">
      <label style="margin-top:.6rem">Valor ${i + 1} — Descripción</label>
      <textarea class="valor-desc" rows="2">${esc(v.desc)}</textarea>
    `;
    container.appendChild(row);
  });
}

function getValores() {
  const titulos = [...document.querySelectorAll('.valor-titulo')].map(el => el.value.trim());
  const descs = [...document.querySelectorAll('.valor-desc')].map(el => el.value.trim());
  return titulos.map((t, i) => ({ titulo: t, desc: descs[i] || '' }));
}

// ── Contacto ──
function renderContacto() {
  const c = content.contacto || {};
  setVal('contacto-telefono1', c.telefono1 || '');
  setVal('contacto-telefono2', c.telefono2 || '');
  setVal('contacto-email', c.email || '');
  setVal('contacto-ubicacion', c.ubicacion || '');
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
