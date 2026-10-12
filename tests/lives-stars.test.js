import test from 'node:test';import assert from 'node:assert/strict';
import {levels} from '../dist/js/levels.js';
import {fresh,normalize,attemptClaret,complete,resetRound,spendHint} from '../dist/js/state.js';
import {diagnose} from '../dist/js/engine.js';
test('Los 100 retos permiten cualquier orden correcto sin perder vidas',()=>{
 for(const L of levels){const s=fresh();s.index=L.n-1;s.completed=s.index;
  for(let r=L.size-1;r>=0;r--)assert.equal(attemptClaret(s,L,r*L.size+L.solution[r]),'correct');
  assert.ok(diagnose(L,s.round.marks).ok);assert.equal(s.round.lives,3);assert.ok(complete(s));
  assert.equal(s.victories,1);assert.equal(s.stars[s.index],3);assert.equal(complete(s),false);
 }
});
test('Fallo fijo pierde una vida una sola vez y tercera vida registra derrota',()=>{
 const s=fresh(),L=levels[15];s.index=15;s.completed=15;
 const bad=Array.from({length:L.size**2},(_,k)=>k).filter(k=>L.solution[Math.floor(k/L.size)]!==k%L.size);
 assert.equal(attemptClaret(s,L,bad[0]),'error');assert.equal(s.round.marks[bad[0]],'e');
 assert.equal(attemptClaret(s,L,bad[0]),'blocked');assert.equal(s.round.lives,2);
 attemptClaret(s,L,bad[1]);assert.equal(attemptClaret(s,L,bad[2]),'lost');assert.equal(s.defeats,1);
 const saved=normalize(s);assert.equal(saved.round.lives,0);assert.equal(saved.round.marks[bad[0]],'e');
 assert.equal(attemptClaret(saved,L,L.solution[0]),'blocked');assert.equal(complete(saved),false);assert.equal(spendHint(saved),false);
 assert.ok(resetRound(saved));assert.equal(saved.index,15);assert.equal(saved.completed,15);assert.equal(saved.round.lives,3);assert.deepEqual(saved.round.marks,{});assert.equal(saved.defeats,1);
});
test('Victoria guarda estrellas según vidas y las repeticiones conservan el máximo',()=>{
 const s=fresh();s.index=15;s.completed=15;s.round.lives=2;complete(s);assert.equal(s.stars[15],2);
 s.round=fresh().round;s.round.lives=1;complete(s);assert.equal(s.stars[15],2);assert.equal(s.completed,16);
 s.round=fresh().round;complete(s);assert.equal(s.stars[15],3);assert.equal(s.victories,3);
 assert.deepEqual(normalize(s).stars,{15:3});
});
