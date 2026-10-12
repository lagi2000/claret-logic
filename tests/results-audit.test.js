import test from 'node:test';import assert from 'node:assert/strict';
import {fresh,save,load,KEY,RESULTS_KEY,recoverRoundScore,complete} from '../dist/js/state.js';
import {unlockedWorldIndex} from '../dist/js/worlds.js';
const memory=()=>{const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};};
test('Repetir el reto 1 no bloquea mundos ya alcanzados',()=>{assert.equal(unlockedWorldIndex({index:0,completed:70}),7);assert.equal(unlockedWorldIndex({index:0,completed:100}),9);});
test('Respaldo de resultados sobrevive a guardado de una edición antigua sin estrellas',()=>{
 const storage=memory(),s=fresh();s.index=14;s.completed=14;s.round.lives=2;complete(s);save(storage,s);
 storage.setItem(KEY,JSON.stringify({index:15,completed:15}));const restored=load(storage).state;
 assert.equal(restored.stars[14],2);assert.equal(restored.victories,1);assert.equal(restored.completed,15);
 assert.ok(storage.getItem(RESULTS_KEY));
});
test('Un guardado atrasado no reduce estrellas ni progreso',()=>{
 const storage=memory(),s=fresh();s.index=24;s.completed=24;complete(s);save(storage,s);
 const older=fresh();older.index=4;older.completed=4;older.stars[0]=1;save(storage,older);
 const restored=load(storage).state;assert.equal(restored.completed,25);assert.equal(restored.stars[24],3);assert.equal(restored.stars[0],1);
});
test('Estrellas históricas solo se recuperan si existe un intento resuelto con vidas conocidas',()=>{
 const s=fresh();s.index=3;s.completed=10;s.round.solved=true;s.round.lives=2;recoverRoundScore(s);
 assert.deepEqual(s.stars,{3:2});assert.equal(s.stars[0],undefined);
});
test('Resultados se recuperan aunque el guardado principal esté corrupto',()=>{
 const storage=memory(),s=fresh();s.index=9;s.completed=9;complete(s);save(storage,s);storage.setItem(KEY,'broken');
 const result=load(storage);assert.ok(result.warning);assert.equal(result.state.completed,10);assert.equal(result.state.stars[9],3);
});
test('Resultados sobreviven también si solo falta el guardado principal',()=>{const storage=memory();storage.setItem(RESULTS_KEY,JSON.stringify({completed:3,victories:3,defeats:1,stars:{0:2,1:3,2:1}}));const s=load(storage).state;assert.equal(s.completed,3);assert.deepEqual(s.stars,{0:2,1:3,2:1});});
