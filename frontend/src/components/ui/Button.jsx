import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20',
  gold: 'bg-gold-600 text-white shadow-sm hover:bg-gold-700 active:bg-gold-800',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  'danger-soft':
    'border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10',
  inverse: 'bg-white text-slate-950 shadow-sm hover:bg-slate-100',
  'inverse-outline': 'border border-white/50 text-white hover:border-white hover:bg-white/10',
};

const SIZES = {
  xs: 'h-8 px-3 text-xs',
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
  xl: 'h-12 px-6 text-base',
  icon: 'h-9 w-9',
};

/**
 * Single button primitive for the whole app. Renders a <Link> when `to` is given,
 * an <a> when `href` is given, otherwise a <button>.
 */
const Button = forwardRef(
  ({ variant = 'primary', size = 'md', loading = false, fullWidth = false, className, children, to, href, disabled, type, ...props }, ref) => {
    const classes = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className);
    const content = (
      <>
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </>
    );

    if (to && !disabled) {
      return (
        <Link ref={ref} to={to} className={classes} {...props}>
          {content}
        </Link>
      );
    }
    if (href && !disabled) {
      return (
        <a ref={ref} href={href} className={classes} {...props}>
          {content}
        </a>
      );
    }
    return (
      <button ref={ref} type={type || 'button'} className={classes} disabled={disabled || loading} {...props}>
        {content}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
