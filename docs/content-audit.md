# Content overlay — phase 1 audit and decisions

Phase 1 of the "owner edits her own content" plan. Done 2026-09-04. This
phase makes content **addressable** and nothing else: no database, no agent,
no admin route, no copy changes. Every slot renders its current hardcoded
value.

The full slot list, with the file and line of every place each slot is used,
is generated rather than maintained by hand:

    node scripts/check-content.js --list

Run the plain check before every commit; it fails if the config and the
pages drift apart:

    node scripts/check-content.js

## The site is not what the handoff assumed

The handoff was written for a Next.js app (server components, `next/image`,
`revalidateTag`, `npm run build`). This site is six static HTML files with
no build step, no package.json, no sanitizer, deployed to GitHub Pages by
the Actions workflow. The mechanism was adapted; the contract was kept.

| Handoff | Here | Why |
|---|---|---|
| `content.config.ts` | `content.config.js` | Nothing compiles TypeScript here. Same shape (`SlotDef`), documented with JSDoc, `require`-able from Node and loadable in a browser. |
| `<Editable id fallback>` | `data-content="<id>"` on the element; the existing markup is the fallback | No component layer exists. An attribute is the smallest render-neutral marker. |
| `<EditableImage>` | `data-content` on the `<picture>` | Overlay replaces `src`, drops the `<source>` webp variants, keeps every other attribute (`loading`, `fetchpriority`, `class`). Only `src` and `alt` are overridable; alt comes from an `<id>.alt` companion key. |
| `lib/content.ts` + cache tag | `js/content.js`: `getContentMap()` shared promise, `CACHE_TAG = 'content'` | One call per page load. Phase 2 fetches under that tag. Any failure resolves to `{}`. |
| existing sanitizer | minimal allowlist sanitizer in `js/content.js` | There was none. Richtext values are rebuilt node by node keeping only `em strong i b br`, no attributes. Nothing is ever inserted as raw HTML. |
| `npm run build` + rendered-HTML diff | `scripts/check-content.js --baseline <ref>` + browser comparison | Strips the overlay markers and proves each page is byte-identical to the baseline commit. |

**One deviation to know about:** each of the five wrapped pages now loads
`js/content.js` (deferred, ~4 KB, same origin). That is one extra local
request per page and no external calls. In phase 1 the script resolves an
empty map and writes nothing to the DOM.

## What "byte-identical" means for a static site

The pages are the rendered HTML, so the markers necessarily change the
files. The acceptance test is therefore: strip the markers and compare.
Three kinds of change exist, nothing else:

1. `data-content="…"` (and `data-content-html` on richtext) added to an
   existing element. 178 of these.
2. A bare `<span data-content="…">` wrapped around a price or number that
   sits inside running text (the homepage strip, tile prices, the rate
   table, package price lines, "Up to 250 guests"). A bare span has no
   styling anywhere in `main.css`, so inside normal inline text it is
   render-neutral. The checker strips bare spans from both sides so the
   pre-existing bare span in the notice bar cancels out.

   **One trap, found by the render comparison, not the byte check.** The
   seven homepage tile prices live in `.occ-tail`, which is a flex
   container. Wrapping only the number turned "From $4,500" into two flex
   items, and `justify-content: space-between` pushed the price to the
   middle of the row. The fix is an outer bare `<span>` around the whole
   run (`<span>From <span data-content>$4,500</span></span>`) so it stays
   one flex item, exactly like the anonymous text item it replaced. Rule
   for phase 2: never split a text run that is a direct child of a flex
   or grid container.
3. The one `<script>` line in `<head>`.

`node scripts/check-content.js --baseline 4c0667d` (the commit before this
work) passes on all five pages. The tour page is untouched.

## Slots, by group

165 slots, 190 markers on five pages. Counts per group:

| Group | Slots | Notes |
|---|---|---|
| Site-wide | 2 | Notice bar tag and message, marked on all five pages. |
| Contact | 2 | Footer address; guest capacity number. |
| Homepage | 42 | Hero headline and subheadline, occasions intro, 7 tiles × (name, description, price), tour invitation, the "downtown" section and its five scenarios. |
| Pricing | 38 | Headline, intro, six rate rows (label + value), bar section (intro, three card descriptions, the four lines where dollar figures will go, footnote), three sample packages (title, guest line, price), "what moves it", three terms. |
| The room | 10 | Headline, intro, dimensions tag, plan disclaimer, six spec values. |
| Weddings | 30 | Headline, subheadline, intro, packages (titles, descriptions), rates intro, eight "every rate includes" cells, rehearsal section, six vendor lines, closing line. |
| For your guests | 31 | Headline, intro, section intros, six places × (name, distance, description, tag), three "getting here" rows. |
| Photos | 14 | Both hero photos, seven tile photos, the downtown photo, the two-photo band, the rehearsal photo, the closing photo. |

