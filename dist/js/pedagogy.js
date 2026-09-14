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
/** Return every deduction that is already forced by the visible marks.
 * This is intentionally broader than nextHint: several cells can be equally safe. */
export function safeDeductions(L, marks={}) {
  const diagnosis=diagnose(L,marks);
  if(diagnosis.conflict)return [];
  const all=Array.from({length:L.size**2},(_,k)=>k);
  const placed=new Set(Object.keys(marks).filter(k=>marks[k]==='c').map(Number));
  const candidates=new Set(all.filter(k=>!placed.has(k)&&marks[k]!=='x'&&[...placed].every(q=>!conflictRules(L,q,k).length)));
  const open=groups(L).filter(g=>!g.cells.some(k=>placed.has(k))).map(g=>({...g,options:g.cells.filter(k=>candidates.has(k))}));
  const moves=new Map();
  const add=move=>moves.set(`${move.type}:${move.target}`,move);
  for(const group of open)if(group.options.length===1){
    const target=group.options[0];
    add({type:'place',target,group,candidates:[target],reason:`En la ${group.kind} ${group.index+1} solo queda una casilla posible.`});
  }
  for(const group of open)if(group.options.length){
    for(const target of candidates)if(!group.options.includes(target)&&group.options.every(option=>conflictRules(L,target,option).length)){
      add({type:'exclude',target,group,candidates:group.options,reason:`El Claret de la ${group.kind} ${group.index+1} estará en una de sus casillas posibles. Todas entran en conflicto con la casilla descartada.`});
    }
  }
  return [...moves.values()];
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
