import test from 'node:test';import assert from 'node:assert/strict';
import {levels} from '../dist/js/levels.js';import {teachingHint,advanceLesson} from '../dist/js/teaching.js';
import {fresh,normalize} from '../dist/js/state.js';
test('Cada tablero ofrece Claret deducible y la cadena sigue tras cualquier colocación correcta',()=>{
 for(const L of levels)for(const order of [L.solution.map((c,r)=>r*L.size+c),L.solution.map((c,r)=>r*L.size+c).reverse()]){
  const marks={};for(const k of order){const h=teachingHint(L,marks);assert.equal(h.type,'place',`Reto ${L.n}`);assert.equal(L.solution[Math.floor(h.target/L.size)],h.target%L.size);assert.ok(h.explanation);marks[k]='c';}assert.equal(teachingHint(L,marks),null);
 }
});
test('Ayuda detecta una cruz que oculta Claret en vez de dar un descarte falso',()=>{const L=levels[15],h=teachingHint(L,{[L.solution[0]]:'x'});assert.equal(h.type,'review');assert.equal(h.target,L.solution[0]);});
test('Tres explicaciones cuestan una ayuda incluso tras recargar y con cero ayudas',()=>{
 let s=fresh();s.helps=1;assert.equal(advanceLesson(s,'[]'),1);assert.equal(s.helps,0);s=normalize(s);
 assert.equal(advanceLesson(s,'[]'),2);assert.equal(advanceLesson(s,'[]'),3);assert.equal(s.helps,0);assert.equal(advanceLesson(s,'different'),0);
});
