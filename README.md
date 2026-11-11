# PERFORIENT website

Plain HTML/CSS/JS, so there is no build step. Upload the contents of this `site/` folder to any static host
(Netlify, Vercel, Cloudflare Pages, GitHub Pages, or your domain's cPanel `public_html`).

## Pages
- `index.html`: homepage (hero, problem, services, results, process, why us, audit form)
- `case-studies/engineering-firm.html`
- `case-studies/educational-institution.html`

## Before going live (2 settings)
Open `assets/js/main.js` and fill in `PERFORIENT_CONFIG` at the top:

1. **`formEndpoint`**: where the audit form sends submissions. It is set to
   `https://formsubmit.co/ajax/info@perforient.com`, a free relay (no account) that emails every
   submission to **info@perforient.com** as a table, with the visitor's email as reply-to.
   - **One-time activation:** the very first submission sends an "Activate Form" email to
     info@perforient.com. Click the link in it; until then submissions are not delivered.
   - **Optional, hides the address from spammers:** after activating, FormSubmit emails a random
     alias string. Replace `info@perforient.com` in the URL with that string.
   - To change the inbox, change the email in the URL (and activate again).
2. **`bookingUrl`**: the online booking page, set to the 30-minute Calendly event
   `https://calendly.com/nasser-perforient/30min`. Every "Book Online" link opens it in a new tab.
   The link is also written into each "Book Online" link in the HTML (so it works without JavaScript);
   to change it, update `bookingUrl` and those links (search the site for `data-booking`).

## Other things to update later
- **Client names/logos**: case studies are anonymous on purpose. Add names only once written permission is confirmed.
- **Domain**: the site is served at `https://perforient.com` (set by the `CNAME` file and the repo's Pages
  settings; the old github.io address redirects there). Canonical URLs, social tags, structured data,
  `sitemap.xml` and `robots.txt` all use `https://perforient.com`.
- **Logo**: `assets/img/logo.svg` (full logo) and `assets/img/favicon.svg` (icon).
- **Colors**: brand tokens are at the top of `assets/css/styles.css` (navy `#0B1F3A`, orange `#FF7A1A`).
- **Social preview image**: `assets/img/og-image.png` (1200×630), referenced as
  `https://perforient.com/assets/img/og-image.png`.
- **FAQ**: on the homepage, with matching FAQ structured data in the `<head>`. Edit both together.
- **404 page**: `404.html` (GitHub Pages serves it automatically for missing pages).
- **Fonts**: Inter and Manrope are self-hosted in `assets/fonts/` (SIL Open Font License).

## Preview locally
```
python3 -m http.server 8000
```
(run it inside this folder)
Then open http://localhost:8000
