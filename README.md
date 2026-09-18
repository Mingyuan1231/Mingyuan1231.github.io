# Mingyuan Wang — academic website

English academic website for Mingyuan Wang, Physics PhD student at UMass Amherst.
Target deployment: https://mingyuan1231.github.io/ (confirmed by the owner).

## Local development

Requires Node.js 22 or newer. There are no third-party build dependencies and no client-side JavaScript.

```sh
npm run build
npm run check
npm run preview
```

Open http://127.0.0.1:4173/. Rebuild after editing; refresh the browser to view changes.

If Node.js is available but npm is not on PATH, the equivalent commands are
`node scripts/build.mjs`, `node scripts/check.mjs`, and `node scripts/serve.mjs`.

## Editing content

- `site.config.json`: URL, public identity, contact links, and actual content review date.
- `content/publications.json`: paper metadata, summaries, abstracts, code links and publication status.
- `scripts/build.mjs`: page layouts, biography, research overview, education and talks.
- `public/assets/style.css`: responsive design.
- `public/assets/mingyuan-wang.jpg`: existing lab portrait; attribution is on `/credits/`.
- `PROJECT_BRIEF.md`: project goals and content standards (not part of the deployed website).

Only `dist/` is published. Do not edit generated files. Run the build and checks after changes.
Update the review date only when reviewing or changing substantive content, not on each rebuild.

## GitHub Pages

The account site repository must be `Mingyuan1231/Mingyuan1231.github.io`. Enable
**Settings → Pages → Build and deployment → GitHub Actions**. The workflow builds,
checks, and deploys on pushes to `main`; pull requests only build and check.

The configured domain must be an HTTPS origin, without a project subpath. This site
targets an account site or a custom domain, not a project subdirectory.

`mingyuanwang.github.io` was the preferred address, but the GitHub username is already
occupied by another account. The owner chose to retain `mingyuan1231.github.io` for now.
Do not change their GitHub username or publish canonical links to the occupied address.

For a future custom domain: verify ownership, configure DNS and the Pages custom-domain
setting, update `site.config.json`, and add the verified domain to `public/CNAME`.
Do not create a CNAME file until the domain is actually available and configured.

## Search and citation design

- Statically rendered HTML, ordinary links, and stable paper URLs.
- Per-page titles and descriptions, canonical URLs, sitemap, and crawlable robots policy.
- `Person`/`ProfilePage` and `ScholarlyArticle` JSON-LD matching visible content.
- Accurate `citation_*` metadata and downloadable BibTeX; preprints explicitly labeled.
- DOI, arXiv, code, and institution links support attribution and verification.
- OAI-SearchBot is allowed for search. No special training policy is added; the default
  robots rule allows crawlers, and training access is independent of search access.
- No analytics or trackers. Search Console verification is not configured yet.

The 2025 paper's author abstract is reproduced under its CC BY 4.0 license, with notation
reformatted. The 2026 paper page uses a clearly labeled summary and links to the original
abstract. Obtain author-supplied abstract text for that page before treating its Scholar
inclusion requirements as complete. `citation_pdf_url` is deliberately omitted because
full texts currently link to external arXiv files rather than a local paper directory.

The selected publication list is not a claim of a complete publication record. Add earlier
papers, ORCID, Scholar profile, awards, or service only after verifying attribution.
The research overview is a draft synthesis grounded in the linked preprints; review wording
as the author before expanding technical or quantitative claims.

An empty `url` in config produces a local-only build with `noindex` and crawl blocking;
CI refuses to publish without a configured URL. `SITE_URL` can override the config for
checks. Neither indexing nor AI citations are guaranteed by technical compliance.

After launch, verify the site in Google Search Console and Bing Webmaster Tools using
the owner's accounts, submit the sitemap, and measure indexing and relevant queries.
