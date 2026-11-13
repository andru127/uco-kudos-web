import { useEffect } from 'react';
import { api } from '../api/client';
import type { PushPayload } from '../api/types';

/**
 * Mantiene abierta la conexión Server-Sent Events mientras el usuario está en la app.
 * EventSource reconecta solo si se cae la red. Al llegar un Kudo se muestra un aviso en la app y,
 * si el usuario dio permiso, una notificación del sistema operativo.
 */
export function useNotificationStream(enabled: boolean, onKudo: (payload: PushPayload) => void): void {
  useEffect(() => {
    if (!enabled) return;
    const source = new EventSource(api.streamUrl());

    const handleKudo = (event: MessageEvent<string>) => {
      const payload = JSON.parse(event.data) as PushPayload;
      onKudo(payload);
      if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
        new Notification(payload.title, { body: payload.body, icon: '/favicon.svg' });
      }
    };

    source.addEventListener('kudo', handleKudo as EventListener);
    return () => {
      source.removeEventListener('kudo', handleKudo as EventListener);
      source.close();
    };
  }, [enabled, onKudo]);
}
