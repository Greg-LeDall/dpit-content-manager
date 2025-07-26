-- Posts table for analytics data
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  notes TEXT,
  calendar_item_id TEXT,
  engagement_rate REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Calendar items table for content planning
CREATE TABLE calendar_items (
  id TEXT PRIMARY KEY,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL,
  platforms TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'planned',
  theme TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default calendar data
INSERT INTO calendar_items (id, day, time, title, content_type, platforms, priority, status, theme) VALUES
('mon-1', 'Monday', '10:00 AM EST', 'Framework Deep-Dive Carousel', 'Framework Carousel', '["LinkedIn","Instagram"]', 'high', 'planned', 'Framework Monday'),
('mon-2', 'Monday', '12:00 PM EST', 'Framework Infographic', 'Framework Carousel', '["Instagram"]', 'medium', 'planned', 'Framework Monday'),
('mon-3', 'Monday', '1:00 PM EST', 'Framework Thread', 'Thread', '["X"]', 'medium', 'planned', 'Framework Monday'),
('tue-1', 'Tuesday', '11:00 AM EST', 'Episode Launch + PRF Summary', 'Episode Launch', '["LinkedIn","X","Facebook"]', 'high', 'planned', 'Episode Launch Day'),
('tue-2', 'Tuesday', '11:30 AM EST', 'Episode Stories Series', 'Stories Series', '["Instagram"]', 'medium', 'planned', 'Episode Launch Day'),
('tue-3', 'Tuesday', '12:00 PM EST', 'Guest Introduction Thread', 'Thread', '["X"]', 'medium', 'planned', 'Episode Launch Day'),
('wed-1', 'Wednesday', '10:00 AM EST', 'Previous Guest Callback', 'Guest Spotlight', '["LinkedIn"]', 'medium', 'planned', 'Guest Spotlight'),
('wed-2', 'Wednesday', '12:00 PM EST', 'Guest Quote Card', 'Quote Card', '["Instagram","X"]', 'medium', 'planned', 'Guest Spotlight'),
('wed-3', 'Wednesday', '3:00 PM EST', 'Remember When Post', 'Guest Spotlight', '["Facebook"]', 'low', 'planned', 'Guest Spotlight'),
('thu-1', 'Thursday', '11:00 AM EST', 'Episode Launch + PRF Summary', 'Episode Launch', '["LinkedIn","X","Facebook"]', 'high', 'planned', 'Episode Launch Day'),
('thu-2', 'Thursday', '11:30 AM EST', 'Episode Stories Series', 'Stories Series', '["Instagram"]', 'medium', 'planned', 'Episode Launch Day'),
('thu-3', 'Thursday', '1:00 PM EST', 'Key Insights Thread', 'Thread', '["X"]', 'medium', 'planned', 'Episode Launch Day'),
('fri-1', 'Friday', '9:00 AM EST', 'Mini-Article: Episode Insights', 'Mini-Article', '["LinkedIn"]', 'medium', 'planned', 'Tactical Friday'),
('fri-2', 'Friday', '12:00 PM EST', 'Weekend Homework', 'Framework Carousel', '["Instagram"]', 'medium', 'planned', 'Tactical Friday'),
('fri-3', 'Friday', '2:00 PM EST', 'Implementation Tips', 'Implementation Tips', '["X"]', 'medium', 'planned', 'Tactical Friday'),
('sat-1', 'Saturday', '10:00 AM EST', 'Previous Episode Highlights', 'Community Content', '["LinkedIn","Facebook"]', 'low', 'planned', 'Community & Archive'),
('sat-2', 'Saturday', '1:00 PM EST', 'Best Of Compilation', 'Community Content', '["Instagram"]', 'low', 'planned', 'Community & Archive'),
('sun-1', 'Sunday', '11:00 AM EST', 'Motivational Quote', 'Motivational Quote', '["Instagram","Facebook"]', 'low', 'planned', 'Motivation & Preview'),
('sun-2', 'Sunday', '5:00 PM EST', 'Monday Preparation', 'Preview', '["LinkedIn"]', 'low', 'planned', 'Motivation & Preview');