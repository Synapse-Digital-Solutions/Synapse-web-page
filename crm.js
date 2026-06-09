/* ══════════════════════════════════════════
   Synapse CRM — App v4
   ══════════════════════════════════════════ */

// ── CONFIG ──
const SUPABASE_URL = 'https://oaqnacycwvfxirvvfeas.supabase.co';
const SUPABASE_KEY = 'sb_publishable_XR6mGip9Hkeu2np808QqjA_lHGD3oOH';
const _supa = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const PLANES_DEFAULT = [
  {
    id: 1, nombre: 'Página Web Profesional', implementacion: 13000, mensual: 800,
    features: [
      'Diseño personalizado adaptado a tu empresa',
      'Hasta 5 secciones (inicio, servicios, quiénes somos, contacto + 1)',
      'Diseño responsivo: celular, tablet y computadora',
      'Formulario de contacto directo',
      'Integración con Google Maps',
      'Dominio propio (.com o .com.mx) incluido el primer año',
      'Optimización básica para buscadores (SEO)',
      'Entrega en 15 días hábiles',
    ],
  },
  {
    id: 2, nombre: 'CRM — Gestión de Clientes', implementacion: 15000, mensual: 2000,
    features: [
      'Análisis de los procesos actuales de tu empresa',
      'Configuración del sistema a la medida de tu operación',
      'Migración de contactos y datos existentes',
      'Creación de flujos de seguimiento y expedientes',
      'Capacitación presencial o virtual (hasta 3 sesiones)',
      'Manual de uso básico personalizado',
      'Soporte técnico vía WhatsApp en horario hábil',
      'Revisión mensual de uso y optimización del sistema',
    ],
  },
  {
    id: 3, nombre: 'Paquete Completo', implementacion: 26000, mensual: 2800,
    features: [
      'Todo lo incluido en Página Web Profesional',
      'Todo lo incluido en CRM — Gestión de Clientes',
      'Ahorro de $2,000 frente a planes individuales',
      'Onboarding dedicado con consultor Synapse',
      'Prioridad en soporte técnico',
    ],
  },
];

