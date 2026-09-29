import test from 'node:test';
import assert from 'node:assert/strict';
import {levels} from '../dist/js/levels.js';
import {tutorials} from '../dist/js/tutorials.js';
import {diagnose} from '../dist/js/engine.js';
import {missionFor,seedMission,missionGate} from '../dist/js/missions.js';
import {fresh,beginTutorial,advanceTutorial,complete,nextLevel,save,load,activateDay} from '../dist/js/state.js';
import {journeyStatus} from '../dist/js/journey.js';

test('Una partida de principio a fin atraviesa prácticas, 100 retos, diez logros y el cierre sin repetirse',()=>{
  const data=new Map(),storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};
  let state=fresh(),practice=beginTutorial(state);
  for(const [i,L] of tutorials.entries()){
    assert.equal(practice.index,i);
    for(const [row,column] of L.solution.entries())practice.round.marks[row*L.size+column]='c';
    assert.equal(diagnose(L,practice.round.marks).ok,true);
    practice.round.solved=true;
    assert.equal(advanceTutorial(state,practice,true),i===0);
  }
  assert.equal(state.tutorialDone,true);
  assert.equal(state.completed,0);
  assert.equal(activateDay(state,new Date(2026,8,29,12)).changed,true);
  assert.equal(activateDay(state,new Date(2026,8,29,13)).changed,false);
  const achievements=[];
  for(let index=0;index<levels.length;index++){
    const L=levels[index],mission=missionFor(index,L);
    assert.equal(state.index,index);
    seedMission(index,L,state.round);
    if(mission?.type==='intruder'){
      assert.ok(missionGate(mission,state.round.marks,'c',mission.intruder)===null);
      delete state.round.marks[mission.intruder];
    }
    for(const [row,column] of L.solution.entries())state.round.marks[row*L.size+column]='c';
    assert.ok(diagnose(L,state.round.marks).ok,`reto ${index+1}`);
    assert.ok(complete(state),`completar reto ${index+1}`);
    save(storage,state);state=load(storage).state;
    const journey=journeyStatus(state);
    if((index+1)%10===0){
      assert.equal(journey.kind,'achievement',`logro del reto ${index+1}`);
      achievements.push(journey.world);state.celebratedWorlds.push(journey.world);
      save(storage,state);state=load(storage).state;
      assert.equal(journeyStatus(state).kind,index===99?'complete':'advance');
    }else assert.equal(journey.kind,'advance');
    if(index<99)assert.ok(nextLevel(state));
  }
  assert.deepEqual(achievements,[0,1,2,3,4,5,6,7,8,9]);
  assert.equal(state.completed,100);
  assert.equal(journeyStatus(state).kind,'complete');
  assert.equal(nextLevel(state),false);
});
