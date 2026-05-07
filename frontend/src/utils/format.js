export const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

// Returns a text-only color class (used where the caller provides its own bg)
export const getRatingColor = (rating) => {
  if (rating >= 4) return 'text-emerald-600';
  if (rating >= 3) return 'text-amber-600';
  return 'text-red-600';
};

// Returns both text and background classes (used for rating badges/pills)
export const getRatingBadge = (rating) => {
  if (rating >= 4) return 'text-emerald-700 bg-emerald-50';
  if (rating >= 3) return 'text-amber-700 bg-amber-50';
  return 'text-red-700 bg-red-50';
};

export const getUniversityName = (emailOrCode) => {
  const v = (emailOrCode || '').toLowerCase();
  if (v.includes('wits')) return 'University of the Witwatersrand';
  if (v.includes('uj')) return 'University of Johannesburg';
  return 'University';
};

export const getUniversityCode = (university) => {
  if (!university) return '';
  const lower = university.toLowerCase();
  if (lower === 'wits') return 'WITS';
  if (lower === 'uj') return 'UJ';
  return university.toUpperCase();
};
