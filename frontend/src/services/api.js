const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://dpit-api.phil-e23.workers.dev'  // ← Your actual Worker URL
  : 'http://localhost:8787';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  // Posts
  async getPosts(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/posts?${params}`);
  }

  async createPost(postData) {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(id, postData) {
    return this.request(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id) {
    return this.request(`/api/posts/${id}`, {
      method: 'DELETE',
    });
  }

  // Calendar
  async getCalendar() {
    return this.request('/api/calendar');
  }

  async createCalendarItem(itemData) {
    return this.request('/api/calendar', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateCalendarItem(id, itemData) {
    return this.request(`/api/calendar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteCalendarItem(id) {
    return this.request(`/api/calendar/${id}`, {
      method: 'DELETE',
    });
  }

  async updateCalendarStatus(id, status) {
    return this.request(`/api/calendar/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Analytics
  async getAnalyticsSummary() {
    return this.request('/api/analytics/summary');
  }

  async getPlatformAnalytics() {
    return this.request('/api/analytics/platform');
  }

  async getContentAnalytics() {
    return this.request('/api/analytics/content');
  }

  // Sync
  async syncToWebhook(webhookUrl, data) {
    return fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();