import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
const papers = JSON.parse(await readFile(path.join(root, 'content/publications.json'), 'utf8'));
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
  url:absolute('/'), jobTitle:'Physics PhD Student', email:`mailto:${config.email}`,
  affiliation:{'@type':'CollegeOrUniversity',name:'University of Massachusetts Amherst',url:'https://www.umass.edu/'},
  sameAs:[config.github,config.lab], knowsAbout:['Entanglement distillation','Quantum error correction','Graph-state purification'],
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
function resources(p,detail=false) {
  return `<div class="links">${detail ? '' : `<a href="/publications/${p.slug}/">Paper details</a>`}<a href="https://arxiv.org/abs/${p.arxiv}">arXiv</a><a href="https://arxiv.org/pdf/${p.arxiv}">PDF</a><a href="${p.code}">Code</a>${p.archive ? `<a href="${p.archive}">Archived code</a>` : ''}<a href="/publications/${p.slug}/citation.bib" download>BibTeX</a></div>`;
}
function paperList() {
  return papers.map(p=>`<article class="paper"><div class="paper-year">${p.date.slice(0,4)}</div><div><h3><a href="/publications/${p.slug}/">${esc(p.title)}</a></h3><p class="authors">${authors(p)}</p><span class="tag">${p.status} · arXiv:${p.arxiv}</span><p class="summary">${esc(p.summary)}</p>${resources(p)}</div></article>`).join('');
}
function heading(kicker,title,intro='') {
  return `<div class="page-top"><p class="eyebrow">${kicker}</p><h1>${title}</h1>${intro ? `<p class="lead">${intro}</p>` : ''}</div>`;
}
function bib(p) {
  return `@misc{wang${p.date.slice(0,4)}${p.slug.replaceAll('-','')},\n  title = {{${p.title}}},\n  author = {${p.authors.join(' and ')}},\n  year = {${p.date.slice(0,4)}},\n  eprint = {${p.arxiv}},\n  archivePrefix = {arXiv},\n  primaryClass = {quant-ph},\n  doi = {${p.doi}},\n  url = {https://arxiv.org/abs/${p.arxiv}}\n}\n`;
}

// Remove only this script's fixed build directory, after verifying its location.
if (path.dirname(out) !== path.resolve(root) || path.basename(out) !== 'dist') throw new Error('Unsafe build directory.');
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await cp(path.join(root,'public'),out,{recursive:true});

await page('/', 'Mingyuan Wang | Quantum Information · UMass Amherst',
  'Mingyuan Wang is a Physics PhD student at UMass Amherst studying entanglement distillation and quantum error correction in the Krastanov Lab.',
  `<section class="hero"><div><p class="eyebrow">Quantum information · UMass Amherst</p><h1>Mingyuan Wang <span class="chinese" lang="zh">王明元</span></h1><p class="position">Physics PhD student · Krastanov Lab</p><p class="intro">I study how to preserve and distill entanglement in noisy quantum systems. My research focuses on <strong>entanglement distillation</strong> and <strong>quantum error correction</strong>, with recent work on GHZ states and graph-state purification.</p><p>I am a PhD student at the University of Massachusetts Amherst, working with <a href="https://lab.krastanov.org/">Stefan Krastanov</a>.</p><div class="links"><a class="button" href="/publications/">Explore my research</a><a href="mailto:${config.email}">Email</a><a href="${config.github}">GitHub</a></div></div><aside class="portrait-panel"><img class="portrait" src="/assets/mingyuan-wang.jpg" alt="Mingyuan Wang" width="248" height="302"><div class="portrait-note"><strong>University of Massachusetts Amherst</strong>Department of Physics<br>Amherst, Massachusetts</div></aside></section>
  <section class="research-strip" aria-labelledby="focus"><h2 id="focus">Research focus</h2><p>From <a href="/publications/ghz-preserving-gates/">GHZ-preserving gates</a> to <a href="/publications/graph-state-purification/">graph-state purification</a>: designing entanglement distillation circuits with noise in mind.</p></section>
  <section class="section"><div class="section-head"><h2>Selected publications</h2><a href="/publications/">View publications →</a></div>${paperList()}</section>
  <div class="lower-grid section"><section><h2>Recent work & talks</h2><article class="event"><time datetime="2026-06-22">June 2026</time><p>New preprint on <a href="/publications/graph-state-purification/">graph-state purification across local Clifford orbits</a>.</p></article><article class="event"><time datetime="2025-10-29">October 2025</time><p><a href="/publications/ghz-preserving-gates/">GHZ-Preserving Gates and Optimized Distillation Circuits</a> is available on arXiv.</p></article><article class="event"><time datetime="2025-06-02">June 2025</time><p>Presented “From GHZ to Graph states: A Group-Based Approach to Entanglement Preservation” at the <a href="https://www.umass.edu/quantum/2025-quantumsavory-workshop/">UMass quantum networking workshop</a>.</p></article></section><section><h2>Research software</h2><p>Implementations and research code for exploring entanglement distillation.</p><article class="event"><h3><a href="https://github.com/Mingyuan1231/GraphPreserving">GraphPreserving</a></h3><p>A Julia package for representing and simulating graph-preserving operations.</p></article><article class="event"><h3><a href="https://github.com/Mingyuan1231/GHZ_Preserving">GHZPreserving.jl</a></h3><p>Julia implementations of GHZ-preserving circuit optimization algorithms.</p></article></section></div>`,
  '',{'@type':'ProfilePage',name:'Mingyuan Wang — academic profile',url:absolute('/'),mainEntity:person});

