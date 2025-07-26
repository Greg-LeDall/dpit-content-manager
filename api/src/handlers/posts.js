import { Hono } from 'hono';

export const postsHandler = new Hono();

// GET /api/posts - List all posts with filtering
postsHandler.get('/', async (c) => {
  const { platform, week, search } = c.req.query();
  
  let sql = 'SELECT * FROM posts WHERE 1=1';
  const params = [];
  
  if (platform && platform !== 'all') {
    sql += ' AND platform = ?';
    params.push(platform);
  }
  
  if (search) {
    sql += ' AND (title LIKE ? OR content_type LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  sql += ' ORDER BY date DESC';
  
  try {
    const result = await c.env.DB.prepare(sql).bind(...params).all();
    return c.json(result.results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch posts' }, 500);
  }
});

// POST /api/posts - Create new post
postsHandler.post('/', async (c) => {
  try {
    const post = await c.req.json();
    
    // Calculate engagement rate
    const engagementRate = post.views > 0 
      ? ((post.likes + post.comments + post.shares) / post.views * 100).toFixed(2)
      : 0;
    
    const sql = `
      INSERT INTO posts 
      (date, platform, content_type, title, url, views, likes, comments, shares, clicks, notes, calendar_item_id, engagement_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await c.env.DB.prepare(sql).bind(
      post.date,
      post.platform,
      post.contentType,
      post.title,
      post.url || null,
      post.views || 0,
      post.likes || 0,
      post.comments || 0,
      post.shares || 0,
      post.clicks || 0,
      post.notes || null,
      post.calendarItemId || null,
      engagementRate
    ).run();
    
    // Update calendar item status if linked
    if (post.calendarItemId) {
      await c.env.DB.prepare(
        'UPDATE calendar_items SET status = ? WHERE id = ?'
      ).bind('analyzed', post.calendarItemId).run();
    }
    
    return c.json({ 
      id: result.meta.last_row_id, 
      ...post, 
      engagementRate 
    }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

// PUT /api/posts/:id - Update post
postsHandler.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const post = await c.req.json();
    
    const engagementRate = post.views > 0 
      ? ((post.likes + post.comments + post.shares) / post.views * 100).toFixed(2)
      : 0;
    
    const sql = `
      UPDATE posts SET 
        date = ?, platform = ?, content_type = ?, title = ?, url = ?,
        views = ?, likes = ?, comments = ?, shares = ?, clicks = ?,
        notes = ?, engagement_rate = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await c.env.DB.prepare(sql).bind(
      post.date,
      post.platform,
      post.contentType,
      post.title,
      post.url || null,
      post.views || 0,
      post.likes || 0,
      post.comments || 0,
      post.shares || 0,
      post.clicks || 0,
      post.notes || null,
      engagementRate,
      id
    ).run();
    
    return c.json({ id, ...post, engagementRate });
  } catch (error) {
    return c.json({ error: 'Failed to update post' }, 500);
  }
});

// DELETE /api/posts/:id - Delete post
postsHandler.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await c.env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete post' }, 500);
  }
});