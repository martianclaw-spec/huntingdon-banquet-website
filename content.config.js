// content.config.js — the allowlist of owner-editable content.
//
// Nothing outside this list is ever editable. Each entry names one slot; the
// live page marks the matching element with data-content="<id>" and keeps the
// current wording in place as the fallback. Phase 1 has no data source, so
// every slot renders its fallback.
//
// This file is plain JavaScript (not TypeScript) because the site has no build
// step. The shape mirrors the SlotDef interface from the handoff so a later
// control-plane app can import it unchanged.
//
// Image slots: the value is a URL. A companion key "<id>.alt" (not listed
// here) may carry the replacement alt text; nothing else about an image is
// overridable.
//
// Money slots hold the display string ("$4,500"), not a number. The overlay
// does no formatting.

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

  // ---- Site-wide -------------------------------------------------------------

  { id: 'notice.label', label: 'Notice bar tag', group: 'Site-wide', type: 'text', maxLength: 24,
    help: 'The short uppercase tag at the top of every page. Currently "Opening soon".' },
  { id: 'notice.text', label: 'Notice bar message', group: 'Site-wide', type: 'text', maxLength: 140,
    help: 'Shown on every page next to the tag. Two lines at most on a phone.' },

  // ---- Contact ---------------------------------------------------------------

  { id: 'contact.address', label: 'Address in the footer', group: 'Contact', type: 'text', maxLength: 60,
    help: 'One line under the name at the bottom of every page.' },
  { id: 'venue.capacity', label: 'Guest capacity', group: 'Contact', type: 'number', maxLength: 4,
    help: 'The number on the homepage strip ("Capacity 250") and in the room specs ("Up to 250 guests"). Sentences elsewhere that mention 250 are changed on their own.' },

  // ---- Homepage --------------------------------------------------------------

  { id: 'hero.headline', label: 'Homepage headline', group: 'Homepage', type: 'richtext', maxLength: 56,
    help: 'Over the big photo. Two short lines at most; a third line runs into the curve of the arch.' },
  { id: 'hero.subheadline', label: 'Homepage subheadline', group: 'Homepage', type: 'text', maxLength: 130,
    help: 'One sentence under the headline. Three lines at most.' },

  { id: 'home.occasions.intro', label: 'Occasions intro', group: 'Homepage', type: 'text', maxLength: 200,
    help: 'The sentence under "One room, every kind of gathering".' },

  { id: 'home.occasions.weddings.name', label: 'Tile 1 name (Weddings)', group: 'Homepage', type: 'text', maxLength: 40 },
  { id: 'home.occasions.weddings.desc', label: 'Tile 1 description (Weddings)', group: 'Homepage', type: 'text', maxLength: 120 },
  { id: 'home.occasions.weddings.price', label: 'Tile 1 starting price (Weddings)', group: 'Homepage', type: 'money', maxLength: 10, confirm: true,
    help: 'Shown as "From $4,500". Enter the amount only.' },

  { id: 'home.occasions.celebrations.name', label: 'Tile 2 name (Celebrations of life)', group: 'Homepage', type: 'text', maxLength: 40 },
  { id: 'home.occasions.celebrations.desc', label: 'Tile 2 description (Celebrations of life)', group: 'Homepage', type: 'text', maxLength: 120 },
  { id: 'home.occasions.celebrations.price', label: 'Tile 2 starting price (Celebrations of life)', group: 'Homepage', type: 'money', maxLength: 10, confirm: true },

  { id: 'home.occasions.showers.name', label: 'Tile 3 name (Showers & parties)', group: 'Homepage', type: 'text', maxLength: 40 },
  { id: 'home.occasions.showers.desc', label: 'Tile 3 description (Showers & parties)', group: 'Homepage', type: 'text', maxLength: 120 },
  { id: 'home.occasions.showers.price', label: 'Tile 3 starting price (Showers & parties)', group: 'Homepage', type: 'money', maxLength: 10, confirm: true },

  { id: 'home.occasions.graduations.name', label: 'Tile 4 name (Graduations)', group: 'Homepage', type: 'text', maxLength: 40 },
  { id: 'home.occasions.graduations.desc', label: 'Tile 4 description (Graduations)', group: 'Homepage', type: 'text', maxLength: 120 },
  { id: 'home.occasions.graduations.price', label: 'Tile 4 starting price (Graduations)', group: 'Homepage', type: 'money', maxLength: 10, confirm: true },

  { id: 'home.occasions.reunions.name', label: 'Tile 5 name (Class reunions)', group: 'Homepage', type: 'text', maxLength: 40 },
  { id: 'home.occasions.reunions.desc', label: 'Tile 5 description (Class reunions)', group: 'Homepage', type: 'text', maxLength: 120 },
  { id: 'home.occasions.reunions.price', label: 'Tile 5 starting price (Class reunions)', group: 'Homepage', type: 'money', maxLength: 10, confirm: true },

  { id: 'home.occasions.banquets.name', label: 'Tile 6 name (Church & civic banquets)', group: 'Homepage', type: 'text', maxLength: 40 },
  { id: 'home.occasions.banquets.desc', label: 'Tile 6 description (Church & civic banquets)', group: 'Homepage', type: 'text', maxLength: 120 },
  { id: 'home.occasions.banquets.price', label: 'Tile 6 starting price (Church & civic banquets)', group: 'Homepage', type: 'money', maxLength: 10, confirm: true },

  { id: 'home.occasions.corporate.name', label: 'Tile 7 name (Corporate & meetings)', group: 'Homepage', type: 'text', maxLength: 40 },
  { id: 'home.occasions.corporate.desc', label: 'Tile 7 description (Corporate & meetings)', group: 'Homepage', type: 'text', maxLength: 120 },
  { id: 'home.occasions.corporate.price', label: 'Tile 7 hourly price (Corporate & meetings)', group: 'Homepage', type: 'money', maxLength: 10, confirm: true,
    help: 'Shown as "$150 / hr". Enter the amount only.' },

  { id: 'home.cta.text', label: 'Tour invitation text', group: 'Homepage', type: 'text', maxLength: 120,
    help: 'The sentence in the dark "Walk the room with us" tile. Says "Twenty minutes" today; the tour page says thirty.' },

  { id: 'home.adjacency.eyebrow', label: 'Downtown section tag', group: 'Homepage', type: 'text', maxLength: 36,
    help: 'Currently "Downtown, not a cornfield".' },
  { id: 'home.adjacency.headline', label: 'Downtown section headline', group: 'Homepage', type: 'richtext', maxLength: 60 },
  { id: 'home.adjacency.intro', label: 'Downtown section paragraph', group: 'Homepage', type: 'text', maxLength: 360,
    help: 'The paragraph about the mini golf, arcade, and tavern being separate businesses.' },

  { id: 'home.adjacency.1.name', label: 'Scenario 1 title', group: 'Homepage', type: 'text', maxLength: 28,
    help: 'Sits on one line beside its paragraph. Keep it short.' },
  { id: 'home.adjacency.1.text', label: 'Scenario 1 text', group: 'Homepage', type: 'text', maxLength: 170 },
  { id: 'home.adjacency.2.name', label: 'Scenario 2 title', group: 'Homepage', type: 'text', maxLength: 28 },
  { id: 'home.adjacency.2.text', label: 'Scenario 2 text', group: 'Homepage', type: 'text', maxLength: 170 },
  { id: 'home.adjacency.3.name', label: 'Scenario 3 title', group: 'Homepage', type: 'text', maxLength: 28 },
  { id: 'home.adjacency.3.text', label: 'Scenario 3 text', group: 'Homepage', type: 'text', maxLength: 170 },
  { id: 'home.adjacency.4.name', label: 'Scenario 4 title', group: 'Homepage', type: 'text', maxLength: 28 },
  { id: 'home.adjacency.4.text', label: 'Scenario 4 text', group: 'Homepage', type: 'text', maxLength: 170 },
  { id: 'home.adjacency.5.name', label: 'Scenario 5 title', group: 'Homepage', type: 'text', maxLength: 28 },
  { id: 'home.adjacency.5.text', label: 'Scenario 5 text', group: 'Homepage', type: 'text', maxLength: 170 },

  // ---- Pricing (rate table is shared with the Weddings page) -------------------

  { id: 'pricing.headline', label: 'Pricing page headline', group: 'Pricing', type: 'richtext', maxLength: 40 },
  { id: 'pricing.intro', label: 'Pricing page intro', group: 'Pricing', type: 'text', maxLength: 320 },

  { id: 'pricing.saturday_label', label: 'Rate 1 label', group: 'Pricing', type: 'text', maxLength: 48,
    help: 'Currently "Saturday, peak season · May–Oct". Also shown on the Weddings page.' },
  { id: 'pricing.saturday', label: 'Saturday peak rate', group: 'Pricing', type: 'money', maxLength: 10, confirm: true,
    help: 'Used in four places: the homepage strip, the pricing table, and the Weddings page package and rate table.' },
  { id: 'pricing.frisun_label', label: 'Rate 2 label', group: 'Pricing', type: 'text', maxLength: 48,
    help: 'Currently "Friday or Sunday". Also shown on the Weddings page.' },
  { id: 'pricing.frisun', label: 'Friday or Sunday rate', group: 'Pricing', type: 'money', maxLength: 10, confirm: true,
    help: 'Also the "Reception only" wedding package price.' },
  { id: 'pricing.weekday_label', label: 'Rate 3 label', group: 'Pricing', type: 'text', maxLength: 48,
    help: 'Currently "Weekday, full day". Also shown on the Weddings page.' },
  { id: 'pricing.weekday', label: 'Weekday full-day rate', group: 'Pricing', type: 'money', maxLength: 10, confirm: true,
    help: 'Also the "Small wedding" package price.' },
  { id: 'pricing.halfday_label', label: 'Rate 4 label', group: 'Pricing', type: 'text', maxLength: 48,
    help: 'Currently "Half day, up to 5 hours".' },
  { id: 'pricing.halfday', label: 'Half-day rate', group: 'Pricing', type: 'money', maxLength: 10, confirm: true },
  { id: 'pricing.hourly_label', label: 'Rate 5 label', group: 'Pricing', type: 'text', maxLength: 48,
    help: 'Currently "Hourly, DIY · 3-hour minimum".' },
  { id: 'pricing.hourly', label: 'Hourly rate', group: 'Pricing', type: 'money', maxLength: 10, confirm: true,
    help: 'Shown as "$150 / hr". The corporate sample package ($600, "4 × $150") does not update on its own.' },
  { id: 'pricing.offseason_label', label: 'Off-season label', group: 'Pricing', type: 'text', maxLength: 48,
    help: 'Currently "January–April". Also shown on the Weddings page.' },
  { id: 'pricing.offseason_discount', label: 'Off-season discount', group: 'Pricing', type: 'text', maxLength: 12, confirm: true,
    help: 'Currently "20% off". Asks for confirmation like a price because it changes what people pay.' },

  { id: 'pricing.bar.intro', label: 'Bar section intro', group: 'Pricing', type: 'text', maxLength: 320,
    help: 'The paragraph under "The bar is ours to run".' },
  { id: 'pricing.bar.hourly.desc', label: 'Hosted per hour: description', group: 'Pricing', type: 'text', maxLength: 200 },
  { id: 'pricing.bar.beer_wine_rate', label: 'Hosted per hour: beer & wine rate line', group: 'Pricing', type: 'text', maxLength: 40,
    help: 'Currently "Per guest / hour" with no number. This is where the beer & wine figure goes.' },
  { id: 'pricing.bar.full_bar_rate', label: 'Hosted per hour: full bar rate line', group: 'Pricing', type: 'text', maxLength: 40,
    help: 'Currently "Per guest / hour · spirits added". This is where the full bar figure goes.' },
  { id: 'pricing.bar.consumption.desc', label: 'Hosted on consumption: description', group: 'Pricing', type: 'text', maxLength: 220 },
  { id: 'pricing.bar.minimum', label: 'Hosted on consumption: minimum line', group: 'Pricing', type: 'text', maxLength: 24,
    help: 'Currently "Set your minimum". This is where a minimum figure goes.' },
  { id: 'pricing.bar.minimum_note', label: 'Hosted on consumption: note under the minimum', group: 'Pricing', type: 'text', maxLength: 40 },
  { id: 'pricing.bar.cash.desc', label: 'Cash bar: description', group: 'Pricing', type: 'text', maxLength: 200 },
  { id: 'pricing.bar.note', label: 'Bar footnote', group: 'Pricing', type: 'text', maxLength: 200,
    help: 'The line about rates being confirmed at booking and mixing models.' },

  { id: 'pricing.samples.intro', label: 'Sample packages intro', group: 'Pricing', type: 'text', maxLength: 200 },
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
    help: 'Today this is 4 hours × the hourly rate. The "4 × $150" line in the card is not editable.' },

  { id: 'pricing.moves.statement', label: '"What moves it" statement', group: 'Pricing', type: 'text', maxLength: 60 },
  { id: 'pricing.moves.text', label: '"What moves it" paragraph', group: 'Pricing', type: 'text', maxLength: 420 },

  { id: 'pricing.terms.reservation_fee', label: 'Terms: reservation fee', group: 'Pricing', type: 'text', maxLength: 260 },
  { id: 'pricing.terms.insurance', label: 'Terms: event insurance', group: 'Pricing', type: 'text', maxLength: 260 },
  { id: 'pricing.terms.food', label: 'Terms: food and catering', group: 'Pricing', type: 'text', maxLength: 260 },

  // ---- The room ----------------------------------------------------------------

  { id: 'room.headline', label: 'Room page headline', group: 'The room', type: 'richtext', maxLength: 40 },
  { id: 'room.intro', label: 'Room page intro', group: 'The room', type: 'text', maxLength: 320 },
  { id: 'room.dimensions', label: 'Dimensions tag by the floor plan', group: 'The room', type: 'text', maxLength: 40,
    help: 'Currently "80′ × 50′ · 4,500 sq ft".' },
  { id: 'room.plan_note', label: 'Floor plan disclaimer', group: 'The room', type: 'text', maxLength: 220,
    help: 'The "Illustrative — the room is mid-renovation" line under the drawing.' },
  { id: 'room.specs.dimensions', label: 'Specs: dimensions', group: 'The room', type: 'text', maxLength: 120 },
  { id: 'room.specs.access', label: 'Specs: access', group: 'The room', type: 'text', maxLength: 120 },
  { id: 'room.specs.included', label: 'Specs: included with the room', group: 'The room', type: 'text', maxLength: 200 },
  { id: 'room.specs.inhouse', label: 'Specs: in-house (bar, sound, projection)', group: 'The room', type: 'richtext', maxLength: 220,
    help: 'The first sentence is set larger and italic today. An edited version renders in plain text unless italics are used.' },
  { id: 'room.specs.catering', label: 'Specs: catering', group: 'The room', type: 'text', maxLength: 260 },
  { id: 'room.specs.parking', label: 'Specs: parking and load-in', group: 'The room', type: 'text', maxLength: 300 },

  // ---- Weddings ------------------------------------------------------------------

  { id: 'weddings.hero.headline', label: 'Weddings headline', group: 'Weddings', type: 'richtext', maxLength: 56,
    help: 'Over the big photo. Sits on one line at desktop today; two lines at most.' },
  { id: 'weddings.hero.subheadline', label: 'Weddings subheadline', group: 'Weddings', type: 'text', maxLength: 130 },
  { id: 'weddings.intro.statement', label: 'Weddings intro statement', group: 'Weddings', type: 'text', maxLength: 140,
    help: 'The large line "Ceremony by the windows, dinner on the floor…".' },
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
  { id: 'weddings.closing', label: 'Closing line (the building\'s history)', group: 'Weddings', type: 'richtext', maxLength: 150,
    help: 'The large centered line at the bottom of the Weddings page.' },

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

  // ---- Photos ----------------------------------------------------------------------

  { id: 'hero.image', label: 'Homepage photo', group: 'Photos', type: 'image',
    help: 'Wide landscape shot; it fills the arch and is cropped to fit.' },
  { id: 'home.occasions.weddings.image', label: 'Tile 1 photo (Weddings)', group: 'Photos', type: 'image' },
  { id: 'home.occasions.celebrations.image', label: 'Tile 2 photo (Celebrations of life)', group: 'Photos', type: 'image' },
  { id: 'home.occasions.showers.image', label: 'Tile 3 photo (Showers & parties)', group: 'Photos', type: 'image' },
  { id: 'home.occasions.graduations.image', label: 'Tile 4 photo (Graduations)', group: 'Photos', type: 'image' },
  { id: 'home.occasions.reunions.image', label: 'Tile 5 photo (Class reunions)', group: 'Photos', type: 'image' },
  { id: 'home.occasions.banquets.image', label: 'Tile 6 photo (Church & civic banquets)', group: 'Photos', type: 'image' },
  { id: 'home.occasions.corporate.image', label: 'Tile 7 photo (Corporate & meetings)', group: 'Photos', type: 'image' },
  { id: 'home.adjacency.image', label: 'Downtown section photo', group: 'Photos', type: 'image' },
  { id: 'weddings.hero.image', label: 'Weddings page photo', group: 'Photos', type: 'image',
    help: 'Wide landscape shot; it fills the arch and is cropped to fit.' },
  { id: 'weddings.gallery.1', label: 'Weddings photo band, left', group: 'Photos', type: 'image' },
  { id: 'weddings.gallery.2', label: 'Weddings photo band, right', group: 'Photos', type: 'image' },
  { id: 'weddings.rehearsal.image', label: 'Rehearsal section photo', group: 'Photos', type: 'image' },
  { id: 'weddings.closing.image', label: 'Weddings closing photo', group: 'Photos', type: 'image' },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONTENT_SLOTS: CONTENT_SLOTS };
}
