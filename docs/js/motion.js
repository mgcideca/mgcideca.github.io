/* MGCI DECA Training League — motion (v9)
   The moving parts, added on top of the site without changing how it works:
   - a background "scene" for each page (the shapes glide to new spots when you change page)
   - a quiet "focus" scene while someone is taking an exam
   - page transitions, scroll reveals, numbers that count up, the sliding menu highlight
   - the floating header, and the landing-page extras (title, moving band, tilting cards)
   It only reads the page app.js draws. If this file is missing or breaks, the site still works.
   Anyone whose device asks for reduced motion gets the scenes without the movement. */
(function () {
  "use strict";
  const root = document.documentElement;
  const app = document.getElementById("app");
  if (!app) return;
  const reduce = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  const still = () => reduce.matches;
  if (!still()) root.classList.add("motion");

  const AREAS = ["Marketing", "Finance", "Hospitality + Tourism", "Business Management", "Entrepreneurship",
    "Personal Financial Literacy", "Roleplays", "Exam practice", "Provincials"];

  let lastKey = null;
  let lastEnter = 0;
  let pillPos = null; // where the menu highlight was last drawn, so it can slide from there
  let io = null;

  const route = () => (location.hash.replace(/^#\/?/, "") || "home").split("?")[0];

  function scene() {
    if (app.querySelector(".entry")) return "landing";
    if (app.querySelector(".quiz")) return "focus";
    const r = route();
    if (r.startsWith("report-")) return "calm";
    return { home: "home", leaderboards: "boards", practice: "practice", me: "calm", exec: "work", admin: "work" }[r] || "home";
  }

  // What counts as "a different page" (gets the full entrance) vs. a redraw of the same one.
  function pageKey() {
    if (app.querySelector(".entry")) return "entry";
    const extra = app.querySelector(".quiz") ? ":quiz" : app.querySelector(".results") ? ":results" : "";
    return route() + extra;
  }
  function tabKey() {
    const t = app.querySelector('.tabs [aria-selected="true"]');
    return t ? t.textContent : "";
  }
  let lastTab = "";

  /* ---------- after every draw of the page ---------- */
  function onRender() {
    const page = app.querySelector("main.page");
    if (!page || page.querySelector(":scope > .loading")) return;
    root.dataset.scene = scene();
    root.classList.remove("is-leaving");
    placePill();

    const key = pageKey();
    const tab = tabKey();
    const now = performance.now();
    if (key !== lastKey || now - lastEnter < 300) {
      // a new page, or a second draw right after one (data arriving): play the entrance
      if (key !== lastKey) lastEnter = now;
      lastKey = key; lastTab = tab;
      enter(page, "enter");
    } else if (tab !== lastTab) {
      lastTab = tab;
      enter(page, "tab-enter");
    }
  }

  function enter(page, cls) {
    if (still()) return;
    let i = 0;
    for (const el of page.children) el.style.setProperty("--i", Math.min(i++, 8));
    page.querySelectorAll(".standings tbody tr").forEach((tr, n) => tr.style.setProperty("--r", Math.min(n, 16)));
    page.classList.add(cls);
    if (cls === "enter") {
      landing(page);
      countUps(page);
    }
    reveals(page);
  }

  /* ---------- numbers count up from zero ---------- */
  function countUps(page) {
    page.querySelectorAll(".you-rank .big, .figures dd, .result-score .big, .report-score .big, .report-total b").forEach((el, n) => {
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walk.nextNode()) && !/\d/.test(node.nodeValue)) { /* find the first number */ }
      if (!node) return;
      const text = node.nodeValue;
      const m = text.match(/\d[\d,]*(\.\d+)?/);
      if (!m) return;
      const target = parseFloat(m[0].replace(/,/g, ""));
      const decimals = m[1] ? m[1].length - 1 : 0;
      const before = text.slice(0, m.index), after = text.slice(m.index + m[0].length);
      const t0 = performance.now() + 150 + n * 60, dur = 1100;
      const tick = (t) => {
        if (!node.isConnected) return;
        const p = Math.max(0, Math.min(1, (t - t0) / dur));
        const eased = 1 - Math.pow(1 - p, 3);
        node.nodeValue = before + (target * eased).toFixed(decimals) + after;
        if (p < 1) requestAnimationFrame(tick);
      };
      node.nodeValue = before + (0).toFixed(decimals) + after;
      requestAnimationFrame(tick);
    });
  }

  /* ---------- things below the fold rise in when scrolled to ---------- */
  function reveals(page) {
    if (!("IntersectionObserver" in window)) return;
    if (io) io.disconnect();
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    const fold = window.innerHeight * 0.95;
    const items = page.querySelectorAll(".panel, .block, .side-block, .explainer, .figures, a.rp-row, .pi-area, .rep-block, .report-sec, .report-overall, .q-note, .rp-list, .review li, .entry-rules div");
    let n = 0;
    items.forEach((el) => {
      if (el.parentElement.closest(".rv")) return; // already moving with its parent
      const r = el.getBoundingClientRect();
      if (r.top < fold) return; // on screen already: the entrance covers it
      el.classList.add("rv");
      el.style.setProperty("--rd", (n++ % 3) * 70 + "ms");
      io.observe(el);
    });
    // never leave anything hidden if something goes wrong
    setTimeout(() => page.querySelectorAll(".rv:not(.in)").forEach((el) => { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in"); }), 1500);
  }

  /* ---------- landing page extras ---------- */
  function landing(page) {
    const title = page.querySelector(".entry-title");
    if (title && !title.querySelector(".w")) {
      let w = 0;
      Array.from(title.childNodes).forEach((node) => {
        if (node.nodeType !== 3 || !node.nodeValue.trim()) return;
        const frag = document.createDocumentFragment();
        node.nodeValue.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const s = document.createElement("span");
          s.className = "w"; s.style.setProperty("--w", w++); s.textContent = part;
          frag.appendChild(s);
        });
        node.replaceWith(frag);
      });
    }
    const main = page.querySelector(".entry:not(.single) .entry-main");
    if (main && !page.querySelector(".marquee")) {
      const items = AREAS.map((a) => `<span>${a}</span>`).join("");
      main.insertAdjacentHTML("afterend", `<div class="marquee" aria-hidden="true"><div class="marquee-track">${items}${items}</div></div>`);
    }
    page.querySelectorAll(".entry-rules div").forEach((d, n) => d.style.setProperty("--c", n));
  }

  // feature cards on the landing page tilt toward the pointer
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest && e.target.closest(".entry-rules div");
    if (!card || still()) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty("--rx", (-y * 6).toFixed(2) + "deg");
    card.style.setProperty("--ry", (x * 8).toFixed(2) + "deg");
  });
  document.addEventListener("pointerout", (e) => {
    const card = e.target.closest && e.target.closest(".entry-rules div");
    if (card && !card.contains(e.relatedTarget)) { card.style.removeProperty("--rx"); card.style.removeProperty("--ry"); }
  });

  /* ---------- the sliding menu highlight ---------- */
  function linkPos(a) { return { left: a.offsetLeft, width: a.offsetWidth }; }
  function placePill() {
    const nav = app.querySelector("nav.nav");
    if (!nav) { pillPos = null; return; }
    const cur = nav.querySelector('a[aria-current="page"]');
    if (!cur) return;
    const pill = document.createElement("span");
    pill.className = "nav-pill";
    nav.prepend(pill);
    nav.classList.add("has-pill");
    const to = linkPos(cur);
    const from = pillPos && !still() ? pillPos : to;
    pill.style.transition = "none";
    pill.style.left = from.left + "px"; pill.style.width = from.width + "px";
    pill.getBoundingClientRect(); // lock in the start position
    pill.style.transition = "";
    pill.style.left = to.left + "px"; pill.style.width = to.width + "px";
    pillPos = to;
  }

  /* ---------- leaving a page: fade the old one, slide the highlight, then switch ---------- */
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || !app.contains(a) || a.hasAttribute("data-action") || still()) return;
    const to = a.getAttribute("href");
    if (to === location.hash || (to === "#home" && !location.hash)) return;
    e.preventDefault();
    const nav = a.closest("nav.nav");
    const pill = nav && nav.querySelector(".nav-pill");
    if (pill) { const p = linkPos(a); pill.style.left = p.left + "px"; pill.style.width = p.width + "px"; pillPos = p; }
    root.classList.add("is-leaving");
    setTimeout(() => { location.hash = to; }, 190);
    setTimeout(() => root.classList.remove("is-leaving"), 900); // safety
  }, true);

  /* ---------- floating header, and shapes that follow the pointer and the scroll ---------- */
  let px = 0, py = 0, sy = 0, queued = false;
  function paint() {
    queued = false;
    const calm = root.dataset.scene === "focus" || root.dataset.scene === "work" || still();
    root.style.setProperty("--px", (calm ? 0 : px).toFixed(1) + "px");
    root.style.setProperty("--py", (calm ? 0 : py).toFixed(1) + "px");
    root.style.setProperty("--sy", (calm ? 0 : sy).toFixed(1) + "px");
  }
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  window.addEventListener("pointermove", (e) => {
    px = (e.clientX / window.innerWidth - 0.5) * -36;
    py = (e.clientY / window.innerHeight - 0.5) * -28;
    queue();
  }, { passive: true });
  window.addEventListener("scroll", () => {
    root.classList.toggle("scrolled", window.scrollY > 16);
    sy = Math.max(-140, -window.scrollY * 0.12);
    queue();
  }, { passive: true });

  /* ---------- watch for the app drawing a page ---------- */
  new MutationObserver(onRender).observe(app, { childList: true });
  onRender();
})();
