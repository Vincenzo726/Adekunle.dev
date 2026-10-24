# Boluwatife Adekunle Portfolio

A responsive portfolio built with HTML, CSS, vanilla JavaScript, and Express.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

## Contact form

The contact form opens WhatsApp with the visitor's name, email, and message prefilled. The visitor must press Send in WhatsApp to deliver it.

## Search indexing and SEO

The public pages include canonical URLs, page-specific search and social metadata, and structured data on the homepage. `public/robots.txt` advertises `public/sitemap.xml` to crawlers. Keep the canonical URLs and sitemap host aligned with the production domain.

The Google Search Console HTML verification file is served from the site root. Deploy it, then click Verify in Search Console. Submit `https://adekunle-dev.onrender.com/sitemap.xml` in the Search Console Sitemaps report. Keep the verification file available after verification.

## Before publishing

- Confirm the portrait and project screenshots are approved for public use.
- Confirm the exact project contributions and permission to feature each project.
- Verify the phone number before adding it to the public contact section.
- Confirm the exact freeCodeCamp certificate title and link.
- Add the CV only when a final copy is ready.

## Checks

Run `npm test` to exercise the health and contact API endpoints, page navigation, sitemap, robots rules, and SEO metadata.