# PERFORIENT website

Plain HTML/CSS/JS, so there is no build step. Upload the contents of this `site/` folder to any static host
(Netlify, Vercel, Cloudflare Pages, GitHub Pages, or your domain's cPanel `public_html`).

## Pages
- `index.html`: homepage (hero, problem, services, results, process, why us, audit form)
- `case-studies/engineering-firm.html`
- `case-studies/educational-institution.html`

## Before going live (2 settings)
Open `assets/js/main.js` and fill in `PERFORIENT_CONFIG` at the top:

1. **`formEndpoint`**: where the audit form sends submissions.
   Free option: create a form at https://formspree.io, then paste its URL, e.g. `"https://formspree.io/f/abcdwxyz"`.
   Submissions are then emailed to you. Until it is set, the form shows a "not connected yet" notice.
2. **`bookingUrl`**: your online booking page (Calendly, Cal.com, Google Calendar booking page…).
   Every "Book Online" button uses it. Until it is set, those buttons scroll to the form.

## Other things to update later
- **Client names/logos**: case studies are anonymous on purpose. Add names only once written permission is confirmed.
- **Domain**: canonical URLs, `sitemap.xml` and `robots.txt` assume `https://www.perforient.com`.
- **Logo**: `assets/img/logo.svg` (full logo) and `assets/img/favicon.svg` (icon).
- **Colors**: brand tokens are at the top of `assets/css/styles.css` (navy `#0B1F3A`, orange `#FF7A1A`).
- **Social preview image**: add a 1200×630 image and an `og:image` meta tag to each page.

## Preview locally
```
cd site && python3 -m http.server 8000
```
Then open http://localhost:8000
