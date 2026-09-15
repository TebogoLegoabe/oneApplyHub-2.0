// Joins class names, dropping falsy values. Keeps conditional Tailwind classes readable.
export const cn = (...classes) => classes.filter(Boolean).join(' ');
