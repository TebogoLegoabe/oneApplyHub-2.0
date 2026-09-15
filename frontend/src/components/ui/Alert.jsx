import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const TONES = {
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200',
    iconClassName: 'text-red-500 dark:text-red-400',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200',
    iconClassName: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    icon: TriangleAlert,
    className: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200',
    iconClassName: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    icon: Info,
    className: 'border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-900/60 dark:bg-brand-500/10 dark:text-brand-100',
    iconClassName: 'text-brand-600 dark:text-brand-300',
  },
};

/**
 * Inline status banner. Pass `action` for a trailing button (e.g. Retry) and `onDismiss` for a close control.
 */
const Alert = ({ tone = 'info', title, children, action, onDismiss, className }) => {
  const { icon: Icon, className: toneClass, iconClassName } = TONES[tone] || TONES.info;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-3 rounded-2xl border p-4 text-sm', toneClass, className)}>
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconClassName)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn('leading-relaxed', title && 'mt-0.5')}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="-m-1 shrink-0 self-start rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
