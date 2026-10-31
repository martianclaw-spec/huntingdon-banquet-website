// content.config.js: the allowlist of owner-editable content.
//
// Nothing outside this list is ever editable. Each entry names one slot; the
// live page marks the matching element with data-content="<id>" and keeps the
// current wording in place as the fallback.
//
// This file is plain JavaScript (not TypeScript) because the site has no build
// step. The shape mirrors the SlotDef interface from the handoff so the
// control-plane app can import it unchanged.
//
// Image slots: the value is a URL. A companion key "<id>.alt" (not listed
// here) may carry the replacement alt text; nothing else about an image is
// overridable.
//
// Money slots hold the display string ("$4,500"), not a number. The overlay
// does no formatting.
//
// Redesign, 2026-10-30: ids whose meaning did not change were kept, so the
// control plane's history stays attached to them. Retired ids (the notice bar,
// homepage tile prices and photos, the floor plan lines) are gone from here;
// re-seeding marks them editable = false rather than deleting them.

/**
 * @typedef {'text' | 'richtext' | 'image' | 'money' | 'number'} SlotType
 *
 * @typedef {Object} SlotDef
 * @property {string}   id         dotted, group.name form
 * @property {string}   label      plain language, shown to the venue owner
 * @property {string}   group      which page or area the owner will look under
 * @property {SlotType} type
 * @property {number}   [maxLength] for text types; set from what the layout holds
 * @property {boolean}  [confirm]   true for every money slot
 * @property {string}   [help]
 */

