# Mingyuan Wang — academic website

English academic website for Mingyuan Wang, Physics PhD candidate at UMass Amherst.
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

Public pages speak in the author’s voice. Keep editorial provenance, verification notes,
permission statements, and content-review logs in repository documentation, not on the site.
Describe technical scope directly within the research explanation rather than adding generic disclaimers.
The former `/credits/` page and its footer link have been removed.

- `site.config.json`: URL, public identity, contact links, and content modification date for the sitemap.
- `content/publications.json`: paper metadata, summaries, abstracts, code links and publication status.
- `content/academic.json`: research appointments, projects, education, manuscripts, talks, expertise, service and teaching.
- `content/*.html`: research overview and topic pages, written from the author's research statement.
- `scripts/academic-pages.mjs`: academic CV layout and section navigation.
- `scripts/build.mjs`: shared page layouts, homepage, citation metadata and publication pages.
- `public/assets/style.css`: responsive design.
- `public/assets/mingyuan-wang.jpg`: personal portrait.
- `PROJECT_BRIEF.md`: project goals and content standards (not part of the deployed website).

Only `dist/` is published. Do not edit generated files. Run the build and checks after changes.
Update the modification date only when reviewing or changing substantive content, not on each rebuild.

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
- No analytics or trackers. Search Console ownership and indexing require verification in the owner's account.

The 2025 paper's author abstract is reproduced under its CC BY 4.0 license, with notation
reformatted. The other three paper pages reproduce their linked arXiv author-preprint
abstracts at the author's request. Sequence control uses the abstract from the current
author-supplied manuscript, retaining its in-preparation status. `citation_pdf_url` is deliberately omitted because
full texts currently link to external arXiv files rather than a local paper directory.

The publication list contains the four public papers identified in the supplied CV, plus a
separate entry for a manuscript in preparation. Journal metadata was checked against
publisher-deposited Crossref records; author names follow those records for the journal versions.
Preprints retain arXiv metadata, and submission venues are author-reported, not acceptances.
Do not give an unpublished manuscript a fabricated DOI, publication date or journal citation.

The CV and research pages draw on the author's supplied CV and four-page research statement.
They distinguish completed contributions, ongoing research, and future goals. PairMoment's
O(n²) claim is the size of its state representation, not the runtime of the whole optimizer.
Original application PDFs and extracted source files are not part of the site or repository.
The workshop date was reconciled with the owner as June 2, 2025, following the official
UMass schedule rather than the 2024 date in the supplied CV.
The owner supplied ORCID 0000-0002-1010-2807 and Scholar profile j_yVltwAAAAJ.
Person.sameAs includes their public URLs and GitHub; lab and CQN relationships use memberOf.
Awards and further papers should only be added with verified information.

An empty `url` in config produces a local-only build with `noindex` and crawl blocking;
CI refuses to publish without a configured URL. `SITE_URL` can override the config for
checks. Neither indexing nor AI citations are guaranteed by technical compliance.

After launch, verify the site in Google Search Console and Bing Webmaster Tools using
the owner's accounts, submit the sitemap, and measure indexing and relevant queries.
