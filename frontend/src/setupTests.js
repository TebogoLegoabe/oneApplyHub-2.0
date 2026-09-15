import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// jsdom in CRA's Jest lacks these; React Router 7 needs them at import time.
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

if (!window.matchMedia) {
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
}
