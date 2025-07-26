import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  Calendar, TrendingUp, Eye, Heart,
  Plus, Save, Upload, Download, Filter, Search, X, Edit, Trash2,
  CheckCircle, PlayCircle, Settings,
  CalendarDays, BarChart3, FileText
} from 'lucide-react';
import { apiService } from './services/api';

const ContentManagementSystem = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [posts, setPosts] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCalendarForm, setShowCalendarForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editingCalendarItem, setEditingCalendarItem] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterWeek, setFilterWeek] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState('');

  // Content types from your calendar
  const contentTypes = [
    'Episode Launch', 'Framework Carousel', 'Guest Spotlight', 'Implementation Tips',
    'Quote Card', 'Stories Series', 'Thread', 'Mini-Article', 'Community Content',
    'Motivational Quote', 'Throwback', 'Preview'
  ];

  const platforms = ['LinkedIn', 'Instagram', 'X', 'Facebook'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const platformColors = {
    'LinkedIn': '#0077b5',
    'Instagram': '#e4405f', 
    'X': '#1da1f2',
    'Facebook': '#1877f2'
  };

  const priorityColors = {
    'high': '#ef4444',
    'medium': '#f59e0b',
    'low': '#6b7280'
  };

  const statusColors = {
    'planned': '#6b7280',
    'posted': '#3b82f6',
    'analyzed': '#10b981'
  };

  // Load data from API on component mount
  useEffect(() => {
    loadData();
    const savedWebhook = localStorage.getItem('dpit-webhook-url');
    if (savedWebhook) {
      setWebhookUrl(savedWebhook);
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, calendarData] = await Promise.all([
        apiService.getPosts(),
        apiService.getCalendar()
      ]);
      
      setPosts(postsData);
      setCalendar(calendarData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setSyncStatus('❌ Failed to load data from server');
      setTimeout(() => setSyncStatus(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Save webhook URL to localStorage
  useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem('dpit-webhook-url', webhookUrl);
    }
  }, [webhookUrl]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    platform: '',
    contentType: '',
    title: '',
    url: '',
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    clicks: 0,
    notes: '',
    calendarItemId: ''
  });

  const [calendarFormData, setCalendarFormData] = useState({
    day: 'Monday',
    time: '10:00 AM EST',
    title: '',
    contentType: '',
    platforms: [],
    priority: 'medium',
    status: 'planned',
    theme: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      platform: '',
      contentType: '',
      title: '',
      url: '',
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
      notes: '',
      calendarItemId: ''
    });
  };

  const resetCalendarForm = () => {
    setCalendarFormData({
      day: 'Monday',
      time: '10:00 AM EST',
      title: '',
      contentType: '',
      platforms: [],
      priority: 'medium',
      status: 'planned',
      theme: '',
      notes: ''
    });
  };

  const handleSubmit = async () => {
    if (!formData.platform || !formData.contentType || !formData.title) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingPost) {
        const updatedPost = await apiService.updatePost(editingPost.id, formData);
        setPosts(posts.map(post => post.id === editingPost.id ? updatedPost : post));
        setEditingPost(null);
      } else {
        const newPost = await apiService.createPost(formData);
        setPosts([...posts, newPost]);
      }

      resetForm();
      setShowAddForm(false);
      setSyncStatus('✅ Post saved successfully!');
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (error) {
      console.error('Failed to save post:', error);
      setSyncStatus('❌ Failed to save post. Please try again.');
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  const handleCalendarSubmit = async () => {
    if (!calendarFormData.title || !calendarFormData.contentType) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const itemData = {
        ...calendarFormData,
        id: editingCalendarItem ? editingCalendarItem.id : `${calendarFormData.day.toLowerCase()}-${Date.now()}`
      };

      if (editingCalendarItem) {
        const updatedItem = await apiService.updateCalendarItem(editingCalendarItem.id, itemData);
        setCalendar(calendar.map(item => item.id === editingCalendarItem.id ? updatedItem : item));
        setEditingCalendarItem(null);
      } else {
        const newItem = await apiService.createCalendarItem(itemData);
        setCalendar([...calendar, newItem]);
      }

      resetCalendarForm();
      setShowCalendarForm(false);
      setSyncStatus('✅ Calendar item saved successfully!');
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (error) {
      console.error('Failed to save calendar item:', error);
      setSyncStatus('❌ Failed to save calendar item. Please try again.');
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  const handleEdit = (post) => {
    setFormData({
      ...post,
      calendarItemId: post.calendar_item_id || ''
    });
    setEditingPost(post);
    setShowAddForm(true);
  };

  const handleEditCalendarItem = (item) => {
    setCalendarFormData({
      ...item,
      contentType: item.content_type
    });
    setEditingCalendarItem(item);
    setShowCalendarForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await apiService.deletePost(id);
        setPosts(posts.filter(post => post.id !== id));
        setSyncStatus('✅ Post deleted successfully!');
        setTimeout(() => setSyncStatus(''), 2000);
      } catch (error) {
        console.error('Failed to delete post:', error);
        setSyncStatus('❌ Failed to delete post. Please try again.');
        setTimeout(() => setSyncStatus(''), 3000);
      }
    }
  };

  const handleDeleteCalendarItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this calendar item?')) {
      try {
        await apiService.deleteCalendarItem(id);
        setCalendar(calendar.filter(item => item.id !== id));
        setSyncStatus('✅ Calendar item deleted successfully!');
        setTimeout(() => setSyncStatus(''), 2000);
      } catch (error) {
        console.error('Failed to delete calendar item:', error);
        setSyncStatus('❌ Failed to delete calendar item. Please try again.');
        setTimeout(() => setSyncStatus(''), 3000);
      }
    }
  };

  const markAsPosted = async (calendarItemId) => {
    try {
      await apiService.updateCalendarStatus(calendarItemId, 'posted');
      setCalendar(calendar.map(item => 
        item.id === calendarItemId 
          ? { ...item, status: 'posted' }
          : item
      ));
      setSyncStatus('✅ Status updated!');
      setTimeout(() => setSyncStatus(''), 2000);
    } catch (error) {
      console.error('Failed to update status:', error);
      setSyncStatus('❌ Failed to update status. Please try again.');
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  const createPostFromCalendar = (calendarItem) => {
    setFormData({
      ...formData,
      contentType: calendarItem.content_type,
      title: calendarItem.title,
      calendarItemId: calendarItem.id
    });
    setShowAddForm(true);
  };

  const syncToGoogleSheets = async () => {
    if (!webhookUrl) {
      setSyncStatus('Please enter a Make.com webhook URL first');
      return;
    }

    setSyncStatus('Syncing...');
    
    try {
      const response = await apiService.syncToWebhook(webhookUrl, {
        posts: posts,
        calendar: calendar,
        timestamp: new Date().toISOString(),
        summary: generateSummaryStats()
      });

      if (response.ok) {
        setSyncStatus('✅ Successfully synced to Google Sheets!');
      } else {
        setSyncStatus('❌ Sync failed. Please check your webhook URL.');
      }
    } catch (error) {
      setSyncStatus('❌ Sync failed. Please check your connection.');
    }

    setTimeout(() => setSyncStatus(''), 3000);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Platform', 'Content Type', 'Title', 'URL', 'Views', 'Likes', 'Comments', 'Shares', 'Clicks', 'Engagement Rate', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...posts.map(post => [
        post.date,
        post.platform,
        post.content_type,
        `"${post.title}"`,
        post.url || '',
        post.views,
        post.likes,
        post.comments,
        post.shares,
        post.clicks,
        post.engagement_rate,
        `"${post.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dpit-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateSummaryStats = () => {
    const totalPosts = posts.length;
    const totalViews = posts.reduce((sum, post) => sum + parseInt(post.views || 0), 0);
    const totalEngagement = posts.reduce((sum, post) => sum + parseInt(post.likes || 0) + parseInt(post.comments || 0) + parseInt(post.shares || 0), 0);
    const avgEngagementRate = posts.length > 0 ? (posts.reduce((sum, post) => sum + parseFloat(post.engagement_rate || 0), 0) / posts.length).toFixed(2) : 0;

    return {
      totalPosts,
      totalViews,
      totalEngagement,
      avgEngagementRate
    };
  };

  // Filter posts based on current filters
  const filteredPosts = posts.filter(post => {
    const platformMatch = filterPlatform === 'all' || post.platform === filterPlatform;
    const searchMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       post.content_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    let weekMatch = true;
    if (filterWeek !== 'all') {
      const postDate = new Date(post.date);
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      
      if (filterWeek === 'current') {
        weekMatch = postDate >= weekStart;
      } else if (filterWeek === 'last') {
        const lastWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        weekMatch = postDate >= lastWeekStart && postDate < weekStart;
      }
    }

    return platformMatch && searchMatch && weekMatch;
  });

  // Analytics data preparation
  const platformData = platforms.map(platform => {
    const platformPosts = filteredPosts.filter(post => post.platform === platform);
    return {
      platform,
      posts: platformPosts.length,
      views: platformPosts.reduce((sum, post) => sum + parseInt(post.views || 0), 0),
      engagement: platformPosts.reduce((sum, post) => sum + parseInt(post.likes || 0) + parseInt(post.comments || 0) + parseInt(post.shares || 0), 0)
    };
  });

  const contentTypeData = contentTypes.map(type => {
    const typePosts = filteredPosts.filter(post => post.content_type === type);
    return {
      type: type.length > 15 ? type.substring(0, 15) + '...' : type,
      fullType: type,
      posts: typePosts.length,
      avgEngagement: typePosts.length > 0 ? (typePosts.reduce((sum, post) => sum + parseFloat(post.engagement_rate || 0), 0) / typePosts.length).toFixed(2) : 0
    };
  }).filter(item => item.posts > 0);

  const stats = generateSummaryStats();

  // Group calendar by day
  const calendarByDay = days.map(day => ({
    day,
    items: calendar.filter(item => item.day === day).sort((a, b) => a.time.localeCompare(b.time))
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your content data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2">
              DPIT Content Management System
            </h1>
            <p className="text-gray-400">Plan, execute, and analyze your content strategy</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <button
              onClick={activeTab === 'calendar' ? () => setShowCalendarForm(true) : () => setShowAddForm(true)}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
              {activeTab === 'calendar' ? 'Add Calendar Item' : 'Add Post'}
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={20} />
              Export CSV
            </button>
            <button
              onClick={syncToGoogleSheets}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Upload size={20} />
              Sync to Sheets
            </button>
            <button
              onClick={loadData}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Settings size={20} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'calendar' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarDays size={20} />
            Content Calendar
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'analytics' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 size={20} />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'posts' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText size={20} />
            Posts Management
          </button>
        </div>

        {/* Sync Status */}
        {syncStatus && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-sm">{syncStatus}</p>
          </div>
        )}

        {/* Webhook Configuration */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-3">Make.com Webhook Configuration</h3>
          <div className="flex gap-3">
            <input
              type="url"
              placeholder="Enter your Make.com webhook URL..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={() => setWebhookUrl('')}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            This URL will receive both calendar and analytics data for Google Sheets sync.
          </p>
        </div>

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-8">
              {calendarByDay.map(({ day, items }) => (
                <div key={day} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{day.toUpperCase()}</h3>
                    {items.length > 0 && (
                      <p className="text-sm text-orange-500 font-medium">
                        {items[0].theme}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="bg-gray-700 rounded-lg p-3 border-l-4" style={{ borderColor: priorityColors[item.priority] }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400 font-mono">{item.time}</span>
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: statusColors[item.status] }}
                              title={item.status}
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditCalendarItem(item)}
                                className="text-blue-400 hover:text-blue-300 p-1"
                                title="Edit"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteCalendarItem(item.id)}
                                className="text-red-400 hover:text-red-300 p-1"
                                title="Delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <h4 className="text-sm font-medium text-white mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-400 mb-2">{item.content_type}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.platforms.map(platform => (
                            <span 
                              key={platform}
                              className="text-xs px-2 py-1 rounded text-white"
                              style={{ backgroundColor: platformColors[platform] }}
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex gap-1">
                          {item.status === 'planned' && (
                            <>
                              <button
                                onClick={() => markAsPosted(item.id)}
                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                                title="Mark as Posted"
                              >
                                <PlayCircle size={12} />
                              </button>
                              <button
                                onClick={() => createPostFromCalendar(item)}
                                className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                                title="Add Analytics"
                              >
                                <BarChart3 size={12} />
                              </button>
                            </>
                          )}
                          {item.status === 'posted' && (
                            <button
                              onClick={() => createPostFromCalendar(item)}
                              className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                              title="Add Analytics"
                            >
                              <BarChart3 size={12} />
                            </button>
                          )}
                          {item.status === 'analyzed' && (
                            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                              <CheckCircle size={12} />
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Posts</p>
                    <p className="text-2xl font-bold text-orange-500">{stats.totalPosts}</p>
                  </div>
                  <Calendar className="text-orange-500" size={24} />
                </div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Views</p>
                    <p className="text-2xl font-bold text-blue-500">{stats.totalViews.toLocaleString()}</p>
                  </div>
                  <Eye className="text-blue-500" size={24} />
                </div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Engagement</p>
                    <p className="text-2xl font-bold text-green-500">{stats.totalEngagement.toLocaleString()}</p>
                  </div>
                  <Heart className="text-green-500" size={24} />
                </div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Engagement Rate</p>
                    <p className="text-2xl font-bold text-yellow-500">{stats.avgEngagementRate}%</p>
                  </div>
                  <TrendingUp className="text-yellow-500" size={24} />
                </div>
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Platform Performance */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Platform Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="platform" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="views" fill="#3B82F6" name="Views" />
                    <Bar dataKey="engagement" fill="#10B981" name="Engagement" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Content Type Performance */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Content Type Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={contentTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="type" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#fff' }}
                      labelFormatter={(label, payload) => payload[0]?.payload?.fullType || label}
                    />
                    <Legend />
                    <Bar dataKey="posts" fill="#F59E0B" name="Posts" />
                    <Bar dataKey="avgEngagement" fill="#EF4444" name="Avg Engagement %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Posts Management Tab */}
        {activeTab === 'posts' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="all">All Platforms</option>
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>{platform}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-400" />
                <select
                  value={filterWeek}
                  onChange={(e) => setFilterWeek(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="all">All Time</option>
                  <option value="current">Current Week</option>
                  <option value="last">Last Week</option>
                </select>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-64">
                <Search size={20} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Posts Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold">Posts Analytics</h3>
                <p className="text-gray-400 text-sm">Showing {filteredPosts.length} of {posts.length} posts</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Platform</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Content Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Engagement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredPosts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                          No posts found. Add your first post to get started!
                        </td>
                      </tr>
                    ) : (
                      filteredPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(post.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: platformColors[post.platform] }}
                            >
                              {post.platform}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{post.content_type}</td>
                          <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                            {post.url ? (
                              <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400">
                                {post.title}
                              </a>
                            ) : (
                              post.title
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{parseInt(post.views || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {(parseInt(post.likes || 0) + parseInt(post.comments || 0) + parseInt(post.shares || 0)).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`font-medium ${parseFloat(post.engagement_rate || 0) > 5 ? 'text-green-500' : parseFloat(post.engagement_rate || 0) > 2 ? 'text-yellow-500' : 'text-red-500'}`}>
                              {post.engagement_rate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(post)}
                                className="text-blue-500 hover:text-blue-400"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="text-red-500 hover:text-red-400"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Post Modal - keeping the same structure but with API field names */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingPost ? 'Edit Post' : 'Add New Post'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPost(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({...formData, platform: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      required
                    >
                      <option value="">Select Platform</option>
                      {platforms.map(platform => (
                        <option key={platform} value={platform}>{platform}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
                  <select
                    value={formData.contentType}
                    onChange={(e) => setFormData({...formData, contentType: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    required
                  >
                    <option value="">Select Content Type</option>
                    {contentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Post Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="Enter post title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Post URL (optional)</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Views</label>
                    <input
                      type="number"
                      value={formData.views}
                      onChange={(e) => setFormData({...formData, views: parseInt(e.target.value) || 0})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Likes</label>
                    <input
                      type="number"
                      value={formData.likes}
                      onChange={(e) => setFormData({...formData, likes: parseInt(e.target.value) || 0})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Comments</label>
                    <input
                      type="number"
                      value={formData.comments}
                      onChange={(e) => setFormData({...formData, comments: parseInt(e.target.value) || 0})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Shares</label>
                    <input
                      type="number"
                      value={formData.shares}
                      onChange={(e) => setFormData({...formData, shares: parseInt(e.target.value) || 0})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Clicks</label>
                    <input
                      type="number"
                      value={formData.clicks}
                      onChange={(e) => setFormData({...formData, clicks: parseInt(e.target.value) || 0})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    rows={3}
                    placeholder="Additional notes about this post..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg transition-colors"
                  >
                    <Save size={20} />
                    {editingPost ? 'Update Post' : 'Save Post'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingPost(null);
                      resetForm();
                    }}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Calendar Item Modal - keeping same structure */}
        {showCalendarForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingCalendarItem ? 'Edit Calendar Item' : 'Add Calendar Item'}
                </h2>
                <button
                  onClick={() => {
                    setShowCalendarForm(false);
                    setEditingCalendarItem(null);
                    resetCalendarForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Day</label>
                    <select
                      value={calendarFormData.day}
                      onChange={(e) => setCalendarFormData({...calendarFormData, day: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                    <input
                      type="text"
                      value={calendarFormData.time}
                      onChange={(e) => setCalendarFormData({...calendarFormData, time: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                      placeholder="10:00 AM EST"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={calendarFormData.title}
                    onChange={(e) => setCalendarFormData({...calendarFormData, title: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="Content title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Content Type</label>
                  <select
                    value={calendarFormData.contentType}
                    onChange={(e) => setCalendarFormData({...calendarFormData, contentType: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    required
                  >
                    <option value="">Select Content Type</option>
                    {contentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Platforms</label>
                  <div className="grid grid-cols-2 gap-2">
                    {platforms.map(platform => (
                      <label key={platform} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={calendarFormData.platforms.includes(platform)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCalendarFormData({
                                ...calendarFormData,
                                platforms: [...calendarFormData.platforms, platform]
                              });
                            } else {
                              setCalendarFormData({
                                ...calendarFormData,
                                platforms: calendarFormData.platforms.filter(p => p !== platform)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-300">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                    <select
                      value={calendarFormData.priority}
                      onChange={(e) => setCalendarFormData({...calendarFormData, priority: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      value={calendarFormData.status}
                      onChange={(e) => setCalendarFormData({...calendarFormData, status: e.target.value})}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="planned">Planned</option>
                      <option value="posted">Posted</option>
                      <option value="analyzed">Analyzed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                  <input
                    type="text"
                    value={calendarFormData.theme}
                    onChange={(e) => setCalendarFormData({...calendarFormData, theme: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="e.g., Framework Monday, Episode Launch Day..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes (optional)</label>
                  <textarea
                    value={calendarFormData.notes}
                    onChange={(e) => setCalendarFormData({...calendarFormData, notes: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCalendarSubmit}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg transition-colors"
                  >
                    <Save size={20} />
                    {editingCalendarItem ? 'Update Item' : 'Save Item'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCalendarForm(false);
                      setEditingCalendarItem(null);
                      resetCalendarForm();
                    }}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <ContentManagementSystem />
    </div>
  );
}

export default App;