/** @type {SlotDef[]} */
var CONTENT_SLOTS = [

  // ---- Contact and facts used on several pages --------------------------------

  { id: 'contact.address', label: 'Address in the footer', group: 'Contact', type: 'text', maxLength: 60,
    help: 'The street line at the bottom of every page. "Huntingdon, PA" sits on the line below it.' },
  { id: 'venue.capacity', label: 'Guest capacity', group: 'Contact', type: 'number', maxLength: 4,
    help: 'The big number in the "at a glance" strip on the homepage and The Space, and in "Up to 279 guests" on The Space. Sentences elsewhere that mention 279 are changed on their own.' },

  // ---- Homepage ---------------------------------------------------------------

  { id: 'hero.headline', label: 'Homepage headline', group: 'Homepage', type: 'richtext', maxLength: 56,
    help: 'The big line under the sign on the first photo. Words in italics show in the slanted style, like "A lot of character." today.' },
  { id: 'hero.subheadline', label: 'Homepage subheadline', group: 'Homepage', type: 'text', maxLength: 140,
    help: 'One sentence under the headline. Two lines on a computer.' },

  { id: 'home.welcome.statement', label: 'Welcome: large sentence', group: 'Homepage', type: 'text', maxLength: 160,
    help: 'The large serif sentence beside the arched photo, under "Welcome".' },
  { id: 'home.welcome.text', label: 'Welcome: paragraph', group: 'Homepage', type: 'text', maxLength: 360 },

  { id: 'home.occasions.intro', label: 'Occasions intro', group: 'Homepage', type: 'text', maxLength: 200,
    help: 'The sentence under "One room, every kind of celebration".' },
  { id: 'home.occasions.weddings.name', label: 'Occasion 1 name (Wedding receptions)', group: 'Homepage', type: 'text', maxLength: 40 },
  { id: 'home.occasions.weddings.desc', label: 'Occasion 1 description (Wedding receptions)', group: 'Homepage', type: 'text', maxLength: 120 },
  { id: 'home.occasions.showers.name', label: 'Occasion 2 name (Showers)', group: 'Homepage', type: 'text', maxLength: 40 },
  { id: 'home.occasions.showers.desc', label: 'Occasion 2 description (Showers)', group: 'Homepage', type: 'text', maxLength: 120 },
  { id: 'home.occasions.birthdays.name', label: 'Occasion 3 name (Birthdays & anniversaries)', group: 'Homepage', type: 'text', maxLength: 40 },
  { id: 'home.occasions.birthdays.desc', label: 'Occasion 3 description (Birthdays & anniversaries)', group: 'Homepage', type: 'text', maxLength: 120 },
  { id: 'home.occasions.corporate.name', label: 'Occasion 4 name (Corporate events)', group: 'Homepage', type: 'text', maxLength: 40 },
  { id: 'home.occasions.corporate.desc', label: 'Occasion 4 description (Corporate events)', group: 'Homepage', type: 'text', maxLength: 120 },
  { id: 'home.occasions.fundraisers.name', label: 'Occasion 5 name (Fundraisers)', group: 'Homepage', type: 'text', maxLength: 40 },
  { id: 'home.occasions.fundraisers.desc', label: 'Occasion 5 description (Fundraisers)', group: 'Homepage', type: 'text', maxLength: 120 },
  { id: 'home.occasions.reunions.name', label: 'Occasion 6 name (Class reunions)', group: 'Homepage', type: 'text', maxLength: 40 },
  { id: 'home.occasions.reunions.desc', label: 'Occasion 6 description (Class reunions)', group: 'Homepage', type: 'text', maxLength: 120 },
  { id: 'home.occasions.holidays.name', label: 'Occasion 7 name (Holiday parties)', group: 'Homepage', type: 'text', maxLength: 40 },
  { id: 'home.occasions.holidays.desc', label: 'Occasion 7 description (Holiday parties)', group: 'Homepage', type: 'text', maxLength: 120 },

  { id: 'home.bar.headline', label: 'Bar section headline', group: 'Homepage', type: 'richtext', maxLength: 40,
    help: 'On the dark band with the arched photo of the bar.' },
  { id: 'home.bar.text', label: 'Bar section paragraph', group: 'Homepage', type: 'text', maxLength: 300 },

  { id: 'home.adjacency.eyebrow', label: 'Downtown section tag', group: 'Homepage', type: 'text', maxLength: 36,
    help: 'The small gold tag above the downtown headline. Currently "Downtown Huntingdon".' },
  { id: 'home.adjacency.headline', label: 'Downtown section headline', group: 'Homepage', type: 'richtext', maxLength: 60 },
  { id: 'home.adjacency.intro', label: 'Downtown section paragraph', group: 'Homepage', type: 'text', maxLength: 360,
    help: 'The paragraph about the tavern, mini golf, and arcade being separate businesses nearby.' },
  { id: 'home.adjacency.1.name', label: 'Downtown box 1 title', group: 'Homepage', type: 'text', maxLength: 28 },
  { id: 'home.adjacency.1.text', label: 'Downtown box 1 text', group: 'Homepage', type: 'text', maxLength: 170 },
  { id: 'home.adjacency.2.name', label: 'Downtown box 2 title', group: 'Homepage', type: 'text', maxLength: 28 },
  { id: 'home.adjacency.2.text', label: 'Downtown box 2 text', group: 'Homepage', type: 'text', maxLength: 170 },
  { id: 'home.adjacency.3.name', label: 'Downtown box 3 title', group: 'Homepage', type: 'text', maxLength: 28 },
  { id: 'home.adjacency.3.text', label: 'Downtown box 3 text', group: 'Homepage', type: 'text', maxLength: 170 },
  { id: 'home.adjacency.4.name', label: 'Downtown box 4 title', group: 'Homepage', type: 'text', maxLength: 28 },
  { id: 'home.adjacency.4.text', label: 'Downtown box 4 text', group: 'Homepage', type: 'text', maxLength: 170 },
  { id: 'home.adjacency.5.name', label: 'Downtown box 5 title', group: 'Homepage', type: 'text', maxLength: 28 },
  { id: 'home.adjacency.5.text', label: 'Downtown box 5 text', group: 'Homepage', type: 'text', maxLength: 170 },

  { id: 'home.findus.headline', label: 'Finding us: headline', group: 'Homepage', type: 'richtext', maxLength: 40,
    help: 'Beside the photo of the black door. Currently "Look for the black door".' },
  { id: 'home.findus.text', label: 'Finding us: directions', group: 'Homepage', type: 'text', maxLength: 220 },

  { id: 'home.social.text', label: 'Facebook box sentence', group: 'Homepage', type: 'text', maxLength: 140,
    help: 'Under "Follow along on Facebook". The box only shows once the Facebook page link is set up.' },

  { id: 'home.cta.headline', label: 'Closing invitation headline', group: 'Homepage', type: 'richtext', maxLength: 50,
    help: 'The large line on the last photo before the bottom of the homepage.' },
  { id: 'home.cta.text', label: 'Closing invitation sentence', group: 'Homepage', type: 'text', maxLength: 160 },

  // ---- Pricing (rate rows are shared with the Weddings page) -------------------

  { id: 'pricing.headline', label: 'Rates page headline', group: 'Pricing', type: 'richtext', maxLength: 40 },
  { id: 'pricing.intro', label: 'Rates page intro', group: 'Pricing', type: 'text', maxLength: 320 },

  { id: 'pricing.saturday_label', label: 'Rate 1 label', group: 'Pricing', type: 'text', maxLength: 48,
    help: 'Currently "Saturday, peak season (May to Oct)". Also shown on the Weddings page.' },
  { id: 'pricing.saturday', label: 'Saturday peak rate', group: 'Pricing', type: 'money', maxLength: 10, confirm: true,
    help: 'Used on the Rates page and twice on the Weddings page (the first package and the rate list).' },
  { id: 'pricing.frisun_label', label: 'Rate 2 label', group: 'Pricing', type: 'text', maxLength: 48,
    help: 'Currently "Friday or Sunday". Also shown on the Weddings page.' },
  { id: 'pricing.frisun', label: 'Friday or Sunday rate', group: 'Pricing', type: 'money', maxLength: 10, confirm: true,
    help: 'Also the "Reception only" wedding package price.' },
  { id: 'pricing.weekday_label', label: 'Rate 3 label', group: 'Pricing', type: 'text', maxLength: 48,
    help: 'Currently "Weekday, full day". Also shown on the Weddings page.' },
  { id: 'pricing.weekday', label: 'Weekday full-day rate', group: 'Pricing', type: 'money', maxLength: 10, confirm: true,
    help: 'Also "The small wedding" package price.' },
  { id: 'pricing.halfday_label', label: 'Rate 4 label', group: 'Pricing', type: 'text', maxLength: 48,
    help: 'Currently "Half day, up to 5 hours".' },
  { id: 'pricing.halfday', label: 'Half-day rate', group: 'Pricing', type: 'money', maxLength: 10, confirm: true },
  { id: 'pricing.hourly_label', label: 'Rate 5 label', group: 'Pricing', type: 'text', maxLength: 48,
    help: 'Currently "Hourly, 3-hour minimum".' },
  { id: 'pricing.hourly', label: 'Hourly rate', group: 'Pricing', type: 'money', maxLength: 10, confirm: true,
    help: 'Shown as "$150 / hr". The corporate sample event ($600, "4 × $150") does not update on its own.' },
  { id: 'pricing.offseason_label', label: 'Off-season label', group: 'Pricing', type: 'text', maxLength: 48,
    help: 'Currently "January to April". Also shown on the Weddings page.' },
  { id: 'pricing.offseason_discount', label: 'Off-season discount', group: 'Pricing', type: 'text', maxLength: 12, confirm: true,
    help: 'Currently "20% off". Asks for confirmation like a price because it changes what people pay.' },

  { id: 'pricing.bar.intro', label: 'Bar section intro', group: 'Pricing', type: 'text', maxLength: 320,
    help: 'The paragraph beside "The bar is ours to run".' },
  { id: 'pricing.bar.hourly.desc', label: 'Hosted per hour: description', group: 'Pricing', type: 'text', maxLength: 200 },
  { id: 'pricing.bar.beer_wine_rate', label: 'Hosted per hour: beer & wine rate line', group: 'Pricing', type: 'text', maxLength: 40,
    help: 'Currently "Per guest, per hour" with no number. This is where the beer & wine figure goes.' },
  { id: 'pricing.bar.full_bar_rate', label: 'Hosted per hour: full bar rate line', group: 'Pricing', type: 'text', maxLength: 40,
    help: 'Currently "Per guest, per hour, spirits added". This is where the full bar figure goes.' },
  { id: 'pricing.bar.consumption.desc', label: 'Hosted on consumption: description', group: 'Pricing', type: 'text', maxLength: 220 },
  { id: 'pricing.bar.minimum', label: 'Hosted on consumption: minimum line', group: 'Pricing', type: 'text', maxLength: 24,
    help: 'Currently "Set your minimum". This is where a minimum figure goes.' },
  { id: 'pricing.bar.minimum_note', label: 'Hosted on consumption: note under the minimum', group: 'Pricing', type: 'text', maxLength: 40 },
  { id: 'pricing.bar.cash.desc', label: 'Cash bar: description', group: 'Pricing', type: 'text', maxLength: 200 },
  { id: 'pricing.bar.note', label: 'Bar footnote', group: 'Pricing', type: 'text', maxLength: 200,
    help: 'The line under the three bar boxes about rates being confirmed at booking.' },

  { id: 'pricing.samples.intro', label: 'Sample events intro', group: 'Pricing', type: 'text', maxLength: 200 },
  { id: 'pricing.samples.saturday.title', label: 'Sample 1 title', group: 'Pricing', type: 'text', maxLength: 40 },
  { id: 'pricing.samples.saturday.guests', label: 'Sample 1 guest line', group: 'Pricing', type: 'text', maxLength: 34 },
  { id: 'pricing.samples.saturday.price', label: 'Sample 1 price', group: 'Pricing', type: 'money', maxLength: 10, confirm: true,
    help: 'Same number as the Saturday peak rate today, but changed separately.' },
  { id: 'pricing.samples.memorial.title', label: 'Sample 2 title', group: 'Pricing', type: 'text', maxLength: 40 },
  { id: 'pricing.samples.memorial.guests', label: 'Sample 2 guest line', group: 'Pricing', type: 'text', maxLength: 34 },
  { id: 'pricing.samples.memorial.price', label: 'Sample 2 price', group: 'Pricing', type: 'money', maxLength: 10, confirm: true },
  { id: 'pricing.samples.corporate.title', label: 'Sample 3 title', group: 'Pricing', type: 'text', maxLength: 40 },
  { id: 'pricing.samples.corporate.guests', label: 'Sample 3 guest line', group: 'Pricing', type: 'text', maxLength: 34 },
  { id: 'pricing.samples.corporate.price', label: 'Sample 3 price', group: 'Pricing', type: 'money', maxLength: 10, confirm: true,
    help: 'Today this is 4 hours times the hourly rate. The "4 × $150" line in the box is not editable.' },

  { id: 'pricing.moves.statement', label: '"What moves it" statement', group: 'Pricing', type: 'text', maxLength: 60 },
  { id: 'pricing.moves.text', label: '"What moves it" paragraph', group: 'Pricing', type: 'text', maxLength: 420 },

  { id: 'pricing.terms.reservation_fee', label: 'Terms: reservation fee', group: 'Pricing', type: 'text', maxLength: 260 },
  { id: 'pricing.terms.insurance', label: 'Terms: event insurance', group: 'Pricing', type: 'text', maxLength: 260 },
  { id: 'pricing.terms.food', label: 'Terms: food and catering', group: 'Pricing', type: 'text', maxLength: 260 },

  // ---- The Space ------------------------------------------------------------------

  { id: 'room.headline', label: 'The Space headline', group: 'The room', type: 'richtext', maxLength: 40 },
  { id: 'room.intro', label: 'The Space intro', group: 'The room', type: 'text', maxLength: 320,
    help: 'The paragraph on the first photo of The Space page.' },
  { id: 'room.specs.building', label: 'Details: the building', group: 'The room', type: 'text', maxLength: 160,
    help: 'The first line of the details list, about the Miller Building.' },
  { id: 'room.specs.dimensions', label: 'Details: size', group: 'The room', type: 'text', maxLength: 120 },
  { id: 'room.specs.access', label: 'Details: access', group: 'The room', type: 'text', maxLength: 120 },
  { id: 'room.specs.included', label: 'Details: included with the room', group: 'The room', type: 'text', maxLength: 200 },
  { id: 'room.specs.inhouse', label: 'Details: in-house (bar, sound, projection)', group: 'The room', type: 'richtext', maxLength: 220,
    help: 'The first sentence is italic today. An edited version renders in plain text unless italics are used.' },
  { id: 'room.specs.catering', label: 'Details: catering', group: 'The room', type: 'text', maxLength: 260 },
  { id: 'room.specs.parking', label: 'Details: parking and load-in', group: 'The room', type: 'text', maxLength: 300 },

  // ---- Weddings ------------------------------------------------------------------

  { id: 'weddings.hero.headline', label: 'Weddings headline', group: 'Weddings', type: 'richtext', maxLength: 56,
    help: 'On the first photo of the Weddings page. Two lines at most.' },
  { id: 'weddings.hero.subheadline', label: 'Weddings subheadline', group: 'Weddings', type: 'text', maxLength: 140 },
  { id: 'weddings.intro.statement', label: 'Weddings intro statement', group: 'Weddings', type: 'text', maxLength: 140,
    help: 'The large centered line "Ceremony by the windows, dinner on the floor...".' },
  { id: 'weddings.intro.text', label: 'Weddings intro paragraph', group: 'Weddings', type: 'text', maxLength: 320 },
  { id: 'weddings.packages.intro', label: 'Packages intro', group: 'Weddings', type: 'text', maxLength: 200 },
  { id: 'weddings.packages.full.title', label: 'Package 1 title', group: 'Weddings', type: 'text', maxLength: 40,
    help: 'Its price is the Saturday peak rate.' },
  { id: 'weddings.packages.full.desc', label: 'Package 1 description', group: 'Weddings', type: 'text', maxLength: 150 },
  { id: 'weddings.packages.reception.title', label: 'Package 2 title', group: 'Weddings', type: 'text', maxLength: 40,
    help: 'Its price is the Friday or Sunday rate.' },
  { id: 'weddings.packages.reception.desc', label: 'Package 2 description', group: 'Weddings', type: 'text', maxLength: 150 },
  { id: 'weddings.packages.small.title', label: 'Package 3 title', group: 'Weddings', type: 'text', maxLength: 40,
    help: 'Its price is the weekday full-day rate.' },
  { id: 'weddings.packages.small.desc', label: 'Package 3 description', group: 'Weddings', type: 'text', maxLength: 150 },
  { id: 'weddings.rates.intro', label: 'Rates intro', group: 'Weddings', type: 'text', maxLength: 160 },
  { id: 'weddings.includes.1', label: 'Every rate includes: item 1', group: 'Weddings', type: 'text', maxLength: 60 },
  { id: 'weddings.includes.2', label: 'Every rate includes: item 2', group: 'Weddings', type: 'text', maxLength: 60 },
  { id: 'weddings.includes.3', label: 'Every rate includes: item 3', group: 'Weddings', type: 'text', maxLength: 60 },
  { id: 'weddings.includes.4', label: 'Every rate includes: item 4', group: 'Weddings', type: 'text', maxLength: 60 },
  { id: 'weddings.includes.5', label: 'Every rate includes: item 5', group: 'Weddings', type: 'text', maxLength: 60 },
  { id: 'weddings.includes.6', label: 'Every rate includes: item 6', group: 'Weddings', type: 'text', maxLength: 60 },
  { id: 'weddings.includes.7', label: 'Every rate includes: item 7', group: 'Weddings', type: 'text', maxLength: 60 },
  { id: 'weddings.includes.not', label: 'Every rate includes: the "not included" line', group: 'Weddings', type: 'text', maxLength: 80 },
  { id: 'weddings.rehearsal.headline', label: 'Rehearsal section headline', group: 'Weddings', type: 'richtext', maxLength: 60 },
  { id: 'weddings.rehearsal.text', label: 'Rehearsal section paragraph', group: 'Weddings', type: 'text', maxLength: 420,
    help: 'Mentions the arcade next door being its own business.' },
  { id: 'weddings.vendors.intro', label: 'Preferred vendors intro', group: 'Weddings', type: 'text', maxLength: 160 },
  { id: 'weddings.vendors.catering', label: 'Vendors: catering', group: 'Weddings', type: 'text', maxLength: 40,
    help: 'Currently "List on request". A name or two fits here.' },
  { id: 'weddings.vendors.cake', label: 'Vendors: cake & sweets', group: 'Weddings', type: 'text', maxLength: 40 },
  { id: 'weddings.vendors.florals', label: 'Vendors: florals', group: 'Weddings', type: 'text', maxLength: 40 },
  { id: 'weddings.vendors.photography', label: 'Vendors: photography', group: 'Weddings', type: 'text', maxLength: 40 },
  { id: 'weddings.vendors.music', label: 'Vendors: music & DJs', group: 'Weddings', type: 'text', maxLength: 40 },
  { id: 'weddings.vendors.officiants', label: 'Vendors: officiants', group: 'Weddings', type: 'text', maxLength: 40 },
  { id: 'weddings.faq.1', label: 'Question: how many guests', group: 'Weddings', type: 'text', maxLength: 260 },
  { id: 'weddings.faq.2', label: 'Question: bringing a caterer', group: 'Weddings', type: 'text', maxLength: 260 },
  { id: 'weddings.faq.3', label: 'Question: the bar', group: 'Weddings', type: 'text', maxLength: 260 },
  { id: 'weddings.faq.4', label: 'Question: sound system', group: 'Weddings', type: 'text', maxLength: 260 },
  { id: 'weddings.faq.5', label: 'Question: holding a date', group: 'Weddings', type: 'text', maxLength: 260 },
  { id: 'weddings.faq.6', label: 'Question: event insurance', group: 'Weddings', type: 'text', maxLength: 260 },
  { id: 'weddings.faq.7', label: 'Question: parking', group: 'Weddings', type: 'text', maxLength: 260 },
  { id: 'weddings.faq.8', label: 'Question: seeing the room first', group: 'Weddings', type: 'text', maxLength: 260 },
  { id: 'weddings.closing', label: 'Closing line', group: 'Weddings', type: 'richtext', maxLength: 150,
    help: 'The large centered line under the wide photo at the bottom of the Weddings page.' },

  // ---- For your guests -------------------------------------------------------------

  { id: 'guests.headline', label: 'Guests page headline', group: 'For your guests', type: 'richtext', maxLength: 40 },
  { id: 'guests.intro', label: 'Guests page intro', group: 'For your guests', type: 'text', maxLength: 320 },
  { id: 'guests.stay.intro', label: 'Stay: intro', group: 'For your guests', type: 'text', maxLength: 160 },
  { id: 'guests.stay.1.name', label: 'Stay 1: name', group: 'For your guests', type: 'text', maxLength: 40 },
  { id: 'guests.stay.1.distance', label: 'Stay 1: street and distance', group: 'For your guests', type: 'text', maxLength: 48 },
  { id: 'guests.stay.1.desc', label: 'Stay 1: description', group: 'For your guests', type: 'text', maxLength: 160 },
  { id: 'guests.stay.1.tag', label: 'Stay 1: tag (Walkable / Drive)', group: 'For your guests', type: 'text', maxLength: 16 },
  { id: 'guests.stay.2.name', label: 'Stay 2: name', group: 'For your guests', type: 'text', maxLength: 40 },
  { id: 'guests.stay.2.distance', label: 'Stay 2: street and distance', group: 'For your guests', type: 'text', maxLength: 48 },
  { id: 'guests.stay.2.desc', label: 'Stay 2: description', group: 'For your guests', type: 'text', maxLength: 160 },
  { id: 'guests.stay.2.tag', label: 'Stay 2: tag (Walkable / Drive)', group: 'For your guests', type: 'text', maxLength: 16 },
  { id: 'guests.stay.3.name', label: 'Stay 3: name', group: 'For your guests', type: 'text', maxLength: 40 },
  { id: 'guests.stay.3.distance', label: 'Stay 3: street and distance', group: 'For your guests', type: 'text', maxLength: 48 },
  { id: 'guests.stay.3.desc', label: 'Stay 3: description', group: 'For your guests', type: 'text', maxLength: 160 },
  { id: 'guests.stay.3.tag', label: 'Stay 3: tag (Walkable / Drive)', group: 'For your guests', type: 'text', maxLength: 16 },
  { id: 'guests.eat.intro', label: 'Eat: intro', group: 'For your guests', type: 'text', maxLength: 160 },
  { id: 'guests.eat.1.name', label: 'Eat 1: name', group: 'For your guests', type: 'text', maxLength: 40 },
  { id: 'guests.eat.1.distance', label: 'Eat 1: street and distance', group: 'For your guests', type: 'text', maxLength: 48 },
  { id: 'guests.eat.1.desc', label: 'Eat 1: description', group: 'For your guests', type: 'text', maxLength: 160 },
  { id: 'guests.eat.1.tag', label: 'Eat 1: tag', group: 'For your guests', type: 'text', maxLength: 16 },
  { id: 'guests.eat.2.name', label: 'Eat 2: name', group: 'For your guests', type: 'text', maxLength: 40 },
  { id: 'guests.eat.2.distance', label: 'Eat 2: street and distance', group: 'For your guests', type: 'text', maxLength: 48 },
  { id: 'guests.eat.2.desc', label: 'Eat 2: description', group: 'For your guests', type: 'text', maxLength: 160 },
  { id: 'guests.eat.2.tag', label: 'Eat 2: tag', group: 'For your guests', type: 'text', maxLength: 16 },
  { id: 'guests.eat.3.name', label: 'Eat 3: name', group: 'For your guests', type: 'text', maxLength: 40 },
  { id: 'guests.eat.3.distance', label: 'Eat 3: street and distance', group: 'For your guests', type: 'text', maxLength: 48 },
  { id: 'guests.eat.3.desc', label: 'Eat 3: description', group: 'For your guests', type: 'text', maxLength: 160 },
  { id: 'guests.eat.3.tag', label: 'Eat 3: tag', group: 'For your guests', type: 'text', maxLength: 16 },
  { id: 'guests.getting_here.up', label: 'Getting here: getting up', group: 'For your guests', type: 'text', maxLength: 300 },
  { id: 'guests.getting_here.parking', label: 'Getting here: parking', group: 'For your guests', type: 'text', maxLength: 300 },
  { id: 'guests.getting_here.dropoff', label: 'Getting here: drop-off', group: 'For your guests', type: 'text', maxLength: 300 },

  // ---- Plan your event --------------------------------------------------------------

  { id: 'inquire.headline', label: 'Plan your event headline', group: 'Plan your event', type: 'richtext', maxLength: 40 },
  { id: 'inquire.intro', label: 'Plan your event intro', group: 'Plan your event', type: 'text', maxLength: 220,
    help: 'The sentence on the photo above the inquiry form.' },
  { id: 'inquire.thanks', label: 'Thank-you message', group: 'Plan your event', type: 'text', maxLength: 160,
    help: 'Shown after someone sends the inquiry form.' },

  // ---- Photos ----------------------------------------------------------------------

  { id: 'hero.image', label: 'Homepage main photo', group: 'Photos', type: 'image',
    help: 'Fills the whole screen behind the sign. A wide, sideways photo works best.' },
  { id: 'home.welcome.image', label: 'Homepage welcome photo (arched)', group: 'Photos', type: 'image',
    help: 'Shown with an arched top. A tall, upright photo works best.' },
  { id: 'home.welcome.image2', label: 'Homepage welcome photo (small, overlapping)', group: 'Photos', type: 'image' },
  { id: 'home.occasions.image', label: 'Homepage occasions photo (arched)', group: 'Photos', type: 'image' },
  { id: 'home.bar.image', label: 'Homepage bar photo (arched)', group: 'Photos', type: 'image' },
  { id: 'home.findus.image', label: 'Homepage door photo (arched)', group: 'Photos', type: 'image' },
  { id: 'home.cta.image', label: 'Homepage closing photo (darkened behind text)', group: 'Photos', type: 'image' },
  { id: 'room.gallery.1', label: 'Gallery photo 1', group: 'Photos', type: 'image',
    help: 'The photo grid on the homepage and on The Space page share these nine photos.' },
  { id: 'room.gallery.2', label: 'Gallery photo 2', group: 'Photos', type: 'image' },
  { id: 'room.gallery.3', label: 'Gallery photo 3', group: 'Photos', type: 'image' },
  { id: 'room.gallery.4', label: 'Gallery photo 4', group: 'Photos', type: 'image' },
  { id: 'room.gallery.5', label: 'Gallery photo 5', group: 'Photos', type: 'image' },
  { id: 'room.gallery.6', label: 'Gallery photo 6', group: 'Photos', type: 'image' },
  { id: 'room.gallery.7', label: 'Gallery photo 7', group: 'Photos', type: 'image' },
  { id: 'room.gallery.8', label: 'Gallery photo 8', group: 'Photos', type: 'image' },
  { id: 'room.gallery.9', label: 'Gallery photo 9', group: 'Photos', type: 'image' },
  { id: 'room.hero.image', label: 'The Space main photo', group: 'Photos', type: 'image' },
  { id: 'weddings.hero.image', label: 'Weddings main photo', group: 'Photos', type: 'image',
    help: 'Fills the top of the Weddings page behind the headline; it is cropped to fit.' },
  { id: 'weddings.gallery.1', label: 'Weddings pair of arched photos, left', group: 'Photos', type: 'image' },
  { id: 'weddings.gallery.2', label: 'Weddings pair of arched photos, right', group: 'Photos', type: 'image' },
  { id: 'weddings.rehearsal.image', label: 'Rehearsal section photo', group: 'Photos', type: 'image' },
  { id: 'weddings.closing.image', label: 'Weddings closing wide photo', group: 'Photos', type: 'image' },
  { id: 'pricing.hero.image', label: 'Rates page main photo', group: 'Photos', type: 'image' },
  { id: 'guests.hero.image', label: 'Guests page main photo', group: 'Photos', type: 'image' },
  { id: 'guests.getting_here.image', label: 'Guests page door photo (arched)', group: 'Photos', type: 'image' },
  { id: 'inquire.hero.image', label: 'Plan your event main photo', group: 'Photos', type: 'image' },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONTENT_SLOTS: CONTENT_SLOTS };
}
