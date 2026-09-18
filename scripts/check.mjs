import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../dist/',import.meta.url));
async function walk(dir) {return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(path.join(dir,e.name)):path.join(dir,e.name)))).flat();}
const files = await walk(root);
let links = 0;
for (const file of files.filter(f=>f.endsWith('.html'))) {
  const html = await readFile(file,'utf8');
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,`${file}: expected one h1`);
  assert.match(html,/<html lang="en">/);
  assert.match(html,/<meta name="description" content="[^"]+">/);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#]*)(?:#[^"]*)?"/g)) {
    let target = path.join(root,m[1]);
    if (m[1].endsWith('/')) target = path.join(target,'index.html');
    assert.ok((await stat(target)).isFile(),`${file}: missing ${m[1]}`);
    links++;
  }
  assert.doesNotMatch(html,/undefined|TODO|Lorem ipsum|<script (?:src|defer)/);
}
const config = JSON.parse(await readFile(new URL('../site.config.json',import.meta.url),'utf8'));
const origin = (process.env.SITE_URL || config.url).replace(/\/$/,'');
const home = await readFile(path.join(root,'index.html'),'utf8');
const robots = await readFile(path.join(root,'robots.txt'),'utf8');
if (origin) {
  assert.ok(home.includes(`rel="canonical" href="${origin}/"`));
  assert.doesNotMatch(home,/name="robots" content="noindex"/);
  assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
  assert.ok((await readFile(path.join(root,'sitemap.xml'),'utf8')).includes(`${origin}/publications/ghz-preserving-gates/`));
} else {
  assert.match(home,/name="robots" content="noindex"/);
  assert.match(robots,/Disallow: \//);
  assert.doesNotMatch(home,/rel="canonical"/);
}
const papers = JSON.parse(await readFile(new URL('../content/publications.json',import.meta.url),'utf8'));
for (const p of papers) {
  const html = await readFile(path.join(root,'publications',p.slug,'index.html'),'utf8');
  assert.equal((html.match(/name="citation_author"/g)||[]).length,p.authors.length);
  assert.ok(html.includes(`content="${p.doi}"`));
  const citation = await readFile(path.join(root,'publications',p.slug,'citation.bib'),'utf8');
  assert.ok(citation.includes(p.authors.join(' and ')));
}
console.log(`Verified ${files.filter(f=>f.endsWith('.html')).length} pages, ${links} local links/assets, JSON-LD, indexing mode, and citations.`);
