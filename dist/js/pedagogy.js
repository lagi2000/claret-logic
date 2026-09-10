import {groups,conflictRules,diagnose} from './engine.js';
/** Forward deductions only: singleton and universal exclusion. No answer key,
 * hypothetical branching or exhaustive solver is used here. */
export function deductions(L) {
  const units=groups(L), candidates=new Set(Array.from({length:L.size**2},(_,k)=>k));
  const placed=new Set(), trace=[];
  while(placed.size<L.size) {
    let changed=false;
    const open=units.filter(g=>!g.cells.some(k=>placed.has(k))).map(g=>({...g,options:g.cells.filter(k=>candidates.has(k))}));
    if(open.some(g=>!g.options.length))return {solved:false,trace,placed:[...placed],contradiction:true};
    const single=open.find(g=>g.options.length===1);
    if(single) {
      const target=single.options[0];placed.add(target);candidates.delete(target);
      const removed=[...candidates].filter(k=>conflictRules(L,target,k).length);
      removed.forEach(k=>candidates.delete(k));
      trace.push({type:'place',target,group:single,candidates:[target],removed,reason:`En la ${single.kind} ${single.index+1} solo queda una casilla posible.`});changed=true;
    } else {
      for(const g of open) {
        const removed=[...candidates].filter(k=>!g.options.includes(k)&&g.options.every(q=>conflictRules(L,k,q).length));
        if(removed.length) {
          removed.forEach(k=>candidates.delete(k));
          trace.push({type:'exclude',target:removed[0],group:g,candidates:g.options,removed,reason:`El Claret de la ${g.kind} ${g.index+1} estará en una de las casillas señaladas. Todas entran en conflicto con la casilla descartada.`});
          changed=true;break;
        }
      }
    }
    if(!changed)break;
  }
  const solved=placed.size===L.size&&diagnose(L,Object.fromEntries([...placed].map(k=>[k,'c']))).ok;
  const exclusions=trace.filter(t=>t.type==='exclude');
  const breadth=exclusions.reduce((s,t)=>s+t.candidates.length,0);
  return {solved,trace,placed:[...placed],rating:trace.length+exclusions.length*8+breadth*2,metrics:{steps:trace.length,exclusions:exclusions.length,breadth}};
}
/** Replay a certified deduction trace until the first unapplied step.
 * Only preceding proven placements are premises; guesses are never used as facts. */
export function nextHint(L, marks) {
  const result=diagnose(L,marks);
  if(result.conflict)return {type:'conflict',target:result.cells[0],cells:result.cells,reason:result.message};
  for(const step of deductions(L).trace) {
    if(step.type==='place' && marks[step.target]!=='c')return step;
    if(step.type==='exclude') {
      const target=step.removed.find(k=>marks[k]!=='x');
      if(target!==undefined)return {...step,target};
    }
  }
  return null;
}
