import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { Category, Kudo, User, UserSummary } from '../api/types';
import { ALLOWED_TYPES, MAX_FILES, roleLabel, validateFiles } from '../utils/format';

interface Props {
  currentUser: User;
  onPublished: (kudo: Kudo) => void;
}

export function PublishKudoView({ currentUser, onPublished }: Props) {
  const [people, setPeople] = useState<UserSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recipientId, setRecipientId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    Promise.all([api.users(), api.categories()])
      .then(([users, cats]) => {
        setPeople(users.filter((user) => user.id !== currentUser.id));
        setCategories(cats);
      })
      .catch((e: Error) => setError(e.message));
  }, [currentUser.id]);

  function handleFiles(selected: FileList | null) {
    const list = selected ? Array.from(selected) : [];
    setError(validateFiles(list));
    setFiles(list);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const fileError = validateFiles(files);
    if (fileError) {
      setError(fileError);
      return;
    }
    setSending(true);
    setError(null);
    try {
      onPublished(await api.publishKudo(recipientId, categoryId, content, files));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo publicar el Kudo');
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit} aria-label="Publicar Kudo">
      <h2>Dar un Kudo</h2>
      <label>
        ¿A quién quieres reconocer?
        <select required value={recipientId} onChange={(e) => setRecipientId(e.target.value)} name="recipient">
          <option value="">Selecciona una persona</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.fullName} — {roleLabel(person.role)}
            </option>
          ))}
        </select>
      </label>
      <label>
        Categoría
        <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} name="category">
          <option value="">Selecciona una categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Mensaje
        <textarea required rows={5} value={content} onChange={(e) => setContent(e.target.value)} name="content"
                  placeholder="Cuéntale por qué merece este reconocimiento…" />
      </label>
      <label>
        Adjuntos (opcional, máx. {MAX_FILES}, 5 MB c/u)
        <input type="file" multiple accept={ALLOWED_TYPES.join(',')} onChange={(e) => handleFiles(e.target.files)} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn btn--primary" type="submit" disabled={sending}>
        {sending ? 'Publicando…' : 'Publicar Kudo'}
      </button>
    </form>
  );
}
