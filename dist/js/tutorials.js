import {groups,conflictRules} from './engine.js';
export const tutorials = [
  {n:1,regions:[[1,0,0,0],[1,2,0,0],[1,2,2,2],[1,3,2,2]],solution:[2,0,3,1],title:'Te acompaño',tip:'Primero entiende el porqué. Después coloca a Claret.'},
  {n:2,regions:[[2,0,3,1],[2,3,3,1],[2,2,3,3],[2,2,3,3]],solution:[1,3,0,2],title:'Ahora lo ves tú',tip:'Busca el color que ocupa una sola casilla. ¿Dónde debe ir su Claret?'},
  {n:3,regions:[[0,0,0,2],[1,1,2,2],[3,3,2,2],[3,3,3,2]],solution:[2,0,3,1],title:'Ya puedes deducir',tip:'El rosa está en la primera fila. ¿Qué casilla verde tocaría todas sus opciones? Márcala con una cruz y busca la que queda.'}
].map(L=>({size:4,rank:'Explorador',difficulty:'Tutorial',activeRules:['region','rowcol','touch'],...L}));

// Guide from visible constraints, never from the answer key or personal notes.
export function tutorialGuide(L,marks){
  const placed=Object.keys(marks).map(Number).filter(k=>marks[k]==='c');
  const names=['rosa','verde','azul','amarillo'];
  for(const group of groups(L)){
    if(group.cells.some(k=>placed.includes(k)))continue;
    const possible=group.cells.filter(k=>placed.every(q=>!conflictRules(L,k,q).length));
    if(possible.length!==1)continue;
    const target=possible[0],where=`fila ${Math.floor(target/L.size)+1}, columna ${target%L.size+1}`;
    const zone=group.kind==='región'?`color ${names[group.index]}`:`${group.kind} ${group.index+1}`;
    const why=group.cells.length===1?'solo tiene una casilla y necesita un Claret':'solo tiene una casilla libre: las demás comparten color, fila o columna con un Claret, o lo tocan';
    return {target,text:`${placed.length?'¡Bien! Ahora mira':'Mira'} el ${zone}: ${why}. Colócalo en ${where} con doble toque.`,cells:[target]};
  }
  return null;
}
