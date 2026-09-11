/* ============================================================
   Listing editor — loads data/site.json into a friendly form;
   "Save & publish" commits the new JSON (and any uploaded
   photos) straight to the GitHub repo via the Contents API,
   and GitHub Pages redeploys automatically (~1 min).

   Your token lives only in this browser's localStorage.
   ============================================================ */
(async function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- repo + token ---------- */
  const host = location.hostname || "localhost";
  let OWNER = host.split(".")[0]; // coustang.github.io -> coustang
  if (OWNER === "localhost" || OWNER === "127.0.0.1") OWNER = localStorage.getItem("gh_owner") || "";
  const REPO = localStorage.getItem("gh_repo") || "cabin-site";
  const BRANCH = "master";
  let TOKEN = localStorage.getItem("gh_token") || "";

  function setBanner(msg, kind) {
    const b = $("#banner");
    if (!msg) { b.className = "banner"; b.textContent = ""; return; }
    b.className = "banner " + (kind || "");
    b.textContent = msg;
  }

  /* ---------- data ---------- */
  let DATA = null;      // { site, cabins } working copy
  let activeId = null;  // current cabin id in the form

  async function loadData() {
    const res = await fetch("data/site.json?ts=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load data/site.json (" + res.status + ")");
    DATA = await res.json();
  }
  const activeCabin = () => DATA.cabins.find((c) => c.id === activeId);

  /* ---------- connect ---------- */
  async function connect() {
    TOKEN = $("#token").value.trim();
    if (!TOKEN) return setBanner("Paste your GitHub token first.", "err");
    localStorage.setItem("gh_token", TOKEN);
    try {
      const r = await gh("/user");
      OWNER = r.login;
      localStorage.setItem("gh_owner", OWNER);
      $("#conn-chip").textContent = "Connected as " + r.login;
      $("#conn-chip").classList.add("ok");
      setBanner("");
    } catch (e) {
      setBanner("Connect failed: " + e.message + " — check the token has repo access to " + OWNER + "/" + REPO, "err");
    }
  }

  /* ---------- GitHub Contents API ---------- */
  async function gh(path, opts = {}) {
    const r = await fetch("https://api.github.com" + path, Object.assign({
      headers: { Authorization: "Bearer " + TOKEN, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    }, opts));
    if (!r.ok) {
      let msg = r.status;
      try { const j = await r.json(); msg = j.message || msg; } catch (_) {}
      throw new Error(msg);
    }
    return r.status === 204 ? null : r.json();
  }

  function toB64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  async function fileSha(path) {
    try {
      const j = await gh(`/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`);
      return j.sha;
    } catch (e) { return null; } // not there yet -> create
  }

  async function putFile(path, b64content, message) {
    const sha = await fileSha(path);
    const body = { message, content: b64content };
    if (sha) body.sha = sha;
    return gh(`/repos/${OWNER}/${REPO}/contents/${path}`, { method: "PUT", body: JSON.stringify(body) });
  }

  /* ---------- form rendering ---------- */
  function renderAll() {
    $("#editor").style.display = "";
    $("#bar").style.display = "";
    renderTabs();
    renderCabinForm();
    renderSiteSettings();
  }

  function renderTabs() {
    const t = $("#cabin-tabs");
    t.innerHTML = DATA.cabins.map((c) => `<button class="tab ${c.id === activeId ? "active" : ""}" data-id="${esc(c.id)}">${esc(c.name)}</button>`).join("");
    t.querySelectorAll(".tab").forEach((b) => b.onclick = () => { activeId = b.dataset.id; renderTabs(); renderCabinForm(); });
  }

  const NUM_FIELDS = ["reviews", "guests", "bedrooms"];
  const LIST_FIELDS = { amenities: "\n", description: "\n", notes: "\n" }; // textarea, one item per line
  const DIST_FIELD = "distances"; // "Place | distance" per line

  function bindFields() {
    document.querySelectorAll("[data-f]").forEach((el) => {
      el.oninput = () => {
        const c = activeCabin();
        if (!c) return;
        const f = el.dataset.f;
        if (LIST_FIELDS[f]) c[f] = el.value.split("\n").map((s) => s.trim()).filter(Boolean);
        else if (f === DIST_FIELD) {
          c.distances = el.value.split("\n").map((line) => line.split("|").map((x) => x.trim())).filter((p) => p.length >= 2 && p[0]);
        } else if (NUM_FIELDS.includes(f)) c[f] = Number(el.value) || 0;
        else c[f] = el.value;
      };
    });
    document.querySelectorAll("[data-s]").forEach((el) => {
      el.oninput = () => { DATA.site[el.dataset.s] = el.value; };
    });
    document.querySelectorAll("[data-hl]").forEach((el) => {
      el.oninput = () => { DATA.site.hospitableLinks[el.dataset.hl] = el.value; };
    });
  }

  function renderCabinForm() {
    const c = activeCabin();
    if (!c) return;
    document.querySelectorAll("[data-f]").forEach((el) => {
      const f = el.dataset.f;
      if (LIST_FIELDS[f]) el.value = (c[f] || []).join("\n");
      else if (f === DIST_FIELD) el.value = (c.distances || []).map(([p, d]) => p + " | " + d).join("\n");
      else el.value = c[f] == null ? "" : c[f];
    });
    renderHero(c);
    renderGallery(c);
  }

  function renderSiteSettings() {
    document.querySelectorAll("[data-s]").forEach((el) => { el.value = DATA.site[el.dataset.s] || ""; });
    const hlWrap = $("#hospitable-links");
    if (hlWrap && !hlWrap.children.length) {
      hlWrap.innerHTML = DATA.cabins.map((c) => `<label class="f">Hospitable pay link — ${esc(c.name)}<input type="text" data-hl="${esc(c.id)}"></label>`).join("");
    }
    document.querySelectorAll("[data-hl]").forEach((el) => { el.value = (DATA.site.hospitableLinks || {})[el.dataset.hl] || ""; });
  }

  /* ---------- photos ---------- */
  function renderHero(c) {
    const prev = $("#hero-prev");
    if (c.heroImage) { prev.src = c.heroImage; prev.style.display = ""; } else { prev.style.display = "none"; }
  }

  function renderGallery(c) {
    const g = $("#gallery");
    g.innerHTML = c.gallery.map((p, i) => `
      <div class="ph">
        <img src="${esc(p)}" alt="">
        <span class="idx">${i + 1}</span>
        <div class="ctl">
          <button data-act="left" title="Move earlier" ${i === 0 ? "disabled" : ""}>◀</button>
          <button data-act="del" title="Remove">✕</button>
          <button data-act="right" title="Move later" ${i === c.gallery.length - 1 ? "disabled" : ""}>▶</button>
        </div>
      </div>`).join("");
    g.querySelectorAll("button").forEach((b) => {
      b.onclick = () => {
        const i = [...g.children].indexOf(b.closest(".ph"));
        const act = b.dataset.act;
        if (act === "del") c.gallery.splice(i, 1);
        else if (act === "left" && i > 0) [c.gallery[i - 1], c.gallery[i]] = [c.gallery[i], c.gallery[i - 1]];
        else if (act === "right" && i < c.gallery.length - 1) [c.gallery[i + 1], c.gallery[i]] = [c.gallery[i], c.gallery[i + 1]];
        renderGallery(c);
      };
    });
  }

  /* client-side resize/compress, returns {name, b64} */
  async function processImage(file) {
    const bmp = await createImageBitmap(file);
    const maxW = 1600;
    let w = bmp.width, h = bmp.height;
    if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.82));
    const b64 = await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result.split(",")[1]); fr.readAsDataURL(blob); });
    return { name: "upload-" + Date.now() + "-" + Math.floor(Math.random() * 900 + 100) + ".jpg", b64 };
  }

  let pendingUploads = []; // {name,b64} for photos added this session

  async function addFiles(input, target) {
    const c = activeCabin();
    if (!c) return;
    for (const file of input.files) {
      try {
        const img = await processImage(file);
        if (target === "hero") c.heroImage = "images/" + img.name;
        else c.gallery.push("images/" + img.name);
        pendingUploads.push(img); // remember to commit the file itself on publish
      } catch (e) { setBanner("Couldn't process " + file.name + ": " + e.message, "err"); }
    }
    input.value = "";
    renderCabinForm();
  }

  /* ---------- publish ---------- */
  async function publish() {
    const btn = $("#publish-btn"), st = $("#pub-status");
    if (!TOKEN || !OWNER) return setBanner("Connect with your GitHub token first (top of the page).", "err");
    btn.disabled = true;
    try {
      for (const c of DATA.cabins) if (!c.name || !(c.description && c.description.length)) throw new Error("Every cabin needs a name and at least one description line.");

      // 1. commit any uploaded photos first
      for (const img of pendingUploads) {
        st.textContent = "Uploading photo " + img.name + "…";
        await putFile("images/" + img.name, img.b64, "editor: add photo " + img.name);
      }
      pendingUploads = [];

      // 2. commit the data file
      const json = JSON.stringify(DATA, null, 2);
      st.textContent = "Publishing site.json…";
      await putFile("data/site.json", toB64(json), "editor: update listings");

      setBanner("✅ Published! Your changes go live in about a minute.", "ok");
      const base = location.origin + location.pathname.replace(/admin\.html.*$/, "");
      st.innerHTML = `Live at <a href="${esc(base)}" target="_blank">${esc(base)}</a>`;
    } catch (e) {
      setBanner("Publish failed: " + e.message, "err");
      st.textContent = "";
    } finally {
      btn.disabled = false;
    }
  }

  /* ---------- init ---------- */
  bindFields();
  $("#connect-btn").onclick = connect;
  $("#token").onkeydown = (e) => { if (e.key === "Enter") connect(); };
  $("#publish-btn").onclick = publish;
  $("#hero-file").onchange = (e) => addFiles(e.target, "hero");
  $("#gal-file").onchange = (e) => addFiles(e.target, "gallery");
  $("#hero-clear").onclick = () => { const c = activeCabin(); if (c) { c.heroImage = ""; renderHero(c); } };
  $("#gal-add-url-btn").onclick = async () => {
    const url = prompt("Image URL:");
    if (!url) return;
    const c = activeCabin();
    c.gallery.push(url.trim());
    renderGallery(c);
  };

  // always load the form (preview mode); connect + enable publishing when a token is present
  try {
    await loadData();
    activeId = DATA.cabins[0].id;
    renderAll();
  } catch (e) {
    setBanner("Couldn't load site data: " + e.message, "err");
  }
  if (TOKEN) { $("#token").value = TOKEN; connect(); }
})();
