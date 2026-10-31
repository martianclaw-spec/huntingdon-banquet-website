// Single source of truth for the venue identity and contact details.
// Pages, titles, and the inquiry form read from here; nothing hardcodes these.
// Anything left empty simply does not show on the site (no dead links).
window.VENUE = {
  name: 'The Loft at 708',
  shortName: 'The Loft at 708',
  address: '708 Washington Street, second floor',
  city: 'Huntingdon, PA',
  zip: '16652',

  // The Loft's public contact details, as listed on its own Facebook page
  // (not Michele's realtor office). Empty means the matching link or line
  // stays hidden.
  facebookUrl: 'https://www.facebook.com/profile.php?id=61594589293638',
  email: 'mshovlin3@gmail.com',
  phone: '(814) 386-2991',

  // Where the "Plan your event" form sends inquiries (a URL that accepts a
  // JSON POST). Empty: the form falls back to opening an email to `email`,
  // and with no email either it says plainly that it is not connected yet.
  inquiryUrl: '',

  // Where js/content.js fetches owner-made content changes from. Empty or
  // unreachable means the site shows its built-in copy.
  contentUrl: 'https://diy-customer.vercel.app/api/content/loft',
};
