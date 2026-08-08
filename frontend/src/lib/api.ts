const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    signup: (data: { name: string; email: string; password: string }) =>
      fetchWithAuth('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  },

  habits: {
    list: () => fetchWithAuth('/habits'),
    create: (data: { name: string; category?: string; icon?: string; color?: string }) =>
      fetchWithAuth('/habits', { method: 'POST', body: JSON.stringify(data) }),
    month: (year: number, month: number) => fetchWithAuth(`/habits/month/${year}/${month}`),
    record: (habitId: number, date: string, completed: boolean) =>
      fetchWithAuth(`/habits/${habitId}/record`, {
        method: 'POST',
        body: JSON.stringify({ date, completed }),
      }),
    delete: (id: number) => fetchWithAuth(`/habits/${id}`, { method: 'DELETE' }),
  },

  reflections: {
    get: (date: string) => fetchWithAuth(`/reflections/${date}`),
    save: (data: { date: string; mood?: string; energy?: number; remarks?: string; tomorrowFocus?: string }) =>
      fetchWithAuth('/reflections', { method: 'POST', body: JSON.stringify(data) }),
    yesterday: (date: string) => fetchWithAuth(`/reflections/yesterday/${date}`),
  },
};
