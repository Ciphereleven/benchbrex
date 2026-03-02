export default async function handler(req, res) {
  const SUPABASE_URL = 'https://zowbwgzslqxrqdpoimac.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_I7_Xi25VO1-xaDjpi7VDsA_l5938yBC';

  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/leads?select=*&order=created_at.desc&limit=500`, { headers });
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    if (req.method === 'PATCH') {
      const { id, ...updates } = req.body;
      const r = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${id}`, {
        method: 'PATCH', headers, body: JSON.stringify(updates)
      });
      return res.status(r.status).json({ success: r.ok });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
