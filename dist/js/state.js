export const KEY='claretLogic.v4';
export const ranks=['Explorador','Aprendiz','Observador','Estratega','Experto','Maestro','Mente brillante','Genio lógico','Gran estratega','Mente Claret'];
const integer=(v,min,max,fallback)=>Number.isInteger(v)&&v>=min&&v<=max?v:fallback;
const clone=value=>typeof globalThis.structuredClone==='function'?globalThis.structuredClone(value):JSON.parse(JSON.stringify(value));
export function fresh(){return {version:4,tutorialRevision:2,tutorialDone:false,tutorialIndex:0,tutorialRound:{marks:{},lives:3,usedHelp:false,helpStep:0,solved:false},index:0,completed:0,helps:3,streak:0,sound:true,daily:{last:'',current:0,best:0},seenWorlds:[],round:{marks:{},lives:3,usedHelp:false,helpStep:0,solved:false}};}
export function normalize(raw) {
  const s=fresh();if(!raw||typeof raw!=='object')return s;
  s.tutorialDone=raw.tutorialDone===true;s.tutorialIndex=integer(raw.tutorialIndex,0,1,0);
  if(raw.tutorialRevision===2&&raw.tutorialRound&&typeof raw.tutorialRound==='object'){
    const t=raw.tutorialRound;
    s.tutorialRound={marks:Object.fromEntries(Object.entries(t.marks??{}).filter(([k,v])=>/^\d+$/.test(k)&&+k<16&&['c','x'].includes(v))),lives:integer(t.lives,1,3,3),usedHelp:t.usedHelp===true,helpStep:integer(t.helpStep,0,2,0),solved:t.solved===true};
  }
  s.index=integer(raw.index,0,99,0);s.completed=integer(raw.completed,0,100,s.index);
  s.helps=integer(raw.helps,0,3,3);s.streak=integer(raw.streak,0,14,0);s.sound=typeof raw.sound==='boolean'?raw.sound:true;
  if(raw.daily&&typeof raw.daily==='object')s.daily={last:typeof raw.daily.last==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(raw.daily.last)?raw.daily.last:'',current:integer(raw.daily.current,0,100000,0),best:integer(raw.daily.best,0,100000,0)};
  s.daily.best=Math.max(s.daily.current,s.daily.best);
  s.seenWorlds=Array.isArray(raw.seenWorlds)?[...new Set(raw.seenWorlds.filter(value=>Number.isInteger(value)&&value>=0&&value<10))]:[];
  const round=raw.round;
  if(round&&typeof round==='object')s.round={marks:Object.fromEntries(Object.entries(round.marks??{}).filter(([k,v])=>/^\d+$/.test(k)&&+k<49&&['c','x'].includes(v))),lives:integer(round.lives,1,3,3),usedHelp:round.usedHelp===true,helpStep:integer(round.helpStep,0,2,0),solved:round.solved===true};
  return s;
}
export function load(storage) {
  try {
    const value=storage.getItem(KEY);if(value)return {state:normalize(JSON.parse(value)),warning:false};
    const legacy=storage.getItem('claretLogic.v3');
    if(legacy)return {state:migrateV3(JSON.parse(legacy)),warning:false};
    const s=fresh(), oldLevel=Number(storage.getItem('claretLevel25'));
    if(oldLevel>=1&&oldLevel<=100){s.index=Math.max(0,oldLevel-3);s.completed=s.index;s.tutorialDone=oldLevel>=3;s.tutorialIndex=oldLevel===2?1:0;}
    for(const [field,key,max] of [['helps','claretHelps25',3],['streak','claretStreak25',14]]) {
      const v=storage.getItem(key);if(v!==null)s[field]=integer(Number(v),0,max,s[field]);
    }
    s.sound=storage.getItem('claretSound25')!=='off';
    s.daily={last:storage.getItem('claretDailyDate27')??'',current:Number(storage.getItem('claretDailyStreak27'))||0,best:Number(storage.getItem('claretDailyBest27'))||0};
    return {state:normalize(s),warning:false};
  } catch{return {state:fresh(),warning:true};}
}
export function migrateV3(raw){
  const old=normalize(raw),s=normalize({...old,tutorialDone:old.index>=2||old.completed>=2,index:Math.max(0,old.index-2),completed:Math.max(0,old.completed-2)});
  if(old.index<2){s.tutorialIndex=old.index;s.tutorialRound=old.round;s.round=fresh().round;}
  return s;
}
export function beginTutorial(s,replay=false){return {index:replay?0:s.tutorialIndex,round:replay?fresh().round:clone(s.tutorialRound),completed:0,helps:3,streak:0};}
export function advanceTutorial(s,practice,onboarding){
  if(!practice.round.solved)return false;
  if(practice.index===0){practice.index=1;practice.round=fresh().round;if(onboarding){s.tutorialIndex=1;s.tutorialRound=clone(practice.round);}return true;}
  if(onboarding){s.tutorialDone=true;s.tutorialIndex=1;s.tutorialRound=clone(practice.round);}return false;
}
export function save(storage,state){try{storage.setItem(KEY,JSON.stringify(state));return true;}catch{return false;}}
export function resetRound(s){if(s.round.solved)return false;const next=s.round.lives-1;s.round={marks:{},lives:next||3,usedHelp:s.round.usedHelp,helpStep:0,solved:false};return true;}
export function complete(s) {
  if(s.round.solved)return false;s.round.solved=true;
  if(s.completed<=s.index){s.completed=s.index+1;if(!s.round.usedHelp){s.streak++;if(s.streak===15){s.helps=Math.min(3,s.helps+1);s.streak=0;}}else s.streak=0;}
  return true;
}
export function spendHint(s,free=false) {
  if(s.round.solved||(!free&&s.helps===0))return false;
  if(!free)s.helps--;s.round.usedHelp=true;s.streak=0;s.round.helpStep=(s.round.helpStep+1)%3;return true;
}
export function nextLevel(s){if(!s.round.solved||s.index===99)return false;s.index++;s.round=fresh().round;return true;}
export function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function activateDay(s,now=new Date()) {
  const today=dateKey(now);if(s.daily.last>=today)return {changed:false,reward:false};
  const prev=new Date(now);prev.setDate(prev.getDate()-1);
  s.daily.current=s.daily.last===dateKey(prev)?s.daily.current+1:1;
  s.daily.best=Math.max(s.daily.best,s.daily.current);s.daily.last=today;
  const reward=s.daily.current%7===0&&s.helps<3;if(reward)s.helps++;
  return {changed:true,reward};
}
export function earnedRank(completed){return completed<10?'Primeros pasos':ranks[Math.min(9,Math.floor(completed/10)-1)];}
export function activeDates(daily) {
  const dates=new Set();if(!daily.last)return dates;
  const date=new Date(daily.last+'T12:00:00');
  for(let i=0;i<Math.min(7,daily.current);i++){dates.add(dateKey(date));date.setDate(date.getDate()-1);}return dates;
}
