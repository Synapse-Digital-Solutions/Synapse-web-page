import jwt from 'jsonwebtoken';

export async function POST(req) {
  const { password } = await req.json();
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!ADMIN_PASSWORD || !JWT_SECRET) {
    return Response.json({ error: 'Server not configured' }, { status: 500 });
  }

  if (password !== ADMIN_PASSWORD) {
    return Response.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
  return Response.json({ token });
}
