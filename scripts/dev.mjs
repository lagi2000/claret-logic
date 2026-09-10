/** Dependency-free development server; never used by the deployed game. */
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const root=new URL('../dist/',import.meta.url).pathname;
const args=process.argv.slice(2),get=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.jpeg':'image/jpeg'};
http.createServer((req,res)=>{
 try{const url=new URL(req.url,'http://localhost');if(url.pathname==='/__qa'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});fs.createReadStream(new URL('../tests/browser-harness.html',import.meta.url)).pipe(res);return;}const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('No encontrado');return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(400);res.end('Solicitud no válida');}
}).listen(Number(get('--port',4173)),get('--host','0.0.0.0'),()=>console.log('Claret Logic listo para revisión.'));
