import { vi } from 'vitest';
import { session } from '../auth/session';
import { api, ApiError } from './client';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('api client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    session.clear();
  });

  it('envía el token JWT en la cabecera Authorization', async () => {
    session.save('mi-token', { id: 'u1', fullName: 'A', email: 'a@uco.edu.co', phone: '+573000000000', role: 'DOCENTE' });
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(200, []));

    await api.categories();

    const headers = fetchMock.mock.calls[0]![1]!.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer mi-token');
  });

  it('convierte Problem Details en ApiError con el mensaje del servidor', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(422, { title: 'Regla', detail: 'No puedes darte un Kudo a ti mismo' }));

    await expect(api.feed()).rejects.toEqual(new ApiError(422, 'No puedes darte un Kudo a ti mismo'));
  });

  it('cierra la sesión si el token expiró (401)', async () => {
    session.save('vencido', { id: 'u1', fullName: 'A', email: 'a@uco.edu.co', phone: '+573000000000', role: 'DOCENTE' });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(401, { detail: 'expirado' }));
    const listener = vi.fn();
    window.addEventListener('uco-kudos:logout', listener);

    await expect(api.feed()).rejects.toBeInstanceOf(ApiError);

    expect(session.token()).toBeNull();
    expect(listener).toHaveBeenCalled();
    window.removeEventListener('uco-kudos:logout', listener);
  });

  it('publica el Kudo como multipart con los adjuntos', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(201, { id: 'k1' }));
    const file = new File(['png'], 'foto.png', { type: 'image/png' });

    await api.publishKudo('u2', 'c1', 'Hola', [file]);

    const body = fetchMock.mock.calls[0]![1]!.body as FormData;
    expect(body.get('recipientId')).toBe('u2');
    expect(body.getAll('files')).toHaveLength(1);
  });
});
