import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../dist/',import.meta.url));
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.bib':'text/plain; charset=utf-8','.xml':'application/xml','.txt':'text/plain'};
const port = Number(process.env.PORT || 4173);
http.createServer(async(req,res)=>{
  try {
    const url = new URL(req.url,'http://localhost');
    const name = decodeURIComponent(url.pathname);
    let target = path.resolve(root,`.${name}`);
    const rel = path.relative(root,target);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {res.writeHead(403);res.end();return;}
    if ((await stat(target)).isDirectory()) {
      if (!name.endsWith('/')) {res.writeHead(301,{Location:`${url.pathname}/${url.search}`});res.end();return;}
      target = path.join(target,'index.html');
    }
    const body = await readFile(target);
    res.writeHead(200,{'Content-Type':mime[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});
    res.end(await readFile(path.join(root,'404.html')));
  }
}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}`));
