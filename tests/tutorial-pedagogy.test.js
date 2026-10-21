import test from 'node:test';
import assert from 'node:assert/strict';
import {tutorials,tutorialGuide} from '../dist/js/tutorials.js';
import {deductions} from '../dist/js/pedagogy.js';
import {fresh,normalize,beginTutorial,advanceTutorial} from '../dist/js/state.js';

test('Tres prácticas: dos cadenas directas y una única exclusión introductoria',()=>{
  assert.equal(tutorials.length,3);
  tutorials.forEach((L,i)=>{
    const proof=deductions(L);assert.ok(proof.solved);
    assert.equal(proof.trace.filter(s=>s.type==='exclude').length,i===2?1:0);
    assert.equal(proof.trace.filter(s=>s.type==='place').length,4);
  });
});
test('La guía siempre explica una posición demostrable, incluso colocando en otro orden',()=>{
  const L=tutorials[0],cells=L.solution.map((c,r)=>r*4+c);
  for(let mask=0;mask<15;mask++){
    const marks=Object.fromEntries(cells.filter((_,i)=>mask&(1<<i)).map(k=>[k,'c']));
    const guide=tutorialGuide(L,marks);assert.ok(guide);assert.ok(cells.includes(guide.target));
    assert.notEqual(marks[guide.target],'c');assert.match(guide.text,/porque|solo tiene/);
  }
});
test('La revisión del tutorial reinicia sus tableros antiguos sin perder la campaña',()=>{
  const s=fresh();s.tutorialRevision=2;s.tutorialIndex=1;s.tutorialRound.marks={0:'c'};
  s.completed=48;s.index=48;s.stars={47:3};
  const next=normalize(s);assert.equal(next.tutorialIndex,0);assert.deepEqual(next.tutorialRound.marks,{});
  assert.equal(next.completed,48);assert.equal(next.stars[47],3);
});
test('Recarga de la tercera práctica y cierre correcto sin sumar victorias',()=>{
  let s=fresh(),p=beginTutorial(s);
  for(let i=0;i<2;i++){p.round.solved=true;assert.ok(advanceTutorial(s,p,true));}
  s=normalize(s);p=beginTutorial(s);assert.equal(p.index,2);
  p.round.solved=true;assert.equal(advanceTutorial(s,p,true),false);
  assert.ok(s.tutorialDone);assert.equal(s.victories,0);assert.equal(s.completed,0);
});
