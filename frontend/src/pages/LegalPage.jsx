import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Mail } from 'lucide-react';
import { legalDocuments } from '../data/legalDocuments';
import { Badge } from '../components/ui';

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const LegalPage = ({ type }) => {
  const params = useParams();
  const docType = type || params.type;
  const doc = legalDocuments[docType] || legalDocuments.terms;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to home
      </Link>

      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-300">oneApplyHub legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{doc.title}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>Effective {doc.effectiveDate}</Badge>
          <Badge>{doc.version}</Badge>
          <Badge>{doc.website}</Badge>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="hidden lg:block" aria-label="Sections">
          <ol className="sticky top-24 space-y-1 text-sm">
            {doc.sections.map((section, index) => (
              <li key={section.heading}>
                <a href={`#${slugify(section.heading)}`} className="flex gap-2 rounded-lg px-3 py-1.5 text-slate-500 transition-colors hover:bg-white hover:text-brand-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-brand-300">
                  <span className="w-5 shrink-0 tabular-nums text-slate-400 dark:text-slate-600">{index + 1}.</span>
                  <span>{section.heading}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-4">
          {doc.sections.map((section, index) => (
            <section key={section.heading} id={slugify(section.heading)} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                <span className="mr-2 text-slate-300 dark:text-slate-600">{index + 1}.</span>{section.heading}
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={`${section.heading}-${paragraphIndex}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5 text-sm text-brand-900 dark:border-brand-900 dark:bg-brand-500/10 dark:text-brand-100">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>Questions about this document? Contact <a href="mailto:info@oneapplyhub.co.za" className="font-semibold underline underline-offset-2">info@oneapplyhub.co.za</a>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
