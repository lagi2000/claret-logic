import test from 'node:test';
import assert from 'node:assert/strict';
import {levels} from '../dist/js/levels.js';
import {conflictRules,diagnose} from '../dist/js/engine.js';
import {safeDeductions} from '../dist/js/pedagogy.js';
import {missionFor,seedMission,missionGate,missionProgress} from '../dist/js/missions.js';

const solutionCells=L=>L.solution.map((column,row)=>row*L.size+column);

test('Cada mundo combina seis retos clásicos y cuatro misiones reconocibles',()=>{
  for(let world=0;world<10;world++){
    const types=Array.from({length:10},(_,offset)=>missionFor(world*10+offset,levels[world*10+offset])?.type??'classic');
    assert.deepEqual(types,['classic','classic','started','classic','logical','classic','intruder','classic','classic','boss']);
  }
});

test('Claret ya ha empezado coloca una única guía correcta y protegida',()=>{
  for(let index=2;index<100;index+=10){
    const L=levels[index],mission=missionFor(index,L),round={marks:{}};
    assert.equal(seedMission(index,L,round),true);
    assert.equal(Object.keys(round.marks).length,1);
    assert.ok(solutionCells(L).includes(mission.fixed[0]));
    assert.match(missionGate(mission,round.marks,'c',mission.fixed[0]),/guía/);
    assert.equal(missionProgress(mission,round.marks),'Claret guía colocado');
  }
});

test('La jugada lógica acepta todas las primeras deducciones seguras y nunca bloquea el tablero',()=>{
  for(let index=4;index<100;index+=10){
    const L=levels[index],mission=missionFor(index,L);
    assert.ok(mission.validMoves.length>0,`Reto ${L.n} sin deducción inicial`);
    const unique=new Set(mission.validMoves.map(move=>`${move.tool}:${move.cell}`));
    assert.equal(unique.size,mission.validMoves.length);
    for(const move of mission.validMoves){
      assert.equal(missionGate(mission,{},move.tool,move.cell),null);
      assert.equal(missionProgress(mission,{[move.cell]:move.tool}),'Primera deducción conseguida');
    }
    for(let cell=0;cell<L.size**2;cell++)for(const tool of ['c','x'])assert.equal(missionGate(mission,{},tool,cell),null);
  }
});

test('El reto 5 admite tanto la casilla rosa como la azul como primeras deducciones',()=>{
  const L=levels[4],mission=missionFor(4,L);
  const placements=mission.validMoves.filter(move=>move.tool==='c').map(move=>move.cell);
  assert.ok(placements.includes(3));
  assert.ok(placements.includes(12));
});

test('El reto 15 ofrece varias exclusiones seguras y selecciona Descartar sin bloquear otras jugadas',()=>{
  const L=levels[14],mission=missionFor(14,L);
  assert.equal(mission.preferredTool,'x');
  assert.ok(mission.validMoves.filter(move=>move.tool==='x').length>1);
  for(let cell=0;cell<L.size**2;cell++)assert.equal(missionGate(mission,{},'c',cell),null);
});

test('Las deducciones inmediatas son compatibles con la solución única en los 100 retos',()=>{
  for(const L of levels){
    const solution=new Set(solutionCells(L)),moves=safeDeductions(L,{});
    assert.ok(moves.length>0,`Reto ${L.n} sin salida lógica inicial`);
    for(const move of moves){
      if(move.type==='place')assert.ok(solution.has(move.target),`Claret inseguro en reto ${L.n}`);
      else assert.ok(!solution.has(move.target),`Descarte inseguro en reto ${L.n}`);
    }
  }
});

test('Detecta al intruso presenta un conflicto real y conserva una guía correcta',()=>{
  for(let index=6;index<100;index+=10){
    const L=levels[index],mission=missionFor(index,L),round={marks:{}};seedMission(index,L,round);
    assert.ok(solutionCells(L).includes(mission.fixed[0]));
    assert.ok(!solutionCells(L).includes(mission.intruder));
    assert.ok(conflictRules(L,mission.fixed[0],mission.intruder).length>0);
    assert.equal(diagnose(L,round.marks).conflict,true);
    assert.match(missionGate(mission,round.marks,'x',0),/intruso/);
    assert.equal(missionGate(mission,round.marks,'c',mission.intruder),null);
    delete round.marks[mission.intruder];
    assert.equal(diagnose(L,round.marks).conflict,undefined);
    assert.equal(missionProgress(mission,round.marks),'Intruso localizado');
  }
});

test('Cada décimo reto anuncia el lugar y el rango correspondiente',()=>{
  for(let index=9;index<100;index+=10){const mission=missionFor(index,levels[index]);assert.equal(mission.type,'boss');assert.match(mission.title,/GRAN RETO/);assert.match(mission.copy,/rango/i);}
});
