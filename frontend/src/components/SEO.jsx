import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://www.oneapplyhub.co.za';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

const ROUTE_META = {
  '/': {
    title: 'oneApplyHub | Student Accommodation near Wits & UJ',
    description:
      'Find verified student accommodation near Wits University and UJ. Browse NSFAS-accredited residences and read honest student reviews.',
  },
  '/properties': {
    title: 'Student Accommodation Listings | oneApplyHub',
    description:
      'Browse verified student accommodation near Wits and UJ. Filter by residence type, price range, university, amenities, and student reviews.',
  },
  '/reviews': {
    title: 'Student Accommodation Reviews | oneApplyHub',
    description:
      'Read authentic student reviews for Johannesburg accommodation near Wits and UJ, including ratings for safety, value, location, and management.',
  },
  '/bursaries': {
    title: 'South African Bursaries & Opportunities | oneApplyHub',
    description:
      'Explore bursaries, scholarships, and funding opportunities for South African students across engineering, IT, business, law, health, and more.',
  },
  '/login': {
    title: 'Login | oneApplyHub',
    description: 'Sign in to oneApplyHub to manage your reviews, applications, and student accommodation tools.',
    robots: 'noindex, nofollow',
  },
  '/register': {
    title: 'Create Account | oneApplyHub',
    description: 'Create a oneApplyHub account to review properties, apply for accommodation, and track your student application.',
  },
  '/dashboard': {
    title: 'Student Dashboard | oneApplyHub',
    description: 'View student accommodation insights, review statistics, and platform activity on your oneApplyHub dashboard.',
    robots: 'noindex, nofollow',
  },
  '/application': {
    title: 'My Accommodation Application | oneApplyHub',
    description: 'Submit and track your student accommodation application on oneApplyHub.',
    robots: 'noindex, nofollow',
  },
  '/privacy': {
    title: 'Privacy Policy | oneApplyHub',
    description: 'Read the oneApplyHub privacy policy and learn how student data is collected, protected, and used.',
  },
  '/terms': {
    title: 'Terms of Service | oneApplyHub',
    description: 'Read the oneApplyHub terms of service for using the student accommodation platform.',
  },
};

const matchMeta = (pathname) => {
  if (pathname.startsWith('/properties/') && pathname.endsWith('/review')) {
    return {
      title: 'Write a Property Review | oneApplyHub',
      description: 'Share your student accommodation experience and help other students make better housing decisions.',
      robots: 'noindex, nofollow',
    };
  }

  if (pathname.startsWith('/properties/')) {
    return {
      title: 'Property Details | oneApplyHub',
      description:
        'View student accommodation details, amenities, pricing, contact information, and verified student reviews on oneApplyHub.',
    };
  }

  if (pathname.startsWith('/admin')) {
    return {
      title: 'Admin Dashboard | oneApplyHub',
      description: 'Administrative dashboard for managing oneApplyHub properties, users, reviews, and applications.',
      robots: 'noindex, nofollow',
    };
  }

  return ROUTE_META[pathname] || ROUTE_META['/'];
};

const upsertMeta = (selector, attrs) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
};

const upsertLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

const SEO = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = matchMeta(pathname);
    const canonicalUrl = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;
    const robots = meta.robots || 'index, follow';
    const image = meta.image || DEFAULT_IMAGE;

    document.title = meta.title;
    upsertMeta('meta[name="description"]', { name: 'description', content: meta.description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: meta.title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: meta.description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });
    upsertMeta('meta[property="og:image:width"]', { property: 'og:image:width', content: '1200' });
    upsertMeta('meta[property="og:image:height"]', { property: 'og:image:height', content: '630' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
    upsertLink('canonical', canonicalUrl);
  }, [pathname]);

  return null;
};

export default SEO;
