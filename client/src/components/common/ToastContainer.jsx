import { useToast } from '../../context/ToastContext';

const ICONS = {
  success: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10l4 4 8-8"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7"/>
      <path d="M7 7l6 6M13 7l-6 6"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7"/>
      <path d="M10 6v4M10 14h.01"/>
    </svg>
  ),
};

const TYPE_STYLES = {
  success: 'bg-success/12 border-success/30 text-success',
  error: 'bg-danger/12 border-danger/30 text-danger',
  info: 'bg-primary/12 border-primary/30 text-primary',
};

const ICON_BG = {
  success: 'bg-success/15',
  error: 'bg-danger/15',
  info: 'bg-primary/15',
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[300] flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 min-w-[260px] max-w-[360px] px-4 py-3 rounded-xl border shadow-[0_12px_32px_rgba(0,0,0,0.4)] animate-fade-slide ${TYPE_STYLES[toast.type]}`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${ICON_BG[toast.type]}`}>
            {ICONS[toast.type]}
          </div>
          <span className="text-[13px] font-medium leading-snug">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-auto shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 5l10 10M15 5l-10 10"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
