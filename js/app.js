/* ============================================================
   App logic: loads data/site.json, renders cabins, handles
   #/cabin/<id> routes and the booking request form.
   No build step required. Edit listings via /admin.html.
   ============================================================ */

let SITE = null;
let CABINS = [];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

function cabinById(id) { return CABINS.find(c => c.id === id); }

/* ---------- data loading ---------- */
async function loadData() {
  const res = await fetch("data/site.json?ts=" + Date.now(), { cache: "no-store" });
  if (!res.ok) throw new Error("site.json HTTP " + res.status);
  const d = await res.json();
  SITE = d.site;
  CABINS = d.cabins || [];
}

/* ---------- shared UI bits ---------- */
function ratingBadge(c) {
  const star = "★";
  return `<span class="badge-rating">${star} ${c.rating}${c.reviews ? ` · ${c.reviews}` : ""}</span>`;
}

function specsRow(c) {
  return `<div class="specs">
    <span>👥 ${c.guests} guests</span><span>🛏️ ${c.bedrooms} BR</span>
    <span>🚿 ${c.baths}</span><span>📐 ${c.sqft}</span></div>`;
}

function amenityList(c) {
  return `<ul class="amenities">${c.amenities.map(a => `<li>${a}</li>`).join("")}</ul>`;
}

function distanceList(c) {
  return `<ul class="dist-list">${c.distances.map(([place, d]) =>
    `<li><span>${place}</span><span class="d">${d}</span></li>`).join("")}</ul>`;
}

/* ---------- booking card (used on cabin pages) ---------- */
function bookingCard(c) {
  const mode = SITE.bookingMode;
  const link = SITE.hospitableLinks[c.id];
  let html = `<div class="book-card">
    <h3>Book ${c.name}</h3>
    <p class="book-rate"><b>$—</b>/night · sleeps ${c.guests} · check-in 4 PM / out 10 AM</p>`;

  if (mode === "link" && link) {
    html += `<a class="btn btn-primary" href="${link}" target="_blank" rel="noopener">Check availability &amp; book →</a>
      <p class="book-note">You'll be taken to our secure booking page.</p>`;
  } else if (mode === "both") {
    html += `<form data-booking-form="${c.id}">${requestFields(c)}</form>
      ${link ? `<div class="divider-or">or</div><a class="btn btn-primary" href="${link}" target="_blank" rel="noopener">Pay online now →</a>` : ""}`;
  } else {
    html += `<form data-booking-form="${c.id}">${requestFields(c)}</form>
      <p class="book-note">We'll confirm availability within a few hours.</p>`;
  }

  if (SITE.phone) {
    html += `<div class="divider-or">questions?</div><a class="btn btn-outline" href="tel:${SITE.phone.replace(/\D/g, "")}">${SITE.phone}</a>`;
  }
  html += `</div>`;
  return html;
}

function requestFields(c) {
  const today = new Date().toISOString().split("T")[0];
  return `
    <div class="field"><label for="${c.id}-name">Your name</label>
      <input id="${c.id}-name" type="text" required placeholder="Full name"></div>
    <div class="field"><label for="${c.id}-email">Email</label>
      <input id="${c.id}-email" type="email" required placeholder="you@email.com"></div>
    <div class="date-row">
      <div class="field"><label for="${c.id}-in">Check-in</label>
        <input id="${c.id}-in" type="date" min="${today}" required></div>
      <div class="field"><label for="${c.id}-out">Check-out</label>
        <input id="${c.id}-out" type="date" min="${today}" required></div>
    </div>
    <div class="field"><label for="${c.id}-guests">Guests</label>
      <select id="${c.id}-guests">${Array.from({length: c.guests}, (_, i) => `<option>${i + 1}</option>`).join("")}</select></div>
    <div class="field"><label for="${c.id}-msg">Anything we should know? (optional)</label>
      <textarea id="${c.id}-msg" rows="2" placeholder="Arrival time, special requests…"></textarea></div>
    <button class="btn btn-wood" type="submit">Send booking request</button>`;
}

