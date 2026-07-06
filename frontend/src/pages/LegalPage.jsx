import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Mail } from 'lucide-react';
import { legalDocuments } from '../data/legalDocuments';

const LegalPage = ({ type }) => {
  const params = useParams();
  const docType = type || params.type;
  const doc = legalDocuments[docType] || legalDocuments.terms;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/" className="mb-5 inline-flex items-center rounded-xl bg-white px-3 py-2 text-xs font-black text-blue-600 shadow-sm hover:text-blue-700 dark:bg-slate-900 dark:text-blue-300">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to home
        </Link>

        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
            <FileText className="h-6 w-6" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">OneApplyHub legal</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">{doc.title}</h1>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">Effective {doc.effectiveDate}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{doc.version}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">{doc.website}</span>
          </div>
        </header>

        <div className="mt-5 space-y-4">
          {doc.sections.map((section) => (
            <section key={section.heading} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="text-lg font-black text-slate-950 dark:text-white">{section.heading}</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={`${section.heading}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-500/10 dark:text-blue-100">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Questions about this document? Contact <a href="mailto:info@oneapplyhub.co.za" className="font-black underline">info@oneapplyhub.co.za</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
