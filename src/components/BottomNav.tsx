export type View = 'feed' | 'publish' | 'profile';

const ITEMS: { view: View; icon: string; label: string }[] = [
  { view: 'feed', icon: '🏠', label: 'Muro' },
  { view: 'publish', icon: '➕', label: 'Dar Kudo' },
  { view: 'profile', icon: '👤', label: 'Perfil' },
];

export function BottomNav({ current, onChange }: { current: View; onChange: (view: View) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {ITEMS.map((item) => (
        <button key={item.view} type="button" aria-current={current === item.view ? 'page' : undefined}
                className={current === item.view ? 'active' : ''} onClick={() => onChange(item.view)}>
          <span aria-hidden="true">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
