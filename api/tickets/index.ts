import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET /api/tickets
    if (req.method === 'GET') {
      const { status, sort, order } = req.query;
      let query = supabase.from('tickets').select('*');
      if (status && status !== 'all') query = query.eq('status', status as string);
      if (sort) {
        query = query.order(sort as string, { ascending: order === 'asc' });
      } else {
        query = query.order('updated_at', { ascending: false });
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    // POST /api/tickets
    if (req.method === 'POST') {
      const { changed_by, ...ticketData } = req.body;
      const now = new Date();
      let dueDate = ticketData.due_date;
      if (!dueDate) {
        const due = new Date(now);
        due.setDate(due.getDate() + 3);
        dueDate = due.toISOString();
      }
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ...ticketData,
          status: 'pending',
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          due_date: dueDate,
        })
        .select()
        .single();
      if (error) throw error;
      await supabase.from('change_logs').insert({
        ticket_id: data.id,
        action_type: 'CREATE',
        change_summary: 'Ticket Created',
        new_value: JSON.stringify(data),
      });
      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[API /api/tickets]', error);
    return res.status(500).json({ error: error.message });
  }
}
