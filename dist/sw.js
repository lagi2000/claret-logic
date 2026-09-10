const PREFIX='claret-logic-'+encodeURIComponent(new URL(self.registration.scope).pathname)+'-';
const CACHE=PREFIX+'02c969845769';
const ASSETS=["./","./.nojekyll","./assets/claret.jpeg","./assets/cover.png","./assets/icon-192.png","./assets/icon-512.png","./assets/maria-reference.png","./index.html","./js/app.js","./js/engine.js","./js/feedback.js","./js/levels.js","./js/pedagogy.js","./js/state.js","./js/tutorials.js","./manifest.webmanifest","./styles.css"];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url),scope=new URL(self.registration.scope);
 if(event.request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 const relative='./'+url.pathname.slice(scope.pathname.length);
 if(event.request.mode==='navigate'){
  if(!['./','./index.html'].includes(relative))return;
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match('./index.html'))||fetch(event.request)));return;
 }
 if(!ASSETS.includes(relative))return;
 event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(relative))||fetch(event.request)));
});
