/**
 * Photography of Johannesburg, Wits and UJ from Wikimedia Commons, served from
 * /public/images (resized and converted to WebP). Creative Commons licences require
 * crediting the photographer and licence wherever a photo is shown — use <PhotoCredit>.
 */
const LICENSE_URLS = {
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
};

const photo = (file, alt, author, license, source) => ({
  src: `${process.env.PUBLIC_URL || ''}/images/${file}`,
  alt,
  author,
  license,
  licenseUrl: LICENSE_URLS[license] || null,
  source,
});

export const PHOTOS = {
  mandelaBridge: photo(
    'mandela-bridge.webp',
    'Nelson Mandela Bridge, which links Braamfontein to Newtown, under a clear sky',
    'NJR ZA',
    'Public domain',
    'https://commons.wikimedia.org/wiki/File:South_Africa-Johannesburg-Nelson_Mandela_Bridge001.jpg',
  ),
  witsGreatHall: photo(
    'wits-great-hall-jacarandas.webp',
    'The Great Hall at Wits University framed by flowering jacarandas',
    'Chante Schatz',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Great_Hall_October_2023-4.jpg',
  ),
  ujKingsway: photo(
    'uj-kingsway-campus.webp',
    'Lawns and residence buildings at UJ Auckland Park Kingsway campus',
    'Aurobindo Ogra',
    'CC BY-SA 3.0',
    'https://commons.wikimedia.org/wiki/File:UJ_APK-1.JPG',
  ),
  braamfontein: photo(
    'braamfontein-view.webp',
    'Braamfontein and the Johannesburg city skyline seen from Constitution Hill',
    'Nick-D',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Braamfontein_and_Johannesburg_CBD_viewed_from_the_Old_Fort_June_2026.jpg',
  ),
  witsGreatHallTrees: photo(
    'wits-great-hall-trees.webp',
    'Steps leading up to the Wits Great Hall seen between trees',
    'Heather Elke',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Great_Hall_facade_through_jacarandas.jpg',
  ),
  mandelaBridgeNight: photo(
    'mandela-bridge-night.webp',
    'Nelson Mandela Bridge lit up at night with the Johannesburg skyline behind it',
    'South African Tourism',
    'CC BY 2.0',
    'https://commons.wikimedia.org/wiki/File:Mandela_Bridge,_Johannesburg,_Gauteng,_South_Africa.jpg',
  ),
  witsLibraryLawns: photo(
    'wits-library-lawns.webp',
    'The Library Lawns on Wits University main campus',
    'Christophe Hendrickx',
    'CC BY-SA 4.0',
    'https://commons.wikimedia.org/wiki/File:Library_Lawns_Witwatersrand.JPG',
  ),
};
