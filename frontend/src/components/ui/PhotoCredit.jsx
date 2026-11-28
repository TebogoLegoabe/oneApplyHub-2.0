import { cn } from '../../utils/cn';

/**
 * Attribution required by the photos' Creative Commons licences: photographer
 * (linked to the source page) and licence (linked to its deed).
 */
const PhotoCredit = ({ photo, className, tone = 'overlay' }) => {
  if (!photo) return null;
  const link = tone === 'overlay' ? 'underline-offset-2 hover:underline' : 'font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline dark:text-slate-300 dark:hover:text-white';
  return (
    <p
      className={cn(
        'text-[10px] leading-tight',
        tone === 'overlay' ? 'rounded bg-black/55 px-1.5 py-0.5 text-white' : 'text-slate-500 dark:text-slate-400',
        className,
      )}
    >
      Photo:{' '}
      <a href={photo.source} target="_blank" rel="noopener noreferrer" className={link}>{photo.author}</a>
      {photo.licenseUrl ? (
        <>, <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer" className={link}>{photo.license}</a></>
      ) : (
        ` (${photo.license.toLowerCase()})`
      )}
    </p>
  );
};

export default PhotoCredit;
