import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCv } from './academic-pages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
const papers = JSON.parse(await readFile(path.join(root, 'content/publications.json'), 'utf8'));
const academic = JSON.parse(await readFile(path.join(root, 'content/academic.json'), 'utf8'));
const content = name => readFile(path.join(root, 'content', `${name}.html`), 'utf8');
const origin = (process.env.SITE_URL || config.url).replace(/\/$/, '');
if (process.env.CI && !origin) throw new Error('Set the confirmed site URL before publishing.');
if (origin && (new URL(origin).protocol !== 'https:' || new URL(origin).pathname !== '/')) {
  throw new Error('SITE_URL must be an HTTPS origin, without a project subpath.');
}
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const absolute = route => origin ? `${origin}${route}` : undefined;
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const longDate = date => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric', timeZone:'UTC' });
const person = {
  '@type':'Person', '@id': absolute('/#person'), name:config.name, alternateName:config.alternateName,
  url:absolute('/'), jobTitle:config.jobTitle, email:`mailto:${config.email}`,
  affiliation:{'@type':'CollegeOrUniversity',name:'University of Massachusetts Amherst',url:'https://www.umass.edu/'},
  sameAs:[config.github,config.lab], knowsAbout:['Entanglement distillation','Quantum error correction','Graph-state purification','Quantum networks','Stabilizer formalism','Clifford circuits','Combinatorial optimization'],
};
const routes = [];

function frame(route, title, description, body, extra = '', schema) {
  const nav = [['/','About'],['/research/','Research'],['/publications/','Publications'],['/cv/','CV & contact']];
  const active = route === '/' ? '/' : `/${route.split('/')[1]}/`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(description)}">
