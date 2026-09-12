import test from 'node:test';
import assert from 'node:assert/strict';
import {access,readFile,stat} from 'node:fs/promises';
import {worlds,routePoints,worldIndexForLevel,unlockedWorldIndex} from '../dist/js/worlds.js';
import {fittedBoardSize} from '../dist/js/layout.js';

const expected=[
  ['Sallent','Retos 1–10','Explorador'],
  ['Vic','Retos 11–20','Aprendiz'],
  ['Cuba','Retos 21–30','Observador'],
  ['Madrid · Palacio Real','Retos 31–40','Estratega'],
  ['Las Palmas de Gran Canaria','Retos 41–50','Experto'],
  ['Don Benito','Retos 51–60','Maestro'],
  ['Sevilla','Retos 61–70','Mente brillante'],
  ['Carvalhos','Retos 71–80','Genio lógico'],
  ['Zimbabue','Retos 81–90','Gran estratega'],
  ['Fátima','Retos 91–100','Mente Claret']
];

test('Los diez mundos respetan el orden, los rangos y los bloques aprobados',()=>{
  assert.equal(worlds.length,10);
  assert.deepEqual(worlds.map(({place,range,rank})=>[place,range,rank]),expected);
});

test('Cada mundo dispone de arte web optimizado y metadatos completos',async()=>{
  for(const world of worlds){
    assert.match(world.art,/^\d{2}-[a-z-]+\.webp$/);
    assert.ok(world.description.length>30);
    const path=new URL(`../dist/assets/worlds/${world.art}`,import.meta.url);
    await access(path);
    assert.ok((await stat(path)).size<300_000,`${world.art} debe pesar menos de 300 KB`);
  }
});

test('La ruta tiene diez posiciones distintas y permanece dentro del escenario',()=>{
  assert.equal(routePoints.length,10);
  assert.equal(new Set(routePoints.map(String)).size,10);
  for(const [x,y] of routePoints){assert.ok(x>=0&&x<=100);assert.ok(y>=0&&y<=100);}
});

test('El nivel y el progreso abren exactamente el mundo correspondiente',()=>{
  assert.equal(worldIndexForLevel(0),0);assert.equal(worldIndexForLevel(9),0);
  assert.equal(worldIndexForLevel(10),1);assert.equal(worldIndexForLevel(99),9);
  assert.equal(unlockedWorldIndex({index:0,completed:0}),0);
  assert.equal(unlockedWorldIndex({index:40,completed:40}),4);
  assert.equal(unlockedWorldIndex({index:99,completed:100}),9);
});

test('La interfaz incluye recorrido, racha, misiones y celebración accesibles',async()=>{
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  for(const id of ['worldMap','worldScene','worldAmbience','levelNodes','achievement','collection','badgeGrid','journeyButton','journeyOverview','journeyList','journeyCurrent','startDaily','mapDaily','gameDaily','daily','missionIntro','claretReaction'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/aria-labelledby="worldTitle"/);
  assert.match(html,/aria-labelledby="achievementTitle"/);
  assert.match(html,/aria-labelledby="collectionTitle"/);
  assert.match(html,/aria-labelledby="journeyTitle"/);
  assert.match(html,/aria-labelledby="missionIntroTitle"/);
});

test('La cuadrícula no dibuja números de región y limita el distintivo a la guía',async()=>{
  const app=await readFile(new URL('../dist/js/app.js',import.meta.url),'utf8');
  assert.doesNotMatch(app,/className='regionid'/);
  assert.match(app,/classList\.toggle\('fixed',Boolean\(mission\?\.fixed\?\.includes\(k\)\)\)/);
  assert.match(app,/pulseConsequences\(k,L\)/);
});

test('El tablero aprovecha el ancho sin crecer fuera de la altura visible',()=>{
  assert.equal(fittedBoardSize({viewport:700,contentHeight:520,boardSize:170,maxWidth:345}),330);
  assert.equal(fittedBoardSize({viewport:844,contentHeight:650,boardSize:320,maxWidth:345}),345);
  assert.equal(fittedBoardSize({viewport:480,contentHeight:600,boardSize:220,maxWidth:300}),168);
});
