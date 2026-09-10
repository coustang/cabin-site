/* ============================================================
   SITE CONFIG — edit this file to change anything on the site.
   One object per cabin. Images live in /images (swap files, keep names).
   ============================================================ */

const SITE = {
  name: "Smoky Mountain Cabins",
  tagline: "Three unforgettable Gatlinburg-area cabins",
  // Your contact details shown on the site + used for booking-request emails
  email: "you@example.com",          // <-- REPLACE with your real email
  phone: "(865) 555-0100",           // <-- REPLACE (optional, leave "" to hide)
  addressLine: "Gatlinburg & Sevierville, Tennessee",

  /* ------------------------------------------------------------
     BOOKING MODE — how guests book on this site.
       "request" = form sends you a booking request email (works out of the box)
       "link"    = button opens your Hospitable payment link for that cabin
       "both"    = show both options in the booking card
     ------------------------------------------------------------ */
  bookingMode: "request",

  /* If bookingMode is "link" or "both": paste each cabin's Hospitable
     direct-booking / payment-link URL here (one per cabin). */
  hospitableLinks: {
    creekside: "",   // e.g. "https://pay.hospitable.com/..."
    oaks:      "",
    heaven:    ""
  },

  /* If bookingMode is "request" or "both": where request emails go. */
  bookingEmailTo: "you@example.com",  // <-- REPLACE with your real email
};

