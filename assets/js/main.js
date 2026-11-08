/* =========================================================
   PERFORIENT — site configuration
   Fill these two values in before going live (see README.md).
   ========================================================= */
const PERFORIENT_CONFIG = {
  // Your online booking page, e.g. a Calendly / Cal.com / Google Calendar link.
  bookingUrl: "",
  // Form endpoint that emails you submissions, e.g. "https://formspree.io/f/abcdwxyz".
  formEndpoint: "",
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
        const res = await fetch(PERFORIENT_CONFIG.formEndpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(String(res.status));
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

  /* ---- Footer year ---- */
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
