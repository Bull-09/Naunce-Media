NUANCE MEDIA WEBSITE: HOW TO PUT IT LIVE
=========================================

This folder is a complete static website: plain HTML, CSS, JS and images.
No build step, no database, no npm install. Upload the CONTENTS of this
folder to the root of the web hosting for nuancemedia.agency.


OPTION A: VERCEL (recommended, it's where the preview already lives)
--------------------------------------------------------------------
1. In the existing Vercel project, replace the site files with the
   contents of this folder (or drag this folder into a new Vercel project).
2. Framework preset: "Other". Build command: none. Output directory: "."
3. Settings > Domains: add nuancemedia.agency (and www, redirecting to it).
4. vercel.json is included (caching headers, .html URLs kept as-is).

OPTION B: CPANEL / HOSTINGER / ANY APACHE HOSTING
-------------------------------------------------
1. Upload everything in this folder into public_html (including the
   hidden .htaccess file; turn on "show hidden files" if you can't see it).
2. .htaccess handles the 404 page, HTTPS and www -> non-www redirect.

OPTION C: NETLIFY / CLOUDFLARE PAGES
------------------------------------
Drag and drop this folder. 404.html is picked up automatically.


!! CONTACT FORMS: MUST DO BEFORE LAUNCH !!
------------------------------------------
All forms (book a call, contact, creators, careers) send a JSON POST to:

    /api/contact

Fields: form, page, name, business, email, phone, type, budget,
svc (array), message (+ city, instagram, samples, categories,
languages, role, portfolio on the creator/careers forms).

- The previous developer's Vercel version already had /api/contact.
  If you deploy on that same Vercel project, keep that function.
- On any other hosting, point it to a form service (Formspree,
  Web3Forms, Getform, etc.) by changing ONE line at the top of core.js:
      var FORM_ENDPOINT = '/api/contact';
- Expected response: HTTP 200 = success. HTTP 400 with {"error":"..."}
  shows that message. Anything else shows a "copy your details and
  email us" fallback, so no lead is ever lost silently.
- TEST IT: submit one form and confirm the enquiry arrives.


AFTER LAUNCH (SEO)
------------------
1. Google Search Console: add nuancemedia.agency, submit
   https://nuancemedia.agency/sitemap.xml
2. Bing Webmaster Tools: same sitemap.
3. Check https://nuancemedia.agency/robots.txt and /llms.txt load.
4. Test a page in Google's Rich Results Test
   (https://search.google.com/test/rich-results) - FAQ and
   Organization data should show up.
5. Set up Google Business Profile for Surat and Mumbai.
6. Add analytics / Meta Pixel if wanted: paste the snippet before
   </head> on every page (or ask for it to be added to the template).


CONTENT STILL TO FILL IN (owner, not IT)
----------------------------------------
- privacy.html and refund.html: replace text in [brackets] and remove
  the "Draft for review" box. Get them checked by a lawyer.
- about.html: founder photos (currently initials).
- Surat street address, if you want it shown.
- Optional: Calendly link on book-a-call.html.


OPTIONAL: CLEAN URLS
--------------------
Links use .html (e.g. /meta-ads.html), which works everywhere.
For /meta-ads instead, on Vercel set "cleanUrls": true in vercel.json;
Vercel then redirects the .html versions automatically. Update the
<link rel="canonical"> tags and sitemap.xml to match if you do.


FILES
-----
index.html ............ Home
services.html ......... Services hub (what we do / don't do)
meta-ads.html, ugc.html, website-seo.html ... Service pages
work.html + case-*.html (6) ................. Case studies
creatives.html ........ Creative wall
about.html ............ About, founders, ethics
surat.html, mumbai.html ... City pages
book-a-call.html, contact.html ... Lead forms
creators.html, careers.html, onboarding.html
insights.html + 3 guides (good-roas-india, meta-ads-budget-guide,
                          ugc-vs-studio-ads)
privacy.html, refund.html, 404.html
site.css, core.js ..... Styles and interactions
assets/ ............... Images and videos
sitemap.xml, robots.txt, llms.txt ... SEO / AI search files
vercel.json, .htaccess ... Hosting config
