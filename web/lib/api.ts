import { getCookie } from './cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const token = options.token || getCookie('access_token');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Generic GET method
  async get<T = any>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  // Generic POST method
  async post<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Generic PUT method
  async put<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Generic PATCH method
  async patch<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Generic DELETE method
  async delete<T = any>(endpoint: string, options?: ApiOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Auth endpoints
  async register(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: any) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async refreshToken() {
    return this.request('/auth/refresh-token', {
      method: 'POST',
    });
  }

  async verifyEmail(token: string) {
    return this.request(`/auth/verify-email/${token}`);
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // User endpoints
  async getUser(id: string) {
    return this.request(`/users/profile/${id}`);
  }

  async updateProfile(data: any) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.request('/users/me/avatar', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async uploadCV(file: File) {
    const formData = new FormData();
    formData.append('cv', file);
    
    return this.request('/users/me/cv', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async searchUsers(query: string, role?: string) {
    const params = new URLSearchParams({ q: query });
    if (role) params.append('role', role);
    
    return this.request(`/users/search?${params}`);
  }

  // Job endpoints
  async getJobs(params?: any) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/jobs?${searchParams}`);
  }

  async getJob(id: string) {
    return this.request(`/jobs/${id}`);
  }

  async createJob(data: any) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJob(id: string, data: any) {
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteJob(id: string) {
    return this.request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleJobStatus(id: string) {
    return this.request(`/jobs/${id}/toggle`, {
      method: 'PATCH',
    });
  }

  async getMyJobs(params?: any) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/jobs/my/jobs?${searchParams}`);
  }

  async getCompanyJobs(companyId: string, params?: any) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/jobs/company/${companyId}?${searchParams}`);
  }

  // Application endpoints
  async applyToJob(data: any) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyApplications(params?: any) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/applications/my?${searchParams}`);
  }

  async getJobApplications(jobId: string, params?: any) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/applications/job/${jobId}?${searchParams}`);
  }

  async getApplication(id: string) {
    return this.request(`/applications/${id}`);
  }

  async updateApplicationStatus(id: string, status: string, rejectionReason?: string) {
    return this.request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rejectionReason }),
    });
  }

  async withdrawApplication(id: string) {
    return this.request(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // Message endpoints
  async getConversations() {
    return this.request('/messages/conversations');
  }

  async startConversation(participantId: string) {
    return this.request('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantId }),
    });
  }

  async getMessages(conversationId: string, params?: any) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/messages/conversations/${conversationId}/messages?${searchParams}`);
  }

  async sendMessage(conversationId: string, content: string) {
    return this.request(`/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async markMessageAsRead(messageId: string) {
    return this.request(`/messages/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  }

  async deleteMessage(messageId: string) {
    return this.request(`/messages/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  // Notification endpoints
  async getNotifications(params?: any) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/notifications?${searchParams}`);
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteAllNotifications() {
    return this.request('/notifications', {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getUsers(params?: any) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/admin/users?${searchParams}`);
  }

  async changeUserRole(userId: string, role: string) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async banUser(userId: string, isActive: boolean) {
    return this.request(`/admin/users/${userId}/ban`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getPendingCompanies(params?: any) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/admin/pending-companies?${searchParams}`);
  }

  async verifyCompany(id: string, isVerified: boolean) {
    return this.request(`/admin/companies/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ isVerified }),
    });
  }

  async getReports(params?: any) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/admin/reports?${searchParams}`);
  }

  async updateReport(id: string, status: string, moderatorNotes?: string) {
    return this.request(`/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, moderatorNotes }),
    });
  }

  async getAdminLogs(params?: any) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/admin/logs?${searchParams}`);
  }

  async getSiteSettings() {
    return this.request('/admin/settings');
  }

  async updateSiteSettings(data: any) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Upload endpoints
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request('/upload/single', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async uploadMultipleFiles(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    return this.request('/upload/multiple', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async uploadVerificationDocs(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('documents', file));
    
    return this.request('/upload/verification', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }
}

export const api = new ApiClient();
