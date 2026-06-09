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

export async function POST(req) {
  if (!verifyToken(req)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { key, data } = await req.json();

  if (!key || !data) {
    return Response.json({ error: 'Faltan datos' }, { status: 400 });
  }

  const { error } = await supabase
    .from('content')
    .upsert({ key, data, updated_at: new Date().toISOString() });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
