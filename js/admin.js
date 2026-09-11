/* Listing editor — reads/writes data/site.json via GitHub Contents API */
const OWNER = "coustang", REPO = "cabin-site", BRANCH = "master";
let DATA = null, curCabin = 0, tabMode = "main";
let LOGO_DATAURL = null; // uploaded logo (data URL) until published

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- token / connection ---------- */
let TOKEN = localStorage.getItem("gh_token") || "";

function setBanner(msg, ok) { const b = $("#banner"); if (!msg) { b.className = "banner"; return; } b.textContent = msg; b.className = "banner " + (ok ? "ok" : "err"); }
async function api(path, opts = {}) {
  const r = await fetch("https://api.github.com/repos/" + OWNER + "/" + REPO + path, {
    ...opts, headers: { Authorization: "Bearer " + TOKEN, Accept: "application/vnd.github+json", ...(opts.headers || {}) }
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || ("GitHub API " + r.status));
  return r;
}

async function connect() {
  const t = $("#token").value.trim();
  if (!t) return setBanner("Paste a token first.", false);
  TOKEN = t; localStorage.setItem("gh_token", t);
  try {
    await api("/"); // verify
    const me = await (await fetch("https://api.github.com/user", { headers: { Authorization: "Bearer " + TOKEN } })).json();
    $("#conn-chip").textContent = "Connected as " + me.login; $("#conn-chip").className = "chip ok";
    setBanner("Connected. You can now Save & publish.", true);
  } catch (e) { setBanner("Token rejected: " + e.message, false); }
}

/* ---------- load data ---------- */
async function loadData() {
  const r = await fetch("data/site.json?t=" + Date.now());
  DATA = await r.json();
  buildTabs();
  switchTab(-1); // start on Main page tab
  $("#editor").style.display = ""; $("#bar").style.display = "";
}

/* ---------- tabs ---------- */
function buildTabs() {
  const wrap = $("#cabin-tabs");
  let html = `<button class="tab" data-tab="-1">🏠 Main page</button>`;
  DATA.cabins.forEach((c, i) => { html += `<button class="tab" data-tab="${i}">${esc(c.name)}</button>`; });
  wrap.innerHTML = html;
  $$("#cabin-tabs .tab").forEach(b => b.onclick = () => switchTab(+b.dataset.tab));
}

let filledMain = false, filledCabin = false;
function switchTab(i) {
  // collect any unsaved edits from the currently visible form first
  if (tabMode === "main" && filledMain) readMain();
  else if (tabMode === "cabin" && filledCabin) readCabin();
  if (i !== -1) curCabin = i; // keep last-viewed cabin even while on Main tab
  tabMode = i === -1 ? "main" : "cabin";
  $$("#cabin-tabs .tab").forEach((b, k) => b.classList.toggle("active", (k === 0 && tabMode === "main") || (k > 0 && k - 1 === curCabin)));
  $("#main-form").style.display = tabMode === "main" ? "" : "none";
  $("#cabin-form").style.display = tabMode === "cabin" ? "" : "none";
  if (tabMode === "main") { fillMain(); filledMain = true; } else { fillCabin(); filledCabin = true; }
}

/* ---------- MAIN PAGE form ---------- */
function H() { if (!DATA.site.home) DATA.site.home = {}; return DATA.site.home; }

function fillMain() {
  const s = DATA.site, h = H();
  $$("[data-s]").forEach(el => el.value = s[el.dataset.s] ?? "");
  $$("[data-h]").forEach(el => {
    const v = h[el.dataset.h];
    el.value = Array.isArray(v) ? v.join("\n") : (v ?? "");
  });
  renderLogoPrev();
  // value cards (all inputs inside one [data-vc] wrapper so readMain can find them)
  $("#value-cards").innerHTML = (h.values || []).map((v, i) => `
    <div data-vc="${i}" style="margin-bottom:14px">
      <div class="frow">
        <label class="f">Icon (emoji)<input type="text" data-vci="icon" value="${esc(v.icon)}"></label>
        <label class="f">Title<input type="text" data-vci="title" value="${esc(v.title)}"></label>
      </div>
      <label class="f" style="margin-bottom:4px">Text<textarea data-vci="text" style="min-height:60px">${esc(v.text)}</textarea></label>
    </div>`).join("") +
    `<button class="btn btn-ghost" id="vc-add">+ Add card</button>`;
  $("#vc-add").onclick = () => { h.values.push({ icon: "✨", title: "", text: "" }); fillMain(); };
  // faq (items are {q, a} objects; all inputs inside one [data-fqi] wrapper)
  $("#faq-edit").innerHTML = (h.faq || []).map((f, i) => `
    <div data-fqi="${i}" style="margin-bottom:14px">
      <label class="f" style="margin-bottom:8px">Question<input type="text" data-fqk="q" value="${esc(f.q)}"></label>
      <label class="f">Answer<textarea data-fqk="a" style="min-height:70px">${esc(f.a)}</textarea></label>
    </div>`).join("") +
    `<button class="btn btn-ghost" id="faq-add">+ Add question</button>`;
  $("#faq-add").onclick = () => { h.faq.push({ q: "New question?", a: "Answer here." }); fillMain(); };
  // hospitable links
  $("#hospitable-links").innerHTML = DATA.cabins.map(c => `<label class="f">Hospitable pay link — ${esc(c.name)}<input type="text" data-hl="${c.id}" value="${esc(s.hospitableLinks?.[c.id] || "")}"></label>`).join("");
}

function readMain() {
  const s = DATA.site;
  $$("[data-s]").forEach(el => s[el.dataset.s] = el.value);
  const h = H();
  $$("[data-h]").forEach(el => {
    const v = el.value.trim();
    if (el.tagName === "TEXTAREA" && el.dataset.h === "trustItems") h.trustItems = v.split("\n").map(x => x.trim()).filter(Boolean);
    else h[el.dataset.h] = v;
  });
  $$("#value-cards [data-vci]").forEach(el => {
    const i = +el.closest("[data-vc]").dataset.vc, k = el.dataset.vci;
    if (h.values[i]) h.values[i][k] = el.value.trim();
  });
  $$("#faq-edit [data-fqk]").forEach(el => {
    const i = +el.closest("[data-fqi]").dataset.fqi, k = el.dataset.fqk;
    if (h.faq[i]) h.faq[i][k] = el.value.trim();
  });
  $$("[data-hl]").forEach(el => { s.hospitableLinks = s.hospitableLinks || {}; s.hospitableLinks[el.dataset.hl] = el.value.trim(); });
  h.values = (h.values || []).filter(v => v.title || v.text);
  h.faq = (h.faq || []).filter(f => f.q);
  s.home = h;
}

/* ---------- logo ---------- */
function renderLogoPrev() {
  const el = $("#logo-prev");
  if (LOGO_DATAURL) el.innerHTML = `<img src="${LOGO_DATAURL}" alt="">`;
  else if (DATA.site.logo) el.innerHTML = `<img src="${esc(DATA.site.logo)}" alt="">`;
  else el.textContent = "🏔️";
}

async function fileToDataUrl(file, maxW) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, hgt = img.height;
      if (maxW && w > maxW) { hgt = Math.round(hgt * maxW / w); w = maxW; }
      const c = document.createElement("canvas"); c.width = w; c.height = hgt;
      c.getContext("2d").drawImage(img, 0, 0, w, hgt);
      res(c.toDataURL("image/jpeg", .85));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

/* ---------- CABIN form ---------- */
function C() { return DATA.cabins[curCabin]; }

function fillCabin() {
  const c = C();
  $$("[data-f]").forEach(el => {
    const k = el.dataset.f; let v = c[k];
    if (Array.isArray(v)) v = v.join("\n");
    el.value = v ?? "";
  });
  $("#hero-prev").src = c.heroImage || "images/hero.jpg";
  renderGallery();
}

function readCabin() {
  const c = C();
  $$("[data-f]").forEach(el => {
    const k = el.dataset.f, v = el.value;
    if (["description", "amenities", "notes"].includes(k)) c[k] = v.split("\n").map(x => x.trim()).filter(Boolean);
    else if (k === "distances") c.distances = v.split("\n").map(l => l.split("|")).map(p => p.map(x => x.trim())).filter(r => r[0]);
    else if (["reviews", "guests", "bedrooms"].includes(k)) c[k] = parseInt(v) || 0;
    else c[k] = v;
  });
}

function renderGallery() {
  const g = $("#gallery");
  g.innerHTML = C().gallery.map((src, i) => `
    <div class="ph" data-i="${i}">
      <img src="${esc(src)}" alt="">
      ${i === 0 ? '<span class="idx">1st</span>' : ""}
      <div class="ctl">
        <button title="Move left" data-act="l">◀</button>
        <button title="Remove" data-act="x">✕</button>
        <button title="Move right" data-act="r">▶</button>
      </div>
    </div>`).join("");
  $$("#gallery .ph button").forEach(b => b.onclick = () => {
    const i = +b.closest(".ph").dataset.i, a = b.dataset.act;
    if (a === "x") C().gallery.splice(i, 1);
    else if (a === "l" && i > 0) [C().gallery[i - 1], C().gallery[i]] = [C().gallery[i], C().gallery[i - 1]];
    else if (a === "r" && i < C().gallery.length - 1) [C().gallery[i + 1], C().gallery[i]] = [C().gallery[i], C().gallery[i + 1]];
    renderGallery();
  });
}

/* ---------- publish ---------- */
async function shaOf(path) {
  const r = await api("/contents/" + path);
  return (await r.json()).sha;
}
function dataUrlToBin(dataUrl) {
  const b64 = dataUrl.split(",")[1];
  return atob(b64);
}
async function putFile(path, content, msg, sha, isBinary) {
  // isBinary: content is a latin1 string (from atob) → btoa directly
  // text:     UTF-8 encode first so non-ASCII survives
  const b64 = isBinary ? btoa(content) : btoa(unescape(encodeURIComponent(content)));
  const body = { message: msg, content: b64, branch: BRANCH };
  if (sha) body.sha = sha;
  await api("/contents/" + path, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

async function publish() {
  const btn = $("#publish-btn");
  if (!TOKEN || !$("#conn-chip").classList.contains("ok")) return setBanner("Connect with your GitHub token first (top of page).", false);
  readMain(); readCabin();
  btn.disabled = true; $("#pub-status").textContent = "Publishing…";
  try {
    // 1) upload logo image file if a new one was picked (binary!)
    if (LOGO_DATAURL) {
      let sha = null; try { sha = await shaOf("images/logo.jpg"); } catch {}
      await putFile("images/logo.jpg", dataUrlToBin(LOGO_DATAURL), "editor: update site logo", sha, true);
      DATA.site.logo = "images/logo.jpg"; // point JSON at the uploaded file
    }
    // 2) upload any in-memory photo uploads (data URLs) as real files
    let upN = Date.now();
    for (const c of DATA.cabins) {
      if (c.heroImage && c.heroImage.startsWith("data:")) {
        const path = `images/${c.id}-up${upN++}.jpg`;
        await putFile(path, dataUrlToBin(c.heroImage), `editor: upload ${c.id} hero`, null, true);
        c.heroImage = path;
      }
      for (let gi = 0; gi < c.gallery.length; gi++) {
        const src = c.gallery[gi];
        if (!src.startsWith("data:")) continue;
        const path = `images/${c.id}-up${upN++}.jpg`;
        await putFile(path, dataUrlToBin(src), `editor: upload ${c.id} photo`, null, true);
        c.gallery[gi] = path;
      }
    }
    // 3) commit updated content (JSON is ASCII-safe via encodeURIComponent round-trip)
    let sha = null; try { sha = await shaOf("data/site.json"); } catch {}
    const jsonBin = decodeURIComponent(encodeURIComponent(JSON.stringify(DATA, null, 2)));
    await putFile("data/site.json", jsonBin, "editor: update site content", sha);
    $("#pub-status").textContent = "✅ Published! Live in ~1 minute.";
    setBanner("Published successfully.", true);
  } catch (e) {
    $("#pub-status").textContent = "";
    setBanner("Publish failed: " + e.message, false);
  } finally { btn.disabled = false; }
}

/* ---------- init ---------- */
$("#connect-btn").onclick = connect;
$("#token").onkeydown = e => { if (e.key === "Enter") connect(); };
if (TOKEN) $("#token").value = TOKEN; // prefill, user can hit Connect
$("#publish-btn").onclick = publish;

// logo upload
$("#logo-file").onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    LOGO_DATAURL = await fileToDataUrl(f, 512);
    renderLogoPrev();
    setBanner("Logo ready — hit Save & publish to make it live.", true);
  } catch { setBanner("Couldn't read that image file.", false); }
};
$("#logo-clear").onclick = () => { LOGO_DATAURL = null; DATA.site.logo = ""; renderLogoPrev(); };

// hero photo
$("#hero-file").onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try { C().heroImage = await fileToDataUrl(f, 1600); $("#hero-prev").src = C().heroImage; } catch {}
};
$("#hero-clear").onclick = () => { C().heroImage = ""; $("#hero-prev").src = "images/hero.jpg"; };

// gallery add by URL / upload
$("#gal-add-url-btn").onclick = async () => {
  const u = prompt("Paste image URL:"); if (!u) return;
  C().gallery.push(u.trim()); renderGallery();
};
$("#gal-file").onchange = async e => {
  for (const f of e.target.files) { try { C().gallery.push(await fileToDataUrl(f, 1600)); } catch {} }
  renderGallery(); e.target.value = "";
};

loadData().catch(e => setBanner("Couldn't load data/site.json: " + e.message, false));
