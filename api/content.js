import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function GET() {
  const { data, error } = await supabase
    .from('content')
    .select('key, data');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const content = {};
  for (const row of data) {
    content[row.key] = row.data;
  }

  return Response.json(content, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' }
  });
}
