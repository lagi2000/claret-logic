import test from 'node:test';
import assert from 'node:assert/strict';
import {levels} from '../dist/js/levels.js';
import {fresh,normalize,upgradeCampaign,CAMPAIGN_REVISION} from '../dist/js/state.js';
import {diagnose} from '../dist/js/engine.js';
test('La campaña llega a 9×9 en el nivel 9 y a 10×10 antes del 48',()=>{
 assert.equal(levels[8].size,9);assert.equal(levels[47].size,10);
 assert.ok(levels.every(L=>L.size>=4&&L.size<=10));
});
test('Migrar campaña conserva premios pero no marcas de regiones antiguas',()=>{
 const s=normalize({...fresh(),campaignRevision:0,index:14,completed:15,helps:1,streak:4,daily:{last:'2026-10-10',current:7,best:12},round:{marks:{5:'c'},solved:true}});
 assert.ok(upgradeCampaign(s,levels));assert.equal(s.index,15);assert.equal(s.completed,15);
 assert.deepEqual(s.round.marks,{});assert.equal(s.helps,1);assert.equal(s.streak,4);assert.equal(s.daily.best,12);
 s.round.marks[80]='x';assert.equal(upgradeCampaign(s,levels),false);assert.equal(s.round.marks[80],'x');
});
test('Recargar conserva las cien casillas y la revisión nueva',()=>{
 const s=fresh();s.index=47;s.round.marks={0:'c',49:'x',80:'c',99:'x'};
 const n=normalize(s);assert.deepEqual(n,s);assert.equal(n.campaignRevision,CAMPAIGN_REVISION);
});
test('Migrar una campaña finalizada conserva el final jugable',()=>{
 const s=normalize({index:99,completed:100});upgradeCampaign(s,levels);
 assert.equal(s.completed,100);assert.ok(s.round.solved);assert.ok(diagnose(levels[99],s.round.marks).ok);
});
