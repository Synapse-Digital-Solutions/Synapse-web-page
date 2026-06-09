import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function verifyToken(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return false;
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/quicktime',
];

export async function POST(req) {
  if (!verifyToken(req)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const file = req.body ? await req.blob() : null;
  const contentType = req.headers.get('content-type') || '';
  const filename = req.headers.get('x-filename') || `archivo-${Date.now()}`;

  if (!file || !ALLOWED_TYPES.includes(contentType)) {
    return Response.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
  }

  if (file.size > 50 * 1024 * 1024) {
    return Response.json({ error: 'El archivo supera 50MB' }, { status: 400 });
  }

  const ext = filename.includes('.') ? filename.split('.').pop() : 'bin';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('media')
    .upload(path, file, { contentType, upsert: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);

  return Response.json({ url: urlData.publicUrl });
}