await page('/publications/','Publications | Mingyuan Wang','Selected quantum information preprints by Mingyuan Wang, with paper details, source code, and BibTeX citations.',
  `${heading('Research output','Publications','Selected work on entanglement distillation and quantum information. Publication status is shown for each paper.')}<section class="section" aria-label="Publication list">${paperList()}</section>`);

for (const p of papers) {
  const route = `/publications/${p.slug}/`;
  const meta = `<meta name="citation_title" content="${esc(p.title)}">${p.authors.map(a=>`<meta name="citation_author" content="${esc(a)}">`).join('')}<meta name="citation_publication_date" content="${p.date.replaceAll('-','/')}"><meta name="citation_doi" content="${p.doi}"><meta name="citation_arxiv_id" content="${p.arxiv}">`;
  const abstract = p.abstract ? `<h2 id="abstract">Abstract</h2><p class="abstract">${esc(p.abstract)}</p><p class="source">Author abstract from <a href="https://arxiv.org/abs/${p.arxiv}">arXiv</a>, by ${esc(p.authors.join(', '))}. <a href="${p.abstractLicense}">CC BY 4.0</a>; mathematical notation reformatted for the web.</p>` : `<h2 id="summary">Research summary</h2><p>${esc(p.overview)}</p><p class="source">Summary of the preprint. Read the <a href="https://arxiv.org/abs/${p.arxiv}">full author abstract on arXiv</a>.</p>`;
  await page(route,`${p.title} | Mingyuan Wang`,p.summary,
    `<div class="page-top paper-head"><p class="breadcrumb"><a href="/publications/">Publications</a> / ${p.date.slice(0,4)}</p><p class="eyebrow">${p.tag} · ${p.status}</p><h1>${esc(p.title)}</h1><p class="authors">${authors(p)}</p><p class="paper-meta">Submitted ${longDate(p.date)} · arXiv:${p.arxiv} · <a href="https://doi.org/${p.doi}">DOI</a></p></div><article class="prose">${abstract}${resources(p,true)}${p.abstract ? `<h2>Research overview</h2><p>${esc(p.overview)}</p>` : ''}<h2>Scope of the results</h2><p>${esc(p.scope)}</p><h2 id="cite">Cite this work</h2><p>${esc(p.authors.join(', '))}. <em>${esc(p.title)}</em>. arXiv:${p.arxiv} (${p.date.slice(0,4)}). <a href="https://doi.org/${p.doi}">${p.doi}</a>.</p><details><summary>BibTeX citation</summary><pre><code>${esc(bib(p))}</code></pre></details><a href="${route}citation.bib" download>Download BibTeX</a><h2>Related research</h2><p><a href="/research/entanglement-distillation/">Entanglement distillation: from GHZ states to graph states</a></p></article>`,meta,
    {'@type':'ScholarlyArticle','@id':absolute(route),url:absolute(route),headline:p.title,name:p.title,author:p.authors.map(a=>a===config.name ? person : {'@type':'Person',name:a}),datePublished:p.date,description:p.summary,...(p.abstract ? {abstract:p.abstract,license:p.abstractLicense} : {}),creativeWorkStatus:'Preprint',identifier:[{'@type':'PropertyValue',propertyID:'DOI',value:p.doi},{'@type':'PropertyValue',propertyID:'arXiv',value:p.arxiv}],sameAs:`https://arxiv.org/abs/${p.arxiv}`,isAccessibleForFree:true});
  await writeFile(path.join(out,route.slice(1),'citation.bib'),bib(p));
}

