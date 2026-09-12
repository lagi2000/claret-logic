import test from 'node:test';
import assert from 'node:assert/strict';
import {levels} from '../dist/js/levels.js';
import {conflictRules,diagnose} from '../dist/js/engine.js';
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

test('La jugada lógica exige una deducción válida sin señalarla en el mensaje',()=>{
  for(let index=4;index<100;index+=10){
    const L=levels[index],mission=missionFor(index,L),marks={};
    assert.ok(Number.isInteger(mission.target));
    assert.ok(['c','x'].includes(mission.expected));
    const wrong=(mission.target+1)%(L.size**2);
    assert.match(missionGate(mission,marks,mission.expected,wrong),/deducción/);
    assert.equal(missionGate(mission,marks,mission.expected,mission.target),null);
    marks[mission.target]=mission.expected;
    assert.equal(missionProgress(mission,marks),'Primera deducción conseguida');
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