The rate table is **one set of slots used on both pages**: `pricing.saturday`
also feeds the homepage strip and the "Ceremony & reception" package;
`pricing.frisun` and `pricing.weekday` feed the other two packages; the
labels and the off-season line are shared the same way. Change it once and
it changes everywhere, which is what the owner worksheet promises.

`maxLength` values come from the layout: the hero headline gets 56 because
the arch clips a third 76-px line; scenario titles get 28 because they are
`white-space: nowrap` beside their paragraph; tile descriptions get 120
because the grid row grows with the tallest tile; and so on. They are
generous for prose and tight for single-line labels.

## Deliberately separate, not shared

- **Tile prices** (`home.occasions.<x>.price`) are their own slots even
  where they equal a rate today, because the worksheet asks the owner to
  correct each tile individually and a graduation could reasonably start
  at a different number from the half-day rate.
- **Sample package prices** are their own slots. The corporate sample
  ($600) is 4 × the hourly rate and its "Hourly, 4 × $150" list item is not
  editable, so a change to the hourly rate leaves that card stale. Flagged
  in the slot's help text.
- **Capacity.** `venue.capacity` covers the two standalone numbers
  ("Capacity 250", "Up to 250 guests"). The number also appears inside four
  sentences (homepage subheadline, banquets tile, weddings subheadline,
  package 1 description); those are edited through their own text slots.
  The floor plan in `js/room.js` caps seat counts at 250 and 200 in code and
  is not addressable.

## Flagged and left alone

- **No phone number or email exists anywhere on the site**, so there is
  nothing to wrap. Adding one is a copy change and belongs with the owner's
  worksheet answer. `contact.address` covers the footer line only; the same
  address also lives in `config.js` (not wired to the footer), in the big
  address block on the guests page, and in the tour confirmation.
- **Notice bar** text is editable but the bar cannot be hidden. After
  opening, the owner will want it gone, which needs a visibility flag that
  the slot types do not have. Phase 2 question.
- **Guests page photo placeholders** (`<div class="img-slot">`) are not
  image slots. Turning them into photos means replacing the div with a
  `<picture>`, which is a structure change. Skipped and flagged.
- **Book a tour page**: untouched, including its headline, the confirmation
  copy (address, "what to expect", parking), and the occasion dropdown.
- **`<li>` lists** inside package and sample cards are not slots; there is
  no list type and each item would need its own id. The weddings "every
  rate includes" grid *is* wrapped because each cell is a standalone
  element and it is the master list the worksheet asks about.
- **Two richtext slots carry inline-styled spans** (`room.specs.inhouse`
  has a larger italic first sentence; `weddings.closing` has an italic
  second half). The fallback keeps that styling; an edited value can only
  use `<em>`, so the owner would lose the size change. Acceptable for
  phase 1, worth a note in the editing UI.
- **Editorial headlines** that are structural ("One room, every kind of
  gathering", "The bar is ours to run", "Three sample nights", "Three ways
  to take the room", section labels like "Occasions" and "Packages") are
  not slots. Navigation, footer links, buttons, and the strip items "Full
  bar on site / Elevator & ADA / Downtown Huntingdon" are not slots.
- **Copy inconsistency noticed, not fixed**: the homepage tile says tours
  take "Twenty minutes"; the tour page says "about thirty minutes". Both
  are now editable (`home.cta.text`; the tour page is not).
- **Venue name** already has its own mechanism (`config.js` +
  `data-venue-name` in `js/site.js`). Left as is; it is a config change,
  not content.

## Verification performed

- `node scripts/check-content.js --baseline 4c0667d`: all five pages
  byte-identical once markers are stripped; every id used; every marker in
  the config; image and richtext markers on the right elements.
- Browser comparison, baseline vs current served side by side on
  localhost, at 1440×900 and at 375×812: identical `innerText`, identical
  bounding boxes for every element (bare spans excluded on both sides),
  identical document height on all five pages; no console errors; the only
  additional request is `js/content.js`. This is the check that caught the
  flex-container trap above; the byte check alone would not have.
- No build exists to run. `node --check` passes on the two new scripts.

## Notes for phase 2 (do not build now)

- The control plane returns `Record<string, string>`; `js/content.js`
  already applies it. Money and number values are display strings; no
  formatting happens in the overlay.
- Image alt text rides on `<id>.alt`. Either list those keys in the config
  or keep the convention; the checker does not know about them.
- The notice bar needs an on/off, not a string.
- `getContentMap()` is client-side, so a value that differs from the
  fallback will paint after first render. If that flash matters, phase 2
  should inject values at deploy time (the Actions workflow can rewrite the
  HTML) rather than fetch in the browser.
