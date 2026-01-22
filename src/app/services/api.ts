const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
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
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'Failed to fetch' || msg.includes('Load failed') || msg.includes('NetworkError')) {
        throw new Error(
          `Impossible de joindre l'API (${this.baseURL}). Vérifiez que le backend tourne (npm run start:dev dans backend-api).`
        );
      }
      throw err;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error((error as { message?: string }).message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.accessToken);
    return data;
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

  // Practitioners
  async getPractitioners() {
    return this.request<any[]>('/practitioners');
  }

  async getPractitioner(id: string) {
    return this.request<any>(`/practitioners/${id}`);
  }

  async getPractitionerAvailability(id: string) {
    return this.request<any[]>(`/practitioners/${id}/availability`);
  }

  // Employees
  async getEmployeeMe() {
    return this.request<any>('/employees/me');
  }

  // News
  async getNews() {
    return this.request<any[]>('/news');
  }

  logout() {
    this.setToken(null);
  }
}

export const api = new ApiClient(API_URL);
