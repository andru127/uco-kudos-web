import { session } from '../auth/session';
import type { Category, Kudo, LoginResponse, Page, User, UserSummary } from './types';

export const API_URL: string = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Convierte respuestas Problem Details (RFC 9457) del back-end en mensajes legibles. */
async function toApiError(response: Response): Promise<ApiError> {
  try {
    const problem = (await response.json()) as { detail?: string; title?: string };
    return new ApiError(response.status, problem.detail ?? problem.title ?? `Error ${response.status}`);
  } catch {
    return new ApiError(response.status, `Error ${response.status}`);
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = session.token();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (response.status === 401 && token) {
    session.clear();
    window.dispatchEvent(new Event('uco-kudos:logout'));
  }
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as T;
}

function json(method: string, body: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/api/v1/auth/login', json('POST', { email, password })),

  me: () => request<User>('/api/v1/users/me'),

  updateContact: (email: string, phone: string) =>
    request<User>('/api/v1/users/me/contact', json('PUT', { email, phone })),

  users: () => request<UserSummary[]>('/api/v1/users'),

  categories: () => request<Category[]>('/api/v1/categories'),

  feed: (page = 0, size = 10) => request<Page<Kudo>>(`/api/v1/kudos?page=${page}&size=${size}`),

  kudo: (id: string) => request<Kudo>(`/api/v1/kudos/${encodeURIComponent(id)}`),

  publishKudo: (recipientId: string, categoryId: string, content: string, files: File[]) => {
    const form = new FormData();
    form.append('recipientId', recipientId);
    form.append('categoryId', categoryId);
    form.append('content', content);
    files.forEach((file) => form.append('files', file));
    return request<Kudo>('/api/v1/kudos', { method: 'POST', body: form });
  },

  /** Los adjuntos requieren token: se descargan con fetch y se abren como blob. */
  async downloadAttachment(downloadPath: string, fileName: string): Promise<void> {
    const response = await fetch(`${API_URL}${downloadPath}`, {
      headers: { Authorization: `Bearer ${session.token() ?? ''}` },
    });
    if (!response.ok) throw await toApiError(response);
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  },

  streamUrl: () => `${API_URL}/api/v1/notifications/stream?access_token=${encodeURIComponent(session.token() ?? '')}`,
};
