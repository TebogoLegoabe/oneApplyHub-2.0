/**
 * Official brand marks for social links, as inline SVG (Lucide no longer ships brand logos).
 * Brands allow their marks in a single colour when linking to their pages, so these use currentColor.
 *
 * Facebook: Simple Icons 16.38.1 (CC0 1.0), https://simpleicons.org
 * LinkedIn: Font Awesome Free 7.3.1 by @fontawesome - https://fontawesome.com
 *   License - https://fontawesome.com/license/free (Icons: CC BY 4.0). Copyright 2026 Fonticons, Inc.
 */

export const FacebookIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" focusable="false">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
  </svg>
);

// viewBox cropped to the square "in" mark (the source icon is 448 x 512 with empty bands top and bottom).
export const LinkedInIcon = ({ className }) => (
  <svg viewBox="0 32 448 448" fill="currentColor" className={className} aria-hidden="true" focusable="false">
    <path d="M416 32L31.9 32C14.3 32 0 46.5 0 64.3L0 447.7C0 465.5 14.3 480 31.9 480L416 480c17.6 0 32-14.5 32-32.3l0-383.4C448 46.5 433.6 32 416 32zM135.4 416l-66.4 0 0-213.8 66.5 0 0 213.8-.1 0zM102.2 96a38.5 38.5 0 1 1 0 77 38.5 38.5 0 1 1 0-77zM384.3 416l-66.4 0 0-104c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9l0 105.8-66.4 0 0-213.8 63.7 0 0 29.2 .9 0c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9l0 117.2z" />
  </svg>
);
