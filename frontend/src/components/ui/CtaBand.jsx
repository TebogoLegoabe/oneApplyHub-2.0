import { cn } from '../../utils/cn';
import PhotoCredit from './PhotoCredit';

/**
 * Closing call to action for a page: a solid navy band with a title, a short line of
 * copy and an action slot (use Button variant="inverse"). Pass `image` (from
 * constants/photos) to set a darkened photo behind it.
 */
const CtaBand = ({ title, description, action, image, headingLevel: Heading = 'h2', className }) => (
  <section className={cn('relative isolate overflow-hidden rounded-2xl bg-ink-950 p-6 text-white dark:ring-1 dark:ring-inset dark:ring-white/10 sm:p-8', className)}>
    {image && (
      <>
        <img src={image.src} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-ink-950/80" aria-hidden="true" />
      </>
    )}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Heading className="text-xl font-bold tracking-tight">{title}</Heading>
        {description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/80">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
    {image && <PhotoCredit photo={image} className="absolute bottom-2 right-2" />}
  </section>
);

export default CtaBand;