// ── PLANES (localStorage) ──
function loadPlanes() {
  try {
    const raw = localStorage.getItem('synapse_planes_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return PLANES_DEFAULT.map(p => ({ ...p, features: [...p.features] }));
}
function savePlanes() {
  localStorage.setItem('synapse_planes_v2', JSON.stringify(planes));
}

// ── STATE ──
let records      = [];
let tab          = 'dashboard';
let search       = '';
let filtroEstado = 'todos';
let editingId    = null;
let pendingConfirm = null;

let planes      = loadPlanes();
let editingPlanId = null;

// Cotizar state
let cotizarClienteId = null;
let cotizarSearch    = '';
let cotizarItems     = []; // [{planId, nombre, implementacion, mensual, descuento}]
let cotizarNotasExtra = '';

// Notas tab state
let notasAll     = [];
let notasLoaded  = false;
let notasLoading = false;
let notasError   = null;
let notasFiltroCliente = '';

// Credenciales tab state
let clavesAll     = [];
let clavesLoaded  = false;
let clavesLoading = false;
let clavesError   = null;
let clavesFiltroCliente = '';
let claveVisible  = new Set();

// ── USUARIO EN SESIÓN ──
let crmUserName = localStorage.getItem('crm_user_name') || 'Juan Manuel';

// ── ICONS ──
const I = {
  dashboard: `<svg class="nav-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  users:     `<svg class="nav-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  userCheck: `<svg class="nav-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>`,
  fileText:  `<svg class="nav-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
  clock:     `<svg class="nav-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  layers:    `<svg class="nav-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  editTab:   `<svg class="nav-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  keyTab:    `<svg class="nav-icon" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  plus:      `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  edit:      `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  key:       `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  note:      `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  star:      `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  trash:     `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`,
  search:    `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  check:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  warn:      `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  eye:       `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff:    `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  copy:      `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
  download:  `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  upload:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  pdf:       `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  refresh:   `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
};

// ── HELPERS ──
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fmt(n) { return '$' + Number(n).toLocaleString('es-MX'); }
const COLORS = ['#7c3aed','#6d28d9','#4f46e5','#0ea5e9','#0891b2','#059669','#d97706','#dc2626','#db2777'];
function aColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return COLORS[Math.abs(h) % COLORS.length];
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── TOAST ──
let _toastT;
function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  clearTimeout(_toastT);
  const icon = type === 'success' ? I.check : type === 'error' ? I.warn : '';
  el.className = `toast toast-${type}`;
  el.innerHTML = icon + esc(msg);
  el.classList.add('show');
  _toastT = setTimeout(() => el.classList.remove('show'), 3000);
}

// ── SUPABASE: REGISTROS ──
async function loadAll() {
  showLoading(true);
  try {
    const [{ data: regs, error: e1 }, { data: cots, error: e2 }] = await Promise.all([
      _supa.from('registros').select('*').order('created_at', { ascending: false }),
      _supa.from('cotizaciones').select('*').order('created_at', { ascending: false }),
    ]);
    if (e1) throw e1;
    if (e2) throw e2;
    records = (regs || []).map(r => ({
      id: r.id, nombre: r.nombre, telefono: r.telefono || '',
      email: r.email || '', ubicacion: r.ubicacion || '',
      sitioWeb: r.sitio_web || '', notas: r.notas || '',
      estado: r.estado || 'no_llamado', tipo: r.tipo || 'prospecto',
      cotizaciones: (cots || []).filter(c => c.registro_id === r.id).map(c => ({
        folio: c.folio, plan: c.plan, monto: Number(c.monto), fecha: c.fecha,
      })),
    }));
  } catch (err) {
    toast('Error al cargar datos: ' + err.message, 'error');
  }
  showLoading(false);
  renderAll();
}

function showLoading(on) {
  if (on) document.getElementById('main-content').innerHTML =
    '<div style="padding:80px;text-align:center;color:var(--t3);font-size:13px">Cargando…</div>';
}

async function dbAdd(data) {
  const { data: row, error } = await _supa.from('registros').insert([{
    nombre: data.nombre, telefono: data.telefono, email: data.email,
    ubicacion: data.ubicacion, sitio_web: data.sitioWeb,
    notas: data.notas, estado: data.estado, tipo: data.tipo,
  }]).select().single();
  if (error) throw error;
  return row;
}
async function dbUpdate(id, data) {
  const { error } = await _supa.from('registros').update({
    nombre: data.nombre, telefono: data.telefono, email: data.email,
    ubicacion: data.ubicacion, sitio_web: data.sitioWeb,
    notas: data.notas, estado: data.estado, tipo: data.tipo,
  }).eq('id', id);
  if (error) throw error;
}
async function dbDelete(id) {
  const { error } = await _supa.from('registros').delete().eq('id', id);
  if (error) throw error;
}
async function dbToggleStatus(id, newEstado) {
  const { error } = await _supa.from('registros').update({ estado: newEstado }).eq('id', id);
  if (error) throw error;
}
async function dbConvertir(id) {
  const { error } = await _supa.from('registros').update({ tipo: 'cliente' }).eq('id', id);
  if (error) throw error;
}
async function dbAddCotizacion(registroId, cot) {
  const { error } = await _supa.from('cotizaciones').insert([{
    registro_id: registroId, folio: cot.folio, plan: cot.plan, monto: cot.monto, fecha: cot.fecha,
  }]);
  if (error) throw error;
}

// ── SUPABASE: NOTAS ──
async function dbLoadAllNotas() {
  const { data, error } = await _supa.from('notas').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
async function dbAddNota(registroId, contenido) {
  const { data, error } = await _supa.from('notas')
    .insert([{ registro_id: registroId, contenido }]).select().single();
  if (error) throw error;
  return data;
}
async function dbDeleteNota(id) {
  const { error } = await _supa.from('notas').delete().eq('id', id);
  if (error) throw error;
}

// ── SUPABASE: CLAVES ──
async function dbLoadAllClaves() {
  const { data, error } = await _supa.from('claves').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
async function dbAddClave(registroId, { nombre, valor, tipo }) {
  const { data, error } = await _supa.from('claves')
    .insert([{ registro_id: registroId, nombre, valor, tipo }]).select().single();
  if (error) throw error;
  return data;
}
async function dbDeleteClave(id) {
  const { error } = await _supa.from('claves').delete().eq('id', id);
  if (error) throw error;
}

// ── NAV ──
function setTab(t) {
  tab = t; search = ''; filtroEstado = 'todos';
  renderAll();
  if (t === 'notas' && !notasLoaded && !notasLoading) {
    notasLoading = true;
    dbLoadAllNotas()
      .then(data => { notasAll = data; notasLoaded = true; notasError = null; })
      .catch(err => { notasError = err; })
      .finally(() => { notasLoading = false; renderAll(); });
  }
  if (t === 'credenciales' && !clavesLoaded && !clavesLoading) {
    clavesLoading = true;
    dbLoadAllClaves()
      .then(data => { clavesAll = data; clavesLoaded = true; clavesError = null; })
      .catch(err => { clavesError = err; })
      .finally(() => { clavesLoading = false; renderAll(); });
  }
}

function renderNav() {
  const pros     = records.filter(r => r.tipo === 'prospecto').length;
  const clis     = records.filter(r => r.tipo === 'cliente').length;
  const allCots  = records.flatMap(r => r.cotizaciones || []);
  const sections = [
    {
      label: 'Visión general',
      items: [{ id: 'dashboard', label: 'Dashboard', icon: I.dashboard }],
    },
    {
      label: 'Contactos',
      items: [
        { id: 'prospectos', label: 'Prospectos', icon: I.users,     count: pros },
        { id: 'clientes',   label: 'Clientes',   icon: I.userCheck, count: clis },
      ],
    },
    {
      label: 'Trabajo',
      items: [
        { id: 'cotizar',   label: 'Cotizar',   icon: I.fileText },
        { id: 'historial', label: 'Historial', icon: I.clock, count: allCots.length },
      ],
    },
    {
      label: 'Gestión',
      items: [
        { id: 'notas',         label: 'Notas',         icon: I.editTab, count: notasAll.length || undefined },
        { id: 'credenciales',  label: 'Credenciales',  icon: I.keyTab,  count: clavesAll.length || undefined },
      ],
    },
    {
      label: 'Configuración',
      items: [{ id: 'servicios', label: 'Servicios', icon: I.layers, count: planes.length }],
    },
  ];

  document.getElementById('nav-menu').innerHTML = sections.map(sec => `
    <div class="nav-section">${sec.label}</div>
    ${sec.items.map(it => `
      <button class="nav-btn ${tab === it.id ? 'active' : ''}" onclick="setTab('${it.id}')">
        ${it.icon}
        <span>${esc(it.label)}</span>
        ${it.count !== undefined ? `<span class="nav-badge">${it.count}</span>` : ''}
      </button>`).join('')}
  `).join('');

  document.getElementById('sidebar-date').textContent =
    new Date().toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });

  const initials = crmUserName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const userEl = document.getElementById('sidebar-user');
  if (userEl) userEl.innerHTML = `
    <div class="sidebar-user-avatar">${initials}</div>
    <span class="sidebar-user-name">${esc(crmUserName)}</span>
    <button class="sidebar-logout-btn" onclick="logout()" title="Cerrar sesión">
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    </button>
  `;
}

async function logout() {
  try { await _supa.auth.signOut(); } catch {}
  location.reload();
}

function getFiltered(tipo) {
  return records
    .filter(r => r.tipo === tipo)
    .filter(r => filtroEstado === 'todos' || r.estado === filtroEstado)
    .filter(r => {
      if (!search) return true;
      const q = search.toLowerCase();
      return r.nombre.toLowerCase().includes(q)
        || (r.ubicacion || '').toLowerCase().includes(q)
        || (r.telefono || '').includes(q)
        || (r.email || '').toLowerCase().includes(q);
    });
}

function renderAll() {
  renderNav();
  const searchEl  = document.getElementById('search-input');
  const hadFocus  = searchEl && document.activeElement === searchEl;
  const cursorPos = hadFocus ? searchEl.selectionStart : -1;

  const m = document.getElementById('main-content');
  if      (tab === 'dashboard')    m.innerHTML = renderDashboard();
  else if (tab === 'prospectos')   m.innerHTML = renderTable('prospecto');
  else if (tab === 'clientes')     m.innerHTML = renderTable('cliente');
  else if (tab === 'cotizar')      m.innerHTML = renderCotizar();
  else if (tab === 'historial')    m.innerHTML = renderHistorial();
  else if (tab === 'notas')        m.innerHTML = renderNotasTab();
  else if (tab === 'credenciales') m.innerHTML = renderCredencialesTab();
  else if (tab === 'servicios')    m.innerHTML = renderServicios();

  if (hadFocus) {
    const el = document.getElementById('search-input');
    if (el) { el.focus(); if (cursorPos >= 0) el.setSelectionRange(cursorPos, cursorPos); }
  }
}

// ── RENDER: DASHBOARD ──
function renderDashboard() {
  const pros      = records.filter(r => r.tipo === 'prospecto').length;
  const clis      = records.filter(r => r.tipo === 'cliente').length;
  const nllam     = records.filter(r => r.estado === 'no_llamado').length;
  const allCots   = records.flatMap(r => (r.cotizaciones || []).map(c => ({ ...c, rec: r })));
  const totalMonto = allCots.reduce((s, c) => s + (Number(c.monto) || 0), 0);
  const conversion = pros + clis > 0 ? Math.round((clis / (pros + clis)) * 100) : 0;
  const recentCots = [...allCots].slice(0, 8);

  const statCard = ({ val, lbl, iconClass, icon }) => `
    <div class="stat-card">
      <div class="stat-card-top">
        <div class="stat-card-icon ${iconClass || ''}">${icon}</div>
      </div>
      <div>
        <div class="stat-val">${val}</div>
        <div class="stat-lbl">${lbl}</div>
      </div>
    </div>`;

  const cotRows = recentCots.length === 0
    ? `<tr><td colspan="4" class="empty-state">Sin cotizaciones aún</td></tr>`
    : recentCots.map(c => `
      <tr>
        <td><span class="folio-code">#${esc(c.folio)}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="avatar" style="background:${aColor(c.rec.nombre)}">${esc(c.rec.nombre.slice(0,2).toUpperCase())}</div>
            <span style="font-size:12.5px;font-weight:600">${esc(c.rec.nombre)}</span>
          </div>
        </td>
        <td style="font-size:12px;color:var(--t2)">${esc(c.plan.split('+')[0].trim())}</td>
        <td style="font-weight:600;font-size:13px;text-align:right">${fmt(c.monto)}</td>
      </tr>`).join('');

  return `
    <div class="page-hdr">
      <div>
        <div class="page-title">Dashboard</div>
        <div class="page-sub">${new Date().toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long'})}</div>
      </div>
      <div class="hdr-actions">
        <button class="btn" onclick="exportCSV('all')">${I.download} Exportar CSV</button>
        <button class="btn-primary" onclick="setTab('cotizar')">${I.pdf} Nueva cotización</button>
      </div>
    </div>
    <div class="stat-row">
      ${statCard({ val: pros,    lbl: 'Prospectos',     icon: I.users,    iconClass: '' })}
      ${statCard({ val: clis,    lbl: 'Clientes',       icon: I.userCheck,iconClass: 'green' })}
      ${statCard({ val: nllam,   lbl: 'Sin contactar',  icon: I.warn,     iconClass: 'amber' })}
      ${statCard({ val: fmt(totalMonto).replace('$',''), lbl: 'MXN cotizados', icon: I.fileText, iconClass: '' })}
    </div>
    <div class="dash-grid">
      <div class="dash-activity">
        <div class="dash-activity-hdr">
          <span class="dash-activity-title">Cotizaciones recientes</span>
          <button class="btn-ghost btn-sm" onclick="setTab('historial')">${I.clock} Ver todas</button>
        </div>
        <div class="table-scroll">
          <table>
            <thead><tr><th>Folio</th><th>Cliente</th><th>Plan</th><th style="text-align:right">Monto</th></tr></thead>
            <tbody>${cotRows}</tbody>
          </table>
        </div>
      </div>
      <div class="dash-side">
        <div class="info-card">
          <div class="info-card-title">Pipeline</div>
          <div class="funnel-item">
            <span class="funnel-label" style="font-size:11.5px;color:var(--t2)">Total</span>
            <div class="funnel-bar-wrap"><div class="funnel-bar" style="width:100%;background:var(--accent)"></div></div>
            <span class="funnel-val">${pros + clis}</span>
          </div>
          <div class="funnel-item">
            <span class="funnel-label" style="font-size:11.5px;color:var(--t2)">Contactados</span>
            <div class="funnel-bar-wrap"><div class="funnel-bar" style="width:${pros+clis>0?Math.round(((pros+clis-nllam)/(pros+clis))*100):0}%;background:#7c3aed"></div></div>
            <span class="funnel-val">${pros + clis - nllam}</span>
          </div>
          <div class="funnel-item">
            <span class="funnel-label" style="font-size:11.5px;color:var(--t2)">Clientes</span>
            <div class="funnel-bar-wrap"><div class="funnel-bar" style="width:${conversion}%;background:var(--green)"></div></div>
            <span class="funnel-val">${clis}</span>
          </div>
        </div>
        <div class="info-card">
          <div class="info-card-title">Resumen</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${[
              ['Conversión', `${conversion}%`],
              ['Cotizaciones', `${allCots.length}`],
              ['Promedio cot.', allCots.length > 0 ? fmt(Math.round(totalMonto / allCots.length)) : '—'],
            ].map(([k,v]) => `
              <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border)">
                <span style="font-size:12px;color:var(--t3)">${k}</span>
                <span style="font-size:13px;font-weight:600">${v}</span>
              </div>`).join('')}
          </div>
        </div>
        <div class="info-card" style="background:var(--accent-dim);border-color:rgba(167,139,250,.2)">
          <div style="font-size:12.5px;font-weight:600;color:var(--accent);margin-bottom:6px">Acción rápida</div>
          <div style="font-size:12px;color:var(--t2);margin-bottom:12px">Genera cotización multi-servicio con descuentos</div>
          <button class="btn-primary" style="width:100%;justify-content:center" onclick="setTab('cotizar')">${I.pdf} Cotizar ahora</button>
        </div>
      </div>
    </div>`;
}

