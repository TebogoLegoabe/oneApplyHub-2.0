import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Mail, Star, ShieldCheck, ThumbsDown, ThumbsUp } from 'lucide-react';
import { propertiesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, Checkbox, EmptyState, Field, Modal, PageHeader, PageLoader, Textarea } from '../components/ui';
import { cn } from '../utils/cn';

const MIN_REVIEW_LENGTH = 50;
const MAX_REVIEW_LENGTH = 5000;

const INITIAL_REVIEW = {
  overall_rating: 0,
  value_rating: 0,
  location_rating: 0,
  safety_rating: 0,
  cleanliness_rating: 0,
  management_rating: 0,
  facilities_rating: 0,
  review_text: '',
  pros: '',
  cons: '',
  recommend: null,
  anonymous: false,
  truthful_experience_confirmed: false,
};

const CATEGORY_RATINGS = [
  ['value_rating', 'Value for money'],
  ['location_rating', 'Location'],
  ['safety_rating', 'Safety'],
  ['cleanliness_rating', 'Cleanliness'],
  ['management_rating', 'Management'],
  ['facilities_rating', 'Facilities'],
];

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

const StarRating = ({ label, value, onChange, required, large = false }) => {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}{required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400" aria-live="polite">
          {shown ? RATING_LABELS[shown] : 'Not rated'}
        </span>
      </div>
      <div className="flex gap-1" role="radiogroup" aria-label={label} onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            className={cn(
              'rounded-lg p-0.5 transition-transform hover:scale-110',
              star <= shown ? 'text-gold-500' : 'text-slate-300 dark:text-slate-700',
            )}
          >
            <Star className={cn(large ? 'h-8 w-8' : 'h-6 w-6', 'fill-current')} />
          </button>
        ))}
      </div>
    </div>
  );
};

const CreateReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showStandard, setShowStandard] = useState(true);
  const [review, setReview] = useState(INITIAL_REVIEW);

  const propertyPath = `/properties/${id}`;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `${propertyPath}/review` } } });
      return;
    }
    propertiesAPI.getProperty(id)
      .then((response) => setProperty(response.data.property))
      .catch(() => setError('Property not found'))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, navigate, propertyPath]);

  const setField = (name, value) => {
    setReview((previous) => ({ ...previous, [name]: value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!review.overall_rating) return 'Please provide an overall rating.';
    if (review.review_text.trim().length < MIN_REVIEW_LENGTH) return `Please write at least ${MIN_REVIEW_LENGTH} characters about your experience.`;
    if (review.recommend === null) return 'Please choose whether you recommend this property.';
    if (!review.truthful_experience_confirmed) return 'Please confirm that your review is truthful and based on your own experience.';
    return '';
  };

  const submitReview = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    try {
      const response = await reviewsAPI.createReview(id, {
        ...review,
        subject: property?.name ? `Review for ${property.name}` : 'Property review',
      });
      setSuccessMessage(
        response.data?.flagged_for_admin
          ? 'Your review has been saved and sent to an admin for approval before it appears publicly.'
          : 'Your review passed our checks and is now visible to other students.',
      );
      setSuccess(true);
      setTimeout(() => navigate(propertyPath), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit your review. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader label="Loading property…" />;

  if (error && !property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
          <EmptyState title="Property not found" description="The property you want to review does not exist or has been removed." action={<Button to="/properties">Back to properties</Button>} />
        </div>
      </div>
    );
  }

  if (!user?.verified) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-card dark:border-slate-800 dark:bg-slate-900">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
            <Mail className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-bold text-slate-950 dark:text-white">Verify your email first</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Only verified students can write reviews. It takes less than a minute.</p>
          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button to="/verify-email">Verify email</Button>
            <Button to={propertyPath} variant="secondary">Back to property</Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card dark:border-slate-800 dark:bg-slate-900">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-bold text-slate-950 dark:text-white">Review submitted</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{successMessage}</p>
          <p className="mt-4 text-xs text-slate-400">Taking you back to the property…</p>
        </div>
      </div>
    );
  }

  const remaining = MAX_REVIEW_LENGTH - review.review_text.length;
  const meetsMinimum = review.review_text.trim().length >= MIN_REVIEW_LENGTH;

  return (
    <>
      <Modal open={showStandard} onClose={() => setShowStandard(false)} hideClose size="md">
        <div className="mb-3 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">Before you review</div>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">Our review standard</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Write a fair, factual review in respectful language and describe your own experience only. Do not include insults, threats, profanity, or accusations you cannot support.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          We may check your application history for this property. Reviews that pass our checks publish immediately; flagged reviews are held for admin approval.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button to={propertyPath} variant="secondary">Back to property</Button>
          <Button onClick={() => setShowStandard(false)} data-autofocus>I understand</Button>
        </div>
      </Modal>

      <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <PageHeader
          backTo={propertyPath}
          backLabel="Back to property"
          eyebrow="Student review"
          icon={Star}
          title="Write a review"
          description={<>Reviewing <span className="font-semibold text-slate-800 dark:text-slate-100">{property?.name}</span>. Your feedback helps other students choose well.</>}
          className="mb-4"
        />

        <form onSubmit={submitReview} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-6" noValidate>
          {error && <Alert tone="error" className="mb-5">{error}</Alert>}

          <section className="mb-6" aria-labelledby="overall-heading">
            <h2 id="overall-heading" className="mb-3 text-sm font-bold text-slate-950 dark:text-white">Overall experience</h2>
            <StarRating label="Overall rating" value={review.overall_rating} onChange={(value) => setField('overall_rating', value)} required large />
          </section>

          <section className="mb-6 border-t border-slate-100 pt-6 dark:border-slate-800" aria-labelledby="categories-heading">
            <h2 id="categories-heading" className="mb-1 text-sm font-bold text-slate-950 dark:text-white">Rate by category</h2>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Optional, but very useful for other students.</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {CATEGORY_RATINGS.map(([key, label]) => (
                <StarRating key={key} label={label} value={review[key]} onChange={(value) => setField(key, value)} />
              ))}
            </div>
          </section>

          <section className="mb-6 border-t border-slate-100 pt-6 dark:border-slate-800">
            <Textarea
              label="Your experience"
              required
              rows={6}
              maxLength={MAX_REVIEW_LENGTH}
              value={review.review_text}
              onChange={(event) => setField('review_text', event.target.value)}
              placeholder="Describe what it was like to live here: the room, the building, management, safety, and value."
              hint={
                meetsMinimum
                  ? `${remaining.toLocaleString()} characters remaining.`
                  : `${Math.max(0, MIN_REVIEW_LENGTH - review.review_text.trim().length)} more characters needed (minimum ${MIN_REVIEW_LENGTH}).`
              }
            />
          </section>

          <section className="mb-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 md:grid-cols-2">
            <Textarea label="What did you like?" optional rows={4} value={review.pros} onChange={(event) => setField('pros', event.target.value)} placeholder="Highlights worth sharing" />
            <Textarea label="What could improve?" optional rows={4} value={review.cons} onChange={(event) => setField('cons', event.target.value)} placeholder="Things future residents should know" />
          </section>

          <section className="mb-6 border-t border-slate-100 pt-6 dark:border-slate-800">
            <Field label="Would you recommend this property?" required>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Recommendation">
                <button
                  type="button"
                  role="radio"
                  aria-checked={review.recommend === true}
                  onClick={() => setField('recommend', true)}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
                    review.recommend === true
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
                  )}
                >
                  <ThumbsUp className="h-4 w-4" aria-hidden="true" />Yes, I recommend it
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={review.recommend === false}
                  onClick={() => setField('recommend', false)}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
                    review.recommend === false
                      ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
                  )}
                >
                  <ThumbsDown className="h-4 w-4" aria-hidden="true" />No, I do not
                </button>
              </div>
            </Field>
          </section>

          <div className="space-y-3">
            <Checkbox
              checked={review.truthful_experience_confirmed}
              onChange={(event) => setField('truthful_experience_confirmed', event.target.checked)}
              label="I confirm this review is truthful and based on my own experience."
              description="oneApplyHub may check my application record for this property and may hold flagged reviews for admin approval."
            />
            <Checkbox
              checked={review.anonymous}
              onChange={(event) => setField('anonymous', event.target.checked)}
              label="Post anonymously"
              description="Your name is hidden. The review is still verified as coming from a real student."
            />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <Button to={propertyPath} variant="secondary">Cancel</Button>
            <Button type="submit" size="lg" loading={submitting}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Submit review
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
          By submitting, you agree to our <Link to="/terms" className="font-semibold text-slate-600 underline-offset-2 hover:underline dark:text-slate-300">review guidelines</Link>.
        </p>
      </div>
    </>
  );
};

export default CreateReviewPage;
