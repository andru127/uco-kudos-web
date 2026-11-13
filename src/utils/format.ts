import type { Role } from '../api/types';

const ROLE_LABELS: Record<Role, string> = {
  ADMINISTRADOR: 'Administrador',
  RECTOR: 'Rector',
  COORDINADOR_ACADEMICO: 'Coord. Académico',
  COORDINADOR_FACULTAD: 'Coord. de Facultad',
  COORDINADOR_PROGRAMA: 'Coord. de Programa',
  DOCENTE: 'Docente',
  ESTUDIANTE: 'Estudiante',
};

export function roleLabel(role: Role): string {
  return ROLE_LABELS[role] ?? role;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function timeAgo(isoDate: string, now: Date = new Date()): string {
  const seconds = Math.round((now.getTime() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60) return 'hace un momento';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `hace ${days} d`;
  return new Date(isoDate).toLocaleDateString('es-CO');
}

export function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_FILES = 5;
export const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

/** Validación temprana en el cliente (mejor experiencia); el back-end vuelve a validar siempre. */
export function validateFiles(files: File[]): string | null {
  if (files.length > MAX_FILES) return `Máximo ${MAX_FILES} adjuntos`;
  const tooBig = files.find((file) => file.size > MAX_FILE_BYTES);
  if (tooBig) return `"${tooBig.name}" supera 5 MB`;
  const invalid = files.find((file) => !ALLOWED_TYPES.includes(file.type));
  if (invalid) return `"${invalid.name}" no es PNG, JPEG, WEBP ni PDF`;
  return null;
}
