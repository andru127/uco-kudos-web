import { useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { User } from '../api/types';
import { roleLabel } from '../utils/format';
import { Avatar } from './Avatar';

interface Props {
  user: User;
  onUserUpdated: (user: User) => void;
  onLogout: () => void;
}

export function ProfileView({ user, onUserUpdated, onLogout }: Props) {
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported',
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    try {
      onUserUpdated(await api.updateContact(email, phone));
      setMessage('Datos de contacto actualizados');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron guardar los datos');
    }
  }

  async function enableNotifications() {
    if ('Notification' in window) setPermission(await Notification.requestPermission());
  }

  return (
    <section className="profile">
      <div className="card profile__header">
        <Avatar name={user.fullName} size={56} />
        <div>
          <h2>{user.fullName}</h2>
          <span className="chip">{roleLabel(user.role)}</span>
        </div>
      </div>

      <form className="card form" onSubmit={handleSubmit}>
        <h3>Canales de notificación</h3>
        <label>
          Correo
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          WhatsApp (formato internacional)
          <input type="tel" required pattern="^\+[1-9]\d{7,14}$" value={phone}
                 onChange={(e) => setPhone(e.target.value)} placeholder="+573001234567" />
        </label>
        {message && <p className="success" role="status">{message}</p>}
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn--primary" type="submit">Guardar</button>
      </form>

      <div className="card form">
        <h3>Notificaciones del navegador</h3>
        {permission === 'granted' && <p className="success">Activadas ✅</p>}
        {permission === 'denied' && <p className="muted">Bloqueadas en la configuración del navegador.</p>}
        {permission === 'default' && (
          <button className="btn btn--ghost" type="button" onClick={enableNotifications}>
            Activar notificaciones
          </button>
        )}
        {permission === 'unsupported' && <p className="muted">Este navegador no las soporta.</p>}
      </div>

      <button className="btn btn--danger" type="button" onClick={onLogout}>Cerrar sesión</button>
    </section>
  );
}