await page('/research/','Research | Mingyuan Wang','Research on multipartite entanglement distillation, GHZ-preserving gates, graph-state purification, and quantum error correction.',
  `${heading('Quantum information','Research','Preserving useful entanglement in the presence of noise.')}<div class="prose"><p>My research focuses on entanglement distillation and quantum error correction. In my recent work, I study the structure of operations that preserve GHZ and graph states and use that structure to design distillation circuits.</p><div class="topic-list"><article><h2><a href="/research/entanglement-distillation/">Entanglement distillation</a></h2><p>How can the structure of multipartite entanglement help us search for purification circuits?</p><a href="/research/entanglement-distillation/">Read the research overview →</a></article><article><h2>GHZ-preserving operations</h2><p>Specialized representations make the simulation of GHZ-preserving gates efficient enough to support circuit optimization.</p><a href="/publications/ghz-preserving-gates/">Read the 2025 preprint →</a></article><article><h2>Graph-state purification</h2><p>Graph-preserving operations and local Clifford equivalences provide a way to organize the search for multipartite purification circuits.</p><a href="/publications/graph-state-purification/">Read the 2026 preprint →</a></article></div></div>`);

await page('/research/entanglement-distillation/','Entanglement Distillation: GHZ & Graph States | Mingyuan Wang','An overview of Mingyuan Wang’s research on GHZ and graph-state entanglement distillation, with links to the underlying preprints and code.',
  `${heading('Research overview','Entanglement distillation','From GHZ states to graph states.')}<article class="prose"><p>My work investigates how algebraic and graph structure can guide the design of circuits for purifying multipartite entanglement.</p><h2>What role do GHZ-preserving gates play?</h2><p>The <a href="/publications/ghz-preserving-gates/">2025 preprint</a> uses a specialized representation of operations that preserve GHZ structure. Faster gate simulation supports the search for distillation circuits and their adaptation to noise models.</p><h2>How does the approach extend to graph states?</h2><p>The <a href="/publications/graph-state-purification/">2026 preprint</a> organizes graph-preserving operations across local-complementation orbits. This connects purification circuit design for graph states that are locally Clifford equivalent.</p><h2>What should I check before applying these results?</h2><p>The relevant state family, allowed operations, and noise assumptions matter. Consult the preprints for the precise representation, circuit constraints, and numerical comparisons; a specialized simulation speedup is not a speedup for arbitrary quantum computation.</p><h2>Where can I find the implementation?</h2><ul><li><a href="https://github.com/Mingyuan1231/GHZ_Preserving">GHZPreserving.jl</a> provides GHZ-preserving circuit optimization code.</li><li><a href="https://github.com/Mingyuan1231/GraphPreserving">GraphPreserving</a> represents and simulates graph-preserving operations in Julia.</li></ul><h2>References</h2><ol>${papers.map(p=>`<li>${esc(p.authors.join(', '))}. <a href="https://arxiv.org/abs/${p.arxiv}">${esc(p.title)}</a>. Preprint, ${p.date.slice(0,4)}.</li>`).join('')}</ol><p class="source">Overview updated ${longDate(config.updated)}.</p></article>`);

