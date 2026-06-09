-- Ejecuta esto en el SQL Editor de tu proyecto en supabase.com

-- Tabla principal de contenido
CREATE TABLE IF NOT EXISTS content (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deshabilitar RLS (el acceso se controla desde la API con service key)
ALTER TABLE content DISABLE ROW LEVEL SECURITY;

-- Datos iniciales: Hero
INSERT INTO content (key, data) VALUES (
  'hero',
  '{
    "badge": "Tecnología que conecta negocios",
    "titulo1": "Tu presencia digital,",
    "titulo2": "redefinida.",
    "subtitulo": "Diseñamos páginas web que convierten y CRMs que organizan tu negocio. Soluciones a la medida, resultados desde el día uno.",
    "btn1": "Ver servicios",
    "btn2": "Hablar con nosotros"
  }'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- Datos iniciales: Estadísticas (los 4 contadores de la sección "Nuestros números hablan" en Inicio)
INSERT INTO content (key, data) VALUES (
  'estadisticas',
  '[
    {"valor": "50+", "etiqueta": "Proyectos entregados"},
    {"valor": "98%", "etiqueta": "Satisfacción del cliente"},
    {"valor": "3x",  "etiqueta": "Más conversiones promedio"},
    {"valor": "24h", "etiqueta": "Tiempo de respuesta"}
  ]'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- Datos iniciales: Servicios
INSERT INTO content (key, data) VALUES (
  'servicios',
  '[
    {
      "numero": "01",
      "titulo": "Páginas Web de Alto Impacto",
      "descripcion": "Diseñamos sitios que comunican lo que tu negocio es, no solo cómo se ve. Cada elemento está pensado para convertir visitantes en clientes reales desde el primer clic.",
      "features": [
        "Diseño único a tu medida — sin plantillas genéricas",
        "Optimización SEO desde el día uno",
        "Velocidad de carga máxima en todos los dispositivos",
        "Integración con redes sociales, WhatsApp y CRM",
        "Panel de métricas y analítica incluido"
      ],
      "pills": ["Landing Pages", "E-commerce", "Corporativo", "SEO", "Portafolios"]
    },
    {
      "numero": "02",
      "titulo": "CRM a la Medida",
      "descripcion": "Olvídate de las hojas de cálculo y el caos. Te damos un sistema hecho exactamente para tu flujo de trabajo — controla cada lead, venta y cliente desde un solo lugar.",
      "features": [
        "Pipeline visual de ventas personalizable",
        "Seguimiento automático de leads y oportunidades",
        "Reportes y dashboards en tiempo real",
        "Automatizaciones de tareas y recordatorios",
        "Integración con WhatsApp, email y más"
      ],
      "pills": ["Pipeline", "Automatización", "Reportes", "Integraciones", "Multi-usuario"]
    },
    {
      "numero": "03",
      "titulo": "Estrategia Digital Completa",
      "descripcion": "No solo construimos — te acompañamos. Analizamos tu negocio, definimos qué herramientas necesitas y nos aseguramos de que realmente funcionen a largo plazo.",
      "features": [
        "Diagnóstico digital de tu negocio actual",
        "Hoja de ruta personalizada con prioridades claras",
        "Selección y configuración de herramientas tech",
        "Capacitación a tu equipo incluida",
        "Soporte continuo y ajustes post-lanzamiento"
      ],
      "pills": ["Consultoría", "Análisis", "Soporte", "Escalabilidad"]
    }
  ]'::jsonb
) ON CONFLICT (key) DO NOTHING;

-- Datos iniciales: Precios
INSERT INTO content (key, data) VALUES (
  'precios',
  '[
    {
      "nombre": "Básico",
      "precio": "$8,500",
      "descripcion": "Ideal para negocios que necesitan presencia web profesional.",
      "features": [
        "Landing page de hasta 5 secciones",
        "Diseño responsivo",
        "SEO básico",
        "Formulario de contacto",
        "1 ronda de revisiones"
      ],
      "destacado": false
    },
    {
      "nombre": "Profesional",
      "precio": "$15,000",
      "descripcion": "Para empresas que quieren impacto real y más páginas.",
      "features": [
        "Hasta 8 páginas",
        "Diseño premium a medida",
        "SEO avanzado",
        "Integración WhatsApp",
        "Blog o catálogo",
        "3 rondas de revisiones",
        "Soporte 30 días"
      ],
      "destacado": true
    },
    {
      "nombre": "Empresarial",
      "precio": "A cotizar",
      "descripcion": "Solución completa con CRM, estrategia y soporte continuo.",
      "features": [
        "Todo lo del plan Profesional",
        "CRM a la medida",
        "Estrategia digital",
        "Automatizaciones",
        "Soporte continuo",
        "Capacitación del equipo"
      ],
      "destacado": false
    }
  ]'::jsonb
) ON CONFLICT (key) DO NOTHING;
