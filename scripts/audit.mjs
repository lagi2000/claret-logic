import fs from 'node:fs';
import {solve} from './solver.mjs';
import {connectedRegions,diagnose} from '../dist/js/engine.js';
import {deductions} from '../dist/js/pedagogy.js';
const levels=JSON.parse(fs.readFileSync(new URL('../docs/original-levels.json',import.meta.url)));
const rows=levels.map(L=>{const s=solve(L,100),p=deductions(L);return {level:L.n,size:L.size,solutions:s.count,capped:s.capped,connected:connectedRegions(L),referenceValid:diagnose(L,Object.fromEntries(L.solution.map((c,r)=>[r*L.size+c,'c']))).ok,pedagogical:p.solved,rating:p.rating};});
fs.writeFileSync(new URL('../docs/audit-original.json',import.meta.url),JSON.stringify(rows,null,2));
console.log(JSON.stringify({levels:rows.length,multiple:rows.filter(r=>r.solutions!==1),disconnected:rows.filter(r=>!r.connected).map(r=>r.level),invalidReference:rows.filter(r=>!r.referenceValid).map(r=>r.level),notDeducible:rows.filter(r=>!r.pedagogical).map(r=>r.level),sizes:[...new Set(rows.map(r=>r.size))]},null,2));
