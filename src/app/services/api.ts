const API_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? '/api' : 'http://localhost:3000');
  console.log("API_URL", API_URL);

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private onUnauthorized: (() => void) | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setOnUnauthorized(callback: (() => void) | null) {
    this.onUnauthorized = callback;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (err) {
      const isMeRequest = endpoint === '/auth/me' || endpoint === '/employees/me';
      if (isMeRequest && this.token) {
        this.setToken(null);
        this.onUnauthorized?.();
      }
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'Failed to fetch' || msg.includes('Load failed') || msg.includes('NetworkError')) {
        const backendHint = this.baseURL.startsWith('/')
          ? 'http://localhost:3000'
          : this.baseURL;
        throw new Error(
          `Impossible de joindre l'API (${backendHint}). Vérifiez que le backend tourne : cd backend-api puis npm run start:dev.`
        );
      }
      throw err;
    }

    if (!response.ok) {
      if (response.status === 401 && this.token) {
        this.setToken(null);
        this.onUnauthorized?.();
      }
      const backendUnreachable =
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504;
      if (backendUnreachable) {
        const hint = this.baseURL.startsWith('/') ? 'http://localhost:3000' : this.baseURL;
        throw new Error(
          `L'API est injoignable (${hint}). Lancez le backend : \`npm run dev:all\` ou \`cd backend-api && npm run start:dev\`.`
        );
      }
      const error = await response.json().catch(() => null);
      let msg: string;
      if (error && typeof (error as { message?: unknown }).message === 'string') {
        msg = (error as { message: string }).message;
      } else if (error && Array.isArray((error as { message?: unknown }).message)) {
        msg = (error as { message: string[] }).message.join('. ');
      } else {
        msg = `Erreur HTTP ${response.status}`;
      }
      throw new Error(msg);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ accessToken?: string; user?: unknown }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const token = data?.accessToken;
    if (!token || typeof token !== 'string') {
      throw new Error('Réponse de connexion invalide (token manquant).');
    }
    this.setToken(token);
    return data as { accessToken: string; user: unknown };
  }

  async register(email: string, password: string, role?: string, companyId?: string) {
    const data = await this.request<{ accessToken: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role, companyId }),
    });
    this.setToken(data.accessToken);
    return data;
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Consultations
  async getConsultations() {
    return this.request<any[]>('/consultations');
  }

  async getConsultation(id: string) {
    return this.request<any>(`/consultations/${id}`);
  }

  async createConsultation(consultation: {
    companyId: string;
    employeeId: string;
    practitionerId: string;
    scheduledAt: string;
    scheduledEndAt: string;
    duration?: number;
    format?: string;
  }) {
    return this.request<any>('/consultations', {
      method: 'POST',
      body: JSON.stringify(consultation),
    });
  }

  async cancelConsultation(id: string) {
    return this.request<any>(`/consultations/${id}/cancel`, { method: 'PATCH' });
  }

  async rescheduleConsultation(
    id: string,
    data: { scheduledAt: string; scheduledEndAt: string },
  ) {
    return this.request<any>(`/consultations/${id}/reschedule`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Practitioners
  async getPractitioners() {
    return this.request<any[]>('/practitioners');
  }

  async getPractitioner(id: string) {
    return this.request<any>(`/practitioners/${id}`);
  }

  async getPractitionerMe() {
    return this.request<any>('/practitioners/me');
  }

  async getPractitionerAvailability(id: string) {
    return this.request<any[]>(`/practitioners/${id}/availability`);
  }

  // Employees
  async getEmployeeMe() {
    return this.request<any>('/employees/me');
  }

  async updateEmployeeMe(data: {
    firstName?: string;
    lastName?: string;
    department?: string;
    position?: string;
    phoneNumber?: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
  }) {
    return this.request<any>('/employees/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // News
  async getNews() {
    return this.request<any[]>('/news');
  }

  async getNewsArticle(id: string) {
    return this.request<any>(`/news/${id}`);
  }

  // Journal
  async getJournal() {
    return this.request<any[]>('/journal');
  }

  async getJournalStats() {
    return this.request<{ total: number; avgMood: number | null; streak: number }>('/journal/stats');
  }

  async createJournalEntry(data: { content: string; mood?: string; tags?: string[] }) {
    return this.request<any>('/journal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteJournalEntry(id: string) {
    return this.request<{ ok: boolean }>(`/journal/${id}`, { method: 'DELETE' });
  }

  // Messages
  async getConversations() {
    return this.request<any[]>('/messages/conversations');
  }

  async getMessages(consultationId: string) {
    return this.request<any[]>(`/messages/consultations/${consultationId}`);
  }

  async sendMessage(consultationId: string, content: string) {
    return this.request<any>('/messages', {
      method: 'POST',
      body: JSON.stringify({ consultationId, content }),
    });
  }

  // Company
  async getCompany() {
    return this.request<any>('/company');
  }

  // HR Statistics
  async getHRStats() {
    return this.request<{
      totalEmployees: number;
      activeUsers: number;
      totalConsultations: number;
      consultationsThisMonth: number;
      completedConsultations: number;
      upcomingConsultations: number;
      departments: string[];
      employeesByDepartment: Record<string, number>;
    }>('/hr/stats');
  }

  // Notifications
  async getNotifications() {
    return this.request<any[]>('/notifications');
  }

  async getUnreadNotificationsCount() {
    const r = await this.request<{ count: number }>('/notifications/unread-count');
    return r.count ?? 0;
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  logout() {
    this.setToken(null);
  }
}

export const api = new ApiClient(API_URL);
