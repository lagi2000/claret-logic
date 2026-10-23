import {groups,conflictRules,diagnose} from './engine.js';
import {deductions} from './pedagogy.js';
import {spendHint} from './state.js';
const proofs=new WeakMap();
export function conflictExplanation(L,a,b){
 const rule=conflictRules(L,a,b)[0];
 const at=k=>`fila ${Math.floor(k/L.size)+1}, columna ${k%L.size+1}`;
 return `${at(a)} ${rule==='contacto'?'toca':`comparte ${rule} con`} ${at(b)}`;
}
export function lessonSteps(L,h,marks){
 if(h.type!=='place')return [];
 const placed=Object.keys(marks).map(Number).filter(k=>marks[k]==='c');
 const direct=h.blocked.flatMap(k=>{const q=placed.find(q=>conflictRules(L,k,q).length);return q===undefined?[]:[{candidates:[q],removed:[k],reason:`Descarta esta casilla: ${conflictExplanation(L,k,q)}. El borde azul señala el Claret que lo demuestra.`}];});
 const deductions=(h.steps??[]).flatMap(step=>step.removed.map(k=>({...step,removed:[k],reason:`La casilla rayada no puede contener a Claret: ${step.candidates.map(q=>conflictExplanation(L,k,q)).join('; ')}. Entraría en conflicto con cualquiera de las opciones azules, y una de ellas debe ocuparse.`})));
 return [...deductions,...direct];
}
export function teachingHint(L,marks){
 const diagnosis=diagnose(L,marks);if(diagnosis.ok)return null;
 if(diagnosis.conflict)return {type:'conflict',target:diagnosis.cells[0],cells:diagnosis.cells,reason:diagnosis.message};
 if(!proofs.has(L))proofs.set(L,new Set(deductions(L).placed));
 const proven=proofs.get(L),wrongNote=Object.keys(marks).map(Number).find(k=>marks[k]==='x'&&proven.has(k));
 if(wrongNote!==undefined)return {type:'review',target:wrongNote,cells:[wrongNote],reason:'Esta cruz es una anotación tuya, no un descarte demostrado. Bórrala y compara de nuevo las posibilidades de su región.'};
 const n=L.size,placed=Object.keys(marks).filter(k=>marks[k]==='c').map(Number);
 const candidates=new Set(Array.from({length:n*n},(_,k)=>k).filter(k=>!placed.includes(k)&&!['x','e'].includes(marks[k])&&placed.every(q=>!conflictRules(L,k,q).length)));
 const units=groups(L),steps=[];
 for(let iteration=0;iteration<n*n;iteration++){
  const open=units.filter(g=>!g.cells.some(k=>placed.includes(k))).map(g=>({...g,options:g.cells.filter(k=>candidates.has(k))}));
  if(open.some(g=>!g.options.length))return {type:'review',target:open.find(g=>!g.options.length).cells[0],cells:open.find(g=>!g.options.length).cells,reason:'Esta zona se ha quedado sin posibilidades. Revisa tus cruces: los descartes personales pueden necesitar corrección.'};
  const single=open.find(g=>g.options.length===1);
  if(single){const target=single.options[0],blocked=single.cells.filter(k=>k!==target);return {type:'place',target,group:single,candidates:[target],cells:[...new Set([...single.cells,...placed])],steps,blocked,reason:`En la ${single.kind} ${single.index+1} solo queda una casilla posible: fila ${Math.floor(target/n)+1}, columna ${target%n+1}.`,explanation:steps.length?steps.map(step=>step.reason).join(' '):`Compara la zona señalada con los Claret colocados y los descartes. Las otras ${blocked.length} casillas están descartadas; esta es la única que queda.`};}
  let progress=false;
  for(const group of open){const removed=[...candidates].filter(k=>!group.options.includes(k)&&group.options.every(q=>conflictRules(L,k,q).length));
   if(removed.length){removed.forEach(k=>candidates.delete(k));const kinds=[...new Set(removed.flatMap(k=>group.options.flatMap(q=>conflictRules(L,k,q))))];
    steps.push({group,candidates:group.options,removed,reason:`El Claret de la ${group.kind} ${group.index+1} debe ocupar una de sus ${group.options.length} posibilidades. Descarta ${removed.map(k=>`(${Math.floor(k/n)+1},${k%n+1})`).join(', ')}: todas entran en conflicto con cada posibilidad por ${kinds.join(', ')}.`});progress=true;break;}
  }
  if(!progress)return {type:'review',target:0,cells:placed,reason:'Revisa los Claret y las anotaciones actuales antes de continuar. No hay una deducción segura con estas premisas.'};
 }
 return null;
}
export function advanceLesson(s,key,free=false,maxStage=3){
 if(s.round.lessonKey!==key){if(!spendHint(s,free))return 0;s.round.lessonKey=key;s.round.helpStep=1;}
 else s.round.helpStep=Math.min(maxStage,s.round.helpStep+1);
 return s.round.helpStep;
}
