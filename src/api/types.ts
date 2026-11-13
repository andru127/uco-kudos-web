export type Role =
  | 'ADMINISTRADOR'
  | 'RECTOR'
  | 'COORDINADOR_ACADEMICO'
  | 'COORDINADOR_FACULTAD'
  | 'COORDINADOR_PROGRAMA'
  | 'DOCENTE'
  | 'ESTUDIANTE';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
}

export interface UserSummary {
  id: string;
  fullName: string;
  role: Role;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  downloadPath: string;
}

export interface Kudo {
  id: string;
  author: UserSummary;
  recipient: UserSummary;
  category: Category;
  content: string;
  publishedAt: string;
  attachments: Attachment[];
}

export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  hasNext: boolean;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface PushPayload {
  kudoId: string;
  title: string;
  body: string;
}
