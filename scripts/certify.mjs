import fs from 'node:fs';
import crypto from 'node:crypto';
import {levels} from '../dist/js/levels.js';
import {solve} from './solver.mjs';
import {connectedRegions,diagnose} from '../dist/js/engine.js';
import {deductions} from '../dist/js/pedagogy.js';
function canonical(L){const n=L.size,v=[];for(let flip=0;flip<2;flip++)for(let rot=0;rot<4;rot++){const a=Array(n*n);for(let r=0;r<n;r++)for(let c=0;c<n;c++){let x=r,y=flip?n-1-c:c;for(let j=0;j<rot;j++)[x,y]=[y,n-1-x];a[x*n+y]=L.regions[r][c];}const ids=new Map();v.push(a.map(k=>{if(!ids.has(k))ids.set(k,ids.size);return ids.get(k);}).join(','));}return v.sort()[0];}
const seen=new Map(),rows=levels.map(L=>{
 const s=solve(L,100),p=deductions(L),reference=L.solution.map((c,r)=>r*L.size+c),key=canonical(L),duplicateOf=seen.get(key)??null;
 seen.set(key,L.n);
 return {level:L.n,size:L.size,solutions:s.count,connected:connectedRegions(L),referenceValid:diagnose(L,Object.fromEntries(reference.map(k=>[k,'c']))).ok,referenceMatchesUnique:s.count===1&&JSON.stringify(reference)===JSON.stringify(s.solutions[0]),humanDeducible:p.solved,rating:p.rating??0,metrics:p.metrics??{},duplicateOf,proof:p.trace};
});
const issues=rows.filter(r=>r.duplicateOf!==null||r.solutions!==1||!r.connected||!r.referenceValid||!r.humanDeducible||!r.referenceMatchesUnique);
const repeated=rows.filter((r,i)=>i>0&&levels[i].size===levels[i-1].size&&JSON.stringify(levels[i].solution)===JSON.stringify(levels[i-1].solution));
const solutionSeen=new Map(),duplicatedSolutions=[];
for(const L of levels){const key=`${L.size}:${L.solution.join(',')}`;if(solutionSeen.has(key))duplicatedSolutions.push([L.n,solutionSeen.get(key)]);else solutionSeen.set(key,L.n);}
const report={version:'3.1.0-rc.2',logicCertified:levels.length===100&&issues.length===0&&repeated.length===0&&duplicatedSolutions.length===0,levelDataSha256:crypto.createHash('sha256').update(fs.readFileSync(new URL('../dist/js/levels.js',import.meta.url))).digest('hex'),certified:rows.filter(r=>!issues.includes(r)).length,blockers:issues.map(r=>({level:r.level,solutions:r.solutions,reason:'Error de validación'})),consecutiveRepeatedSolutions:repeated.map(r=>r.level),duplicatedSolutionPatterns:duplicatedSolutions,rows};
fs.writeFileSync(new URL('../docs/certification.json',import.meta.url),JSON.stringify(report,null,2));
fs.writeFileSync(new URL('../docs/difficulty.csv',import.meta.url),'nivel,tamano,rating,pasos,exclusiones,amplitud,soluciones\n'+rows.map(r=>[r.level,r.size,r.rating,r.metrics.steps??0,r.metrics.exclusions??0,r.metrics.breadth??0,r.solutions].join(',')).join('\n'));
console.log(JSON.stringify({certified:report.certified,blockers:report.blockers,consecutiveRepeatedSolutions:report.consecutiveRepeatedSolutions,duplicatedSolutionPatterns:report.duplicatedSolutionPatterns,geometricDuplicates:rows.filter(r=>r.duplicateOf).map(r=>[r.level,r.duplicateOf]),ratingBySize:[4,5,6,7].map(n=>({size:n,min:Math.min(...rows.filter(r=>r.size===n).map(r=>r.rating)),max:Math.max(...rows.filter(r=>r.size===n).map(r=>r.rating))}))},null,2));
if(!report.logicCertified&&!process.argv.includes('--review'))process.exitCode=1;
