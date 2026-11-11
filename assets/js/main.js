/* =========================================================
   PERFORIENT — site configuration
   Fill these two values in before going live (see README.md).
   ========================================================= */
const PERFORIENT_CONFIG = {
  // Your online booking page, e.g. a Calendly / Cal.com / Google Calendar link.
  bookingUrl: "https://calendly.com/nasser-perforient/30min",
  // Where the audit form sends submissions. FormSubmit emails each one to info@perforient.com.
  // The first submission triggers a one-time "Activate Form" email to that inbox (see README.md).
  formEndpoint: "https://formsubmit.co/ajax/info@perforient.com",
};

(function () {
  "use strict";

  /* ---- Header background on scroll ---- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Mobile menu ---- */
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      header.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("is-open");
        header.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---- Booking links ---- */
  document.querySelectorAll("[data-booking]").forEach((a) => {
    if (PERFORIENT_CONFIG.bookingUrl) {
      a.href = PERFORIENT_CONFIG.bookingUrl;
      a.target = "_blank";
      a.rel = "noopener";
    }
    // Without a booking URL the link falls back to its href (#contact form).
  });

  /* ---- Reveal on scroll ---- */
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---- Audit request form ---- */
  const form = document.querySelector("#audit-form");
  if (form) {
    const status = form.querySelector(".form__status");
    const btn = form.querySelector("button[type=submit]");
    const show = (msg, ok) => {
      status.textContent = msg;
      status.className = "form__status " + (ok ? "is-ok" : "is-err");
    };

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      if (form.querySelector(".hp input").value) return; // spam bot

      if (!PERFORIENT_CONFIG.formEndpoint) {
        show("The form isn't connected yet. Site owner: set formEndpoint in assets/js/main.js (see README.md).", false);
        return;
      }

      btn.disabled = true;
      const label = btn.textContent;
      btn.textContent = "Sending…";
      try {
        const data = Object.fromEntries(new FormData(form));
        delete data._honey;
        data._subject = "New audit request: " + (data.company || data.name);
        data._template = "table";
        data._captcha = "false";
        const res = await fetch(PERFORIENT_CONFIG.formEndpoint, {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || String(out.success) === "false") throw new Error(out.message || String(res.status));
        form.reset();
        show("Thanks! We've received your request and will reply within one business day to schedule your audit.", true);
      } catch (err) {
        show("Something went wrong sending your request. Please try again in a moment.", false);
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  }

  /* =========================================================
     Process animation
     A workflow drawn as a live diagram. "Current process" shows work
     leaking out; "Apply the fix" removes waste steps and shrinks the cycle.
     ========================================================= */
  const SVGNS = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DIAGRAMS = {
    rd: {
      stations: [
        { label: "Design" },
        { label: "Handoff", remove: true, leak: "Manual handoff" },
        { label: "Review", auto: true },
        { label: "Approval 1" },
        { label: "Approval 2", remove: true, leak: "Redundant approval" },
        { label: "Rework", remove: true, leak: "Rework loop" },
        { label: "Release" },
      ],
      before: "R&D cycle ≈ 3 weeks",
      after: "3 days (−85%)",
      ratio: 3 / 21,
    },
    enroll: {
      stations: [
        { label: "Application" },
        { label: "Paper forms", remove: true, leak: "Paper-based step" },
        { label: "Data entry", auto: true, leak: "Manual data entry" },
        { label: "Verify" },
        { label: "Re-check", remove: true, leak: "Redundant step" },
        { label: "Enrolled" },
      ],
      before: "60 min per student",
      after: "20 min (−67%)",
      ratio: 20 / 60,
    },
  };

  function el(name, attrs, parent) {
    const n = document.createElementNS(SVGNS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, s, cls, anchor) {
    const t = el("text", { x, y, class: cls || "", "text-anchor": anchor || "middle" }, parent);
    t.textContent = s;
    return t;
  }
  // Real rendered width of a text node, with an estimate if the browser can't measure yet.
  function textWidth(t, perChar) {
    let w = 0;
    try { w = t.getComputedTextLength(); } catch (e) { /* not rendered */ }
    return w > 0 ? w : t.textContent.length * perChar;
  }

  function buildDiagram(root) {
    const data = DIAGRAMS[root.dataset.diagram];
    const host = root.querySelector(".flow__canvas");
    if (!data || !host) return null;
    const vertical = window.matchMedia("(max-width: 600px)").matches;
    const n = data.stations.length;
    const id = root.id;
    host.innerHTML = "";

    let W, H, pos, along, mainA, mainB;
    if (!vertical) {
      W = 760; H = 316; const y = 150, pad = 56;
      pos = (i) => ({ x: pad + i * (W - 2 * pad) / (n - 1), y });
      mainA = pad - 40; mainB = W - pad + 40;
      along = (s, c) => ({ x: s, y: y + c });
    } else {
      const top = 104, gap = 82;
      W = 340; H = top + (n - 1) * gap + 56; const x = 112;
      pos = (i) => ({ x, y: top + i * gap });
      mainA = top - 40; mainB = top + (n - 1) * gap + 40;
      along = (s, c) => ({ x: x + c, y: s });
    }
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H, role: "img", "aria-labelledby": id + "-title" }, host);
    el("title", { id: id + "-title" }, svg).textContent =
      `Process diagram. Before: ${data.before}. Steps removed by the fix: ${data.stations.filter((s) => s.remove).map((s) => s.label.toLowerCase()).join(", ")}. After: ${data.after}.`;

    const defs = el("defs", {}, svg);
    [["arr-ink", "var(--navy-800)"], ["arr-fix", "var(--teal-700)"]].forEach(([mid, c]) => {
      const m = el("marker", { id: mid + id, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" }, defs);
      el("path", { d: "M0,1 L9,5 L0,9", fill: "none", stroke: c, "stroke-width": 1.5, "stroke-linecap": "round", "stroke-linejoin": "round" }, m);
    });

    const p0 = pos(0), pN = pos(n - 1);
    const dims = el("g", {}, svg);
    if (!vertical) {
      const gB = el("g", { class: "dg-dim dg-dim--before" }, dims);
      el("line", { class: "dg-dim-ext", x1: p0.x, y1: 40, x2: p0.x, y2: p0.y - 46 }, gB);
      el("line", { class: "dg-dim-ext", x1: pN.x, y1: 40, x2: pN.x, y2: pN.y - 46 }, gB);
      el("line", { x1: p0.x, y1: 50, x2: pN.x, y2: 50, "marker-start": `url(#arr-ink${id})`, "marker-end": `url(#arr-ink${id})` }, gB);
      const bg = el("rect", { class: "dg-dim-bg", y: 39, height: 22, rx: 11 }, gB);
      const lt = txt(gB, (p0.x + pN.x) / 2, 54.5, data.before);
      const lw = textWidth(lt, 7.4) + 26;
      bg.setAttribute("x", (p0.x + pN.x) / 2 - lw / 2);
      bg.setAttribute("width", lw);
      const gA = el("g", { class: "dg-dim dg-dim--after" }, dims);
      const xe = p0.x + (pN.x - p0.x) * data.ratio;
      el("line", { x1: xe, y1: 70, x2: xe, y2: 92 }, gA);
      el("line", { x1: p0.x, y1: 82, x2: xe, y2: 82, "marker-start": `url(#arr-fix${id})`, "marker-end": `url(#arr-fix${id})` }, gA);
      txt(gA, xe + 10, 86.5, data.after, "", "start");
    } else {
      const gB = el("g", { class: "dg-dim dg-dim--before" }, dims);
      el("line", { x1: 14, y1: p0.y - 19, x2: 14, y2: pN.y + 19, "marker-start": `url(#arr-ink${id})`, "marker-end": `url(#arr-ink${id})` }, gB);
      txt(gB, 14, 26, "Before: " + data.before, "", "start");
      const gA = el("g", { class: "dg-dim dg-dim--after" }, dims);
      const ye = (p0.y - 19) + ((pN.y + 19) - (p0.y - 19)) * data.ratio;
      el("line", { x1: 28, y1: p0.y - 19, x2: 28, y2: ye, "marker-start": `url(#arr-fix${id})`, "marker-end": `url(#arr-fix${id})` }, gA);
      txt(gA, 14, 48, "After: " + data.after, "", "start");
    }

    if (!vertical) {
      el("line", { class: "dg-pipe", x1: mainA, y1: p0.y, x2: mainB, y2: p0.y, "marker-end": `url(#arr-ink${id})` }, svg);
      el("line", { class: "dg-pipe-fast", x1: mainA, y1: p0.y - 6, x2: mainB, y2: p0.y - 6 }, svg);
    } else {
      el("line", { class: "dg-pipe", x1: p0.x, y1: mainA, x2: p0.x, y2: mainB, "marker-end": `url(#arr-ink${id})` }, svg);
      el("line", { class: "dg-pipe-fast", x1: p0.x - 6, y1: mainA, x2: p0.x - 6, y2: mainB }, svg);
    }

    const particles = el("g", {}, svg);
    const leakPts = [];

    data.stations.forEach((s, i) => {
      const p = pos(i);
      const span = vertical ? 0 : (W - 112) / (n - 1);
      const bw = vertical ? 128 : Math.max(92, Math.min(112, span - 20)), bh = vertical ? 38 : 40;
      const g = el("g", { class: "dg-st" + (s.remove ? " is-removed" : "") }, svg);
      el("rect", { x: p.x - bw / 2, y: p.y - bh / 2, width: bw, height: bh, rx: 9 }, g);
      txt(g, p.x, p.y + 4.5, s.label);
      if (!vertical) txt(g, p.x, p.y - bh / 2 - 9, "Step " + (i + 1), "dg-idx");
      if (s.remove) {
        el("line", { class: "dg-x", x1: p.x - bw / 2 + 6, y1: p.y - bh / 2 - 2, x2: p.x + bw / 2 - 6, y2: p.y + bh / 2 + 2 }, g);
        el("line", { class: "dg-x", x1: p.x - bw / 2 + 6, y1: p.y + bh / 2 + 2, x2: p.x + bw / 2 - 6, y2: p.y - bh / 2 - 2 }, g);
      }
      if (s.remove || s.auto) {
        const tag = el("g", { class: "dg-tag" + (s.auto ? " dg-tag--auto" : "") }, g);
        const r = el("rect", { y: 0, height: 18, rx: 9 }, tag);
        const t = txt(tag, 0, 0, s.remove ? "REMOVED" : "AUTOMATED");
        const tw = textWidth(t, 6.9) + 16;
        const tx = vertical ? p.x + bw / 2 + 10 : p.x - tw / 2;
        const ty = vertical ? p.y - 9 : p.y + bh / 2 + 10;
        r.setAttribute("x", tx); r.setAttribute("y", ty); r.setAttribute("width", tw);
        t.setAttribute("x", tx + tw / 2); t.setAttribute("y", ty + 12.5);
      }
      if (s.leak) {
        const lg = el("g", { class: "dg-leak" }, svg);
        if (!vertical) {
          const drop = leakPts.length % 2 ? 34 : 0; // stagger neighbouring labels
          el("line", { x1: p.x, y1: p.y + bh / 2 + 4, x2: p.x, y2: p.y + 72 + drop }, lg);
          txt(lg, p.x, p.y + 90 + drop, "▼ LEAK", "dg-leak-k");
          txt(lg, p.x, p.y + 106 + drop, s.leak);
        } else {
          el("line", { x1: p.x + bw / 2 + 4, y1: p.y, x2: p.x + bw / 2 + 22, y2: p.y }, lg);
          txt(lg, p.x + bw / 2 + 28, p.y - 3, "► LEAK", "dg-leak-k", "start");
          txt(lg, p.x + bw / 2 + 28, p.y + 12, s.leak, "", "start");
        }
        leakPts.push({ s: vertical ? p.y : p.x });
      }
    });

    return { particles, leakPts, mainA, mainB, along };
  }

  function initDiagram(root) {
    let geo = buildDiagram(root);
    if (!geo) return;
    let fixed = false, interacted = false, visible = false, raf = 0, last = 0, spawnAcc = 0;
    let parts = [];
    const btns = root.querySelectorAll(".flow__toggle button");
    const status = root.querySelector(".flow__status span:last-child");

    function setFixed(v, byUser) {
      fixed = v;
      if (byUser) interacted = true;
      root.classList.toggle("is-fixed", v);
      btns.forEach((b) => b.setAttribute("aria-pressed", String((b.dataset.state === "after") === v)));
      if (status) status.textContent = v ? "Fixed: waste removed" : "Leaking";
    }
    btns.forEach((b) => b.addEventListener("click", () => setFixed(b.dataset.state === "after", true)));

    function spawn() {
      const c = el("circle", { r: 3.8, class: "dg-p" }, geo.particles);
      parts.push({ node: c, s: geo.mainA, c: 0, leak: false, checked: new Set(), life: 1 });
    }
    function frame(t) {
      raf = requestAnimationFrame(frame);
      if (!last) last = t;
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      const speed = fixed ? 230 : 70, interval = fixed ? 0.16 : 0.42;
      spawnAcc += dt;
      if (spawnAcc > interval) { spawnAcc = 0; spawn(); }
      parts = parts.filter((p) => {
        if (p.leak) {
          p.c += 70 * dt; p.life -= 1.1 * dt;
        } else {
          p.s += speed * dt;
          if (!fixed) {
            geo.leakPts.forEach((lp, i) => {
              if (!p.checked.has(i) && p.s >= lp.s) {
                p.checked.add(i);
                if (Math.random() < 0.34) { p.leak = true; p.node.setAttribute("class", "dg-p dg-p--leak"); p.s = lp.s; }
              }
            });
          }
        }
        const q = geo.along(p.s, p.c);
        p.node.setAttribute("cx", q.x.toFixed(1));
        p.node.setAttribute("cy", q.y.toFixed(1));
        p.node.setAttribute("opacity", Math.max(0, p.life).toFixed(2));
        if (p.s > geo.mainB - 6 || p.life <= 0) { p.node.remove(); return false; }
        return true;
      });
    }
    function play() { if (!raf && !reduceMotion) { last = 0; raf = requestAnimationFrame(frame); } }
    function pause() { cancelAnimationFrame(raf); raf = 0; }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible) {
          play();
          // Show the fix on its own if the visitor hasn't touched the toggle.
          if (!interacted && !root.dataset.autoplayed) {
            root.dataset.autoplayed = "1";
            setTimeout(() => { if (!interacted) setFixed(true); }, 6500);
          }
        } else pause();
      }, { threshold: 0.25 }).observe(root);
    } else play();
    document.addEventListener("visibilitychange", () => (document.hidden ? pause() : visible && play()));

    const rebuild = () => { pause(); parts = []; geo = buildDiagram(root); if (visible) play(); };
    const mq = window.matchMedia("(max-width: 600px)");
    mq.addEventListener ? mq.addEventListener("change", rebuild) : mq.addListener(rebuild);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild); // re-measure labels once fonts load
    setFixed(false);
  }
  document.querySelectorAll("[data-diagram]").forEach(initDiagram);

  /* =========================================================
     Leak calculator
     ========================================================= */
  const calc = document.querySelector("[data-calc]");
  if (calc) {
    const q = (s) => calc.querySelector(s);
    const people = q("#c-people"), hours = q("#c-hours"), rate = q("#c-rate");
    const outs = {
      people: q("[data-o=people]"), hours: q("[data-o=hours]"), rate: q("[data-o=rate]"),
      big: q("[data-o=annual]"), month: q("[data-o=month]"), hw: q("[data-o=hw]"),
      hy: q("[data-o=hy]"), fte: q("[data-o=fte]"),
    };
    const WEEKS = 48, FTE_HOURS = 1800;
    let summary = "";
    // All amounts are Canadian dollars, shown as "$76,800".
    const money = (v) => "$" + Math.round(v).toLocaleString("en-CA");
    const fill = (r) => r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min)) * 100 + "%");
    const update = () => {
      [people, hours, rate].forEach(fill);
      const p = +people.value, h = +hours.value, r = +rate.value;
      const hw = p * h, hy = hw * WEEKS, annual = hy * r;
      outs.people.textContent = p + (p === 1 ? " person" : " people");
      outs.hours.textContent = h + " h / week";
      outs.rate.textContent = money(r) + " / h";
      outs.big.textContent = money(annual);
      outs.month.textContent = money(annual / 12);
      outs.hw.textContent = hw.toLocaleString() + " h";
      outs.hy.textContent = hy.toLocaleString() + " h";
      outs.fte.textContent = (hy / FTE_HOURS).toFixed(1) + " full-time staff";
      summary = `Leak estimate: ${p} people × ${h} h/week × ${money(r)}/h ≈ ${money(annual)} CAD per year (${hy.toLocaleString()} hours).`;
      const hidden = document.querySelector("#f-calc");
      if (hidden) hidden.value = summary;
    };
    [people, hours, rate].forEach((i) => i.addEventListener("input", update));
    update();

    const send = q("[data-calc-send]");
    if (send) send.addEventListener("click", () => {
      const msg = document.querySelector("#f-msg");
      if (msg && !msg.value.includes("Leak estimate:")) msg.value = (msg.value ? msg.value.trim() + "\n\n" : "") + summary;
    });
  }

  /* ---- Footer year ---- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
