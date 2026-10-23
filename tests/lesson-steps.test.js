import test from 'node:test';
import assert from 'node:assert/strict';
import {levels} from '../dist/js/levels.js';
import {teachingHint,lessonSteps} from '../dist/js/teaching.js';
import {conflictRules} from '../dist/js/engine.js';
test('Cada explicación visual descarta una casilla con una prueba real',()=>{
 for(const L of levels){
  const marks={};
  for(let i=0;i<L.size;i++){
   const hint=teachingHint(L,marks);
   assert.equal(hint.type,'place',`Nivel ${L.n}`);
   for(const step of lessonSteps(L,hint,marks)){
    assert.equal(step.removed.length,1);
    assert.ok(step.candidates.every(q=>conflictRules(L,step.removed[0],q).length));
   }
   assert.equal(L.solution[Math.floor(hint.target/L.size)],hint.target%L.size);
   marks[hint.target]='c';
  }
 }
});