/* ---------- pages ---------- */
function renderHome() {
  document.title = `${SITE.name} — Direct Booking`;
  const cards = CABINS.map(c => `
    <article class="card">
      <a href="#/cabin/${c.id}" style="display:block;color:inherit">
        <div class="card-media">
          ${ratingBadge(c)}
          <span class="badge-tag">${c.guests} guests</span>
          <img src="${c.heroImage}" alt="${c.name}" loading="lazy" onerror="this.style.display='none'">
        </div>
      </a>
      <div class="card-body">
        <div class="card-loc">${c.location}</div>
        <h3><a href="#/cabin/${c.id}">${c.name}</a></h3>
        ${specsRow(c)}
        <p class="card-desc">${c.shortDesc}</p>
        <div class="card-foot">
          <span class="price-note">Book direct</span>
          <a class="btn btn-primary" href="#/cabin/${c.id}">View &amp; book</a>
        </div>
      </div>
    </article>`).join("");

  return `
  <section class="hero">
    <div class="hero-bg" style="background-image:url('images/hero.jpg')"></div>
    <div class="hero-inner">
      <p class="eyebrow" style="color:#e8d9c3">${SITE.addressLine}</p>
      <h1>${SITE.tagline}</h1>
      <p class="sub">Skip the fees. Book direct with us and get a personal touch, fast answers, and the same great cabins you'd find on Airbnb.</p>
      <div class="hero-actions">
        <a class="btn btn-wood" href="#cabins">Browse our cabins</a>
        ${SITE.phone ? `<a class="btn btn-ghost-light" href="tel:${SITE.phone.replace(/\D/g, '')}">${SITE.phone}</a>` : ""}
      </div>
      <div class="trust-row">
        <span><b>Superhost</b>-rated cabins</span>
        <span><b>4.9★</b> average guest rating</span>
        <span><b>Self check-in</b> smart locks</span>
      </div>
    </div>
  </section>

  <section class="block" id="cabins">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow">Choose your cabin</p>
        <h2>Three cabins, one mountain standard</h2>
        <p>Every cabin is fully equipped, fast-wifi'd, and minutes from Gatlinburg, Pigeon Forge, Dollywood, and the Smoky Mountains.</p>
      </div>
      <div class="cabin-grid">${cards}</div>
    </div>
  </section>

  <section class="block alt" id="why-direct">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow">Why book direct</p>
        <h2>The same cabins, a better experience</h2>
      </div>
      <div class="value-grid">
        <div class="value-card"><div class="ico">💸</div><h3>No booking fees</h3><p>Book straight with us and keep the money you'd pay in platform service fees.</p></div>
        <div class="value-card"><div class="ico">⚡</div><h3>Faster answers</h3><p>Talk to a real human who knows these cabins inside and out — we reply fast, usually within the hour.</p></div>
        <div class="value-card"><div class="ico">🎁</div><h3>Host perks</h3><p>Loyal guests get first pick of dates, flexible requests, and local tips you won't find in a listing.</p></div>
      </div>
    </div>
  </section>

  <section class="block">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow">Location</p>
        <h2>In the heart of it all</h2>
        <p>All three cabins sit between Gatlinburg and Pigeon Forge — minutes from the Parkway, Dollywood, and Great Smoky Mountains National Park.</p>
      </div>
      ${CABINS.map(c => `
        <div class="card" style="margin-bottom:20px">
          <div class="card-body" style="padding:24px 26px">
            <h3>${c.name} — <span style="font-size:.8em;color:var(--wood-dark)">${c.location}</span></h3>
            ${distanceList(c)}
          </div>
        </div>`).join("")}
    </div>
  </section>

  <section class="block alt" id="faq">
    <div class="wrap" style="max-width:760px">
      <div class="section-head"><p class="eyebrow">Good to know</p><h2>Frequently asked</h2></div>
      ${faqItems()}
    </div>
  </section>`;
}

function faqItems() {
  const items = [
    ["What's the check-in and check-out time?", "Check-in is from 4:00 PM, check-out by 10:00 AM. All cabins have smart-lock self check-in — you'll get your door code by email before arrival."],
    ["Is booking direct really cheaper than Airbnb?", "You avoid the platform's guest service fees, and we're happy to work with you on longer stays or special dates. The cabin experience is exactly the same."],
    ["Can I pay online?", SITE.bookingMode === "request" ? "Send a booking request and we'll confirm availability quickly, then follow up with payment details. We can also set up secure online payment links for your stay." : "Yes — use the 'Pay online now' button to book instantly through our secure payment page."],
    ["Are pets allowed?", "Please mention any pets in your booking request so we can confirm what works for that cabin and date."],
    ["What's the cancellation policy?", "It depends on how close you are to check-in. We'll include the exact policy with every confirmation — just ask when you book."]
  ];
  return items.map(([q, a]) => `
    <div class="faq-item">
      <h3>${q}</h3>
      <p style="display:none">${a}</p>
    </div>`).join("");
}

