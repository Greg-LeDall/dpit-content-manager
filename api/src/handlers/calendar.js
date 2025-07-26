import { Hono } from 'hono';

export const calendarHandler = new Hono();

// GET /api/calendar - List all calendar items
calendarHandler.get('/', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      'SELECT * FROM calendar_items ORDER BY day, time'
    ).all();
    
    // Parse JSON platforms field
    const items = result.results.map(item => ({
      ...item,
      platforms: JSON.parse(item.platforms)
    }));
    
    return c.json(items);
  } catch (error) {
    return c.json({ error: 'Failed to fetch calendar items' }, 500);
  }
});

// POST /api/calendar - Create calendar item
calendarHandler.post('/', async (c) => {
  try {
    const item = await c.req.json();
    
    const sql = `
      INSERT INTO calendar_items 
      (id, day, time, title, content_type, platforms, priority, status, theme, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await c.env.DB.prepare(sql).bind(
      item.id,
      item.day,
      item.time,
      item.title,
      item.contentType,
      JSON.stringify(item.platforms),
      item.priority || 'medium',
      item.status || 'planned',
      item.theme || null,
      item.notes || null
    ).run();
    
    return c.json(item, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create calendar item' }, 500);
  }
});

// PUT /api/calendar/:id - Update calendar item
calendarHandler.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const item = await c.req.json();
    
    const sql = `
      UPDATE calendar_items SET 
        day = ?, time = ?, title = ?, content_type = ?, platforms = ?,
        priority = ?, status = ?, theme = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await c.env.DB.prepare(sql).bind(
      item.day,
      item.time,
      item.title,
      item.contentType,
      JSON.stringify(item.platforms),
      item.priority,
      item.status,
      item.theme || null,
      item.notes || null,
      id
    ).run();
    
    return c.json(item);
  } catch (error) {
    return c.json({ error: 'Failed to update calendar item' }, 500);
  }
});

// DELETE /api/calendar/:id - Delete calendar item
calendarHandler.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM calendar_items WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete calendar item' }, 500);
  }
});

// PATCH /api/calendar/:id/status - Update status only
calendarHandler.patch('/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    await c.env.DB.prepare(
      'UPDATE calendar_items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(status, id).run();
    
    return c.json({ success: true, status });
  } catch (error) {
    return c.json({ error: 'Failed to update status' }, 500);
  }
});