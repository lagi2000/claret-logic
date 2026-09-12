import {conflictRules} from './engine.js';
import {nextHint} from './pedagogy.js';
import {worlds} from './worlds.js';

const missionType=index=>({2:'started',4:'logical',6:'intruder',9:'boss'})[index%10]??'classic';
const positions=L=>L.solution.map((column,row)=>row*L.size+column);

export function missionFor(index,L){
  const type=missionType(index),world=worlds[Math.floor(index/10)];
  if(type==='classic')return null;
  if(type==='started'){
    const fixed=positions(L)[0];
    return {type,short:'Claret ya ha empezado',title:'CLARET YA HA EMPEZADO',copy:'Claret te deja una posición segura. Utilízala para deducir las demás.',symbol:'▶',fixed:[fixed],seed:{[fixed]:'c'}};
  }
  if(type==='logical'){
    const hint=nextHint(L,{}),expected=hint?.type==='exclude'?'x':'c';
    return {type,short:'La jugada lógica',title:'LA JUGADA LÓGICA',copy:'Encuentra y marca la primera deducción segura antes de resolver el resto.',symbol:'?',target:hint?.target??positions(L)[0],expected};
  }
  if(type==='intruder'){
    const solution=positions(L),fixed=solution[0],column=fixed%L.size;
    const intruder=Array.from({length:L.size-1},(_,i)=>(i+1)*L.size+column).find(k=>!solution.includes(k)&&conflictRules(L,fixed,k).length);
    return {type,short:'Detecta al intruso',title:'DETECTA AL INTRUSO',copy:'Hay un Claret guía y un intruso. Descubre cuál rompe las normas y retíralo.',symbol:'!',fixed:[fixed],intruder,seed:{[fixed]:'c',[intruder]:'c'}};
  }
  return {type,short:`Gran reto de ${world.place}`,title:`GRAN RETO DE ${world.place.toLocaleUpperCase('es')}`,copy:`Supera el desafío final de ${world.place} para alcanzar el rango ${world.rank}.`,symbol:'★'};
}

export function seedMission(index,L,round){
  const mission=missionFor(index,L);
  if(!mission?.seed||Object.keys(round.marks).length)return false;
  Object.assign(round.marks,mission.seed);return true;
}

export function missionGate(mission,marks,tool,cell){
  if(!mission)return null;
  if(mission.fixed?.includes(cell)&&marks[cell]==='c')return 'Ese es el Claret guía: su posición es segura y no se puede retirar.';
  if(mission.type==='logical'&&marks[mission.target]!==mission.expected&&(tool!==mission.expected||cell!==mission.target))return 'Aún no. Busca una primera deducción que puedas justificar con las tres normas.';
  if(mission.type==='intruder'&&marks[mission.intruder]==='c'&&!(tool==='c'&&cell===mission.intruder))return 'Primero compara los dos Claret y retira al intruso que rompe una norma.';
  return null;
}

export function missionProgress(mission,marks){
  if(!mission)return '';
  if(mission.type==='started')return 'Claret guía colocado';
  if(mission.type==='logical')return marks[mission.target]===mission.expected?'Primera deducción conseguida':'Primera deducción pendiente';
  if(mission.type==='intruder')return marks[mission.intruder]==='c'?'Intruso por localizar':'Intruso localizado';
  return 'Desafío de rango';
}
