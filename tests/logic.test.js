import test from 'node:test';import assert from 'node:assert/strict';
import {levels} from '../dist/js/levels.js';
import {tutorials} from '../dist/js/tutorials.js';
import {solve} from '../scripts/solver.mjs';
import {connectedRegions,autoMarks,diagnose,conflictRules} from '../dist/js/engine.js';
import {deductions,nextHint} from '../dist/js/pedagogy.js';

test('Las dos prácticas 4×4 aplican las tres reglas y tienen solución única',()=>{for(const L of tutorials){assert.equal(L.size,4);assert.deepEqual(L.activeRules,['region','rowcol','touch']);assert.equal(solve(L,100).count,1);}});
for(const L of levels)test(`Reto ${L.n}: unicidad, conexión, referencia y prueba deductiva`,()=>{
 const s=solve(L);assert.equal(s.count,1);assert.ok(connectedRegions(L));
 assert.deepEqual(s.solutions[0],L.solution.map((c,r)=>r*L.size+c));
 assert.ok(diagnose(L,Object.fromEntries(s.solutions[0].map(k=>[k,'c']))).ok);
 const p=deductions(L);assert.ok(p.solved);
 for(const step of p.trace){if(step.type==='place')assert.ok(s.solutions[0].includes(step.target));else for(const k of step.removed)assert.ok(!s.solutions[0].includes(k));}
});
test('Las prácticas descartan fila, columna, color y contacto',()=>{const L=tutorials[0],k=L.solution[0],auto=autoMarks(L,{[k]:'c'});assert.ok(auto.has(0));assert.ok(auto.has(1));assert.ok(auto.has(3));assert.ok(auto.has(6));assert.ok(auto.has(5));assert.ok(auto.has(7));});
test('Las hipótesis equivocadas no consultan la solución',()=>{const L=levels[5],wrong=Array.from({length:L.size**2},(_,i)=>i).find(k=>!L.solution.map((c,r)=>r*L.size+c).includes(k));const auto=autoMarks(L,{[wrong]:'c'});assert.ok(auto.size>0);assert.ok(!auto.has(wrong));assert.deepEqual([...auto],[...autoMarks({...L,solution:[]},{[wrong]:'c'})]);});
test('Comprobar señala conflicto incluso antes de completar el tablero',()=>{const d=diagnose(levels[2],{0:'c',1:'c'});assert.equal(d.ok,false);assert.equal(d.conflict,true);assert.deepEqual(d.cells,[0,1]);});
test('Las X manuales no se pierden al retirar su hipótesis',()=>{const L=levels[2],marks={0:'c',1:'x'};assert.ok(autoMarks(L,marks).has(1));delete marks[0];assert.equal(autoMarks(L,marks).size,0);assert.equal(marks[1],'x');});
test('Regiones desconectadas se rechazan',()=>{const L={size:2,regions:[[0,1],[1,0]],activeRules:['region']};assert.equal(connectedRegions(L),false);});
test('Ayudas sin clave de respuesta y solo un paso aplicado',()=>{for(const L of levels){const noAnswer={...L,solution:undefined};const h=nextHint(noAnswer,{});assert.ok(h);assert.ok(['place','exclude'].includes(h.type));assert.ok(Number.isInteger(h.target));}});
test('Soluciones consecutivas cambian desde el primer 5×5',()=>{for(let i=2;i<levels.length;i++)assert.notDeepEqual(levels[i].solution,levels[i-1].solution);});
test('El contacto diagonal no se interpreta como ajedrez: diagonales lejanas permitidas',()=>{const L={size:4,regions:[[0,0,0,0],[1,1,1,1],[2,2,2,2],[3,3,3,3]],activeRules:['region','rowcol','touch']};assert.ok(conflictRules(L,0,5).includes('contacto'));assert.equal(conflictRules(L,0,10).length,0);});
