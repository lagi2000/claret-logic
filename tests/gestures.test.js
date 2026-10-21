import test from 'node:test';
import assert from 'node:assert/strict';
import {gestureSession} from '../dist/js/gestures.js';
function setup(initial={}){const marks={...initial};let time=1000,placements=0;const g=gestureSession({read:k=>marks[k],write:(k,v)=>{if(v)marks[k]=v;else delete marks[k];},place:k=>{placements++;if(marks[k]==='c')delete marks[k];else marks[k]='c';},now:()=>time});return {g,marks,tick:()=>time+=150,get placements(){return placements;}};}
test('Un toque marca una X; doble toque la convierte en Claret una sola vez',()=>{const s=setup();s.g.down(1,3);s.g.up(1,3);assert.equal(s.marks[3],'x');s.tick();s.g.down(1,3);s.g.up(1,3);assert.equal(s.marks[3],'c');assert.equal(s.placements,1);});
test('Arrastre continuo marca cada casilla una sola vez y respeta figuras',()=>{const s=setup({2:'c'});s.g.down(1,0);s.g.move(1,[1,2,3]);s.g.move(1,[2,1,0]);s.g.up(1,0);assert.deepEqual(s.marks,{0:'x',1:'x',2:'c',3:'x'});assert.equal(s.placements,0);});
test('Arrastrar desde una X borra descartes sin retirar Claret',()=>{const s=setup({0:'x',1:'x',2:'c'});s.g.down(1,0);s.g.move(1,[1,2,3]);s.g.up(1,3);assert.deepEqual(s.marks,{2:'c'});});
test('Segundo dedo y salida del tablero no crean jugadas',()=>{const s=setup();s.g.down(1,0);assert.equal(s.g.down(2,4),false);s.g.move(2,[5]);s.g.up(2,4);s.g.up(1,null);assert.deepEqual(s.marks,{});});
test('Cancelación y cambio de pestaña invalidan el doble toque pendiente',()=>{const s=setup();s.g.down(1,0);s.g.up(1,0);s.g.cancel();s.tick();s.g.down(1,0);s.g.up(1,0);assert.deepEqual(s.marks,{});assert.equal(s.placements,0);});
test('Doble toque retira una figura; un toque aislado no la borra',()=>{const s=setup({0:'c'});s.g.down(1,0);s.g.up(1,0);assert.equal(s.marks[0],'c');s.tick();s.g.down(1,0);s.g.up(1,0);assert.deepEqual(s.marks,{});});
test('Una pulsación mantenida no coloca Claret ni prepara un doble toque',()=>{const s=setup();s.g.down(1,0);for(let i=0;i<4;i++)s.tick();s.g.up(1,0);assert.deepEqual(s.marks,{});s.tick();s.g.down(1,0);s.g.up(1,0);assert.equal(s.marks[0],'x');assert.equal(s.placements,0);});
test('Un arrastre nunca borra las cruces rojas de fallo',()=>{const s=setup({0:'x',1:'e',2:'x'});s.g.down(1,0);s.g.move(1,[1,2]);s.g.up(1,2);assert.deepEqual(s.marks,{1:'e'});});
test('Soltar fuera del tablero cancela cualquier doble toque anterior',()=>{const s=setup();s.g.down(1,0);s.g.up(1,0);s.tick();s.g.down(1,2);s.g.up(1,null);s.g.down(1,0);s.g.up(1,0);assert.equal(s.placements,0);assert.deepEqual(s.marks,{});});
