import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { postsHandler } from './handlers/posts.js';
import { calendarHandler } from './handlers/calendar.js';
import { analyticsHandler } from './handlers/analytics.js';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://dpit-content-manager.pages.dev',
      // Allow any localhost for development
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) {
      return '*';
    }
    return false;
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
}));

// Health check
app.get('/', (c) => c.json({ message: 'DPIT API is running!' }));

// API routes
app.route('/api/posts', postsHandler);
app.route('/api/calendar', calendarHandler);
app.route('/api/analytics', analyticsHandler);

// Make.com webhook endpoint
app.post('/api/sync', async (c) => {
  try {
    const data = await c.req.json();
    // Here you could save data to D1 if needed
    return c.json({ success: true, message: 'Data received' });
  } catch (error) {
    return c.json({ error: 'Invalid JSON' }, 400);
  }
});

export default app;