const CABINS = [
  {
    id: "creekside",
    name: "Creekside Memories",
    tagline: "2 King Suites · Hot Tub · Game Room",
    location: "Gatlinburg, TN — Chalet Village",
    distanceNote: "3 miles to Gatlinburg · 5 miles to Pigeon Forge",
    rating: "4.9",
    reviews: 226,
    guests: 6,
    bedrooms: 2,
    beds: "4 beds (2 king suites)",
    baths: "2.5 baths",
    sqft: "1,800 sq ft",
    heroImage: "images/creekside-hero.svg",
    gallery: [
      "images/creekside-1.svg",
      "images/creekside-2.svg",
      "images/creekside-3.svg",
      "images/creekside-4.svg"
    ],
    shortDesc: "A spacious 1,800 sq ft cabin right between Gatlinburg and Pigeon Forge — two king suites, hot tub, arcade game room, and creek-side peace.",
    description: [
      "Welcome to Creekside Memories, the perfect Tennessee mountain getaway. This spacious 1,800 sq ft cabin sits in the desirable Chalet Village community, right between Gatlinburg and Pigeon Forge — close enough for everything, quiet enough to unplug.",
      "Two large king suites each have their own attached bathroom for comfort and privacy. The cozy living room and vaulted game room both feature fireplaces, creating a warm atmosphere throughout the cabin."
    ],
    amenities: [
      "Hot tub", "Game room with arcade & pool table", "Air hockey",
      "2 king suites w/ private baths", "4 Roku smart TVs", "1 Gbps wifi",
      "Community pools (seasonal)", "Pickleball courts", "Washer & dryer",
      "EV charger (Level 2)", "Smart-lock self check-in", "Parking for 3–4 cars"
    ],
    distances: [
      ["Gatlinburg", "3 mi"], ["Ober Mountain", "4 mi"], ["Pigeon Forge", "5 mi"],
      ["Smoky Mtns NP", "6 mi"], ["Dollywood", "8 mi"]
    ],
    notes: [
      "Community pools open Memorial Day – Labor Day.",
      "Check-in 4 PM, check-out 10 AM. No same-day in/out on major holidays."
    ]
  },

  {
    id: "oaks",
    name: "The Oaks",
    tagline: "Wears Valley Views · Wraparound Deck · Arcade",
    location: "Sevierville, TN — Wears Valley",
    distanceNote: "7 miles to the Parkway · 9 miles to Dollywood",
    rating: "4.84",
    reviews: null,
    guests: 8,
    bedrooms: 3,
    beds: "6 beds (3 king + bunks)",
    baths: "3 baths",
    sqft: "2,400+ sq ft",
    heroImage: "images/oaks-hero.svg",
    gallery: [
      "images/oaks-1.svg",
      "images/oaks-2.svg",
      "images/oaks-3.svg",
      "images/oaks-4.svg"
    ],
    shortDesc: "A 2,400 sq ft Wears Valley retreat with stunning mountain views, a wraparound deck with swing, hot tub, and a full arcade downstairs.",
    description: [
      "Escape to The Oaks — a spacious 2,400 sq ft cabin nestled in the heart of the Tennessee mountains. Three bedrooms, three bathrooms, and a loft give family and friends plenty of room to spread out while you take in stunning views of Wears Valley from the wraparound deck.",
      "The vaulted living room has 20-foot ceilings and large windows framing the Smoky Mountains. The main floor is stair-free with a king bedroom, jetted-tub bath, and full kitchen — ideal for easy access."
    ],
    amenities: [
      "Hot tub", "Wraparound deck w/ porch swing", "Arcade (150+ games)",
      "Pool table", "3 king beds + bunk room", "Jetted tub on main floor",
      "5 Roku smart TVs", "1 Gbps wifi", "Charcoal grill",
      "Stair-free main floor", "Smart-lock self check-in", "Parking for 4–5 cars"
    ],
    distances: [
      ["Smoky Mtns NP", "7 mi"], ["Pigeon Forge Parkway", "7 mi"],
      ["Dollywood", "9 mi"], ["Gatlinburg", "12 mi"]
    ],
    notes: [
      "Some access roads are steep — 4WD or chains recommended in winter.",
      "Main floor is stair-free with ramp to deck (not fully ADA accessible)."
    ]
  },

  {
    id: "heaven",
    name: "Views from Heaven",
    tagline: "Sleeps 12 · Theater Room · Hot Tub w/ Mountain Views",
    location: "Gatlinburg, TN — Gatlinburg Falls Resort",
    distanceNote: "2 miles to Gatlinburg · 4 miles to the Park",
    rating: "4.92",
    reviews: null,
    guests: 12,
    bedrooms: 4,
    beds: "8+ beds (4 king suites + queen bunks)",
    baths: "4 baths",
    sqft: "2,700 sq ft",
    heroImage: "images/heaven-hero.svg",
    gallery: [
      "images/heaven-1.svg",
      "images/heaven-2.svg",
      "images/heaven-3.svg",
      "images/heaven-4.svg"
    ],
    shortDesc: "Our biggest cabin — 2,700 sq ft with four king suites, a home theater room, arcade, and a hot tub overlooking Mt. LeConte.",
    description: [
      "Welcome to Views from Heaven — a spacious 2,700 sq ft cabin in scenic Gatlinburg Falls Resort where you feel like you're above it all. Four king suites each with attached bathrooms make this the perfect spot for large groups, reunions, or family vacations.",
      "Entertainment is endless: a theater room with a 75\" TV and seating for nine, full-size arcade and racing games, air hockey, pool table, and TVs in nearly every room. Step outside to breathtaking views of Mt. LeConte from the expansive decks."
    ],
    amenities: [
      "Hot tub w/ mountain views", "Home theater (75\" TV, seats 9)",
      "Arcade + racing game", "Air hockey & pool table",
      "4 king suites w/ private baths", "Queen-over-queen bunks",
      "2 large decks", "HOA community pool (seasonal)",
      "Washer & dryer", "Smart-lock self check-in", "Parking for 5–6 cars"
    ],
    distances: [
      ["Gatlinburg", "2 mi"], ["Smoky Mtns NP", "4 mi"],
      ["The Island", "9 mi"], ["Dollywood", "10 mi"]
    ],
    notes: [
      "GPS may point to a nearby road — drive ~200 ft further, take the next left into the cul-de-sac.",
      "Community pool open seasonally."
    ]
  }
];
