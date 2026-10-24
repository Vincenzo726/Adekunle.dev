# Boluwatife Adekunle Portfolio

A responsive portfolio built with HTML, CSS, vanilla JavaScript, and Express.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

## Contact form setup

The form sends messages through SMTP and does not store them in a database. Until SMTP is configured, submissions receive an honest setup message and visitors can email `boluwatifeadek1@gmail.com` directly.

1. Copy `.env.example` to `.env`.
2. Fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `CONTACT_FROM` using credentials from your email provider.
3. Set `CONTACT_TO` to the inbox that should receive inquiries.
4. Restart the server and submit a test message.

Never commit `.env` or publish email provider credentials.

## Before publishing

- Add Boluwatife's approved portrait and project screenshots.
- Confirm the exact project contributions and permission to feature each project.
- Verify the phone number before adding it to the public contact section.
- Confirm the exact freeCodeCamp certificate title and link.
- Add the CV only when a final copy is ready.

## Checks

Run `npm test` to exercise the health and contact API endpoints.