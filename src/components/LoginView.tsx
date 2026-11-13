import { useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { LoginResponse } from '../api/types';

interface Props {
  onLoggedIn: (response: LoginResponse) => void;
}

export function LoginView({ onLoggedIn }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      onLoggedIn(await api.login(email, password));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No fue posible iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login">
      <div className="login__brand">
        <span className="logo" aria-hidden="true">★</span>
        <h1>UCO Kudos</h1>
        <p>Reconoce lo que hace grande a nuestra comunidad</p>
      </div>
      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Correo institucional
          <input type="email" autoComplete="username" required value={email}
                 onChange={(e) => setEmail(e.target.value)} placeholder="nombre@uco.edu.co" />
        </label>
        <label>
          Contraseña
          <input type="password" autoComplete="current-password" required value={password}
                 onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}
