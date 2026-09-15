import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

export const INPUT_CLASS =
  'block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600 dark:focus:border-brand-400 dark:disabled:bg-slate-800/60';

export const INPUT_ERROR_CLASS =
  'border-red-300 bg-red-50/40 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800 dark:bg-red-950/20';

/**
 * Label + control + hint/error wrapper. Children receive `id` automatically when they are
 * a single element without one, so labels are always associated with their inputs.
 */
export const Field = ({ label, hint, error, optional, required, htmlFor, className, children }) => (
  <div className={className}>
    {label && (
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span>{label}</span>
        {required && <span className="text-red-500" aria-hidden="true">*</span>}
        {optional && <span className="font-medium text-slate-400 dark:text-slate-500">Optional</span>}
      </label>
    )}
    {children}
    {error ? (
      <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400" role="alert">{error}</p>
    ) : hint ? (
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    ) : null}
  </div>
);

export const Input = forwardRef(({ className, error, icon: Icon, trailing, id, label, hint, optional, required, wrapperClassName, ...props }, ref) => {
  const autoId = useId();
  const inputId = id || (label ? autoId : undefined);
  const control = (
    <div className={cn('relative', !(label || hint || error) && wrapperClassName)}>
      {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />}
      <input
        ref={ref}
        id={inputId}
        className={cn(INPUT_CLASS, Icon && 'pl-10', trailing && 'pr-11', error && INPUT_ERROR_CLASS, className)}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {trailing && <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">{trailing}</div>}
    </div>
  );
  if (!label && !hint && !error) return control;
  return (
    <Field label={label} hint={hint} error={error} optional={optional} required={required} htmlFor={inputId} className={wrapperClassName}>
      {control}
    </Field>
  );
});
Input.displayName = 'Input';

export const Select = forwardRef(({ className, error, icon: Icon, id, label, hint, optional, required, wrapperClassName, children, ...props }, ref) => {
  const autoId = useId();
  const selectId = id || (label ? autoId : undefined);
  const control = (
    <div className={cn('relative', !(label || hint || error) && wrapperClassName)}>
      {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />}
      <select
        ref={ref}
        id={selectId}
        className={cn(INPUT_CLASS, 'pr-9', Icon && 'pl-10', error && INPUT_ERROR_CLASS, className)}
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {children}
      </select>
    </div>
  );
  if (!label && !hint && !error) return control;
  return (
    <Field label={label} hint={hint} error={error} optional={optional} required={required} htmlFor={selectId} className={wrapperClassName}>
      {control}
    </Field>
  );
});
Select.displayName = 'Select';

export const Textarea = forwardRef(({ className, error, id, label, hint, optional, required, wrapperClassName, ...props }, ref) => {
  const autoId = useId();
  const textareaId = id || (label ? autoId : undefined);
  const control = (
    <textarea
      ref={ref}
      id={textareaId}
      className={cn(INPUT_CLASS, 'min-h-[6rem] resize-y leading-relaxed', error && INPUT_ERROR_CLASS, className)}
      aria-invalid={error ? true : undefined}
      {...props}
    />
  );
  if (!label && !hint && !error) return control;
  return (
    <Field label={label} hint={hint} error={error} optional={optional} required={required} htmlFor={textareaId} className={wrapperClassName}>
      {control}
    </Field>
  );
});
Textarea.displayName = 'Textarea';

export const Checkbox = ({ label, description, className, id, ...props }) => {
  const autoId = useId();
  const checkboxId = id || autoId;
  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700',
        className,
      )}
    >
      <input id={checkboxId} type="checkbox" className="mt-0.5" {...props} />
      <span className="text-sm text-slate-600 dark:text-slate-300">
        {label && <span className="block font-semibold text-slate-900 dark:text-white">{label}</span>}
        {description && <span className="mt-0.5 block leading-relaxed">{description}</span>}
      </span>
    </label>
  );
};