function renderCabin(id) {
  const c = cabinById(id);
  if (!c) return renderHome(); // unknown id → home
  document.title = `${c.name} — ${SITE.name}`;
  const galleryImgs = [c.heroImage, ...c.gallery].map((src, i) =>
    `<img class="${i === 0 ? "wide" : ""}" src="${src}" alt="${c.name}" loading="lazy" onerror="this.style.display='none'">`).join("");

  return `
  <div class="breadcrumb"><a href="#/">← All cabins</a></div>
  <section class="cabin-hero">
    <div class="hero-bg" style="background-image:url('${c.heroImage}')"></div>
    <div class="wrap hero-inner" style="padding:120px 24px 70px">
      ${ratingBadge(c).replace("badge-rating", "badge-rating").replace(/<span/, '<span style="position:static;display:inline-block;margin-bottom:14px"')}
      <h1>${c.name}</h1>
      <p class="sub">${c.tagline} · ${c.location}</p>
    </div>
  </section>

  <section class="block">
    <div class="wrap detail-grid">
      <div>
        <div class="specs" style="margin-bottom:18px;font-size:1rem">
          <span>👥 ${c.guests} guests</span><span>🛏️ ${c.bedrooms} bedrooms · ${c.beds}</span>
          <span>🚿 ${c.baths}</span><span>📐 ${c.sqft}</span>
        </div>
        ${c.description.map(p => `<p style="font-size:1.05rem">${p}</p>`).join("")}

        <h3 style="margin-top:28px">What this place offers</h3>
        ${amenityList(c)}

        <h3 style="margin-top:28px">Getting around</h3>
        ${distanceList(c)}

        <div class="gallery">${galleryImgs}</div>

        <h3 style="margin-top:28px">Good to know</h3>
        <ul class="amenities" style="grid-template-columns:1fr 1fr">${c.notes.map(n => `<li>${n}</li>`).join("")}</ul>
      </div>
      <div>${bookingCard(c)}</div>
    </div>
  </section>`;
}

/* ---------- router ---------- */
function route() {
  const m = location.hash.match(/^#\/cabin\/([\w-]+)/);
  const main = $("#page");
  if (m) {
    main.innerHTML = renderCabin(m[1]);
    window.scrollTo(0, 0);
  } else {
    main.innerHTML = renderHome();
  }
  bindFaq();
  bindBookingForms(); // re-bind any newly rendered forms (idempotent)
}

function bindFaq() {
  $$(".faq-item h3").forEach(h => {
    h.addEventListener("click", () => {
      const item = h.parentElement;
      const p = $("p", item);
      const open = item.classList.toggle("open");
      p.style.display = open ? "block" : "none";
    });
  });
}

/* ---------- booking form → mailto (works on any static host) ---------- */
function bindBookingForms() {
  $$("[data-booking-form]").forEach(form => {
    if (form.dataset.bound) return;
    form.dataset.bound = "1";
    const id = form.dataset.bookingForm;
    const c = cabinById(id);
    form.addEventListener("submit", e => {
      e.preventDefault();
      const val = sel => $(sel, form).value.trim();
      const name = val(`#${id}-name`), email = val(`#${id}-email`);
      const cin = val(`#${id}-in`), cout = val(`#${id}-out`);
      if (!cin || !cout) { toast("Please pick your dates"); return; }
      if (new Date(cout) <= new Date(cin)) { toast("Check-out must be after check-in"); return; }
      const guests = val(`#${id}-guests`), msg = val(`#${id}-msg`);

      const subject = `Booking request: ${c.name} — ${cin} to ${cout}`;
      const body = [
        `Cabin: ${c.name}`,
        `Check-in: ${cin}`,
        `Check-out: ${cout}`,
        `Guests: ${guests}`,
        `Name: ${name}`,
        `Email: ${email}`,
        msg ? `Notes: ${msg}` : "",
        "",
        "— sent from the direct-booking website"
      ].filter(Boolean).join("\n");

      const to = SITE.bookingEmailTo || SITE.email;
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast("Opening your email app — hit send and we're on it! 🏔️");
    });
  });
}

/* ---------- misc UI ---------- */
let toastTimer;
function toast(msg) {
  let t = $(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}

function initNav() {
  const btn = $(".menu-btn");
  if (btn) btn.addEventListener("click", () => $(".nav-links").classList.toggle("open"));
  $$(".nav-links a").forEach(a => a.addEventListener("click", () => $(".nav-links").classList.remove("open")));
}

function wireChrome() {
  document.getElementById("brand-name").textContent = SITE.name;
  const fe = document.getElementById("foot-email");
  fe.textContent = SITE.email; fe.href = "mailto:" + SITE.email;
  const fp = document.getElementById("foot-phone");
  if (SITE.phone) { fp.textContent = SITE.phone; fp.href = "tel:" + SITE.phone.replace(/\D/g, ""); }
  else { fp.style.display = "none"; }
  const fc = document.getElementById("foot-cabins");
  if (fc) fc.innerHTML = CABINS.map(c => `<a href="#/cabin/${c.id}">${c.name}</a>`).join("");
  document.getElementById("year").textContent = new Date().getFullYear();
}

/* ---------- boot ---------- */
window.addEventListener("hashchange", route);
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadData();
  } catch (err) {
    $("#page").innerHTML = `<div class="wrap" style="padding:80px 24px;text-align:center">
      <h1>Site data missing</h1><p>Could not load <code>data/site.json</code>. If you're opening this file directly from disk, serve it instead (e.g. <code>python -m http.server</code>) — the live site is unaffected.</p></div>`;
    return;
  }
  wireChrome();
  initNav();
  route();
});
