# Nuance Media: launch checklist

The new site lives on the `site-final` branch. `nuancemedia.agency` is served by the
Vercel project `nuance-media` from the `main` branch, so **merging `site-final` into
`main` is the go-live step**. Everything below is grouped by who needs to do it.

Preview (latest `site-final` build): the `nuance-media-git-site-final-…` link in Vercel,
or the newest `site-final` deployment under the `nuance-media` project.

---

## 1. Must do before going live

### Content (owner)
- [ ] **Privacy policy** (`privacy.html`): fill in the bracketed bits — `[name]` of the
      responsible person, `[24 months]` data retention, `[30 days]`, and
      `[analytics tools, e.g. Google Analytics]`. Then remove the yellow "Draft for review" box.
- [ ] **Refund policy** (`refund.html`): confirm `[7 working days]`, fill the brackets,
      remove the "Draft for review" box.
- [ ] Have both policies checked by a lawyer (or at least read them through once).
- [ ] **Screenshots permission**: the homepage "receipts" section shows real (blurred)
      Meta Ads Manager and Shopify dashboards. Names are hidden, but confirm each client
      is fine with their numbers being shown.
- [ ] Confirm the August Shopify screenshot is the **same brand** as the August Meta Ads
      screenshot (it is labelled "Wellness D2C · August 2026" on both).

### Forms (test on the preview, then on the live site after launch)
- [ ] Send one test from each form: **Book a call**, **Contact**, **Apply as a creator**, **Careers**.
- [ ] Open `nm-admin.html` and check all four arrive (each has its own filter).
- [ ] Delete the old test entries named **"TEST submission (delete me)"** / "TEST - Claude"
      from the `form_submissions` table (the dashboard has no delete button; use the Neon
      console in Vercel → Storage).

### Domain (Vercel → nuance-media → Settings → Domains)
- [ ] Add `www.nuancemedia.agency` and set it to **redirect to** `nuancemedia.agency`
      (right now only the bare domain is connected).

### Go live
- [ ] Final review of the preview on a phone and a laptop.
- [ ] Merge `site-final` into `main` (GitHub PR or `git merge`). Vercel deploys production automatically.
- [ ] After deploy: open `https://nuancemedia.agency`, click through the menu, and send one real form.

---

## 2. Right after launch (same day)

- [ ] **Google Search Console**: add `nuancemedia.agency`, submit `https://nuancemedia.agency/sitemap.xml`.
- [ ] **Bing Webmaster Tools**: same sitemap (or import from Search Console).
- [ ] Check these load: `/robots.txt`, `/sitemap.xml`, `/llms.txt`.
- [ ] Test one page in Google's Rich Results Test (FAQ + Organization should show).
- [ ] Check the old URLs redirect properly:
      `/Seo service.html` → Websites & SEO, `/Graphic Designing.html` → Creatives,
      `/performace marketing.html` → Meta ads, `/career.html` → Careers, `/v3/` → home.

## 3. Soon after launch (nice to have)

- [ ] **Analytics**: add Google Analytics 4 and/or the **Meta Pixel** (none is installed yet).
      Update the privacy policy to name whichever you add.
- [ ] **Google Business Profile** for Surat and Mumbai (Mumbai address is already in the site's structured data).
- [ ] **Founder photos** on the About page (currently initials "NS" and "LS").
- [ ] Surat street address on Contact / Surat page, if you want it shown.
- [ ] Calendly (or similar) link on Book a call, if you want instant booking.
- [ ] A proper **social share image** (1200×630) instead of the logo for WhatsApp/LinkedIn previews.
- [ ] Old job pages (`bde.html`, `media buyer.html`, `cms developer.html`,
      `business development executive.html`) still exist in the old design. Either
      delete/redirect them to `careers.html` or keep them for open roles.
- [ ] Cleanup later: the old `v3/` folder and old `assets/css`, `assets/js`, `assets/imgs`
      are no longer used by the new pages (kept for now so nothing breaks).

---

## What's already done

- New 30+ page white site at the root (home, services, Meta ads, UGC, websites & SEO,
  work + 6 case studies, creatives, about, Surat, Mumbai, insights + 3 guides, forms, policies, 404).
- 3D chrome N on the homepage, count-up stats, scroll reveals, ROAS bar animation.
- **Receipts section** on the homepage: Meta Ads Manager + Shopify tabs, 7 anonymised
  dashboard screenshots incl. the Diwali sale (₹22.1L in two days).
- All forms post to `/api/contact` with validation and a spam trap; saved to the existing database.
- Redirects from the old site's URLs and from the preview paths (`/final`, `/v3`).
- Private pages (`nm-admin`, growth audit, questionnaires, etc.) stay `noindex`.
- SEO: canonical URLs, sitemap, robots.txt, llms.txt, structured data (Organization, FAQ, breadcrumbs).
