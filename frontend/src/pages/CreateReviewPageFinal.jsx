import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle, Mail, Star } from 'lucide-react';
import { propertiesAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const initialReview = {
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
  subject: '',
};

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const Rating = ({ label, value, onChange, required }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
    <div className="mb-2 flex justify-between gap-3 text-xs font-black text-slate-700 dark:text-slate-300">
      <span>{label}{required && <span className="text-red-500"> *</span>}</span>
      <span className="text-slate-400">{value}/5</span>
    </div>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} className={star <= value ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}>
          <Star className="h-6 w-6 fill-current" />
        </button>
      ))}
    </div>
  </div>
);

const CreateReviewPageFinal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Thank you for helping other students.');
  const [review, setReview] = useState(initialReview);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/properties/${id}/review` } } });
      return;
    }
    const loadProperty = async () => {
      try {
        const response = await propertiesAPI.getProperty(id);
        setProperty(response.data.property);
      } catch {
        setError('Property not found');
      } finally {
        setLoading(false);
      }
    };
    loadProperty();
  }, [id, isAuthenticated, navigate]);

  const setField = (name, value) => {
    setReview((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!review.overall_rating) return setError('Please provide an overall rating.');
    if (review.review_text.trim().length < 50) return setError('Please write at least 50 characters.');
    if (review.recommend === null) return setError('Please choose whether you recommend this property.');
    if (!review.truthful_experience_confirmed) return setError('Please confirm that your review is truthful, respectful, and based on your own experience.');
    setSubmitting(true);
    try {
      const response = await reviewsAPI.createReview(id, { ...review, subject: property?.name ? `Review for ${property.name}` : 'Property Review' });
      setSuccessMessage(response.data?.flagged_for_admin ? 'Your review was saved and sent to admin for approval before it appears publicly.' : 'Your review passed the checks and is now visible publicly.');
      setSuccess(true);
      setTimeout(() => navigate(`/properties/${id}`), 1600);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" /></div>;

  if (error && !property) return <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950"><div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"><h1 className="text-xl font-black text-slate-950 dark:text-white">Property not found</h1><Link to="/properties" className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white">Back to properties</Link></div></div>;

  if (!user?.verified) return <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10"><Mail className="h-7 w-7" /></div><h2 className="text-xl font-black text-slate-950 dark:text-white">Verify your email first</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Only verified students can write reviews.</p><div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2"><Link to="/verify-email" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">Verify email</Link><Link to={`/properties/${id}`} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">Back</Link></div></div></div>;

  if (success) return <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950"><div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"><CheckCircle className="mx-auto mb-4 h-14 w-14 text-emerald-600" /><h2 className="text-xl font-black text-slate-950 dark:text-white">Review submitted</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{successMessage}</p></div></div>;

  return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><div className="mx-auto w-full max-w-5xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6"><div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-5 sm:py-4"><Link to={`/properties/${id}`} className="mb-3 inline-flex items-center text-xs font-bold text-blue-600 dark:text-blue-400"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" />Back to property</Link><div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><Star className="h-3.5 w-3.5" />Student review</div><h1 className="mt-2 text-xl font-black text-slate-950 dark:text-white sm:text-2xl">Write a review</h1><p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">Reviewing <span className="font-bold text-slate-700 dark:text-slate-200">{property?.name}</span>.</p></div><form onSubmit={submitReview} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">{error && <div className="mb-4 flex gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-500/10 dark:text-red-300"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}<div className="mb-5"><h2 className="mb-3 text-sm font-black text-slate-950 dark:text-white">Overall experience</h2><Rating label="Overall rating" value={review.overall_rating} onChange={(value) => setField('overall_rating', value)} required /></div><div className="mb-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 md:grid-cols-2"><Rating label="Value" value={review.value_rating} onChange={(value) => setField('value_rating', value)} /><Rating label="Location" value={review.location_rating} onChange={(value) => setField('location_rating', value)} /><Rating label="Safety" value={review.safety_rating} onChange={(value) => setField('safety_rating', value)} /><Rating label="Cleanliness" value={review.cleanliness_rating} onChange={(value) => setField('cleanliness_rating', value)} /><Rating label="Management" value={review.management_rating} onChange={(value) => setField('management_rating', value)} /><Rating label="Facilities" value={review.facilities_rating} onChange={(value) => setField('facilities_rating', value)} /></div><div className="mb-5 border-t border-slate-100 pt-5 dark:border-slate-800"><label className="mb-2 block text-xs font-black text-slate-700 dark:text-slate-300">Your experience *</label><textarea rows={5} className={`${inputClass} resize-none`} value={review.review_text} onChange={(event) => setField('review_text', event.target.value)} placeholder="Share your honest experience living here." /><p className="mt-1 text-xs text-slate-400">{review.review_text.length}/5000 characters. Minimum 50.</p></div><div className="mb-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 md:grid-cols-2"><div><label className="mb-2 block text-xs font-black text-slate-700 dark:text-slate-300">What did you like?</label><textarea rows={4} className={`${inputClass} resize-none`} value={review.pros} onChange={(event) => setField('pros', event.target.value)} /></div><div><label className="mb-2 block text-xs font-black text-slate-700 dark:text-slate-300">What could improve?</label><textarea rows={4} className={`${inputClass} resize-none`} value={review.cons} onChange={(event) => setField('cons', event.target.value)} /></div></div><div className="mb-5 border-t border-slate-100 pt-5 dark:border-slate-800"><p className="mb-3 text-xs font-black text-slate-700 dark:text-slate-300">Would you recommend this property? *</p><div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={() => setField('recommend', true)} className={`rounded-xl border px-4 py-3 text-sm font-bold ${review.recommend === true ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>Yes, I recommend it</button><button type="button" onClick={() => setField('recommend', false)} className={`rounded-xl border px-4 py-3 text-sm font-bold ${review.recommend === false ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>No, I do not</button></div></div><div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-500/10 dark:text-blue-100"><p className="font-black">Review standard</p><p className="mt-1">Write a fair, factual review in respectful language. Describe your own experience only. Do not include insults, threats, profanity, or accusations you cannot support. We may verify your application history and reviews that pass our checks may publish immediately, while flagged reviews are sent to admin for approval before publication.</p></div><label className="mb-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"><input type="checkbox" checked={review.truthful_experience_confirmed} onChange={(event) => setField('truthful_experience_confirmed', event.target.checked)} className="mt-1" /><span className="text-sm text-slate-600 dark:text-slate-300"><b>I confirm this review is truthful and based on my own experience.</b><br />I understand OneApplyHub may check my application record for this property and may hold flagged reviews for admin approval or rejection.</span></label><label className="mb-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"><input type="checkbox" checked={review.anonymous} onChange={(event) => setField('anonymous', event.target.checked)} className="mt-1" /><span className="text-sm text-slate-600 dark:text-slate-300"><b>Post anonymously</b><br />Your review will still be verified as a student review.</span></label><div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><Link to={`/properties/${id}`} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-center text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">Cancel</Link><button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit review'}</button></div></form></div></div>;
};

export default CreateReviewPageFinal;