// ── RENDER: TABLE ──
function renderTable(tipo) {
  const lista = getFiltered(tipo);
  const total = records.filter(r => r.tipo === tipo).length;
  const label = tipo === 'prospecto' ? 'Prospectos' : 'Clientes';

  const rows = lista.length === 0
    ? `<tr><td colspan="6" class="empty-state">No hay ${label.toLowerCase()} que coincidan</td></tr>`
    : lista.map(r => {
        const urlHref = r.sitioWeb && r.sitioWeb !== 'NA'
          ? (r.sitioWeb.match(/^https?:\/\//) ? r.sitioWeb : 'https://' + r.sitioWeb) : null;
        return `<tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px">
              <div class="avatar" style="background:${aColor(r.nombre)}">${esc(r.nombre.slice(0,2).toUpperCase())}</div>
              <div>
                <div style="font-weight:600;font-size:13px">${esc(r.nombre)}</div>
                <div style="font-size:11px;color:var(--t3);margin-top:1px">${esc(r.ubicacion || '—')}</div>
              </div>
            </div>
          </td>
          <td style="color:var(--t2);font-size:12.5px">${esc(r.telefono || '—')}</td>
          <td style="color:var(--t2);font-size:12.5px">${esc(r.email || '—')}</td>
          <td>
            ${urlHref
              ? `<a href="${esc(urlHref)}" target="_blank" rel="noopener" style="font-size:12px;color:var(--accent)">${esc(r.sitioWeb.replace(/^https?:\/\//,'').slice(0,24))}</a>`
              : `<span style="color:var(--t3);font-size:12px">—</span>`}
          </td>
          <td>
            <button class="pill ${r.estado === 'llamado' ? 'pill-llamado' : 'pill-nollamado'}" onclick="toggleStatus('${r.id}')">
              ${r.estado === 'llamado' ? 'Llamado' : 'Sin llamar'}
            </button>
          </td>
          <td>
            <div class="actions">
              <button class="btn btn-sm" onclick="openEdit('${r.id}')">${I.edit} Editar</button>
              <button class="btn btn-sm btn-purple" onclick="irANotas('${r.id}')">${I.note} Notas</button>
              <button class="btn btn-sm btn-purple" onclick="irAClaves('${r.id}')">${I.key} Claves</button>
              <button class="btn btn-sm btn-purple" onclick="irACotizar('${r.id}')">${I.pdf} Cotizar</button>
              ${tipo === 'prospecto' ? `<button class="btn btn-sm btn-green" onclick="convertir('${r.id}')">${I.star} Cliente</button>` : ''}
              <button class="btn btn-sm btn-red" onclick="confirmarEliminar('${r.id}')">${I.trash}</button>
            </div>
          </td>
        </tr>`;
      }).join('');

  return `
    <div class="page-hdr">
      <div>
        <div class="page-title">${label}</div>
        <div class="page-sub">${total} registros · ${lista.length} mostrados</div>
      </div>
      <div class="hdr-actions">
        <label class="btn" style="cursor:pointer">
          <input type="file" accept=".csv" onchange="importCSV(event)" style="display:none">
          ${I.upload} Importar CSV
        </label>
        <button class="btn" onclick="exportCSV('${tipo}')">${I.download} Exportar CSV</button>
        <button class="btn-primary" onclick="openAdd('${tipo}')">${I.plus} Agregar</button>
      </div>
    </div>
    <div class="toolbar">
      <div class="search-wrap">
        <span class="search-icon">${I.search}</span>
        <input id="search-input" placeholder="Buscar nombre, ubicación, teléfono o correo…" value="${esc(search)}" oninput="search=this.value;renderAll();" autocomplete="off">
      </div>
      <button class="filter-btn ${filtroEstado==='todos'?'active':''}" onclick="filtroEstado='todos';renderAll()">Todos</button>
      <button class="filter-btn ${filtroEstado==='llamado'?'active':''}" onclick="filtroEstado='llamado';renderAll()">Llamados</button>
      <button class="filter-btn ${filtroEstado==='no_llamado'?'active':''}" onclick="filtroEstado='no_llamado';renderAll()">Sin llamar</button>
    </div>
    <div class="card">
      <div class="table-scroll">
        <table>
          <thead><tr>
            <th>Nombre / Ubicación</th><th>Teléfono</th><th>Correo</th>
            <th>Sitio Web</th><th>Estado</th><th>Acciones</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

// ── RENDER: COTIZAR ──
function renderCotizar() {
  const q = cotizarSearch.toLowerCase();
  const filtered = cotizarSearch
    ? records.filter(r => r.nombre.toLowerCase().includes(q) || (r.telefono||'').includes(q) || (r.email||'').toLowerCase().includes(q))
    : records;

  const cliente = cotizarClienteId ? records.find(r => r.id === cotizarClienteId) : null;

  const planPicks = planes.map(p => {
    const inQ = cotizarItems.some(i => i.planId === p.id);
    return `
      <div class="cotizar-plan-pick ${inQ ? 'in-quote' : ''}" onclick="toggleCotizarPlan(${p.id})">
        <div class="cotizar-plan-toggle">${inQ ? '✓' : '+'}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12.5px;font-weight:600;color:${inQ ? 'var(--accent)' : 'var(--t1)'}">${esc(p.nombre)}</div>
          <div style="font-size:11px;color:var(--t3)">${fmt(p.implementacion)} impl · ${fmt(p.mensual)}/mes</div>
        </div>
      </div>`;
  }).join('');

  const selectedItems = cotizarItems.length === 0
    ? `<div style="color:var(--t3);font-size:12.5px;text-align:center;padding:20px 0">Agrega servicios del catálogo de arriba</div>`
    : cotizarItems.map(item => `
      <div class="cotizar-item">
        <div class="cotizar-item-hdr">
          <div style="font-size:12.5px;font-weight:600;color:var(--accent)">${esc(item.nombre)}</div>
          <button class="btn-ghost btn-sm" style="margin-left:auto;color:var(--red);font-size:16px;padding:2px 6px"
            onclick="toggleCotizarPlan(${item.planId})">×</button>
        </div>
        <div class="cotizar-item-fields">
          <div>
            <label class="form-lbl">Implementación</label>
            <input class="form-input" type="number" min="0" value="${item.implementacion}"
              oninput="updateCotizarField(${item.planId},'implementacion',this.value)">
          </div>
          <div>
            <label class="form-lbl">Descuento %</label>
            <input class="form-input" type="number" min="0" max="100" value="${item.descuento}"
              oninput="updateCotizarField(${item.planId},'descuento',this.value)">
          </div>
          <div>
            <label class="form-lbl">Mensualidad</label>
            <input class="form-input" type="number" min="0" value="${item.mensual}"
              oninput="updateCotizarField(${item.planId},'mensual',this.value)">
          </div>
        </div>
      </div>`).join('');

  const clientOptions = filtered.slice(0, 25).map(r => `
    <div class="client-option ${cotizarClienteId === r.id ? 'selected' : ''}" onclick="cotizarClienteId='${r.id}';renderAll()">
      <div class="avatar" style="background:${aColor(r.nombre)}">${esc(r.nombre.slice(0,2).toUpperCase())}</div>
      <div>
        <div style="font-size:13px;font-weight:600">${esc(r.nombre)}</div>
        <div style="font-size:11px;color:var(--t3)">${esc(r.ubicacion || r.telefono || r.tipo)}</div>
      </div>
      <span class="tag tag-${r.tipo==='cliente'?'green':'purple'}" style="margin-left:auto">${r.tipo}</span>
    </div>`).join('');

  return `
    <div class="page-hdr">
      <div>
        <div class="page-title">Nueva cotización</div>
        <div class="page-sub">Selecciona cliente y servicios · puedes modificar precios y agregar descuentos</div>
      </div>
    </div>
    <div class="cotizar-layout">
      <div>
        <div class="cotizar-panel" style="margin-bottom:16px">
          <div class="sec-lbl" style="margin-bottom:12px">Cliente</div>
          <input class="client-search-input" placeholder="Buscar cliente o prospecto…"
            value="${esc(cotizarSearch)}" oninput="cotizarSearch=this.value;renderAll()" autocomplete="off">
          <div class="client-options">
            ${clientOptions || `<div style="color:var(--t3);font-size:12.5px;padding:12px">Sin resultados</div>`}
          </div>
        </div>

        <div class="cotizar-panel" style="margin-bottom:16px">
          <div class="sec-lbl" style="margin-bottom:12px">Catálogo de servicios</div>
          ${planPicks}
        </div>

        <div class="cotizar-panel" style="margin-bottom:16px">
          <div class="sec-lbl" style="margin-bottom:12px">Servicios en esta cotización</div>
          ${selectedItems}
        </div>

        <div class="cotizar-panel">
          <div class="sec-lbl" style="margin-bottom:8px">Notas adicionales para el PDF</div>
          <textarea class="form-input" rows="3" placeholder="Condiciones especiales, vigencia, información adicional…"
            oninput="cotizarNotasExtra=this.value">${esc(cotizarNotasExtra)}</textarea>
        </div>
      </div>

      <div class="cotizar-preview">
        <div class="sec-lbl" style="margin-bottom:16px">Resumen</div>
        <div id="cotizar-preview-content">${buildCotizarPreviewHTML(cliente)}</div>
        <button class="btn-primary" style="width:100%;justify-content:center;padding:10px 16px;margin-top:16px"
          onclick="generarCotizacion()" ${!cliente || cotizarItems.length===0 ? 'disabled style="opacity:.4;cursor:not-allowed"' : ''}>
          ${I.pdf} Generar PDF y guardar
        </button>
        ${!cliente ? `<p style="font-size:11.5px;color:var(--t3);text-align:center;margin-top:8px">Selecciona un cliente primero</p>` :
          cotizarItems.length === 0 ? `<p style="font-size:11.5px;color:var(--t3);text-align:center;margin-top:8px">Agrega al menos un servicio</p>` : ''}
      </div>
    </div>`;
}

function buildCotizarPreviewHTML(clienteIn) {
  const cliente = clienteIn !== undefined ? clienteIn : (cotizarClienteId ? records.find(r => r.id === cotizarClienteId) : null);
  if (!cliente) return `<div style="color:var(--t3);font-size:12.5px;text-align:center;padding:20px 0">Selecciona un cliente</div>`;

  const totals = calcCotizarTotals();
  if (totals.items.length === 0) {
    return `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--border)">
        <div class="avatar avatar-lg" style="background:${aColor(cliente.nombre)}">${esc(cliente.nombre.slice(0,2).toUpperCase())}</div>
        <div>
          <div style="font-weight:700;font-size:14px">${esc(cliente.nombre)}</div>
          <div style="font-size:11.5px;color:var(--t3)">${esc(cliente.ubicacion || cliente.telefono || '')}</div>
        </div>
      </div>
      <div style="color:var(--t3);font-size:12.5px;text-align:center;padding:16px 0">Agrega servicios al cotizar</div>`;
  }

  const itemRows = totals.items.map(item => {
    const hasDisc = item.descuento > 0;
    return `
      <div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid var(--border)">
        <div style="font-size:12px;font-weight:600;color:var(--t1);margin-bottom:4px">${esc(item.nombre)}</div>
        <div style="display:flex;justify-content:space-between;font-size:11.5px">
          <span style="color:var(--t3)">Impl.</span>
          <span>
            ${hasDisc ? `<span style="color:var(--t3);text-decoration:line-through;font-size:10.5px;margin-right:4px">${fmt(item.implementacion)}</span>` : ''}
            ${fmt(item.implDesc)}
          </span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11.5px">
          <span style="color:var(--t3)">Mensual</span>
          <span>
            ${hasDisc ? `<span style="color:var(--t3);text-decoration:line-through;font-size:10.5px;margin-right:4px">${fmt(item.mensual)}</span>` : ''}
            ${fmt(item.mensDesc)}/mes
          </span>
        </div>
        ${hasDisc ? `<div style="font-size:10px;color:var(--green);margin-top:2px">Descuento: ${item.descuento}%</div>` : ''}
      </div>`;
  }).join('');

  return `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--border)">
      <div class="avatar avatar-lg" style="background:${aColor(cliente.nombre)}">${esc(cliente.nombre.slice(0,2).toUpperCase())}</div>
      <div>
        <div style="font-weight:700;font-size:14px">${esc(cliente.nombre)}</div>
        <div style="font-size:11.5px;color:var(--t3)">${esc(cliente.ubicacion || cliente.telefono || '')}</div>
      </div>
    </div>
    ${itemRows}
    <div style="margin-top:10px">
      <div class="preview-price-row"><span style="color:var(--t2)">Subtotal impl.</span><span>${fmt(totals.totalImpl)}</span></div>
      <div class="preview-price-row"><span style="color:var(--t2)">Subtotal mensual</span><span>${fmt(totals.totalMens)}/mes</span></div>
      <div class="preview-price-row"><span style="color:var(--t3)">IVA 16%</span><span style="color:var(--t3)">${fmt(totals.ivaImpl)} + ${fmt(totals.ivaMens)}</span></div>
      <div class="preview-price-row total"><span>Total impl. c/IVA</span><span style="color:var(--accent)">${fmt(totals.totalImplIVA)}</span></div>
      <div class="preview-price-row total"><span>Total mensual c/IVA</span><span style="color:var(--accent)">${fmt(totals.totalMensIVA)}/mes</span></div>
    </div>`;
}

function calcCotizarTotals() {
  let totalImpl = 0, totalMens = 0;
  const items = cotizarItems.map(item => {
    const disc = Math.min(100, Math.max(0, item.descuento || 0)) / 100;
    const implDesc = Math.round(item.implementacion * (1 - disc));
    const mensDesc = Math.round(item.mensual * (1 - disc));
    totalImpl += implDesc;
    totalMens += mensDesc;
    return { ...item, implDesc, mensDesc };
  });
  const ivaImpl = Math.round(totalImpl * 0.16);
  const ivaMens = Math.round(totalMens * 0.16);
  return { items, totalImpl, totalMens, ivaImpl, ivaMens, totalImplIVA: totalImpl + ivaImpl, totalMensIVA: totalMens + ivaMens };
}

// ── COTIZAR HANDLERS ──
function toggleCotizarPlan(planId) {
  const idx = cotizarItems.findIndex(i => i.planId === planId);
  if (idx >= 0) {
    cotizarItems = cotizarItems.filter(i => i.planId !== planId);
  } else {
    const p = planes.find(x => x.id === planId);
    if (!p) return;
    cotizarItems = [...cotizarItems, { planId: p.id, nombre: p.nombre, implementacion: p.implementacion, mensual: p.mensual, descuento: 0 }];
  }
  renderAll();
}

function updateCotizarField(planId, field, value) {
  const idx = cotizarItems.findIndex(i => i.planId === planId);
  if (idx < 0) return;
  const parsed = field === 'descuento'
    ? Math.min(100, Math.max(0, parseFloat(value) || 0))
    : Math.max(0, parseFloat(value) || 0);
  cotizarItems[idx][field] = parsed;
  const el = document.getElementById('cotizar-preview-content');
  if (el) el.innerHTML = buildCotizarPreviewHTML();
}

// ── RENDER: HISTORIAL ──
function renderHistorial() {
  const allCots = records.flatMap(r => (r.cotizaciones || []).map(c => ({ ...c, rec: r })));
  const sorted  = [...allCots].sort((a, b) => b.folio.localeCompare(a.folio));
  const total   = sorted.reduce((s, c) => s + Number(c.monto), 0);

  const rows = sorted.length === 0
    ? `<tr><td colspan="6" class="empty-state">Sin cotizaciones.<br><button class="btn-primary" style="margin-top:12px" onclick="setTab('cotizar')">${I.pdf} Primera cotización</button></td></tr>`
    : sorted.map(c => `
      <tr>
        <td><span class="folio-code">#${esc(c.folio)}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="avatar" style="background:${aColor(c.rec.nombre)}">${esc(c.rec.nombre.slice(0,2).toUpperCase())}</div>
            <div>
              <div style="font-weight:600;font-size:12.5px">${esc(c.rec.nombre)}</div>
              <span class="tag tag-${c.rec.tipo==='cliente'?'green':'purple'}" style="margin-top:2px;display:inline-flex">${c.rec.tipo}</span>
            </div>
          </div>
        </td>
        <td style="font-size:12px;color:var(--t2);max-width:200px">${esc(c.plan)}</td>
        <td style="font-weight:600">${fmt(c.monto)}</td>
        <td style="font-size:12px;color:var(--t3)">${esc(c.fecha)}</td>
        <td>
          <button class="btn btn-sm" onclick="regenerarPDF('${c.rec.id}','${c.folio}')">${I.refresh} PDF</button>
        </td>
      </tr>`).join('');

  return `
    <div class="page-hdr">
      <div>
        <div class="page-title">Historial de cotizaciones</div>
        <div class="page-sub">${sorted.length} cotizaciones · ${fmt(total)} total</div>
      </div>
      <button class="btn-primary" onclick="setTab('cotizar')">${I.pdf} Nueva cotización</button>
    </div>
    <div class="card">
      <div class="table-scroll">
        <table>
          <thead><tr><th>Folio</th><th>Cliente</th><th>Plan</th><th>Monto impl.</th><th>Fecha</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

// ── RENDER: NOTAS TAB ──
function renderNotasTab() {
  const clientOptions = records.map(r =>
    `<option value="${r.id}" ${r.id === notasFiltroCliente ? 'selected' : ''}>${esc(r.nombre)}</option>`
  ).join('');

  const body = notasLoading
    ? `<div class="empty-state">Cargando notas…</div>`
    : notasError
      ? `<div style="background:var(--red-bg);border:1px solid var(--red-border);border-radius:var(--r-lg);padding:20px 24px;color:var(--red)">
          <strong>Error al cargar notas.</strong> Crea la tabla <code>notas</code> en Supabase con el SQL que te compartí.<br>
          <span style="color:var(--t3);font-size:12px">${esc(notasError.message || '')}</span>
        </div>`
      : (() => {
          const filtered = notasFiltroCliente
            ? notasAll.filter(n => n.registro_id === notasFiltroCliente)
            : notasAll;
          if (filtered.length === 0) return `<div class="empty-state">Sin notas${notasFiltroCliente ? ' para este cliente' : ''}.<br><button class="btn-primary" style="margin-top:12px" onclick="openAddNota('${notasFiltroCliente}')">+ Agregar primera nota</button></div>`;
          return `<div class="notas-list">${filtered.map(n => {
            const r = records.find(r => r.id === n.registro_id);
            const nombre = r ? r.nombre : '—';
            return `
              <div class="nota-card">
                <div class="nota-card-hdr">
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="avatar" style="background:${aColor(nombre)}">${esc(nombre.slice(0,2).toUpperCase())}</div>
                    <div>
                      <div style="font-weight:600;font-size:13px">${esc(nombre)}</div>
                      <div style="font-size:11px;color:var(--t3)">${fmtDate(n.created_at)}</div>
                    </div>
                  </div>
                  <button class="btn-ghost btn-sm" style="color:var(--red)" onclick="confirmarEliminarNota('${n.id}')">${I.trash}</button>
                </div>
                <div class="nota-card-body">${esc(n.contenido).replace(/\n/g,'<br>')}</div>
              </div>`;
          }).join('')}</div>`;
        })();

  return `
    <div class="page-hdr">
      <div>
        <div class="page-title">Notas</div>
        <div class="page-sub">${notasAll.length} notas guardadas</div>
      </div>
      <div class="hdr-actions">
        <select class="form-input" style="width:200px" onchange="notasFiltroCliente=this.value;renderAll()">
          <option value="">Todos los clientes</option>
          ${clientOptions}
        </select>
        <button class="btn-primary" onclick="openAddNota('${notasFiltroCliente}')">${I.plus} Agregar nota</button>
      </div>
    </div>
    ${body}`;
}

// ── RENDER: CREDENCIALES TAB ──
function renderCredencialesTab() {
  const clientOptions = records.map(r =>
    `<option value="${r.id}" ${r.id === clavesFiltroCliente ? 'selected' : ''}>${esc(r.nombre)}</option>`
  ).join('');

  const body = clavesLoading
    ? `<div class="empty-state">Cargando credenciales…</div>`
    : clavesError
      ? `<div style="background:var(--red-bg);border:1px solid var(--red-border);border-radius:var(--r-lg);padding:20px 24px;color:var(--red)">
          <strong>Error al cargar credenciales.</strong> Crea la tabla <code>claves</code> en Supabase con el SQL compartido.<br>
          <span style="color:var(--t3);font-size:12px">${esc(clavesError.message || '')}</span>
        </div>`
      : (() => {
          const filtered = clavesFiltroCliente
            ? clavesAll.filter(c => c.registro_id === clavesFiltroCliente)
            : clavesAll;

          if (filtered.length === 0) return `<div class="empty-state">Sin credenciales${clavesFiltroCliente ? ' para este cliente' : ''}.<br><button class="btn-primary" style="margin-top:12px" onclick="openAddClave('${clavesFiltroCliente}')">+ Agregar credencial</button></div>`;

          // Group by registro_id
          const groups = {};
          filtered.forEach(c => {
            if (!groups[c.registro_id]) groups[c.registro_id] = [];
            groups[c.registro_id].push(c);
          });

          return Object.entries(groups).map(([regId, items]) => {
            const r = records.find(r => r.id === regId);
            const nombre = r ? r.nombre : 'Cliente desconocido';
            const rows = items.map(c => {
              const visible = claveVisible.has(c.id);
              return `
                <div class="cred-row">
                  <div style="flex-shrink:0">
                    <div class="cred-nombre">${esc(c.nombre)}</div>
                    <span class="cred-tipo">${esc(c.tipo)}</span>
                  </div>
                  <div class="cred-valor ${visible ? '' : 'hidden'}">${visible ? esc(c.valor) : '••••••••••••'}</div>
                  <div class="cred-actions">
                    <button class="btn-ghost btn-sm" onclick="toggleVerClave('${c.id}')" title="${visible?'Ocultar':'Ver'}">${visible ? I.eyeOff : I.eye}</button>
                    <button class="btn-ghost btn-sm" onclick="copiarClave('${esc(c.valor)}')" title="Copiar">${I.copy}</button>
                    <button class="btn-ghost btn-sm" style="color:var(--red)" onclick="confirmarEliminarClave('${c.id}')">${I.trash}</button>
                  </div>
                </div>`;
            }).join('');
            return `
              <div class="cred-group">
                <div class="cred-group-hdr">
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="avatar" style="background:${aColor(nombre)}">${esc(nombre.slice(0,2).toUpperCase())}</div>
                    <span style="font-weight:600;font-size:13px">${esc(nombre)}</span>
                    <span class="nav-badge">${items.length}</span>
                  </div>
                  <button class="btn btn-sm" onclick="openAddClave('${regId}')">${I.plus} Agregar</button>
                </div>
                ${rows}
              </div>`;
          }).join('');
        })();

  return `
    <div class="page-hdr">
      <div>
        <div class="page-title">Credenciales</div>
        <div class="page-sub">${clavesAll.length} credenciales guardadas</div>
      </div>
      <div class="hdr-actions">
        <select class="form-input" style="width:200px" onchange="clavesFiltroCliente=this.value;renderAll()">
          <option value="">Todos los clientes</option>
          ${clientOptions}
        </select>
        <button class="btn-primary" onclick="openAddClave('${clavesFiltroCliente}')">${I.plus} Agregar credencial</button>
      </div>
    </div>
    ${body}`;
}

// ── RENDER: SERVICIOS (con CRUD) ──
function renderServicios() {
  const cards = planes.map((p, idx) => `
    <div class="srv-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
        <div>
          <div class="srv-plan-num">Servicio ${idx + 1}</div>
          <div class="srv-plan-name">${esc(p.nombre)}</div>
        </div>
        <div class="actions">
          <button class="btn btn-sm" onclick="openEditPlan(${p.id})">${I.edit} Editar</button>
          <button class="btn btn-sm btn-red" onclick="confirmarEliminarPlan(${p.id})">${I.trash}</button>
        </div>
      </div>
      <div class="price-grid">
        <div class="price-box"><div class="price-box-lbl">Implementación</div><div class="price-box-val">${fmt(p.implementacion)}</div><div class="price-box-sub">Pago único</div></div>
        <div class="price-box"><div class="price-box-lbl">Mensual</div><div class="price-box-val" style="color:var(--accent)">${fmt(p.mensual)}</div><div class="price-box-sub">Mantenimiento</div></div>
      </div>
      <div class="feat-list">
        ${(p.features || []).map(f=>`<div class="feat-item"><span class="feat-check">✓</span>${esc(f)}</div>`).join('')}
      </div>
    </div>`).join('');

  return `
    <div class="page-hdr">
      <div>
        <div class="page-title">Servicios</div>
        <div class="page-sub">${planes.length} servicios disponibles · guardados localmente</div>
      </div>
      <button class="btn-primary" onclick="openAddPlan()">${I.plus} Agregar servicio</button>
    </div>
    <div class="srv-grid">${cards}</div>`;
}

// ── ACTIONS ──
async function toggleStatus(id) {
  const r = records.find(x => x.id === id);
  if (!r) return;
  const newEstado = r.estado === 'llamado' ? 'no_llamado' : 'llamado';
  try {
    await dbToggleStatus(id, newEstado);
    records = records.map(x => x.id === id ? { ...x, estado: newEstado } : x);
    renderAll();
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

async function convertir(id) {
  try {
    await dbConvertir(id);
    records = records.map(r => r.id === id ? { ...r, tipo: 'cliente' } : r);
    toast('Convertido a cliente', 'success');
    renderAll();
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

function showConfirm(title, body, onConfirm) {
  pendingConfirm = onConfirm;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-body').textContent = body;
  document.getElementById('modal-confirm').style.display = 'flex';
}

function ejecutarConfirm() {
  closeModal('modal-confirm');
  if (pendingConfirm) { pendingConfirm(); pendingConfirm = null; }
}

function confirmarEliminar(id) {
  const r = records.find(x => x.id === id);
  showConfirm('Eliminar registro', `¿Eliminar "${r?.nombre}"? Esta acción no se puede deshacer.`, async () => {
    try {
      await dbDelete(id);
      records = records.filter(r => r.id !== id);
      toast('Registro eliminado', 'success');
      renderAll();
    } catch (err) { toast('Error: ' + err.message, 'error'); }
  });
}

function irACotizar(id) {
  cotizarClienteId = id;
  cotizarSearch = '';
  setTab('cotizar');
}

function irANotas(id) {
  notasFiltroCliente = id;
  setTab('notas');
}

function irAClaves(id) {
  clavesFiltroCliente = id;
  setTab('credenciales');
}

// ── FORM (REGISTRO) ──
function openAdd(tipo) {
  editingId = null;
  document.getElementById('mf-title').textContent = 'Agregar registro';
  ['f-nombre','f-tel','f-email','f-ubic','f-web','f-notas'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('f-estado').value = 'no_llamado';
  document.getElementById('f-tipo').value   = tipo || 'prospecto';
  document.getElementById('modal-form').style.display = 'flex';
  setTimeout(() => document.getElementById('f-nombre').focus(), 80);
}
function openEdit(id) {
  const r = records.find(x => x.id === id);
  if (!r) return;
  editingId = id;
  document.getElementById('mf-title').textContent   = 'Editar registro';
  document.getElementById('f-nombre').value = r.nombre    || '';
  document.getElementById('f-tel').value    = r.telefono  || '';
  document.getElementById('f-email').value  = r.email     || '';
  document.getElementById('f-ubic').value   = r.ubicacion || '';
  document.getElementById('f-web').value    = r.sitioWeb  || '';
  document.getElementById('f-notas').value  = r.notas     || '';
  document.getElementById('f-estado').value = r.estado    || 'no_llamado';
  document.getElementById('f-tipo').value   = r.tipo      || 'prospecto';
  document.getElementById('modal-form').style.display = 'flex';
  setTimeout(() => document.getElementById('f-nombre').focus(), 80);
}
async function saveForm() {
  const nombre = document.getElementById('f-nombre').value.trim();
  if (!nombre) { toast('El nombre es obligatorio', 'error'); return; }
  const data = {
    nombre, telefono: document.getElementById('f-tel').value.trim(),
    email: document.getElementById('f-email').value.trim(),
    ubicacion: document.getElementById('f-ubic').value.trim(),
    sitioWeb: document.getElementById('f-web').value.trim(),
    notas: document.getElementById('f-notas').value.trim(),
    estado: document.getElementById('f-estado').value,
    tipo: document.getElementById('f-tipo').value,
  };
  try {
    if (editingId) {
      await dbUpdate(editingId, data);
      records = records.map(r => r.id === editingId ? { ...r, ...data } : r);
      toast('Registro actualizado', 'success');
    } else {
      const row = await dbAdd(data);
      records = [{ ...data, id: row.id, cotizaciones: [] }, ...records];
      toast('Registro agregado', 'success');
    }
    closeModal('modal-form'); renderAll();
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}

// ── PLANES CRUD ──
function openAddPlan() {
  editingPlanId = null;
  document.getElementById('plan-modal-title').textContent = 'Agregar servicio';
  document.getElementById('p-nombre').value   = '';
  document.getElementById('p-impl').value     = '';
  document.getElementById('p-mens').value     = '';
  document.getElementById('p-features').value = '';
  document.getElementById('modal-plan').style.display = 'flex';
  setTimeout(() => document.getElementById('p-nombre').focus(), 80);
}
function openEditPlan(id) {
  const p = planes.find(x => x.id === id);
  if (!p) return;
  editingPlanId = id;
  document.getElementById('plan-modal-title').textContent = 'Editar servicio';
  document.getElementById('p-nombre').value   = p.nombre || '';
  document.getElementById('p-impl').value     = p.implementacion || '';
  document.getElementById('p-mens').value     = p.mensual || '';
  document.getElementById('p-features').value = (p.features || []).join('\n');
  document.getElementById('modal-plan').style.display = 'flex';
  setTimeout(() => document.getElementById('p-nombre').focus(), 80);
}
function savePlan() {
  const nombre        = document.getElementById('p-nombre').value.trim();
  const implementacion = parseFloat(document.getElementById('p-impl').value) || 0;
  const mensual        = parseFloat(document.getElementById('p-mens').value) || 0;
  const featuresRaw    = document.getElementById('p-features').value;
  const features       = featuresRaw.split('\n').map(s => s.trim()).filter(Boolean);
  if (!nombre) { toast('El nombre es obligatorio', 'error'); return; }
  if (editingPlanId !== null) {
    planes = planes.map(p => p.id === editingPlanId ? { ...p, nombre, implementacion, mensual, features } : p);
    toast('Servicio actualizado', 'success');
  } else {
    const newId = Date.now();
    planes = [...planes, { id: newId, nombre, implementacion, mensual, features }];
    toast('Servicio agregado', 'success');
  }
  savePlanes();
  closeModal('modal-plan');
  renderAll();
}
function confirmarEliminarPlan(id) {
  const p = planes.find(x => x.id === id);
  showConfirm('Eliminar servicio', `¿Eliminar "${p?.nombre}"? Solo se borra localmente.`, () => {
    planes = planes.filter(x => x.id !== id);
    cotizarItems = cotizarItems.filter(i => i.planId !== id);
    savePlanes();
    toast('Servicio eliminado', 'success');
    renderAll();
  });
}

// ── NOTAS TAB HANDLERS ──
function openAddNota(registroId = '') {
  const sel = document.getElementById('nota-registro-id');
  sel.innerHTML = records.map(r =>
    `<option value="${r.id}" ${r.id === registroId ? 'selected' : ''}>${esc(r.nombre)}</option>`
  ).join('');
  document.getElementById('nota-contenido').value = '';
  document.getElementById('modal-add-nota').style.display = 'flex';
  setTimeout(() => document.getElementById('nota-contenido').focus(), 80);
}
async function guardarNota() {
  const registroId = document.getElementById('nota-registro-id').value;
  const contenido  = document.getElementById('nota-contenido').value.trim();
  if (!registroId) { toast('Selecciona un cliente', 'error'); return; }
  if (!contenido)  { toast('Escribe una nota', 'error'); return; }
  try {
    const row = await dbAddNota(registroId, contenido);
    notasAll = [row, ...notasAll];
    closeModal('modal-add-nota');
    toast('Nota guardada', 'success');
    renderAll();
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}
function confirmarEliminarNota(id) {
  showConfirm('Eliminar nota', '¿Eliminar esta nota? No se puede recuperar.', async () => {
    try {
      await dbDeleteNota(id);
      notasAll = notasAll.filter(n => n.id !== id);
      toast('Nota eliminada', 'success');
      renderAll();
    } catch (err) { toast('Error: ' + err.message, 'error'); }
  });
}

// ── CREDENCIALES TAB HANDLERS ──
function openAddClave(registroId = '') {
  const sel = document.getElementById('clave-registro-id');
  sel.innerHTML = records.map(r =>
    `<option value="${r.id}" ${r.id === registroId ? 'selected' : ''}>${esc(r.nombre)}</option>`
  ).join('');
  document.getElementById('clave-nombre').value   = '';
  document.getElementById('clave-usuario').value  = '';
  document.getElementById('clave-valor').value    = '';
  document.getElementById('clave-tipo').value     = 'contraseña';
  document.getElementById('modal-add-clave').style.display = 'flex';
  setTimeout(() => document.getElementById('clave-nombre').focus(), 80);
}
async function guardarClaveModal() {
  const registroId = document.getElementById('clave-registro-id').value;
  const nombre     = document.getElementById('clave-nombre').value.trim();
  const usuario    = document.getElementById('clave-usuario').value.trim();
  const valor      = document.getElementById('clave-valor').value.trim();
  const tipo       = document.getElementById('clave-tipo').value;
  if (!registroId) { toast('Selecciona un cliente', 'error'); return; }
  if (!nombre)  { toast('El nombre es obligatorio', 'error'); return; }
  if (!valor && !usuario) { toast('Ingresa al menos un valor', 'error'); return; }
  try {
    const nuevas = [];
    if (usuario) {
      const r1 = await dbAddClave(registroId, { nombre: nombre + ' — usuario', valor: usuario, tipo: 'usuario' });
      nuevas.push(r1);
    }
    if (valor) {
      const tipoFinal = usuario ? 'contraseña' : tipo;
      const nombreFinal = usuario ? nombre + ' — contraseña' : nombre;
      const r2 = await dbAddClave(registroId, { nombre: nombreFinal, valor, tipo: tipoFinal });
      nuevas.push(r2);
    }
    clavesAll = [...nuevas, ...clavesAll];
    closeModal('modal-add-clave');
    toast(`${nuevas.length > 1 ? 'Credenciales guardadas' : 'Credencial guardada'}`, 'success');
    renderAll();
  } catch (err) { toast('Error: ' + err.message, 'error'); }
}
function toggleVerClave(id) {
  if (claveVisible.has(id)) claveVisible.delete(id);
  else claveVisible.add(id);
  renderAll();
}
async function copiarClave(valor) {
  try {
    await navigator.clipboard.writeText(valor);
    toast('Copiado al portapapeles', 'success');
  } catch { toast('No se pudo copiar', 'error'); }
}
function confirmarEliminarClave(id) {
  showConfirm('Eliminar credencial', '¿Eliminar esta credencial?', async () => {
    try {
      await dbDeleteClave(id);
      clavesAll = clavesAll.filter(c => c.id !== id);
      claveVisible.delete(id);
      toast('Credencial eliminada', 'success');
      renderAll();
    } catch (err) { toast('Error: ' + err.message, 'error'); }
  });
}

// ── GENERAR PDF ──
async function fetchLogoDataURL() {
  const toDataURL = blob => new Promise(res => {
    const fr = new FileReader(); fr.onload = e => res(e.target.result); fr.readAsDataURL(blob);
  });
  // Prefer the horizontal PNG logo for PDFs
  for (const path of ['./logo_negro.png', './logo.png', './logo.svg']) {
    try {
      const r = await fetch(path);
      if (r.ok) return await toDataURL(await r.blob());
    } catch {}
  }
  return null;
}

async function generarCotizacion() {
  const r = records.find(x => x.id === cotizarClienteId);
  if (!r) { toast('Selecciona un cliente primero', 'error'); return; }
  if (cotizarItems.length === 0) { toast('Agrega al menos un servicio', 'error'); return; }

  const logoSrc = await fetchLogoDataURL();
  const logoImg = logoSrc
    ? `<img src="${logoSrc}" alt="Synapse" style="height:48px;width:auto;max-width:220px;object-fit:contain;object-position:left center;display:block">`
    : `<span style="font-weight:900;font-size:20px;letter-spacing:-1px;color:#7c3aed">SYNAPSE</span>`;

  const folio = String(Date.now()).slice(-6);
  const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  const totals = calcCotizarTotals();

  // Build features section
  const featuresWithContent = cotizarItems.filter(item => {
    const plan = planes.find(p => p.id === item.planId);
    return (plan?.features || []).length > 0;
  });
  const featuresHTML = featuresWithContent.map((item, idx) => {
    const plan = planes.find(p => p.id === item.planId);
    const feats = plan?.features || [];
    return `
      ${idx > 0 ? '<div style="height:1px;background:#dddaf0;margin:10px 0"></div>' : ''}
      <div>
        <div style="font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#3d3a52;margin-bottom:8px">${esc(item.nombre)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 20px">
          ${feats.map(f => `<div style="font-size:11.5px;color:#5a5778;padding:2px 0 2px 16px;position:relative"><span style="position:absolute;left:0;color:#7c3aed;font-weight:700;font-size:10px">✓</span>${esc(f)}</div>`).join('')}
        </div>
      </div>`;
  }).join('');

  // Build pricing table
  const showMens = totals.totalMens > 0;
  const totalOriginalImpl = cotizarItems.reduce((s, i) => s + i.implementacion, 0);
  const totalOriginalMens = cotizarItems.reduce((s, i) => s + i.mensual, 0);
  const descuentoImpl = totalOriginalImpl - totals.totalImpl;
  const descuentoMens = totalOriginalMens - totals.totalMens;
  const hasAnyDiscount = descuentoImpl > 0 || descuentoMens > 0;

  const priceRows = totals.items.map(item => {
    const hasDisc = item.descuento > 0;
    const tdStyle = 'padding:8px 12px;font-size:12px;text-align:right;border-bottom:1px solid #f0eef8;white-space:nowrap';
    return `
      <tr>
        <td style="padding:8px 12px;font-size:12px;font-weight:600;color:#3d3a52;border-bottom:1px solid #f0eef8">${esc(item.nombre)}</td>
        <td style="${tdStyle}">
          ${hasDisc ? `<span style="font-size:10px;text-decoration:line-through;color:#c4c2d4;margin-right:4px">${fmt(item.implementacion)}</span>` : ''}
          <strong>${fmt(item.implDesc)}</strong>
          ${hasDisc ? `<span style="font-size:10px;color:#34d399;margin-left:4px">−${item.descuento}%</span>` : ''}
        </td>
        ${showMens ? `<td style="${tdStyle}">
          ${hasDisc ? `<span style="font-size:10px;text-decoration:line-through;color:#c4c2d4;margin-right:4px">${fmt(item.mensual)}</span>` : ''}
          <strong>${fmt(item.mensDesc)}</strong>/mes
        </td>` : ''}
      </tr>`;
  }).join('');

  const notaExtra = cotizarNotasExtra.trim();

  const html = `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8">
<title>Cotización #${folio} — ${esc(r.nombre)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
@page { size: letter; margin: 10mm 16mm; }
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:auto}
body{font-family:'Inter',system-ui,sans-serif;color:#0a0a0f;background:#fff;font-size:12px;line-height:1.55;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.wrap{max-width:100%}
/* Header */
.hdr{display:flex;justify-content:space-between;align-items:center;padding:0 0 16px;border-bottom:2px solid #7c3aed;margin-bottom:18px}
.hdr-left{}
.hdr-right{text-align:right}
.folio-label{font-size:8px;letter-spacing:3px;text-transform:uppercase;color:#9895b0;margin-bottom:4px}
.folio-num{font-size:30px;font-weight:900;letter-spacing:-1.5px;color:#0a0a0f;line-height:1}
.folio-date{font-size:11px;color:#9895b0;margin-top:3px}
/* Client */
.client-row{display:grid;grid-template-columns:1fr auto;gap:20px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid #f0eef8}
.client-name{font-size:18px;font-weight:800;letter-spacing:-0.3px;margin-bottom:6px}
.client-metas{display:flex;flex-wrap:wrap;gap:14px}
.client-meta-item{}
.client-meta-lbl{font-size:8px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#c4c2d4}
.client-meta-val{font-size:11.5px;font-weight:500;color:#3d3a52}
/* Section title */
.sec{font-size:8px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#7c3aed;margin-bottom:10px;display:flex;align-items:center;gap:8px}
.sec::after{content:'';flex:1;height:1px;background:#e0ddf5}
/* Features block */
.features-block{background:#f9f8ff;border-radius:8px;padding:14px 16px;margin-bottom:14px;border:1px solid #ebe8f8}
/* Pricing table */
.price-table{width:100%;border-collapse:collapse;margin-bottom:10px}
.price-table thead th{padding:7px 12px;font-size:8.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9895b0;text-align:right;border-bottom:1px solid #ebe8f8}
.price-table thead th:first-child{text-align:left}
.price-table tfoot td{padding:8px 12px;font-size:11px;font-weight:700;border-top:1.5px solid #3d3a52}
/* Totals */
.totals-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.total-card{border:1px solid #ebe8f8;border-radius:8px;padding:12px 14px}
.total-card-title{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#c4c2d4;margin-bottom:8px}
.total-line{display:flex;justify-content:space-between;font-size:11px;padding:3px 0}
.total-line.big{padding-top:8px;border-top:1px solid #ebe8f8;margin-top:4px}
.total-line.big .tv{font-size:16px;font-weight:900;color:#7c3aed}
/* Footer */
.ftr{display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid #f0eef8;margin-top:4px}
.ftr-note{font-size:10.5px;color:#c4c2d4}
.ftr-badge{background:#7c3aed;color:#fff;font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:5px 12px;border-radius:20px}
/* Extra note */
.extra-nota{background:#f9f8ff;border-left:3px solid #7c3aed;padding:8px 12px;border-radius:0 6px 6px 0;font-size:11px;color:#5a5778;margin-bottom:14px}
</style></head>
<body>
<div class="wrap">
  <div class="hdr">
    <div class="hdr-left">${logoImg}</div>
    <div class="hdr-right">
      <div class="folio-label">Cotización</div>
      <div class="folio-num">#${folio}</div>
      <div class="folio-date">${fecha}</div>
    </div>
  </div>

  <div class="client-row">
    <div>
      <div class="sec">Para</div>
      <div class="client-name">${esc(r.nombre)}</div>
      <div class="client-metas">
        ${r.telefono ? `<div class="client-meta-item"><div class="client-meta-lbl">Teléfono</div><div class="client-meta-val">${esc(r.telefono)}</div></div>` : ''}
        ${r.email    ? `<div class="client-meta-item"><div class="client-meta-lbl">Correo</div><div class="client-meta-val">${esc(r.email)}</div></div>` : ''}
        ${r.ubicacion? `<div class="client-meta-item"><div class="client-meta-lbl">Ubicación</div><div class="client-meta-val">${esc(r.ubicacion)}</div></div>` : ''}
      </div>
    </div>
    <div style="text-align:right">
      <div class="sec" style="text-align:right">${cotizarItems.length > 1 ? `${cotizarItems.length} servicios` : '1 servicio'}</div>
      <div style="font-size:22px;font-weight:900;color:#7c3aed;letter-spacing:-0.5px">${fmt(totals.totalImplIVA)}</div>
      <div style="font-size:10px;color:#9895b0">implementación c/IVA</div>
    </div>
  </div>

  ${featuresHTML ? `<div class="sec">Propuesta de servicios</div><div class="features-block">${featuresHTML}</div>` : ''}

  <div class="sec">Desglose de inversión</div>
  <table class="price-table">
    <thead>
      <tr>
        <th style="text-align:left">Servicio</th>
        <th>Implementación</th>
        ${showMens ? '<th>Mensualidad</th>' : ''}
      </tr>
    </thead>
    <tbody>${priceRows}</tbody>
    <tfoot>
      ${hasAnyDiscount ? `<tr>
        <td style="font-size:11px;color:#9895b0;font-weight:400">Precio original</td>
        <td style="text-align:right;color:#9895b0;font-weight:400;text-decoration:line-through">${fmt(totalOriginalImpl)}</td>
        ${showMens ? `<td style="text-align:right;color:#9895b0;font-weight:400;text-decoration:line-through">${fmt(totalOriginalMens)}/mes</td>` : ''}
      </tr>
      <tr>
        <td style="font-size:11px;color:#34d399;font-weight:600">Descuento total</td>
        <td style="text-align:right;color:#34d399;font-weight:600">−${fmt(descuentoImpl)}</td>
        ${showMens ? `<td style="text-align:right;color:#34d399;font-weight:600">−${fmt(descuentoMens)}/mes</td>` : ''}
      </tr>` : ''}
      <tr>
        <td style="font-size:11px;color:#3d3a52">Subtotal</td>
        <td style="text-align:right">${fmt(totals.totalImpl)}</td>
        ${showMens ? `<td style="text-align:right">${fmt(totals.totalMens)}/mes</td>` : ''}
      </tr>
      <tr>
        <td style="font-size:11px;color:#9895b0;font-weight:400">IVA 16%</td>
        <td style="text-align:right;color:#9895b0;font-weight:400">${fmt(totals.ivaImpl)}</td>
        ${showMens ? `<td style="text-align:right;color:#9895b0;font-weight:400">${fmt(totals.ivaMens)}/mes</td>` : ''}
      </tr>
      <tr>
        <td style="font-size:13px;color:#7c3aed">Total con IVA</td>
        <td style="text-align:right;font-size:13px;color:#7c3aed">${fmt(totals.totalImplIVA)}</td>
        ${showMens ? `<td style="text-align:right;font-size:13px;color:#7c3aed">${fmt(totals.totalMensIVA)}/mes</td>` : ''}
      </tr>
    </tfoot>
  </table>

  ${notaExtra ? `<div class="extra-nota">${esc(notaExtra).replace(/\n/g,'<br>')}</div>` : ''}

  <div class="ftr">
    <div class="ftr-note">Vigencia <strong>30 días</strong> · Precios en MXN · IVA incluido en totales</div>
    <div class="ftr-badge">Synapse Digital Solutions</div>
  </div>
</div>
<script>window.onload=()=>setTimeout(()=>window.print(),300);<\/script>
</body></html>`;

  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) { toast('Permite ventanas emergentes para generar el PDF', 'error'); return; }
  w.document.write(html);
  w.document.close();

  const planNames = cotizarItems.map(i => i.nombre).join(' + ');
  const totalMonto = totals.totalImpl;
  try {
    await dbAddCotizacion(r.id, { folio, plan: planNames, monto: totalMonto, fecha });
    records = records.map(rec => rec.id === r.id
      ? { ...rec, cotizaciones: [...(rec.cotizaciones || []), { folio, plan: planNames, monto: totalMonto, fecha }] }
      : rec);
    toast(`Cotización #${folio} guardada`, 'success');
  } catch (err) {
    toast('PDF generado pero no guardado: ' + err.message, 'error');
  }
  renderAll();
}

function regenerarPDF(registroId, folio) {
  const r   = records.find(r => r.id === registroId);
  const cot = r?.cotizaciones?.find(c => c.folio === folio);
  if (!r || !cot) { toast('No se encontró la cotización', 'error'); return; }
  cotizarClienteId = registroId;
  cotizarSearch    = '';
  // Try to reconstruct items from the plan names saved
  const planNombres = cot.plan.split('+').map(s => s.trim());
  cotizarItems = planNombres.map(nombre => {
    const p = planes.find(x => x.nombre === nombre);
    return p ? { planId: p.id, nombre: p.nombre, implementacion: p.implementacion, mensual: p.mensual, descuento: 0 } : null;
  }).filter(Boolean);
  if (cotizarItems.length === 0) {
    // Fallback: try first plan
    const p = planes[0];
    if (p) cotizarItems = [{ planId: p.id, nombre: p.nombre, implementacion: p.implementacion, mensual: p.mensual, descuento: 0 }];
  }
  generarCotizacion();
}

// ── CSV ──
function parseCSV(text) {
  text = text.replace(/^﻿/, '');
  const firstLine = text.split(/\r?\n/)[0];
  const delim = firstLine.split(';').length > firstLine.split(',').length ? ';' : ',';
  const rows = []; let row = [], field = '', inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i+1];
    if (inQuote) {
      if (ch==='"'&&next==='"'){field+='"';i++;} else if(ch==='"'){inQuote=false;} else{field+=ch;}
    } else {
      if(ch==='"'){inQuote=true;}
      else if(ch===delim){row.push(field.trim());field='';}
      else if(ch==='\n'||(ch==='\r'&&next==='\n')){if(ch==='\r')i++;row.push(field.trim());field='';if(row.some(c=>c))rows.push(row);row=[];}
      else{field+=ch;}
    }
  }
  if(field||row.length){row.push(field.trim());if(row.some(c=>c))rows.push(row);}
  return rows;
}

async function importCSV(e) {
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = async evt => {
    try {
      const rows = parseCSV(evt.target.result);
      if(rows.length<2){toast('Archivo vacío','error');return;}
      const norm = s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();
      const headers = rows[0].map(norm);
      const get=(row,keys)=>{for(const k of keys){const i=headers.indexOf(norm(k));if(i>=0&&i<row.length)return row[i].trim();}return '';};
      const nuevos=rows.slice(1).map(cols=>({
        nombre:get(cols,['nombre','name','empresa']),
        telefono:get(cols,['telefono','# telefono','phone','tel','celular']),
        ubicacion:get(cols,['ubicacion','ubicación','location','direccion','ciudad']),
        sitio_web:get(cols,['sitio web','sitioweb','website','web','sitio','url']),
        notas:get(cols,['comentarios','notas','comments','nota']),
        email:get(cols,['correo','email','mail','e-mail']),
        estado:'no_llamado',tipo:'prospecto',
      })).filter(r=>r.nombre);
      if(!nuevos.length){toast('Sin registros válidos','error');return;}
      const{error}=await _supa.from('registros').insert(nuevos);
      if(error)throw error;
      toast(nuevos.length+' registros importados','success');
      await loadAll();
    } catch(err){toast('Error: '+err.message,'error');}
  };
  reader.readAsText(file,'utf-8');
  e.target.value='';
}

function exportCSV(tipo) {
  const lista = tipo==='all'?records:records.filter(r=>r.tipo===tipo);
  const cols=[['nombre','Nombre'],['ubicacion','Ubicación'],['telefono','Teléfono'],['email','Correo'],['sitioWeb','Sitio Web'],['estado','Estado'],['tipo','Tipo'],['notas','Comentarios']];
  const e2=v=>`"${String(v||'').replace(/"/g,'""')}"`;
  const csv=[cols.map(c=>e2(c[1])),...lista.map(r=>cols.map(c=>e2(r[c[0]])))].map(r=>r.join(',')).join('\n');
  const blob=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`synapse_crm_${tipo}_${new Date().toISOString().slice(0,10)}.csv`;a.click();
  URL.revokeObjectURL(url);toast('CSV exportado','success');
}

// ── MODALS ──
function closeModal(id) { document.getElementById(id).style.display='none'; }
function overlayClose(e, id) { if(e.target===e.currentTarget)closeModal(id); }
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['modal-form','modal-plan','modal-add-nota','modal-add-clave','modal-confirm'].forEach(closeModal);
  }
});

// ── INIT ──
loadAll();
