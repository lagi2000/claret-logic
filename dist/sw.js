const PREFIX='claret-logic-'+encodeURIComponent(new URL(self.registration.scope).pathname)+'-';
const CACHE=PREFIX+'interaction-install-350';
const ASSETS=["./","./actualizar.html","./assets/claret.jpeg","./assets/cover.png","./assets/icon-192.png","./assets/icon-512.png","./assets/maria-reference.png","./assets/worlds/01-sallent.webp","./assets/worlds/02-vic.webp","./assets/worlds/03-cuba.webp","./assets/worlds/04-madrid.webp","./assets/worlds/05-las-palmas.webp","./assets/worlds/06-don-benito.webp","./assets/worlds/07-sevilla.webp","./assets/worlds/08-carvalhos.webp","./assets/worlds/09-zimbabue.webp","./assets/worlds/10-fatima.webp","./index.html","./js/app.js","./js/engine.js","./js/feedback.js","./js/journey.js","./js/layout.js","./js/levels.js","./js/missions.js","./js/pedagogy.js","./js/state.js","./js/tutorials.js","./js/worlds.js","./manifest.webmanifest","./styles.css"];
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
