import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase directly - no relative imports that might break bundling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

function setCors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Vercel file-based routing: req.query.slug is the catch-all segments
  // /api/tickets → slug = undefined
  // /api/tickets/abc → slug = ['abc']
  // /api/tickets/abc/history → slug = ['abc', 'history']
  const slug = req.query.slug as string[] | undefined;
  const ticketId = slug?.[0];
  const isHistory = slug?.[1] === 'history';

  try {
    // GET /api/tickets/:id/history
    if (req.method === 'GET' && ticketId && isHistory) {
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
    }

    // GET /api/tickets/:id
    if (req.method === 'GET' && ticketId) {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      if (error && error.code === 'PGRST116') return res.status(404).json({ error: 'Ticket not found' });
      if (error) throw error;
      return res.status(200).json(data);
    }

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
      const body = req.body;
      const now = new Date();
      let dueDate = body.due_date;
      if (!dueDate) {
        const due = new Date(now);
        due.setDate(due.getDate() + 3);
        dueDate = due.toISOString();
      }
      const { changed_by, ...ticketData } = body;
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
      // Log creation
      await supabase.from('change_logs').insert({
        ticket_id: data.id,
        action_type: 'CREATE',
        change_summary: 'Ticket Created',
        new_value: JSON.stringify(data),
      });
      return res.status(201).json(data);
    }

    // PATCH /api/tickets/:id
    if (req.method === 'PATCH' && ticketId) {
      const { changed_by, ...updateData } = req.body;
      // Get existing ticket first
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

      // Log changes
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
    console.error('[API Error]', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
