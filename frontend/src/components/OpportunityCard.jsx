import { useState } from 'react';
import { Briefcase, GraduationCap, MapPin, Clock, ChevronDown, ChevronUp, ExternalLink, CalendarDays } from 'lucide-react';
import { Badge, Button } from './ui';
import { cn } from '../utils/cn';

export const daysUntil = (dateString) => {
  if (!dateString) return Infinity;
  return Math.ceil((new Date(dateString) - new Date()) / 864e5);
};

export const formatDeadline = (dateString) => {
  if (!dateString) return 'Rolling';
  return new Date(dateString).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const DeadlineChip = ({ days }) => {
  if (!Number.isFinite(days)) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />Rolling deadline
      </span>
    );
  }
  const expired = days <= 0;
  const urgent = !expired && days <= 30;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold',
        expired
          ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300'
          : urgent
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      )}
    >
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      {expired ? 'Closed' : days === 1 ? '1 day left' : `${days} days left`}
    </span>
  );
};

const TYPE_META = {
  internship: { label: 'Internship', icon: Briefcase, tone: 'brand' },
  graduate: { label: 'Graduate programme', icon: GraduationCap, tone: 'gold' },
};

/** Card for an internship or graduate programme from the /opportunities API. */
const OpportunityCard = ({ opportunity }) => {
  const [expanded, setExpanded] = useState(false);
  const days = daysUntil(opportunity.deadline);
  const expired = Number.isFinite(days) && days <= 0;
  const meta = TYPE_META[opportunity.opportunity_type] || TYPE_META.internship;
  const Icon = meta.icon;

  return (
    <article className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 hover:border-brand-200 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-900', expired && 'opacity-75')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', meta.tone === 'gold' ? 'bg-gold-50 text-gold-700 dark:bg-gold-500/10 dark:text-gold-300' : 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300')}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-bold leading-snug text-slate-950 dark:text-white sm:text-base">{opportunity.title}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{opportunity.provider}</p>
          </div>
        </div>
        <DeadlineChip days={days} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone={meta.tone} size="sm">{meta.label}</Badge>
        {opportunity.field && <Badge size="sm">{opportunity.field}</Badge>}
        {opportunity.location && <Badge size="sm" icon={MapPin}>{opportunity.location}</Badge>}
        {opportunity.duration && <Badge size="sm" icon={CalendarDays}>{opportunity.duration}</Badge>}
      </div>

      {opportunity.salary_range && <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400">{opportunity.salary_range}</p>}
      {opportunity.description && <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{opportunity.description}</p>}

      {opportunity.requirements && (
        <>
          <button
            type="button"
            onClick={() => setExpanded((previous) => !previous)}
            aria-expanded={expanded}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 transition-colors hover:text-brand-800 dark:text-brand-300"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
            {expanded ? 'Hide requirements' : 'View requirements'}
          </button>
          {expanded && (
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-600 animate-fade-in dark:bg-slate-800/60 dark:text-slate-300">
              {opportunity.requirements}
            </div>
          )}
        </>
      )}

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Deadline: <span className="font-medium text-slate-700 dark:text-slate-200">{formatDeadline(opportunity.deadline)}</span>
        </p>
        <Button href={opportunity.application_url} target="_blank" rel="noopener noreferrer" size="sm" variant={expired ? 'secondary' : 'primary'}>
          {expired ? 'View details' : 'Apply now'}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
};

export default OpportunityCard;
