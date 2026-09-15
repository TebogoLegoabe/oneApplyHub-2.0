import { TriangleAlert } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * Confirmation for destructive or irreversible actions.
 * Usage: keep `{ open, title, description, confirmLabel, onConfirm }` in state and render once per page.
 */
const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'danger', loading = false }) => (
  <Modal
    open={open}
    onClose={loading ? undefined : onClose}
    size="sm"
    hideClose
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading} data-autofocus>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <div className="flex gap-4">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone === 'danger' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300' : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300'}`}>
        <TriangleAlert className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-bold text-slate-950 dark:text-white">{title}</h2>
        {description && <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;
