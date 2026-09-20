import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const source=fs.readFileSync(new URL('../dist/sw.js',import.meta.url),'utf8');
function runtime({online=false}={}){
 const events={},stores=new Map(),deleted=[],navigated=[],lifecycleState={skipWaiting:false},scope='https://colegio.example/juegos/claret/',foreign='claret-logic-%2Fotra-app%2F-old';let fetches=0;stores.set(foreign,new Map());
 stores.set('claret-logic-%2Fjuegos%2Fclaret%2F-old',new Map());
 const caches={keys:async()=>[...stores.keys()],delete:async k=>{deleted.push(k);return stores.delete(k);},open:async k=>{
   if(!stores.has(k))stores.set(k,new Map());const m=stores.get(k);
   return {addAll:async files=>{for(const f of files)m.set(f,{url:f,body:'cached '+f});},match:async request=>m.get(typeof request==='string'?request:request.url),put:async(key,value)=>m.set(key,value)};
 }};
 const fetch=async request=>{fetches++;if(!online)throw Error('offline');return {ok:true,url:request.url,clone(){return this;}};};
 vm.runInNewContext(source,{URL,caches,fetch,self:{registration:{scope},clients:{claim:async()=>{},matchAll:async()=>[{url:scope,navigate:async url=>navigated.push(url)}]},skipWaiting:async()=>{lifecycleState.skipWaiting=true;},addEventListener:(name,handler)=>events[name]=handler}});
 const lifecycle=async name=>{let p;events[name]({waitUntil:value=>p=value});await p;};
 const request=async(path,mode='cors',method='GET')=>{let p;events.fetch({request:{url:scope+path,mode,method},respondWith:value=>p=value});return p?await p:null;};
 return {events,stores,deleted,navigated,foreign,lifecycleState,get fetches(){return fetches;},lifecycle,request};
}
test('Manifest, iconos y rutas relativos listos para subcarpetas',()=>{const root=new URL('../dist/',import.meta.url),manifest=JSON.parse(fs.readFileSync(new URL('manifest.webmanifest',root)));assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./');for(const icon of manifest.icons)assert.ok(fs.existsSync(new URL(icon.src,root)));});
test('Instalación precarga todos los recursos y permite abrir offline',async()=>{const r=runtime();await r.lifecycle('install');await r.lifecycle('activate');assert.equal((await r.request('','navigate')).url,'./index.html');assert.equal((await r.request('js/levels.js')).url,'./js/levels.js');assert.equal((await r.request('assets/cover.png')).url,'./assets/cover.png');assert.equal((await r.request('assets/worlds/10-fatima.webp')).url,'./assets/worlds/10-fatima.webp');});
test('Una nueva versión toma el control sin esperar a cerrar todas las pestañas',async()=>{const r=runtime();await r.lifecycle('install');assert.equal(r.lifecycleState.skipWaiting,true);});
test('La actualización elimina solo las cachés de esta subcarpeta',async()=>{const r=runtime();await r.lifecycle('install');await r.lifecycle('activate');assert.ok(r.stores.has(r.foreign));assert.deepEqual(r.deleted,['claret-logic-%2Fjuegos%2Fclaret%2F-old']);});
test('La navegación busca una versión nueva y conserva la copia sin conexión',async()=>{const online=runtime({online:true});await online.lifecycle('install');assert.equal((await online.request('','navigate')).url,'https://colegio.example/juegos/claret/');assert.equal(online.fetches,1);const offline=runtime();await offline.lifecycle('install');assert.equal((await offline.request('','navigate')).url,'./index.html');});
test('Al activar una versión nueva no se interrumpe una partida abierta',async()=>{const r=runtime();await r.lifecycle('install');await r.lifecycle('activate');assert.deepEqual(r.navigated,[]);});
test('No intercepta páginas ajenas ni peticiones de escritura',async()=>{const r=runtime();await r.lifecycle('install');assert.equal(await r.request('otra-pagina','navigate'),null);assert.equal(await r.request('js/app.js','cors','POST'),null);assert.equal(await r.request('archivo-desconocido.png'),null);});
