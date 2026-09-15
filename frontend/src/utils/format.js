export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatCurrency = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `R${Number(value).toLocaleString('en-ZA')}`;
};

// Returns a text-only color class (used where the caller provides its own bg)
export const getRatingColor = (rating) => {
  if (rating >= 4) return 'text-emerald-600 dark:text-emerald-400';
  if (rating >= 3) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

// Returns both text and background classes (used for rating badges/pills)
export const getRatingBadge = (rating) => {
  if (rating >= 4) return 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10';
  if (rating >= 3) return 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/10';
  return 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10';
};

export const getUniversityName = (emailOrCode) => {
  const value = (emailOrCode || '').toLowerCase();
  if (value.includes('wits')) return 'University of the Witwatersrand';
  if (value.includes('uj')) return 'University of Johannesburg';
  return 'University';
};

export const getUniversityCode = (university) => {
  if (!university) return '';
  const lower = university.toLowerCase();
  if (lower === 'wits') return 'WITS';
  if (lower === 'uj') return 'UJ';
  return university.toUpperCase();
};