await page('/cv/','Academic CV & Contact | Mingyuan Wang','Mingyuan Wang’s academic background, physics PhD studies at UMass Amherst, selected talks, and contact information.',
  `${heading('Background & contact','Academic profile')}<div class="prose"><h2>Education</h2><div class="cv-row"><div class="date">2021–present</div><div><strong>PhD studies in Physics</strong><p>University of Massachusetts Amherst<br>Advisor: Stefan Krastanov</p></div></div><div class="cv-row"><div class="date">Undergraduate</div><div><strong>BS in Physics · BS in Mathematics</strong><p>Case Western Reserve University</p></div></div><h2>Research interests</h2><p>Entanglement distillation, quantum error correction, GHZ-preserving gates, and graph-state purification.</p><h2>Selected talks</h2><div class="cv-row"><div class="date">June 2, 2025</div><div><strong>From GHZ to Graph states: A Group-Based Approach to Entanglement Preservation</strong><p><a href="https://www.umass.edu/quantum/2025-quantumsavory-workshop/">Quantum Networking Workshop: Modeling, Applications, Design</a><br>UMass Amherst</p></div></div><div class="cv-row"><div class="date">March 18, 2025</div><div><strong>GHZ-preserving Gates and Optimized Purification Circuits</strong><p><a href="https://meetings-archive.aps.org/smt/2025/mar-g33/8/">APS Global Physics Summit 2025</a></p></div></div><h2>Publications & software</h2><p><a href="/publications/">Selected publications and preprints</a> · <a href="${config.github}">Research code on GitHub</a></p><section class="contact" id="contact"><h2>Get in touch</h2><p><a href="mailto:${config.email}">${config.email}</a></p><p>Department of Physics<br>University of Massachusetts Amherst<br>Amherst, Massachusetts, USA</p><p><a href="${config.lab}">Krastanov Lab</a> · <a href="${config.github}">GitHub</a></p></section></div>`);

await page('/credits/','Sources & Credits | Mingyuan Wang','Sources for academic information and attribution for reused material on Mingyuan Wang’s website.',
  `${heading('Site information','Sources & credits')}<div class="prose"><h2>Academic information</h2><ul><li><a href="${config.lab}">Krastanov Lab member directory</a>: affiliation, education, contact information, and photograph.</li><li><a href="https://www.umass.edu/quantum/2025-quantumsavory-workshop/">UMass quantum networking workshop</a>: research interests and workshop talk.</li><li><a href="https://meetings-archive.aps.org/smt/2025/mar-g33/8/">APS Global Physics Summit 2025</a>: conference presentation.</li>${papers.map(p=>`<li><a href="https://arxiv.org/abs/${p.arxiv}">${esc(p.title)}</a>: paper metadata and research description.</li>`).join('')}</ul><h2>Reused material</h2><p>The photograph of Mingyuan Wang is reproduced without modification from the <a href="${config.lab}">Krastanov Lab website</a>, credited there to Stefan Krastanov under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. The displayed crop is made with CSS.</p><p>The abstract of the 2025 GHZ preprint is reproduced under its <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0 license</a>, with mathematical notation reformatted for the web. Authorship is listed on the paper page.</p><p>The 2026 graph-state page contains a research summary and links to the original abstract. Summaries are separate from the authors’ original abstracts.</p><h2>Last content review</h2><p>${longDate(config.updated)}. Preprints are labeled explicitly; a listing does not imply peer-reviewed publication.</p></div>`);

await page('/404.html','Page Not Found | Mingyuan Wang','The requested page could not be found.',`${heading('404','Page not found','The page may have moved or the address may be incorrect.')}<div class="prose"><p><a href="/">Return to the homepage</a> or <a href="/publications/">browse publications</a>.</p></div>`);
await writeFile(path.join(out,'.nojekyll'),'');
await writeFile(path.join(out,'robots.txt'),origin ? `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
if (origin) await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route=>`<url><loc>${esc(absolute(route))}</loc><lastmod>${config.updated}</lastmod></url>`).join('')}</urlset>\n`);
console.log(`Built ${routes.length + 1} HTML pages into dist. ${origin ? `Canonical origin: ${origin}` : 'Local preview only: no production domain configured; indexing disabled.'}`);
