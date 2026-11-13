export interface Toast {
  id: number;
  title: string;
  body: string;
}

export function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((toast) => (
        <button key={toast.id} type="button" className="toast" onClick={() => onDismiss(toast.id)}>
          <strong>{toast.title}</strong>
          <span>{toast.body}</span>
        </button>
      ))}
    </div>
  );
}
