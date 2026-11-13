import { useCallback, useEffect, useState } from 'react';
import type { LoginResponse, PushPayload, User } from './api/types';
import { session } from './auth/session';
import { BottomNav, type View } from './components/BottomNav';
import { FeedView } from './components/FeedView';
import { LoginView } from './components/LoginView';
import { ProfileView } from './components/ProfileView';
import { PublishKudoView } from './components/PublishKudoView';
import { Toasts, type Toast } from './components/Toasts';
import { useNotificationStream } from './hooks/useNotificationStream';

const TOAST_MILLIS = 8000;

export default function App() {
  const [user, setUser] = useState<User | null>(session.user());
  const [view, setView] = useState<View>('feed');
  const [refreshKey, setRefreshKey] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const logout = useCallback(() => {
    session.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener('uco-kudos:logout', logout);
    return () => window.removeEventListener('uco-kudos:logout', logout);
  }, [logout]);

  const showToast = useCallback((title: string, body: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, title, body }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), TOAST_MILLIS);
  }, []);

  const handlePush = useCallback(
    (payload: PushPayload) => {
      showToast(payload.title, payload.body);
      setRefreshKey((key) => key + 1);
    },
    [showToast],
  );

  useNotificationStream(user !== null, handlePush);

  function handleLogin(response: LoginResponse) {
    session.save(response.accessToken, response.user);
    setUser(response.user);
  }

  function handleUserUpdated(updated: User) {
    session.updateUser(updated);
    setUser(updated);
  }

  if (!user) return <LoginView onLoggedIn={handleLogin} />;

  return (
    <div className="app">
      <header className="topbar">
        <img className="logo-img" src="/OIP.png" alt="" />
        <h1>UCO Kudos</h1>
      </header>
      <main className="content">
        {view === 'feed' && <FeedView refreshKey={refreshKey} />}
        {view === 'publish' && (
          <PublishKudoView
            currentUser={user}
            onPublished={(kudo) => {
              showToast('¡Kudo publicado!', `${kudo.recipient.fullName} será notificado por correo, WhatsApp y push.`);
              setRefreshKey((key) => key + 1);
              setView('feed');
            }}
          />
        )}
        {view === 'profile' && <ProfileView user={user} onUserUpdated={handleUserUpdated} onLogout={logout} />}
      </main>
      <Toasts toasts={toasts} onDismiss={(id) => setToasts((current) => current.filter((t) => t.id !== id))} />
      <BottomNav current={view} onChange={setView} />
    </div>
  );
}
