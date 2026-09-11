import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyStatus} from '../dist/js/journey.js';

test('Cada reto ordinario completado vuelve al mapa con el siguiente activo',()=>{
  for(let index=0;index<99;index++){
    if((index+1)%10===0)continue;
    assert.deepEqual(journeyStatus({index,completed:index+1,round:{solved:true}}),{kind:'advance',nextIndex:index+1,world:Math.floor((index+1)/10)});
  }
});

test('Cada bloque de diez abre su logro y el nivel 100 conserva el cierre final',()=>{
  for(let index=9;index<100;index+=10){
    assert.deepEqual(journeyStatus({index,completed:index+1,round:{solved:true}}),{kind:'achievement',world:Math.floor(index/10),final:index===99});
  }
});

test('Un reto no resuelto nunca adelanta el recorrido',()=>{
  for(let index=0;index<100;index++)assert.equal(journeyStatus({index,completed:index,round:{solved:false}}).kind,'current');
});
