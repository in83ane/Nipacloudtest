import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;
  const ticketId = Array.isArray(id) ? id[0] : id;
  if (!ticketId) return res.status(400).json({ error: 'Missing ticket ID' });

  try {
    // GET /api/tickets/:id
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      if (error && error.code === 'PGRST116') return res.status(404).json({ error: 'Ticket not found' });
      if (error) throw error;
      return res.status(200).json(data);
    }

    // PATCH /api/tickets/:id
    if (req.method === 'PATCH') {
      const { changed_by, ...updateData } = req.body;
      const { data: existing } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      if (!existing) return res.status(404).json({ error: 'Ticket not found' });

      const { data, error } = await supabase
        .from('tickets')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', ticketId)
        .select()
        .single();
      if (error) throw error;

      if (updateData.status && updateData.status !== existing.status) {
        await supabase.from('change_logs').insert({
          ticket_id: ticketId,
          action_type: 'UPDATE',
          change_summary: `Status updated: ${existing.status} → ${updateData.status}`,
          old_value: existing.status,
          new_value: updateData.status,
        });
      }
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API /api/tickets/[id]]', error);
    return res.status(500).json({ error: error.message });
  }
}
