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
  // JSON POST). The endpoint saves each one and emails it to Michele with
  // Reply-To set to the guest. If it fails, the form offers an email link to
  // `email` instead. Empty: the form opens an email to `email` directly.
  inquiryUrl: 'https://diy-customer.vercel.app/api/inquiry/loft',

  // Booked days from Michele's "Loft bookings" phone calendar, dates only.
  // Empty means the availability calendar uses the admin's list alone.
  availabilityUrl: 'https://diy-customer.vercel.app/api/availability/loft',

  // Where js/content.js fetches owner-made content changes from. Empty or
  // unreachable means the site shows its built-in copy.
  contentUrl: 'https://diy-customer.vercel.app/api/content/loft',
};
