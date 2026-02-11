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

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async updateMe(data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    position?: string;
  }) {
    return this.request<any>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async changeMyPassword(currentPassword: string, newPassword: string) {
    return this.request<{ success: boolean }>('/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getMyDataExport() {
    return this.request<any>('/auth/me/export-data');
  }

  async deleteMyAccount() {
    return this.request<{ success: boolean }>('/auth/me', { method: 'DELETE' });
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

  async confirmConsultation(id: string) {
    return this.request<any>(`/consultations/${id}/confirm`, {
      method: 'PATCH',
    });
  }

  async completeConsultation(id: string) {
    return this.request<any>(`/consultations/${id}/complete`, {
      method: 'PATCH',
    });
  }

  // Ratings
  async createRating(consultationId: string, rating: number, comment?: string) {
    return this.request<any>('/ratings', {
      method: 'POST',
      body: JSON.stringify({ consultationId, rating, comment }),
    });
  }

  async getMyRatings() {
    return this.request<any[]>('/ratings/me');
  }

  async getRatingsStats() {
    return this.request<{ avgReceived: number | null; countReceived: number; avgGiven: number | null; countGiven: number }>('/ratings/stats');
  }

  async getConsultationRatings(consultationId: string) {
    return this.request<any[]>(`/ratings/consultation/${consultationId}`);
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

  async updatePractitionerMe(data: {
    firstName?: string;
    lastName?: string;
    title?: string;
    professionalId?: string | null;
    specialty?: string;
    customSpecialty?: string | null;
    subSpecialties?: string[];
    languages?: string[];
    bio?: string;
    experience?: number | null;
    education?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    offersVideo?: boolean;
    offersPhone?: boolean;
    defaultDuration?: number;
    timezone?: string;
    isActive?: boolean;
    isAcceptingNewClients?: boolean;
    companyId?: string | null;
  }) {
    return this.request<any>('/practitioners/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getPractitionerMeAvailability() {
    return this.request<any[]>('/practitioners/me/availability');
  }

  async createPractitionerMeAvailability(data: {
    type?: 'RECURRING' | 'EXCEPTION';
    dayOfWeek?: number | null;
    startTime?: string | null;
    endTime?: string | null;
    date?: string | null;
    isAvailable?: boolean;
    slotDuration?: number;
  }) {
    return this.request<any>('/practitioners/me/availability', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePractitionerMeAvailability(
    availabilityId: string,
    data: {
      type?: 'RECURRING' | 'EXCEPTION';
      dayOfWeek?: number | null;
      startTime?: string | null;
      endTime?: string | null;
      date?: string | null;
      isAvailable?: boolean;
      slotDuration?: number;
      isActive?: boolean;
    },
  ) {
    return this.request<any>(`/practitioners/me/availability/${availabilityId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePractitionerMeAvailability(availabilityId: string) {
    return this.request<any>(`/practitioners/me/availability/${availabilityId}`, {
      method: 'DELETE',
    });
  }

  async getPractitionerAvailability(id: string) {
    return this.request<any[]>(`/practitioners/${id}/availability`);
  }

  // Employees
  async getEmployeeMe() {
    return this.request<any>('/employees/me');
  }

  async getEmployeeFavoritePractitioners() {
    return this.request<string[]>('/employees/me/favorite-practitioners');
  }

  async addEmployeeFavoritePractitioner(practitionerId: string) {
    return this.request<any>(`/employees/me/favorite-practitioners/${practitionerId}`, {
      method: 'POST',
    });
  }

  async removeEmployeeFavoritePractitioner(practitionerId: string) {
    return this.request<any>(`/employees/me/favorite-practitioners/${practitionerId}`, {
      method: 'DELETE',
    });
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

  async startConversation(practitionerId: string) {
    return this.request<{ consultationId: string }>('/messages/start-conversation', {
      method: 'POST',
      body: JSON.stringify({ practitionerId }),
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

  async getHRPractitionerStats() {
    return this.request<any[]>('/hr/practitioners');
  }

  async getHREmployees() {
    return this.request<any[]>('/hr/employees');
  }

  async createHREmployee(data: {
    email: string;
    firstName: string;
    lastName: string;
    department?: string;
    position?: string;
    phoneNumber?: string;
    temporaryPassword: string;
  }) {
    return this.request<{ ok: boolean }>('/hr/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getHRConsultations() {
    return this.request<any[]>('/hr/consultations');
  }

  async activateEmployee(employeeId: string) {
    return this.request<any>(`/hr/employees/${employeeId}/activate`, { method: 'PATCH' });
  }

  async deactivateEmployee(employeeId: string) {
    return this.request<any>(`/hr/employees/${employeeId}/deactivate`, { method: 'PATCH' });
  }

  async deleteHREmployee(employeeId: string) {
    return this.request<{ ok: boolean }>(`/hr/employees/${employeeId}`, { method: 'DELETE' });
  }

  async updateHREmployee(
    employeeId: string,
    data: {
      firstName?: string;
      lastName?: string;
      department?: string;
      position?: string;
      phoneNumber?: string;
    },
  ) {
    return this.request<any>(`/hr/employees/${employeeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async setHREmployeePassword(employeeId: string, newPassword: string) {
    return this.request<{ ok: boolean }>(`/hr/employees/${employeeId}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ newPassword }),
    });
  }

  async createHRInvitation(data: {
    type: 'unique' | 'shared';
    email?: string;
    autoApproved: boolean;
    expiresInDays?: number;
  }) {
    return this.request<{
      id: string;
      token: string;
      link: string;
      type: string;
      email?: string;
      singleUse: boolean;
      autoApproved: boolean;
      expiresAt: string;
    }>('/hr/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getHRInvitations() {
    return this.request<any[]>('/hr/invitations');
  }

  /** Public: validate an invitation token (no auth required). */
  async validateInvitationToken(token: string) {
    return this.request<{
      valid: boolean;
      companyName: string;
      email?: string;
      singleUse: boolean;
      autoApproved: boolean;
    }>(`/auth/invitations/validate/${encodeURIComponent(token)}`);
  }

  async register(
    email: string,
    password: string,
    options?: {
      role?: string;
      companyId?: string;
      invitationToken?: string;
      firstName?: string;
      lastName?: string;
    },
  ) {
    const body: Record<string, unknown> = { email, password };
    if (options?.role != null) body.role = options.role;
    if (options?.companyId != null) body.companyId = options.companyId;
    if (options?.invitationToken != null) body.invitationToken = options.invitationToken;
    if (options?.firstName != null) body.firstName = options.firstName;
    if (options?.lastName != null) body.lastName = options.lastName;
    const data = await this.request<{
      accessToken?: string;
      user: any;
      requiresValidation?: boolean;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (data.accessToken) this.setToken(data.accessToken);
    return data;
  }

  // Notifications
  async getNotifications() {
    return this.request<any[]>('/notifications');
  }

  async getNotificationPreferences() {
    return this.request<{ notificationsEnabled: boolean; sessionReminderEnabled: boolean; newArticlesEnabled: boolean }>('/notifications/preferences');
  }

  async updateNotificationPreferences(data: {
    notificationsEnabled?: boolean;
    sessionReminderEnabled?: boolean;
    newArticlesEnabled?: boolean;
  }) {
    return this.request<any>('/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getUnreadNotificationsCount() {
    const r = await this.request<{ count: number }>('/notifications/unread-count');
    return r.count ?? 0;
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  // Admin HuntZen - gestion des admins & entreprises
  async getAdminUsers() {
    return this.request<any[]>('/admin/users');
  }

  async createAdminUser(data: {
    email: string;
    role: string;
    companyId?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    position?: string | null;
  }) {
    return this.request<any>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminUser(
    userId: string,
    data: {
      email?: string;
      role?: string;
      companyId?: string | null;
      isActive?: boolean;
      firstName?: string | null;
      lastName?: string | null;
      phoneNumber?: string | null;
      position?: string | null;
    },
  ) {
    return this.request<any>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateAdminUserPassword(userId: string, password: string) {
    return this.request<any>(`/admin/users/${userId}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password }),
    });
  }

  async getAdminCompanies() {
    return this.request<any[]>('/admin/companies');
  }

  async createAdminCompany(data: {
    name: string;
    slug: string;
    legalName?: string | null;
    siret?: string | null;
    sector?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    logoUrl?: string | null;
    coverUrl?: string | null;
    isActive?: boolean;
  }) {
    return this.request<any>('/admin/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminCompany(
    companyId: string,
    data: {
      name?: string;
      slug?: string;
      legalName?: string | null;
      siret?: string | null;
      sector?: string | null;
      address?: string | null;
      city?: string | null;
      country?: string | null;
      logoUrl?: string | null;
      coverUrl?: string | null;
      isActive?: boolean;
    },
  ) {
    return this.request<any>(`/admin/companies/${companyId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAdminCompanyEmployees(companyId: string) {
    return this.request<any[]>(`/admin/companies/${companyId}/employees`);
  }

  async getAdminActivityLogs(params?: {
    from?: string;
    to?: string;
    action?: string;
    actorUserId?: string;
    page?: number;
    limit?: number;
  }) {
    const sp = new URLSearchParams();
    if (params?.from) sp.set('from', params.from);
    if (params?.to) sp.set('to', params.to);
    if (params?.action) sp.set('action', params.action);
    if (params?.actorUserId) sp.set('actorUserId', params.actorUserId);
    if (params?.page != null) sp.set('page', String(params.page));
    if (params?.limit != null) sp.set('limit', String(params.limit));
    const q = sp.toString();
    return this.request<{ items: any[]; total: number }>(
      `/admin/activity-logs${q ? `?${q}` : ''}`,
    );
  }

  async getAdminPlatformStats() {
    return this.request<{
      practitionersTotal: number;
      practitionersActive: number;
      practitionersValidated: number;
      companiesTotal: number;
      employeesTotal: number;
      consultationsTotal: number;
      consultationsThisMonth: number;
      consultationsCompleted: number;
    }>('/admin/stats/platform');
  }

  async getAdminPractitioners() {
    return this.request<any[]>('/admin/practitioners');
  }

  async createAdminPractitioner(data: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    title: string;
    professionalId?: string | null;
    specialty: string;
    customSpecialty?: string | null;
    subSpecialties?: string[];
    languages?: string[];
    bio: string;
    experience?: number | null;
    education?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
    offersVideo?: boolean;
    offersPhone?: boolean;
    isValidated?: boolean;
    defaultDuration?: number;
    timezone?: string;
    isActive?: boolean;
    isAcceptingNewClients?: boolean;
    companyId?: string | null;
  }) {
    return this.request<{ id: string; userId: string; email: string }>(
      '/admin/practitioners',
      { method: 'POST', body: JSON.stringify(data) },
    );
  }

  async updateAdminPractitioner(
    practitionerId: string,
    data: {
      firstName?: string;
      lastName?: string;
      title?: string;
      professionalId?: string | null;
      specialty?: string;
      customSpecialty?: string | null;
      subSpecialties?: string[];
      languages?: string[];
      bio?: string;
      experience?: number | null;
      education?: string | null;
      avatarUrl?: string | null;
      coverUrl?: string | null;
      offersVideo?: boolean;
      offersPhone?: boolean;
      isValidated?: boolean;
      defaultDuration?: number;
      timezone?: string;
      isActive?: boolean;
      isAcceptingNewClients?: boolean;
      companyId?: string | null;
    },
  ) {
    return this.request<any>(`/admin/practitioners/${practitionerId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async setAdminPractitionerActive(practitionerId: string, isActive: boolean) {
    return this.request<any>(`/admin/practitioners/${practitionerId}/active`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async setAdminPractitionerPassword(practitionerId: string, newPassword: string) {
    return this.request<{ ok: boolean }>(`/admin/practitioners/${practitionerId}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ newPassword }),
    });
  }

  async deleteAdminPractitioner(practitionerId: string) {
    return this.request<any>(`/admin/practitioners/${practitionerId}`, {
      method: 'DELETE',
    });
  }

  async deleteAdminUser(userId: string) {
    return this.request<any>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async deleteAdminCompany(companyId: string) {
    return this.request<any>(`/admin/companies/${companyId}`, {
      method: 'DELETE',
    });
  }

  async getEmergencyResources() {
    return this.request<{ contacts: any[]; resources: any[] }>('/emergency');
  }

  async getAdminEmergencyContacts() {
    return this.request<any[]>('/admin/emergency/contacts');
  }

  async createAdminEmergencyContact(data: { name: string; number: string; available?: string; sortOrder?: number }) {
    return this.request<any>('/admin/emergency/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminEmergencyContact(id: string, data: { name?: string; number?: string; available?: string; sortOrder?: number }) {
    return this.request<any>(`/admin/emergency/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminEmergencyContact(id: string) {
    return this.request<any>(`/admin/emergency/contacts/${id}`, { method: 'DELETE' });
  }

  async getAdminEmergencyResources() {
    return this.request<any[]>('/admin/emergency/resources');
  }

  async createAdminEmergencyResource(data: { name: string; description?: string; url: string; sortOrder?: number }) {
    return this.request<any>('/admin/emergency/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminEmergencyResource(id: string, data: { name?: string; description?: string; url?: string; sortOrder?: number }) {
    return this.request<any>(`/admin/emergency/resources/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminEmergencyResource(id: string) {
    return this.request<any>(`/admin/emergency/resources/${id}`, { method: 'DELETE' });
  }

  logout() {
    this.setToken(null);
  }
}

export const api = new ApiClient(API_URL);
