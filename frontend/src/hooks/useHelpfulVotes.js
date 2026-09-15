import { useCallback, useState } from 'react';
import { reviewsAPI } from '../services/api';

const STORAGE_KEY = 'markedHelpful';

const readMarked = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

/**
 * Shared "mark review as helpful" behaviour for the reviews list and property page.
 * The server prevents duplicate votes; localStorage just remembers what this browser already did
 * so the button can render as pressed without a round trip.
 *
 * @param {boolean} isAuthenticated
 * @param {(reviewId: number, helpfulCount: number) => void} onCounted  called with the new count
 * @param {(message: string) => void} onError
 */
export const useHelpfulVotes = ({ isAuthenticated, onCounted, onError }) => {
  const [marked, setMarked] = useState(readMarked);
  const [pending, setPending] = useState({});

  const markHelpful = useCallback(async (reviewId) => {
    if (!isAuthenticated) {
      onError?.('Sign in to mark reviews as helpful.');
      return;
    }
    if (marked.has(reviewId) || pending[reviewId]) return;
    setPending((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const response = await reviewsAPI.markHelpful(reviewId);
      onCounted?.(reviewId, response.data.helpful_count);
      const next = new Set(marked);
      next.add(reviewId);
      setMarked(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch (error) {
      if (error.response?.status === 409) {
        // Already voted from another device: remember it locally so the UI matches the server.
        const next = new Set(marked);
        next.add(reviewId);
        setMarked(next);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      }
      onError?.(error.response?.data?.error || 'Could not record your vote. Please try again.');
    } finally {
      setPending((prev) => ({ ...prev, [reviewId]: false }));
    }
  }, [isAuthenticated, marked, pending, onCounted, onError]);

  return {
    markHelpful,
    hasMarked: (reviewId) => marked.has(reviewId),
    isPending: (reviewId) => Boolean(pending[reviewId]),
  };
};
