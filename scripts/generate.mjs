import fs from 'node:fs';
import {solve} from './solver.mjs';
import {connectedRegions} from '../dist/js/engine.js';
import {deductions} from '../dist/js/pedagogy.js';
const original=JSON.parse(fs.readFileSync(new URL('../docs/original-levels.json',import.meta.url)));
let seed=20260909; const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
export function canonical(L) {
  const n=L.size, variants=[];
  for(let flip=0;flip<2;flip++)for(let rot=0;rot<4;rot++) {
    const a=Array(n*n);
    for(let r=0;r<n;r++)for(let c=0;c<n;c++) {
      let x=r,y=flip?n-1-c:c;
      for(let j=0;j<rot;j++)[x,y]=[y,n-1-x];
      a[x*n+y]=L.regions[r][c];
    }
    const ids=new Map();variants.push(a.map(v=>{if(!ids.has(v))ids.set(v,ids.size);return ids.get(v);}).join(','));
  }
  return variants.sort()[0];
}
const result=original.slice(0,2).map(L=>({...L}));
for(const size of [4,5,6,7]) {
  const source=original.filter(L=>L.size===size),count=source.length,pool=new Map();
  function consider(L) {
    if(!connectedRegions(L))return;
    const key=canonical(L);if(pool.has(key))return;
    const s=solve(L);if(s.count!==1)return;
    const p=deductions(L);if(!p.solved)return;
    pool.set(key,{...L,solution:s.solutions[0].map(k=>k%size),rating:p.rating,metrics:p.metrics});
  }
  source.forEach(consider);
  for(let i=0;i<6000&&pool.size<count*8;i++) {
    const parents=i%3===0?[...pool.values()]:source;
    const L=structuredClone(parents[Math.floor(random()*parents.length)]);
    for(let m=0;m<1+Math.floor(random()*5);m++) {
      const r=Math.floor(random()*size),c=Math.floor(random()*size),near=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([x,y])=>x>=0&&y>=0&&x<size&&y<size);
      const [x,y]=near[Math.floor(random()*near.length)];L.regions[r][c]=L.regions[x][y];
    }
    consider(L);
  }
  if(pool.size<count)throw Error(`Not enough candidates for ${size}: ${pool.size}`);
  const range={4:[0,45],5:[0,45],6:[18,65],7:[32,100]}[size];
  const sorted=[...pool.values()].filter(L=>L.rating>=range[0]&&L.rating<=range[1]).sort((a,b)=>a.rating-b.rating),chosen=[];
  if(sorted.length<count)throw Error('Insufficient difficulty pool: '+size+' '+sorted.length);
  for(let i=0;i<count;i++) {
    const target=Math.floor(i*(sorted.length-1)/(count-1));
    const candidates=sorted.map((L,index)=>({L,index,distance:Math.abs(index-target)})).filter(({L})=>!chosen.includes(L)&&L.solution.join(',')!==result.at(-1).solution.join(',')).sort((a,b)=>a.distance-b.distance);
    const L=candidates[0].L;chosen.push(L);result.push(L);
  }
  if(size===7) {
    for(let extra=0;extra<2;extra++) {
      const L=[...sorted].reverse().find(L=>!chosen.includes(L)&&L.solution.join(',')!==result.at(-1).solution.join(','));
      if(!L)throw Error('No hay retos adicionales válidos');chosen.push(L);result.push(L);
    }
  }
  console.log(`${size}×${size}: ${pool.size} candidatos certificados, ${count+(size===7?2:0)} seleccionados`);
}
const ranks=['Explorador','Aprendiz','Observador','Estratega','Experto','Maestro','Mente brillante','Genio lógico','Gran estratega','Mente Claret'];
const clean=result.slice(2).map((L,i)=>({n:i+1,size:L.size,regions:L.regions,solution:L.solution,activeRules:L.activeRules,difficulty:i<16?'Inicial':i<46?'Intermedio':'Avanzado',tip:i===0?'Ahora tampoco pueden tocarse, ni en diagonal.':'Observa las regiones y sus posibilidades.',rating:deductions(L).rating??0,metrics:deductions(L).metrics??{},rank:ranks[Math.max(0,Math.floor((i+1)/10)-1)]}));
fs.writeFileSync(new URL('../dist/js/levels.js',import.meta.url),'export const levels = '+JSON.stringify(clean,null,2)+';\n');

// The two hand-authored 4×4 tutorials are maintained separately.
