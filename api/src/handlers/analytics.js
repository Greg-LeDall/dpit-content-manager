import { Hono } from 'hono';

export const analyticsHandler = new Hono();

// GET /api/analytics/summary - Dashboard statistics
analyticsHandler.get('/summary', async (c) => {
  try {
    // Get basic stats
    const totalPostsResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM posts'
    ).first();
    
    const totalViewsResult = await c.env.DB.prepare(
      'SELECT SUM(views) as total FROM posts'
    ).first();
    
    const totalEngagementResult = await c.env.DB.prepare(
      'SELECT SUM(likes + comments + shares) as total FROM posts'
    ).first();
    
    const avgEngagementResult = await c.env.DB.prepare(
      'SELECT AVG(engagement_rate) as avg FROM posts WHERE engagement_rate > 0'
    ).first();
    
    return c.json({
      totalPosts: totalPostsResult.count || 0,
      totalViews: totalViewsResult.total || 0,
      totalEngagement: totalEngagementResult.total || 0,
      avgEngagementRate: avgEngagementResult.avg ? Number(avgEngagementResult.avg).toFixed(2) : 0
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch summary' }, 500);
  }
});

// GET /api/analytics/platform - Platform performance
analyticsHandler.get('/platform', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        platform,
        COUNT(*) as posts,
        SUM(views) as views,
        SUM(likes + comments + shares) as engagement
      FROM posts 
      GROUP BY platform
      ORDER BY posts DESC
    `).all();
    
    return c.json(result.results);
  } catch (error) {
    return c.json({ error: 'Failed to fetch platform data' }, 500);
  }
});

// GET /api/analytics/content - Content type performance
analyticsHandler.get('/content', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        content_type as type,
        content_type as fullType,
        COUNT(*) as posts,
        AVG(engagement_rate) as avgEngagement
      FROM posts 
      GROUP BY content_type
      HAVING posts > 0
      ORDER BY posts DESC
    `).all();
    
    // Format the results
    const formatted = result.results.map(row => ({
      ...row,
      type: row.type.length > 15 ? row.type.substring(0, 15) + '...' : row.type,
      avgEngagement: Number(row.avgEngagement).toFixed(2)
    }));
    
    return c.json(formatted);
  } catch (error) {
    return c.json({ error: 'Failed to fetch content data' }, 500);
  }
});