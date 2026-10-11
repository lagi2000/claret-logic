import fs from 'node:fs';
import {levels as previous} from '../dist/js/levels.js';
import {solve} from './solver.mjs';
import {deductions} from '../dist/js/pedagogy.js';
import {connectedRegions} from '../dist/js/engine.js';
let seed=20261011;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const sizes=[4,5,5,6,6,7,7,8,9,9,...Array.from({length:20},(_,i)=>i%3===0?8:9),...Array.from({length:70},(_,i)=>i%4===0?9:10)];
function grow(n){
 let solution;
 do{solution=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(random()*(i+1));[solution[i],solution[j]]=[solution[j],solution[i]];}}while(solution.some((c,r)=>r&&Math.abs(c-solution[r-1])<2));
 const a=Array(n*n).fill(0),seeds=new Set(solution.map((c,r)=>r*n+c));solution.forEach((c,r)=>a[r*n+c]=r);
 const level=()=>({size:n,solution,regions:Array.from({length:n},(_,r)=>a.slice(r*n,r*n+n)),activeRules:['region','rowcol','touch']});
 if(!connectedRegions(level()))return null;
 // Expand singleton regions while retaining connectedness and a forward proof.
 // This constructs valid puzzles rather than accepting arbitrary ambiguous boards.
 for(let step=0;step<n*n*12;step++){
  const k=Math.floor(random()*a.length);if(seeds.has(k))continue;
  const r=Math.floor(k/n),c=k%n,neighbors=[r?k-n:-1,r<n-1?k+n:-1,c?k-1:-1,c<n-1?k+1:-1].filter(q=>q>=0&&a[q]!==a[k]);
  if(!neighbors.length)continue;
  const old=a[k],g=a[neighbors[Math.floor(random()*neighbors.length)]];
  const counts=a.reduce((v,id)=>(v[id]++,v),Array(n).fill(0));
  if(counts[g]>counts[old]&&random()<.92)continue;
  a[k]=g;const L=level();if(!connectedRegions(L)||!deductions(L).solved)a[k]=old;
 }
 return level();
}
const pools=new Map();
for(const size of [...new Set(sizes)]){
 const count=sizes.filter(n=>n===size).length,patterns=new Set(),pool=[];
 for(const L of previous.filter(L=>L.size===size)){if(patterns.has(L.solution.join(',')))continue;patterns.add(L.solution.join(','));pool.push(L);}
 for(let attempt=0;pool.length<count&&attempt<50000;attempt++){
  const L=grow(size);if(!L)continue;const key=L.solution.join(',');if(patterns.has(key))continue;
  if(solve(L).count!==1)continue;
  const proof=deductions(L);if(!proof.solved)continue;
  patterns.add(key);pool.push({...L,rating:proof.rating,metrics:proof.metrics});
  if(pool.length%10===0)console.log(`${size}×${size}: ${pool.length}/${count} certificados`);
 }
 if(pool.length<count)throw Error(`Pool insuficiente ${size}: ${pool.length}/${count}`);
 pools.set(size,pool.sort((a,b)=>a.rating-b.rating));
}
const ranks=['Explorador','Aprendiz','Observador','Estratega','Experto','Maestro','Mente brillante','Genio lógico','Gran estratega','Mente Claret'];
const levels=sizes.map((size,i)=>{const L=pools.get(size).shift();return {...L,n:i+1,difficulty:i<10?'Iniciación':i<30?'Intermedio':i<70?'Avanzado':'Experto',tip:'Uno por color, fila y columna. Sin tocarse, ni en diagonal.',rank:ranks[Math.floor(i/10)]};});
fs.writeFileSync(new URL('../dist/js/levels.js',import.meta.url),'export const levels = '+JSON.stringify(levels)+';\n');
console.log('100 retos generados y certificados individualmente.');