<meta name="author" content="Mingyuan Wang"><meta name="theme-color" content="#17232c">
${origin && route !== '/404.html' ? `<link rel="canonical" href="${esc(absolute(route))}"><meta property="og:url" content="${esc(absolute(route))}">` : '<meta name="robots" content="noindex">'}
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="${route.startsWith('/publications/') && route !== '/publications/' ? 'article' : 'website'}">
<meta property="og:site_name" content="Mingyuan Wang"><meta property="og:locale" content="en_US">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"><link rel="stylesheet" href="/assets/style.css">
${extra}<script type="application/ld+json">${json({'@context':'https://schema.org',...(schema || {'@type':'WebPage',url:absolute(route),name:title,description,about:person})})}</script>
</head><body><a class="skip" href="#main">Skip to content</a>
<header class="site-header"><div class="wrap header-inner"><a href="/" class="brand">Mingyuan Wang<span>.</span></a><nav aria-label="Main navigation">${nav.map(([url,label])=>`<a href="${url}"${active === url ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav></div></header>
<main id="main" class="wrap">${body}</main>
<footer class="site-footer"><div class="wrap footer-inner"><p>Mingyuan Wang · University of Massachusetts Amherst</p><p><a href="mailto:${config.email}">Email</a> &nbsp; / &nbsp; <a href="${config.github}">GitHub</a> &nbsp; / &nbsp; <a href="/credits/">Sources & credits</a></p></div></footer></body></html>\n`;
}
async function page(route,title,description,body,extra='',schema) {
  const relative = route.endsWith('/') ? `${route.slice(1)}index.html` : route.slice(1);
  const target = path.join(out,relative);
  await mkdir(path.dirname(target),{recursive:true});
  await writeFile(target,frame(route,title,description,body,extra,schema));
  if (route !== '/404.html') routes.push(route);
}
function authors(p) { return p.authors.map(a=>a===config.name ? `<strong>${esc(a)}</strong>` : esc(a)).join(', '); }
function paperStatus(p) { return p.submittedTo ? `${p.status} · submitted to ${p.submittedTo}` : p.status; }
function publicationReference(p) {
  return p.journal ? `<em>${esc(p.journal)}</em> ${esc(p.volume)}(${esc(p.issue)}), ${esc(p.pages || p.articleNumber)} (${p.date.slice(0,4)})` : `arXiv:${p.arxiv} (${p.date.slice(0,4)})`;
}
function resources(p,detail=false) {
  return `<div class="links">${detail ? '' : `<a href="/publications/${p.slug}/">Paper details</a>`}${p.journal ? `<a href="https://doi.org/${p.doi}">Journal article</a>` : ''}<a href="https://arxiv.org/abs/${p.arxiv}">${p.journal ? 'Preprint' : 'arXiv'}</a><a href="https://arxiv.org/pdf/${p.arxiv}">${p.journal ? 'Preprint PDF' : 'PDF'}</a>${p.code ? `<a href="${p.code}">Code</a>` : ''}${p.archive ? `<a href="${p.archive}">Archived code</a>` : ''}<a href="/publications/${p.slug}/citation.bib" download>BibTeX</a></div>`;
}
function paperList(entries=papers) {
  return entries.map(p=>`<article class="paper"><div class="paper-year">${p.date.slice(0,4)}</div><div><h3><a href="/publications/${p.slug}/">${esc(p.title)}</a></h3><p class="authors">${authors(p)}</p><span class="tag">${esc(paperStatus(p))}</span><p class="publication-venue">${publicationReference(p)}</p><p class="summary">${esc(p.summary)}</p>${resources(p)}</div></article>`).join('');
}
function heading(kicker,title,intro='') {
  return `<div class="page-top"><p class="eyebrow">${kicker}</p><h1>${title}</h1>${intro ? `<p class="lead">${intro}</p>` : ''}</div>`;
}
function bib(p) {
  const journalFields = p.journal ? `  journal = {${p.journal.replaceAll('&','\\&')}},\n  volume = {${p.volume}},\n  number = {${p.issue}},\n  pages = {${(p.pages || p.articleNumber).replace('–','--')}},\n` : '';
  return `@${p.journal ? 'article' : 'misc'}{wang${p.date.slice(0,4)}${p.slug.replaceAll('-','')},\n  title = {{${p.title}}},\n  author = {${p.authors.join(' and ')}},\n  year = {${p.date.slice(0,4)}},\n${journalFields}  eprint = {${p.arxiv}},\n  archivePrefix = {arXiv},\n  primaryClass = {${p.primaryClass || 'quant-ph'}},\n  doi = {${p.doi}},\n  url = {https://doi.org/${p.doi}}\n}\n`;
}

// Remove only this script's fixed build directory, after verifying its location.
if (path.dirname(out) !== path.resolve(root) || path.basename(out) !== 'dist') throw new Error('Unsafe build directory.');
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await cp(path.join(root,'public'),out,{recursive:true});

await page('/', 'Mingyuan Wang | Quantum Information · UMass Amherst',
  'Mingyuan Wang is a Physics PhD candidate at UMass Amherst studying entanglement distillation and quantum error correction in the Krastanov Lab.',
  `<section class="hero"><div><p class="eyebrow">Quantum information</p><h1>Mingyuan Wang <span class="chinese" lang="zh">王明元</span></h1><p class="position">Physics PhD candidate · UMass Amherst</p><div class="about-introduction"><p class="intro">I am a Physics PhD candidate at the <strong>University of Massachusetts Amherst</strong>, working with <a href="https://lab.krastanov.org/">Stefan Krastanov</a> in the Center for Quantum Networks (NSF ERC). My research focuses on <strong>multipartite entanglement</strong>, with applications to quantum networks and quantum error correction.</p><p>I study how to prepare and purify entangled quantum states when operations are noisy and resources are limited. I combine stabilizer and Clifford methods, graph theory, and optimization to find compact descriptions of quantum states and design efficient distillation circuits.</p><p>With collaborators, I developed methods for <a href="/publications/ghz-preserving-gates/">GHZ-preserving gates and optimized distillation</a>, and extended this approach to <a href="/publications/graph-state-purification/">graph-state purification across local Clifford orbits</a>. I also develop Julia software to simulate these protocols and explore circuit designs.</p><p>My current work examines how correlated noise affects the <a href="/research/sequence-control/">order of partial-distillation steps</a>, using the PairMoment reduced model, and how <a href="/research/graph-state-synthesis/">graph-state construction choices</a> shape errors for downstream quantum protocols.</p><p>I also serve as <a href="/cv/#service">Engineering Workforce Development Liaison</a> on the CQN Student and Postdoc Leadership Council.</p></div><div class="links"><a class="button" href="/research/">Research</a><a href="/cv/">CV & contact</a><a href="mailto:${config.email}">Email</a></div></div><aside class="portrait-panel"><img class="portrait" src="/assets/mingyuan-wang.jpg" alt="Mingyuan Wang" width="248" height="302"></aside></section>
  <section class="section selected-papers" aria-labelledby="selected-publications"><div class="section-head"><h2 id="selected-publications">Selected publications</h2><a href="/publications/">All publications →</a></div>${papers.filter(p => p.featured).map(p => `<article class="paper"><div class="paper-year">${p.date.slice(0,4)}</div><div><h3><a href="/publications/${p.slug}/">${esc(p.title)}</a></h3><p class="authors">${authors(p)}</p><p class="selected-paper-status">${esc(paperStatus(p))}</p></div></article>`).join('')}</section>`,
  '',{'@type':'ProfilePage',name:'Mingyuan Wang — academic profile',url:absolute('/'),mainEntity:person});

await page('/publications/','Publications & Manuscripts | Mingyuan Wang','Publications, preprints, and a manuscript in preparation by Mingyuan Wang in quantum information, semiconductor heterostructures, and astronomical instrumentation.',
  `${heading('Research output','Publications & manuscripts','Work in quantum information, with earlier publications in condensed-matter physics and astronomical instrumentation.')}
  <section class="section"><div class="section-head"><h2>Preprints</h2></div>${paperList(papers.filter(p => !p.journal))}</section>
  <section class="section"><div class="section-head"><h2>Journal articles</h2></div>${paperList(papers.filter(p => p.journal))}</section>
  <section class="section"><div class="section-head"><h2>Manuscript in preparation</h2></div>${academic.manuscripts.map(p => `<article class="manuscript-entry"><h3><a href="${p.url}">${esc(p.title)}</a></h3><p class="authors">${authors(p)}</p><span class="tag">${esc(p.status)}</span><p>A study of partial-distillation sequence selection under correlated noise, using the PairMoment reduced model.</p><a href="${p.url}">Research overview →</a></article>`).join('')}</section>`);

for (const p of papers) {
  const route = `/publications/${p.slug}/`;
  const journalMeta = p.journal ? `<meta name="citation_journal_title" content="${esc(p.journal)}"><meta name="citation_volume" content="${esc(p.volume)}"><meta name="citation_issue" content="${esc(p.issue)}"><meta name="citation_firstpage" content="${esc(p.pages ? p.pages.split('–')[0] : p.articleNumber)}">${p.pages ? `<meta name="citation_lastpage" content="${esc(p.pages.split('–')[1])}">` : ''}` : '';
  const meta = `<meta name="citation_title" content="${esc(p.title)}">${p.authors.map(a=>`<meta name="citation_author" content="${esc(a)}">`).join('')}<meta name="citation_publication_date" content="${p.date.replaceAll('-','/')}"><meta name="citation_doi" content="${p.doi}"><meta name="citation_arxiv_id" content="${p.arxiv}">${journalMeta}`;
  const abstract = p.abstract ? `<h2 id="abstract">Abstract</h2><p class="abstract">${esc(p.abstract)}</p><p class="source">Author abstract from <a href="https://arxiv.org/abs/${p.arxiv}">arXiv</a>, by ${esc(p.authors.join(', '))}. <a href="${p.abstractLicense}">CC BY 4.0</a>; mathematical notation reformatted for the web.</p>` : `<h2 id="summary">Research summary</h2><p>${esc(p.overview)}</p><p class="source">${p.journal ? `Read the <a href="https://doi.org/${p.doi}">journal article</a> or the <a href="https://arxiv.org/abs/${p.arxiv}">author preprint on arXiv</a>.` : `Summary of the preprint. Read the <a href="https://arxiv.org/abs/${p.arxiv}">full author abstract on arXiv</a>.`}</p>`;
  const contributions = p.contributions ? `<h2>My contributions</h2><ul>${p.contributions.map(point => `<li>${esc(point)}</li>`).join('')}</ul>` : '';
  const publicationSchema = p.journal ? {isPartOf:{'@type':'PublicationIssue',issueNumber:p.issue,isPartOf:{'@type':'PublicationVolume',volumeNumber:p.volume,isPartOf:{'@type':'Periodical',name:p.journal}}},pagination:p.pages || p.articleNumber} : {isAccessibleForFree:true};
  await page(route,`${p.title} | Mingyuan Wang`,p.summary,
    `<div class="page-top paper-head"><p class="breadcrumb"><a href="/publications/">Publications</a> / ${p.date.slice(0,4)}</p><p class="eyebrow">${p.tag}</p><h1>${esc(p.title)}</h1><p class="authors">${authors(p)}</p><p class="paper-meta">${esc(paperStatus(p))}<br>${p.journal ? 'Published' : 'Preprint submitted'} ${longDate(p.date)} · <a href="https://doi.org/${p.doi}">DOI</a></p><p class="publication-venue">${publicationReference(p)}</p></div><article class="prose">${abstract}${resources(p,true)}${contributions}${p.abstract ? `<h2>Research overview</h2><p>${esc(p.overview)}</p>` : ''}<h2>Scope of the results</h2><p>${esc(p.scope)}</p><h2 id="cite">Cite this work</h2><p>${esc(p.authors.join(', '))}. <em>${esc(p.title)}</em>. ${publicationReference(p)}. <a href="https://doi.org/${p.doi}">${p.doi}</a>.</p><details><summary>BibTeX citation</summary><pre><code>${esc(bib(p))}</code></pre></details><a href="${route}citation.bib" download>Download BibTeX</a><h2>Related research</h2><p><a href="${p.related || '/research/entanglement-distillation/'}">${esc(p.relatedLabel || 'Entanglement distillation: from GHZ states to graph states')}</a></p></article>`,meta,
    {'@type':'ScholarlyArticle','@id':absolute(route),url:absolute(route),headline:p.title,name:p.title,author:p.authors.map(a=>a===config.name ? person : {'@type':'Person',name:a}),datePublished:p.date,description:p.summary,...(p.abstract ? {abstract:p.abstract,license:p.abstractLicense} : {}),creativeWorkStatus:p.status,identifier:[{'@type':'PropertyValue',propertyID:'DOI',value:p.doi},{'@type':'PropertyValue',propertyID:'arXiv',value:p.arxiv}],sameAs:p.journal ? `https://doi.org/${p.doi}` : `https://arxiv.org/abs/${p.arxiv}`,...publicationSchema});
  await writeFile(path.join(out,route.slice(1),'citation.bib'),bib(p));
}

await page('/research/','Research | Mingyuan Wang','Mingyuan Wang’s research on multipartite entanglement, PairMoment sequence control, resource-constrained graph-state synthesis, quantum networks, and quantum error correction.',
  `${heading('Quantum information','Research','Structure, noise, and finite resources in quantum information processing.')}${await content('research')}`);

await page('/research/entanglement-distillation/','Entanglement Distillation: GHZ & Graph States | Mingyuan Wang','GHZ-preserving gates, affine binary representations, and graph-state purification across local Clifford orbits, with papers and research software.',
  `${heading('Research overview','Entanglement distillation','Compact representations for multipartite quantum protocols.')}${await content('entanglement-distillation')}`);

await page('/research/sequence-control/','Partial Distillation & PairMoment Sequence Control | Mingyuan Wang','Sequence control for partial graph-state distillation under correlated noise. PairMoment uses an O(n²) state representation of single-vertex errors and pair correlations.',
  `${heading('Current research','Sequence control under correlated noise','Partial graph-state distillation and the PairMoment reduced model.')}${await content('sequence-control')}`);

await page('/research/graph-state-synthesis/','Resource-Constrained Graph-State Synthesis | Mingyuan Wang','Ongoing research on reachable error distributions in graph-state synthesis using noisy resource states and fusion operations, with task-aware optimization goals.',
  `${heading('Current research','Resource-constrained graph-state synthesis','Shaping the errors seen by downstream quantum protocols.')}${await content('graph-state-synthesis')}`);

await page('/cv/','Academic CV & Contact | Mingyuan Wang','Mingyuan Wang, Physics PhD candidate at UMass Amherst: research experience, publications, manuscripts, talks, technical expertise, leadership, teaching, and contact.',
  `${heading('Background & contact','Academic profile','Physics PhD candidate · University of Massachusetts Amherst')}${renderCv(academic, papers, {esc, authors, paperStatus, publicationReference, config})}`);

await page('/credits/','Sources & Credits | Mingyuan Wang','Sources for academic information and attribution for reused material on Mingyuan Wang’s website.',
  `${heading('Site information','Sources & credits')}<div class="prose"><h2>Academic information</h2><p>Research descriptions, appointments, teaching, and service have been expanded from Mingyuan Wang’s author-supplied curriculum vitae and research statement. Ongoing projects, manuscripts in preparation, preprints, and journal articles are identified separately.</p><ul><li><a href="${config.lab}">Krastanov Lab member directory</a>: affiliation, education, contact information, and photograph.</li><li><a href="https://www.umass.edu/quantum/2025-quantumsavory-workshop/">UMass quantum networking workshop</a>: research interests and workshop talk.</li><li><a href="https://meetings-archive.aps.org/smt/2025/mar-g33/8/">APS Global Physics Summit 2025</a>: conference presentation.</li>${papers.map(p=>`<li><a href="https://arxiv.org/abs/${p.arxiv}">${esc(p.title)}</a>: paper metadata and research description.</li>`).join('')}</ul><h2>Reused material</h2><p>The photograph of Mingyuan Wang is reproduced without modification from the <a href="${config.lab}">Krastanov Lab website</a>, credited there to Stefan Krastanov under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. The displayed crop is made with CSS.</p><p>The abstract of the 2025 GHZ preprint is reproduced under its <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0 license</a>, with mathematical notation reformatted for the web. Authorship is listed on the paper page.</p><p>The 2026 graph-state page contains a research summary and links to the original abstract. Summaries are separate from the authors’ original abstracts.</p><h2>Last content review</h2><p>${longDate(config.updated)}. Journal articles are distinguished from preprints and manuscripts in preparation. Submission venues are reported by the author and do not imply acceptance.</p></div>`);

await page('/404.html','Page Not Found | Mingyuan Wang','The requested page could not be found.',`${heading('404','Page not found','The page may have moved or the address may be incorrect.')}<div class="prose"><p><a href="/">Return to the homepage</a> or <a href="/publications/">browse publications</a>.</p></div>`);
await writeFile(path.join(out,'.nojekyll'),'');
await writeFile(path.join(out,'robots.txt'),origin ? `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
if (origin) await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route=>`<url><loc>${esc(absolute(route))}</loc><lastmod>${config.updated}</lastmod></url>`).join('')}</urlset>\n`);
console.log(`Built ${routes.length + 1} HTML pages into dist. ${origin ? `Canonical origin: ${origin}` : 'Local preview only: no production domain configured; indexing disabled.'}`);
