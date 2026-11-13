import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Kudo } from '../api/types';
import { KudoCard } from './KudoCard';

const PAGE_SIZE = 10;

export function FeedView({ refreshKey }: { refreshKey: number }) {
  const [kudos, setKudos] = useState<Kudo[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linked, setLinked] = useState<Kudo | null>(null);

  const load = useCallback(async (pageToLoad: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.feed(pageToLoad, PAGE_SIZE);
      setKudos((current) => (pageToLoad === 0 ? result.items : [...current, ...result.items]));
      setHasNext(result.hasNext);
      setPage(pageToLoad);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el muro');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(0);
  }, [load, refreshKey]);

  // Enlace del correo: /?kudo=<id> muestra ese Kudo destacado arriba.
  useEffect(() => {
    const kudoId = new URLSearchParams(window.location.search).get('kudo');
    if (kudoId) api.kudo(kudoId).then(setLinked).catch(() => setLinked(null));
  }, []);

  return (
    <section className="feed" aria-label="Muro de Kudos">
      {linked && <KudoCard kudo={linked} highlighted />}
      {error && <p className="error" role="alert">{error}</p>}
      {!loading && kudos.length === 0 && !error && (
        <div className="card empty">Aún no hay Kudos. ¡Sé el primero en reconocer a alguien!</div>
      )}
      {kudos.map((kudo) => (
        <KudoCard key={kudo.id} kudo={kudo} />
      ))}
      {loading && <p className="muted center">Cargando…</p>}
      {hasNext && !loading && (
        <button className="btn btn--ghost" type="button" onClick={() => load(page + 1)}>
          Cargar más
        </button>
      )}
    </section>
  );
}
