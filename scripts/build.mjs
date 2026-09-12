import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=new URL('../dist/',import.meta.url);
const list=fs.readdirSync(root,{recursive:true}).filter(f=>fs.statSync(new URL(f,root)).isFile()&&f!=='sw.js').sort();
for(const f of list.filter(f=>f.endsWith('.js')))execFileSync(process.execPath,['--check',new URL(f,root).pathname]);
const html=fs.readFileSync(new URL('index.html',root),'utf8');
for(const m of html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g))if(!fs.existsSync(new URL(m[1],root)))throw Error('Missing asset: '+m[1]);
const hash=crypto.createHash('sha256');for(const f of list)hash.update(fs.readFileSync(new URL(f,root)));
const version=hash.digest('hex').slice(0,12);
const sw=`const PREFIX='claret-logic-'+encodeURIComponent(new URL(self.registration.scope).pathname)+'-';
const CACHE=PREFIX+'${version}';
const ASSETS=${JSON.stringify(['./',...list.map(f=>'./'+f)])};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();const windows=self.clients.matchAll?await self.clients.matchAll({type:'window'}):[];await Promise.all(windows.map(client=>client.navigate?client.navigate(client.url):null));})());});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 const relative='./'+url.pathname.slice(scope.pathname.length);
 if(event.request.mode==='navigate'){
  if(!['./','./index.html'].includes(relative))return;
  event.respondWith(caches.open(CACHE).then(async cache=>{try{const response=await fetch(event.request);if(response?.ok&&cache.put)await cache.put('./index.html',response.clone());return response;}catch{return cache.match('./index.html');}}));return;
 }
 if(!ASSETS.includes(relative))return;
 event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(relative))||fetch(event.request)));
});
`;
fs.writeFileSync(new URL('sw.js',root),sw);execFileSync(process.execPath,['--check',new URL('sw.js',root).pathname]);
console.log('Build validado: '+list.length+' archivos; caché '+version);
