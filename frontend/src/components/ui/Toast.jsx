import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CheckCircle2, className: 'border-emerald-200 bg-white text-slate-900 dark:border-emerald-900/60 dark:bg-slate-900 dark:text-white', iconClassName: 'text-emerald-600 dark:text-emerald-400' },
  error: { icon: AlertCircle, className: 'border-red-200 bg-white text-slate-900 dark:border-red-900/60 dark:bg-slate-900 dark:text-white', iconClassName: 'text-red-600 dark:text-red-400' },
  info: { icon: Info, className: 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white', iconClassName: 'text-brand-600 dark:text-brand-300' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => setToasts((prev) => prev.filter((toast) => toast.id !== id)), []);

  const push = useCallback((message, tone = 'info', duration = 3500) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev.slice(-3), { id, message, tone }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const api = useMemo(() => ({
    push,
    dismiss,
    success: (message, duration) => push(message, 'success', duration),
    error: (message, duration) => push(message, 'error', duration),
    info: (message, duration) => push(message, 'info', duration),
  }), [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toasts.length > 0 && createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6" aria-live="polite">
          {toasts.map(({ id, message, tone }) => {
            const { icon: Icon, className, iconClassName } = TONES[tone] || TONES.info;
            return (
              <div key={id} className={cn('pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl animate-fade-up', className)}>
                <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconClassName)} aria-hidden="true" />
                <p className="flex-1 font-medium leading-snug">{message}</p>
                <button type="button" onClick={() => dismiss(id)} className="-m-1 shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-white" aria-label="Dismiss notification">
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
