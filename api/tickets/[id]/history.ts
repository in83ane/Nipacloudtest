import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  const ticketId = Array.isArray(id) ? id[0] : id;
  if (!ticketId) return res.status(400).json({ error: 'Missing ticket ID' });

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { data, error } = await supabase
      .from('change_logs')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const history = (data || []).map((row: any) => ({
      id: row.id,
      ticket_id: row.ticket_id,
      action_description: row.change_summary || row.action_type,
      old_value: row.old_value,
      new_value: row.new_value,
      timestamp: row.created_at,
    }));
    return res.status(200).json(history);
  } catch (error: any) {
    console.error('[API /api/tickets/[id]/history]', error);
    return res.status(500).json({ error: error.message });
  }
}
