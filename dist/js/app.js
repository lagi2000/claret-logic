import {levels} from './levels.js';
import {bindBoardGestures} from './gestures.js';
import {bindMapSwipe} from './map-swipe.js';
import {tutorials} from './tutorials.js';
import {autoMarks,diagnose,groups} from './engine.js';
import {teachingHint,advanceLesson} from './teaching.js';
import {KEY,recoverRoundScore,attemptClaret,upgradeCampaign,beginTutorial,advanceTutorial,fresh,load,save,normalize,resetRound,complete,spendHint,nextLevel,dateKey,activateDay,earnedRank,activeDates} from './state.js';
import {play,haptic,celebrate} from './feedback.js';
import {worlds,routePoints,worldIndexForLevel,unlockedWorldIndex} from './worlds.js';
import {fittedBoardSize} from './layout.js';
import {journeyStatus,solvedActionLabel} from './journey.js';
import {missionFor,seedMission,missionGate,missionProgress} from './missions.js';
const $=s=>document.querySelector(s), board=$('#board'), cloneRound=value=>typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value));
let storage;try{storage=window.localStorage;}catch{}
const initial=load(storage);let state=initial.state,practice=null,onboarding=false,tool='c',focusCell=0,highlights=[],pendingHint=null,mapWorld=worldIndexForLevel(initial.state.index),pendingAchievement=null,reactionTimer=0,rewardTimer=0,rewardHideTimer=0,dailyReturnFocus=null,dailyTimer=0,installPrompt=null,installReturnFocus=null,shareCardPromise=null;
const palette=['#ffc8d9','#bde9d2','#bfe2ff','#ffe69b','#d9c8ff','#ffd5ad','#66c9c3','#b7c576','#94a9dd','#dea5bc'];
const introducedMissions=new Set(),ambientSymbols=['✦','❋','○','◇','≈','•','✧','❋','◆','✦'];
let hintSource=[],hintExcluded=[];
const current=()=>practice??state, level=()=>practice?tutorials[practice.index]:levels[state.index];
function persist(){if(practice&&onboarding){state.tutorialIndex=practice.index;state.tutorialRound=cloneRound(practice.round);}if(!save(storage,state))$('#storageWarning').hidden=false;}
function cleanRound(s){upgradeCampaign(s,levels);const n=levels[s.index].size;s.round.marks=Object.fromEntries(Object.entries(s.round.marks).filter(([k])=>+k<n*n));if(s.round.solved&&!diagnose(levels[s.index],s.round.marks).ok)s.round.solved=false;recoverRoundScore(s);}
cleanRound(state);
const screens={start:$('#start'),map:$('#worldMap'),game:$('#game')};
function showScreen(name){
  cancelGesture?.();
  for(const [key,screen] of Object.entries(screens)){
    const active=key===name;screen.hidden=!active;
    if(active)screen.removeAttribute('inert');else screen.setAttribute('inert','');
  }
}
function repairActiveScreen(){
  const active=!screens.game.hidden?screens.game:!screens.map.hidden?screens.map:screens.start;
  active.removeAttribute('inert');
}
const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function closeInstallGuide(){
  if($('#installOverlay').hidden)return;$('#installOverlay').hidden=true;
  const target=installReturnFocus?.isConnected?installReturnFocus:$('#installGame');installReturnFocus=null;target?.focus?.({preventScroll:true});
}
function showInstallGuide(){
  installReturnFocus=document.activeElement;const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
  $('#installText').textContent=ios?'En iPhone o iPad se instala desde el menú Compartir de Safari.':'Puedes instalarlo desde el menú de tu navegador.';
  const steps=ios?['Abre https://lagi2000.github.io/claret-logic/ directamente en Safari, fuera del visor de ChatGPT o WhatsApp.','En Safari, pulsa Compartir y elige “Añadir a pantalla de inicio”.','Comprueba que la vista previa muestre la cara de Claret y pulsa “Añadir”. Conserva el acceso anterior hasta comprobar el progreso.']:['Abre el menú del navegador.','Elige “Instalar aplicación” o “Añadir a pantalla de inicio”.','Confirma la instalación.'];
  $('#installSteps').replaceChildren(...steps.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));$('#installOverlay').hidden=false;$('#installClose').focus({preventScroll:true});
}
async function requestInstall(){
  if(isStandalone())return;
  if(!installPrompt){showInstallGuide();return;}
  const prompt=installPrompt;installPrompt=null;await prompt.prompt();const choice=await prompt.userChoice;
  if(choice.outcome==='accepted'){$('#installGame').hidden=true;}else $('#installGame').hidden=false;
}
$('#storageWarning').hidden=!initial.warning;
function message(text,kind=''){$('#message').textContent=text;$('#message').className='message '+kind;}
function victoryMessage(){
  const s=current(),title=document.createElement('strong'),detail=document.createElement('small');
  title.textContent=practice?'¡Práctica superada!':s.index===99?'¡Eres Mente Claret!':'¡Reto superado!';
  const W=worlds[worldIndexForLevel(s.index)],done=s.index%10+1;
  detail.textContent=practice?(s.index===0?'Ya dominas el primer tablero. Vamos al siguiente.':'Ya puedes comenzar tu viaje.'):
    `${'★'.repeat(s.round.lives)} · ${W.place} · ${done}/10 retos completados${done<10?` · A ${10-done} del rango ${W.rank}`:` · Rango ${W.rank} conseguido`}`;
  $('#message').className='message success victory-message';$('#message').replaceChildren(title,detail);
}
function react(kind,text){
  const box=$('#claretReaction');clearTimeout(reactionTimer);box.className=`claret-reaction ${kind}`;$('#reactionText').textContent=text;box.hidden=false;
  reactionTimer=setTimeout(()=>{box.hidden=true;},kind==='win'?1800:1100);
}
function reward(text){
  const toast=$('#rewardToast');clearTimeout(rewardTimer);clearTimeout(rewardHideTimer);$('#rewardToastText').textContent=text;toast.hidden=false;toast.classList.remove('leaving');
  rewardTimer=setTimeout(()=>{toast.classList.add('leaving');rewardHideTimer=setTimeout(()=>{toast.hidden=true;toast.classList.remove('leaving');},220);},2200);
}
function pulseConsequences(origin,L){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const n=L.size,row=Math.floor(origin/n),column=origin%n,region=L.regions[row][column];
  board.querySelectorAll('.cell').forEach(cell=>{const k=Number(cell.dataset.cell),r=Math.floor(k/n),c=k%n;if(k===origin)cell.classList.add('rule-origin');else if(r===row||c===column||L.regions[r][c]===region||(Math.abs(r-row)<=1&&Math.abs(c-column)<=1))cell.classList.add('rule-effect');});
  setTimeout(()=>board.querySelectorAll('.rule-origin,.rule-effect').forEach(cell=>cell.classList.remove('rule-origin','rule-effect')),680);
}
function stats(){
  $('.play').classList.toggle('is-solved',current().round.solved);
  const s=current(),L=level();$('#level').textContent=L.n;$('#levelLabel').textContent=practice?'Práctica':'Reto';$('#levelTotal').textContent=practice?' / 2':' / 100';$('#difficulty').textContent=practice?'PRÁCTICA · TUTORIAL':L.difficulty.toLocaleUpperCase('es');
  $('#rank').textContent=earnedRank(state.completed);$('#progress').value=state.completed;
  $('#lives').textContent='♥ '.repeat(s.round.lives).trim();$('#lives').setAttribute('aria-label',`${s.round.lives} vidas`);
  $('#helps').textContent=state.helps;$('#streak').textContent=state.streak;$('#size').textContent=`${L.size} × ${L.size}`;
  $('#count').textContent=`${Object.values(s.round.marks).filter(v=>v==='c').length}/${L.size}`;
  const mission=practice?null:missionFor(s.index,L);
  $('#missionTag').hidden=!mission;$('#missionTag').textContent=mission?.title??'';
  $('#tipText').textContent=mission?.copy??L.tip;
  $('#missionProgress').hidden=!mission;$('#missionProgress').textContent=mission?missionProgress(mission,s.round.marks):'';
  $('.play').dataset.mission=mission?.type??'classic';
  $('#boardNote').textContent=practice?'Al colocar a Claret verás las consecuencias de tu elección.':'Las cruces solo aparecen cuando tú las colocas.';
  const milestone=!practice&&s.round.solved&&(s.index+1)%10===0&&!s.celebratedWorlds.includes(Math.floor(s.index/10));
  $('#check').textContent=s.round.solved?solvedActionLabel({practice,index:s.index,onboarding,milestone}):'Comprobar';
  $('#check').disabled=false;$('#gameResults').textContent=`Victorias ${state.victories} · Derrotas ${state.defeats}`;if(s.round.lives===0)$('#check').textContent='Reintentar nivel';
  $('#reset').disabled=s.round.solved||s.round.lives>0;$('#hint').disabled=s.round.solved||s.round.lives===0||(!practice&&s.helps===0&&s.round.lessonKey!==JSON.stringify(Object.entries(s.round.marks).sort(([a],[b])=>Number(a)-Number(b))));
  $('#hint').textContent=s.round.lessonKey===JSON.stringify(Object.entries(s.round.marks).sort(([a],[b])=>Number(a)-Number(b)))?'Explícame más':'Ayuda';
  $('#leavePractice').hidden=!practice||onboarding;
  $('#sound').setAttribute('aria-pressed',String(state.sound));$('#sound').setAttribute('aria-label',state.sound?'Desactivar sonido':'Activar sonido');$('#sound').textContent=state.sound?'♪':'♪̸';
  document.querySelectorAll('.daily-button').forEach(button=>button.classList.toggle('due',state.daily.last<dateKey()));
  $('#resume').textContent=state.completed===100?'Has completado los 100 retos.':state.index?`Continúa en el reto ${state.index+1}.`:'100 retos. A tu ritmo.';
  $('#play').setAttribute('aria-label',state.tutorialDone?'Continuar partida':'Jugar');
}
function drawBoard(){
  const s=current(),L=level(),n=L.size,mission=practice?null:missionFor(s.index,L),auto=practice?autoMarks(L,s.round.marks):new Set();
  board.replaceChildren();board.style.gridTemplateColumns=`repeat(${n},minmax(0,1fr))`;board.style.gridTemplateRows=`repeat(${n},minmax(0,1fr))`;board.setAttribute('aria-label',`Tablero de ${n} filas y ${n} columnas`);
  for(let k=0;k<n*n;k++) {
    const r=Math.floor(k/n),c=k%n,region=L.regions[r][c],v=s.round.marks[k],isX=v!=='c'&&(v==='x'||v==='e'||auto.has(k));
    const b=document.createElement('button');b.type='button';b.className='cell';b.dataset.cell=k;b.tabIndex=k===focusCell?0:-1;
    b.style.backgroundColor=palette[region];
    if(r>0&&L.regions[r-1][c]!==region)b.style.borderTop='3px solid #17385c';
    if(c>0&&L.regions[r][c-1]!==region)b.style.borderLeft='3px solid #17385c';
    b.classList.toggle('failed',v==='e');b.classList.toggle('auto',isX&&v!=='x'&&v!=='e');b.classList.toggle('hi',highlights.includes(k));b.classList.toggle('fixed',Boolean(mission?.fixed?.includes(k)));
    b.classList.toggle('hint-source',hintSource.includes(k));b.classList.toggle('hint-excluded',hintExcluded.includes(k));
    b.setAttribute('aria-label',`Fila ${r+1}, columna ${c+1}, región ${region+1}: ${v==='c'?(mission?.fixed?.includes(k)?'Claret guía':'Claret'):isX?(v==='e'?'fallo, descarte fijo':v==='x'?'descarte manual':'descarte automático'):'vacía'}`);
    b.setAttribute('aria-pressed',String(v==='c'));b.setAttribute('aria-disabled',String(s.round.solved));
    if(v==='c'){const img=document.createElement('img');img.src='./assets/claret.jpeg';img.alt='';b.append(img);}
    else if(isX){const cross=document.createElement('span');cross.className='cross';cross.textContent='×';cross.setAttribute('aria-hidden','true');b.append(cross);}
    // Native click covers taps, mouse and keyboard without firing on a swipe.
    b.onclick=e=>{if(e.detail===0)safeMark(k);};b.onkeydown=e=>{
      if(e.key.toLowerCase()==='x'||e.key.toLowerCase()==='c'){e.preventDefault();setTool(e.key.toLowerCase());safeMark(k);return;}
      let target=k;if(e.key==='ArrowLeft')target=Math.max(r*n,k-1);else if(e.key==='ArrowRight')target=Math.min(r*n+n-1,k+1);else if(e.key==='ArrowUp')target=Math.max(0,k-n);else if(e.key==='ArrowDown')target=Math.min(n*n-1,k+n);else if(e.key==='Home')target=r*n;else if(e.key==='End')target=r*n+n-1;else return;
      e.preventDefault();focusCell=target;board.querySelectorAll('button').forEach(cell=>cell.tabIndex=Number(cell.dataset.cell)===target?0:-1);board.querySelector(`[data-cell="${target}"]`).focus();
    };board.append(b);
  }
  stats();
}
function redraw(){
  const s=current();if(!practice)seedMission(s.index,level(),s.round);
  highlights=[];hintSource=[];hintExcluded=[];pendingHint=null;focusCell=0;$('#hintText').hidden=true;
  const mission=practice?null:missionFor(s.index,level());
  if(mission?.type==='logical'&&!Object.keys(s.round.marks).length&&mission.preferredTool)tool=mission.preferredTool;
  drawBoard();setTool(tool);
  message(s.round.lives===0?'Has perdido este intento. Reintenta el mismo nivel con tres vidas.':s.round.solved?'¡Reto superado! Puedes continuar.':mission?.type==='intruder'?'Compara los dos Claret. Uno de ellos rompe una norma.':mission?.type==='logical'?'Busca primero una deducción completamente segura.':'Elige una casilla para empezar.',s.round.solved?'success':'');
  if(s.round.solved)victoryMessage();
}
function mark(k){
  const s=current();if(s.round.solved||s.round.lives===0)return;
  focusCell=k;const marks=s.round.marks,L=level(),mission=practice?null:missionFor(s.index,L),gate=missionGate(mission,marks,tool,k),auto=practice?autoMarks(L,marks):new Set();
  if(marks[k]==='e'){message('Esta casilla ya está descartada por un fallo.');return;}
  const deductionBefore=tool==='c'?teachingHint(L,marks):null;
  const logicalBefore=mission?.type==='logical'&&missionProgress(mission,marks)==='Primera deducción conseguida';
  if(gate){highlights=mission?.type==='intruder'?[...mission.fixed,mission.intruder]:mission?.fixed??[];drawBoard();message(gate,'error');react('worry','Revisa esa relación');play('error',state.sound);return;}
  if(tool==='x'&&marks[k]==='c'){message('Selecciona Claret para retirar esa figura.');react('worry','Primero cambia de herramienta');return;}
  if(tool==='x'&&auto.has(k)&&marks[k]!=='x'){message('Esta X depende de tu hipótesis. Retira el Claret que la provoca para revisarla.');react('think','Revisa tu hipótesis');return;}
  if(tool==='c'){
    const outcome=attemptClaret(s,L,k);
    if(outcome==='error'||outcome==='lost'){
      pendingHint=null;highlights=[];persist();drawBoard();
      message(outcome==='lost'?'Has agotado las tres vidas. Reintenta este nivel.':`Esa casilla no admite Claret. Queda descartada. Te quedan ${s.round.lives} vidas.`,'error');
      react('worry',outcome==='lost'?'¡Puedes volver a intentarlo!':'Una pista para continuar');play('error',state.sound);haptic();
      if(outcome==='lost')$('#check').focus({preventScroll:true});return;
    }
  }else if(marks[k]===tool)delete marks[k];else marks[k]=tool;
  highlights=[];hintSource=[];hintExcluded=[];pendingHint=null;s.round.helpStep=0;$('#hintText').hidden=true;
  persist();drawBoard();const cell=board.querySelector(`[data-cell="${k}"]`);cell.focus({preventScroll:true});if(tool==='c'&&marks[k]==='c'){cell.classList.add('selected');pulseConsequences(k,L);react('think','Veamos qué implica…');}
  const logicalAfter=mission?.type==='logical'&&missionProgress(mission,marks)==='Primera deducción conseguida';
  const missionMoment=mission?.type==='intruder'&&k===mission.intruder&&!marks[k]?'¡Intruso localizado! Ahora completa el tablero.':!logicalBefore&&logicalAfter?'¡Primera deducción conseguida! Continúa con el tablero.':'';
  if(missionMoment)react('spark','¡Buena deducción!');
  message(missionMoment|| (tool==='c'?(practice?'Hipótesis actualizada. Revisa sus consecuencias.':'Claret colocado. Ahora decide tus descartes.'):'Descarte actualizado.'),missionMoment?'success':'');play(missionMoment?'logical':tool==='c'?'place':'x',state.sound);haptic();
  if(tool==='c'&&marks[k]==='c'){
    const wave=document.createElement('span');wave.className='claret-wave';wave.setAttribute('aria-hidden','true');cell.append(wave);setTimeout(()=>wave.remove(),720);
    if(deductionBefore?.type==='place'&&deductionBefore.target===k)message('¡Bien deducido! '+deductionBefore.reason,'success');
    const result=diagnose(L,marks);
    if(result.ok)check();
    else if(result.cells?.length){highlights=result.cells;drawBoard();message(result.message,'error');play('error',state.sound);}
  }
}
const cancelGesture=bindBoardGestures(board,{
  size:()=>level().size,enabled:()=>!screens.game.hidden&&!current().round.solved&&current().round.lives>0&&!document.querySelector('dialog[open]'),
  read:k=>current().round.marks[k],
  write:(k,value)=>{if((current().round.marks[k]??null)===value)return;setTool('x');safeMark(k);},
  place:k=>{setTool('c');safeMark(k);}
});
function safeMark(k){
  try{mark(k);}
  catch(error){console.error('No se pudo registrar la jugada',error);repairActiveScreen();drawBoard();message('No se pudo registrar ese toque. Inténtalo de nuevo.','error');}
}
function setTool(value){tool=value;$('#toolClaret').setAttribute('aria-pressed',String(value==='c'));$('#toolX').setAttribute('aria-pressed',String(value==='x'));}
function showHint(){
  const s=current(),L=level();if(s.round.solved||s.round.lives===0)return;
  const h=teachingHint(L,s.round.marks);if(!h){message('El tablero ya está resuelto.');return;}
  const key=JSON.stringify(Object.entries(s.round.marks).sort(([a],[b])=>Number(a)-Number(b)));
  const maxStage=Math.max(3,(h.steps?.length??0)+2),stage=advanceLesson(s,key,!!practice,maxStage);if(!stage)return;
  hintSource=[];hintExcluded=[];
  pendingHint=h;
  if(h.type==='review'||h.type==='conflict'){highlights=h.cells;$('#hintText').textContent=h.reason;}
  else if(stage===1){highlights=h.steps?.[0]?.group.cells??h.group.cells;$('#hintText').textContent=`Observa la ${h.steps?.[0]?.group.kind??h.group.kind} ${(h.steps?.[0]?.group.index??h.group.index)+1}. Vamos a encontrar un Claret seguro, sin adivinar.`;}
  else if(stage<maxStage){const step=h.steps?.[stage-2];if(step){highlights=[];hintSource=step.candidates;hintExcluded=step.removed;$('#hintText').textContent=`Paso ${stage-1}/${h.steps.length}: el Claret de la ${step.group.kind} ${step.group.index+1} tiene que estar en una casilla con borde azul. Cualquiera de esas posiciones entra en conflicto con las casillas de borde naranja: podemos descartarlas. Pulsa «Explícame más» para seguir.`;}else{highlights=h.cells;$('#hintText').textContent=h.explanation;}}
  else{highlights=[h.target];$('#hintText').textContent=h.reason+' Colócalo tú con doble toque. Esta explicación no gasta otra ayuda.';}
  $('#hintText').hidden=false;persist();drawBoard();play('logical',state.sound);
}
function check(){
  const s=current();if(s.round.lives===0){retryLevel();return;}if(s.round.solved){if(practice){const more=advanceTutorial(state,practice,onboarding);persist();if(!more){leavePractice();return;}redraw();board.focus();return;}
    if(s.index+1<s.completed||(s.index+1===s.completed&&s.celebratedWorlds.includes(Math.floor(s.index/10)))){s.index=Math.min(99,s.completed);s.round=fresh().round;if(s.completed===100){s.round.marks=Object.fromEntries(levels[99].solution.map((c,r)=>[r*levels[99].size+c,'c']));s.round.solved=true;}persist();openMap();return;}
    if(journeyStatus(state).kind==='achievement'){pendingAchievement=worldIndexForLevel(state.index);openAchievement();return;}
    if(nextLevel(s))persist();openMap();return;}
  const result=diagnose(level(),s.round.marks);highlights=result.cells;
  if(result.ok){
    const helpsBefore=s.helps;
    if(practice)s.round.solved=true;else complete(s);persist();drawBoard();
    const milestone=!practice&&(s.index+1)%10===0&&!s.celebratedWorlds.includes(Math.floor(s.index/10)),recoveredHelp=!practice&&s.helps>helpsBefore;
    if(recoveredHelp)reward('15 retos sin ayuda · Recuperas una ayuda');
    else if(!practice&&s.streak>0&&s.streak%3===0)reward(`${s.streak} retos sin ayuda · ¡Mente despierta!`);
    message(practice?'¡Correcto! Práctica completada.':s.index===99?'¡Has completado Claret Logic! Tu rango es Mente Claret.':milestone?`¡Reto superado! Nuevo rango: ${earnedRank(s.completed)}.`:'¡Correcto! Reto superado.','success');
    $('#hintText').hidden=true;react('win',practice?'¡Práctica superada!':milestone?'¡Nuevo rango!':'¡Reto superado!');play(milestone?'badge':'win',state.sound);haptic('win');celebrate(milestone);
    victoryMessage();
    if(!milestone)$('#check').focus({preventScroll:true});
    if(milestone){pendingAchievement=worldIndexForLevel(s.index);setTimeout(openAchievement,450);}
  }else{drawBoard();message(result.message,'error');react('worry','Todavía hay algo que revisar');play('error',state.sound);}
}
function startGame(){
  clearTimeout(dailyTimer);dailyTimer=0;
  if($('#daily').open)closeDaily(false);else $('#dailyBackdrop').hidden=true;
  if(!practice&&!state.tutorialDone){practice=beginTutorial(state);onboarding=true;}
  showScreen('game');repairActiveScreen();
  // The map changes state.index without keeping a game screen mounted. Always
  // rebuild here so the selected node cannot reuse the previous board's DOM.
  redraw();board.focus();
  if(!practice&&state.index%10===0&&!state.seenWorlds.includes(worldIndexForLevel(state.index)))openWorldIntro();
  else{react('ready','¡Vamos a pensar!');queueMissionIntro();}
}
function home(){persist();practice=null;onboarding=false;if($('#daily').open)closeDaily(false);showScreen('start');repairActiveScreen();redraw();$('#play').focus();}
function leavePractice(){practice=null;onboarding=false;redraw();openMap();}
function renderDaily(){
  $('#dailyCount').textContent=state.daily.current;$('#dailyBest').textContent=`Mejor racha: ${state.daily.best}`;
  const now=new Date(),today=dateKey(now),monday=new Date(now);monday.setDate(now.getDate()-(now.getDay()+6)%7);
  const dates=activeDates(state.daily);$('#week').replaceChildren();
  ['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'].forEach((name,i)=>{const d=new Date(monday);d.setDate(monday.getDate()+i);const key=dateKey(d),el=document.createElement('span'),b=document.createElement('b');el.textContent=name;b.className=(dates.has(key)?'on ':'')+(key===today?'today':'');b.textContent=dates.has(key)?'✓':'·';el.setAttribute('aria-label',`${key}: ${dates.has(key)?'racha activada':'sin activación'}`);el.append(b);$('#week').append(el);});
  const activated=state.daily.last>=today;$('#dailyContinue').disabled=!activated;$('#heart').disabled=activated;$('#heart').classList.toggle('lit',activated);$('#dailyMessage').textContent=activated?'Tu corazón de María ya está encendido hoy.':'Un pequeño gesto para comenzar.';
}
function openDaily(automatic=false){
  automatic=automatic===true;
  if($('#daily').open)return true;
  if(automatic&&(!$('#game').hidden||document.querySelector('dialog[open]')))return false;
  if($('#worldIntro').open||$('#achievement').open||$('#rules').open||$('#collection').open||$('#journeyOverview').open)return false;
  if($('#missionIntro').open){$('#missionIntro').close();introducedMissions.delete(state.index);}
  clearTimeout(dailyTimer);dailyTimer=0;dailyReturnFocus=document.activeElement;renderDaily();
  $('#dailyBackdrop').hidden=false;$('#daily').show();$('#heart').focus({preventScroll:true});return true;
}
function closeDaily(resume=true){
  const wasOpen=$('#daily').open;if(wasOpen)$('#daily').close();$('#dailyBackdrop').hidden=true;repairActiveScreen();
  const target=dailyReturnFocus?.isConnected?dailyReturnFocus:$('#levelNodes .current,#play,#board');
  if(wasOpen)target?.focus?.({preventScroll:true});dailyReturnFocus=null;
  if(resume&&!$('#game').hidden&&!$('#worldIntro').open)queueMissionIntro();
}
function openWorldIntro(){
  const worldIndex=worldIndexForLevel(state.index),W=worlds[worldIndex];
  $('#worldIntroArt').src=`./assets/worlds/${W.art}`;$('#worldIntroArt').alt=`Escenario de ${W.place}`;
  $('#worldIntroNumber').textContent=`DESTINO ${worldIndex+1} DE 10`;$('#worldIntroTitle').textContent=W.place;$('#worldIntroDescription').textContent=W.description;
  $('#worldIntroRange').textContent=W.range.replace('Retos ','');$('#worldIntroRank').textContent=W.rank;
  if(!$('#worldIntro').open){$('#worldIntro').showModal();$('#worldIntroContinue').focus();}
}
function queueMissionIntro(){
  if(practice||introducedMissions.has(state.index))return;const mission=missionFor(state.index,level());if(!mission)return;
  const missionIndex=state.index;
  $('#missionIntro').dataset.mission=mission.type;$('#missionIntroSymbol').textContent=mission.symbol;$('#missionIntroTitle').textContent=mission.title;$('#missionIntroCopy').textContent=mission.copy;setTimeout(()=>{if(!$('#game').hidden&&!practice&&state.index===missionIndex&&!$('#daily').open&&!document.querySelector('dialog[open]')){introducedMissions.add(missionIndex);$('#missionIntro').showModal();$('#missionIntroContinue').focus();}},140);
}
function renderAmbience(){
  const layer=$('#worldAmbience'),symbol=ambientSymbols[mapWorld];layer.replaceChildren();layer.dataset.world=mapWorld;
  for(let i=0;i<7;i++){const bit=document.createElement('span');bit.textContent=symbol;bit.style.setProperty('--x',`${9+(i*17)%84}%`);bit.style.setProperty('--delay',`${-i*1.3}s`);bit.style.setProperty('--duration',`${7+i%3*2}s`);layer.append(bit);}
}
function drawMap(){
  const W=worlds[mapWorld],unlocked=unlockedWorldIndex(state),start=mapWorld*10;
  $('#worldScene').style.setProperty('--world-tone',W.tone);$('#worldArt').src=`./assets/worlds/${W.art}`;$('#worldArt').alt=`Escenario de ${W.place}`;
  $('#worldNumber').textContent=`MUNDO ${mapWorld+1} DE 10`;$('#worldTitle').textContent=W.place;$('#worldRange').textContent=W.range;$('#worldRankLabel').textContent=state.completed>=(mapWorld+1)*10?'Rango':'Meta';$('#worldRank').textContent=W.rank;$('#worldDescription').textContent=W.description;renderAmbience();
  $('#routeLine').setAttribute('points',routePoints.map(p=>p.join(',')).join(' '));
  if(levels.slice(start,start+10).some(L=>L.n<=state.completed&&!state.stars[L.n-1]))$('#worldDescription').textContent+=' · ☆: puntuación antigua sin registrar; repite el reto para conseguir estrellas.';
  const nodes=$('#levelNodes');nodes.replaceChildren();
  routePoints.forEach(([x,y],i)=>{
    const number=start+i+1,done=number<=state.completed,current=number===state.completed+1&&state.completed<100,available=mapWorld<=unlocked&&(done||current);
    const mission=missionFor(number-1,levels[number-1]),b=document.createElement('button');b.type='button';b.className='levelnode';b.style.left=x+'%';b.style.top=y+'%';b.textContent=number;if(done){const stars=document.createElement('span');stars.className='node-stars';stars.setAttribute('aria-hidden','true');const score=state.stars[number-1]??0;for(let j=1;j<=3;j++){const star=document.createElement('span');star.className=j<=score?'earned':'empty';star.textContent=j<=score?'★':'☆';stars.append(star);}b.append(stars);}b.dataset.level=number;
    b.classList.toggle('done',done);b.classList.toggle('current',current);b.classList.toggle('locked',!available);b.disabled=!available;
    if(mission){b.classList.add('mission-node');b.dataset.mission=mission.symbol;}
    const missionName=mission?`, misión ${mission.short}`:'';
    b.setAttribute('aria-label',done?`Reto ${number}${missionName}, superado${state.stars[number-1]?`, ${state.stars[number-1]} estrellas`:', estrellas sin registro, repite para puntuarlas'}`:current?`Reto ${number}${missionName}, continuar`:`Reto ${number}${missionName}, bloqueado`);
    if(available)b.onclick=()=>{if(number!==state.index+1||state.round.solved){state.index=number-1;state.round=fresh().round;persist();}startGame();};nodes.append(b);
  });
  $('#previousWorld').disabled=mapWorld===0;$('#nextWorld').disabled=mapWorld===9;
  $('#worldDots').textContent=worlds.map((_,i)=>i===mapWorld?'●':i<=unlocked?'•':'·').join(' ');
}
function openMap(index=worldIndexForLevel(state.completed>=100?99:state.index)){
  // A solved round can survive a refresh. Resume the journey without leaving
  // the player on a map where every visible node is disabled.
  const journey=journeyStatus(state);
  if(journey.kind==='advance'){nextLevel(state);index=worldIndexForLevel(state.index);}
  persist();practice=null;onboarding=false;mapWorld=Math.min(unlockedWorldIndex(state),Math.max(0,index));
  if($('#daily').open)closeDaily(false);showScreen('map');repairActiveScreen();$('#worldMap').classList.add('map-enter');drawMap();$('#levelNodes .current,#badges').focus({preventScroll:true});setTimeout(()=>$('#worldMap').classList.remove('map-enter'),560);
  clearTimeout(dailyTimer);dailyTimer=0;if(journey.kind==='achievement'){pendingAchievement=journey.world;setTimeout(openAchievement,120);}else if(journey.kind!=='complete'&&state.daily.last<dateKey())dailyTimer=setTimeout(()=>openDaily(true),180);
}
function renderCollection(){
  const grid=$('#badgeGrid');grid.replaceChildren();
  worlds.forEach((W,i)=>{const unlocked=state.completed>=(i+1)*10,current=i===worldIndexForLevel(state.completed>=100?99:state.index),progress=Math.max(0,Math.min(10,state.completed-i*10)),card=document.createElement('article');card.className='badgecard';card.classList.toggle('locked',!unlocked&&!current);card.classList.toggle('current',current&&!unlocked);card.innerHTML=`<img src="./assets/worlds/${W.art}" alt="" width="160" height="100"><span class="badge-medal" aria-hidden="true">${W.symbol}</span><div><small>DESTINO ${i+1} · ${unlocked?'COMPLETADO':current?`${progress}/10 RETOS`:'POR DESCUBRIR'}</small><strong>${unlocked?W.rank:current?W.place:'Destino oculto'}</strong><p>${unlocked?W.place+' · '+W.description:current?'Sigue avanzando para conseguir la insignia '+W.rank+'.':'Completa el destino anterior para revelarlo.'}</p></div>`;grid.append(card);});
}
function renderJourney(){
  const active=worldIndexForLevel(state.completed>=100?99:state.index),list=$('#journeyList');list.replaceChildren();
  worlds.forEach((W,i)=>{
    const done=state.completed>=(i+1)*10,current=i===active&&!done,locked=i>active,button=document.createElement('button');
    button.type='button';button.className='journeycard';button.classList.toggle('done',done);button.classList.toggle('current',current);button.classList.toggle('locked',locked);button.disabled=false;
    const known=true,status=done?`Rango ${W.rank} conseguido`:current?'Tu destino actual':'Puedes explorar este destino; sus retos siguen bloqueados';
    button.innerHTML=`<img src="./assets/worlds/${W.art}" alt="" width="120" height="80"><span><small>DESTINO ${i+1} · ${W.range}</small><strong>${known?W.place:'Por descubrir'}</strong><em>${status}</em></span>`;
    button.setAttribute('aria-label',locked?`${W.place}, ${W.range}, explorar, retos bloqueados`:done?`${W.place}, ${W.range}, superado`:`${W.place}, ${W.range}, destino actual`);
    button.onclick=()=>{$('#journeyOverview').close();mapWorld=i;drawMap();$('#levelNodes .current,#badges').focus({preventScroll:true});};
    list.append(button);
  });
}
function openAchievement(){
  if(pendingAchievement===null||$('#achievement').open||($('#game').hidden&&$('#worldMap').hidden))return;
  // The green "Ver logro" button remains available if another dialog is open.
  if(document.querySelector('dialog[open]'))return;
  const W=worlds[pendingAchievement];
  $('#achievementBadge').textContent=W.symbol;$('#achievement').style.setProperty('--world-tone',W.tone);$('#achievementTitle').textContent=W.rank;$('#achievementPlace').textContent=W.place;
  $('#achievementArt').src=`./assets/worlds/${W.art}`;$('#achievementArt').alt=`Escenario de ${W.place}`;$('#achievementStats').textContent=`${(pendingAchievement+1)*10} retos completados · Destino ${pendingAchievement+1}/10`;
  $('#achievementCopy').textContent=pendingAchievement===9?'Has superado los 100 retos y alcanzado el rango máximo: Mente Claret.':'Has superado 10 nuevos retos. Tu insignia se ha añadido a la colección.';
  $('#achievementContinue').textContent=pendingAchievement===9?'Ver mi recorrido completo':'Descubrir el siguiente mundo';$('#shareAchievement').textContent='Compartir logro';
  shareCardPromise=createAchievementCard(pendingAchievement).catch(()=>null);
  $('#achievement').showModal();$('#achievementContinue').focus();
}
$('#play').onclick=()=>state.tutorialDone?openMap():openRuleCards(openMap);$('#home').onclick=e=>{e.preventDefault();home();};$('#mapHome').onclick=home;
$('#startDaily').onclick=()=>openDaily();$('#mapDaily').onclick=()=>openDaily();$('#gameDaily').onclick=()=>openDaily();
$('#installGame').onclick=()=>requestInstall().catch(showInstallGuide);$('#installClose').onclick=closeInstallGuide;$('#installConfirm').onclick=closeInstallGuide;
$('#installOverlay').onclick=e=>{if(e.target===$('#installOverlay'))closeInstallGuide();};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#installGame').hidden=isStandalone();});
window.addEventListener('appinstalled',()=>{installPrompt=null;$('#installGame').hidden=true;closeInstallGuide();});
$('#installGame').hidden=isStandalone();
$('#badges').onclick=()=>{renderCollection();$('#collection').showModal();};$('[data-close="collection"]').onclick=()=>$('#collection').close();
$('#journeyButton').onclick=()=>{renderJourney();$('#journeyOverview').showModal();$('#journeyList .current,#journeyList .done').focus({preventScroll:true});};$('[data-close="journey"]').onclick=()=>$('#journeyOverview').close();
$('#journeyCurrent').onclick=()=>{$('#journeyOverview').close();mapWorld=worldIndexForLevel(state.completed>=100?99:state.index);drawMap();$('#levelNodes .current,#badges').focus({preventScroll:true});};
function changeMapWorld(direction){const next=Math.max(0,Math.min(9,mapWorld+direction));if(next===mapWorld)return;mapWorld=next;drawMap();}
$('#previousWorld').onclick=()=>changeMapWorld(-1);$('#nextWorld').onclick=()=>changeMapWorld(1);
bindMapSwipe($('#worldScene'),changeMapWorld);
async function createAchievementCard(worldIndex){
  const W=worlds[worldIndex],canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');canvas.width=1080;canvas.height=1350;
  const gradient=ctx.createLinearGradient(0,0,1080,1350);gradient.addColorStop(0,W.tone);gradient.addColorStop(1,'#102d50');ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,1350);
  const image=new Image();image.src=`./assets/worlds/${W.art}`;try{await image.decode();const scale=Math.max(1080/image.width,620/image.height),w=image.width*scale,h=image.height*scale;ctx.drawImage(image,(1080-w)/2,(620-h)/2,w,h);}catch{}
  const shade=ctx.createLinearGradient(0,250,0,680);shade.addColorStop(0,'transparent');shade.addColorStop(1,'#102d50');ctx.fillStyle=shade;ctx.fillRect(0,0,1080,680);
  ctx.textAlign='center';ctx.fillStyle='#ffe29a';ctx.font='900 34px system-ui';ctx.fillText('CLARET LOGIC · HE CONSEGUIDO',540,700);
  const fit=(text,max,start)=>{let size=start;do{ctx.font=`900 ${size}px system-ui`;size-=2;}while(ctx.measureText(text).width>max&&size>38);return ctx.font;};
  ctx.fillStyle='white';fit(W.place,920,86);ctx.fillText(W.place,540,800);ctx.fillStyle='#ffe29a';fit(W.rank.toLocaleUpperCase('es'),900,76);ctx.fillText(W.rank.toLocaleUpperCase('es'),540,900);
  ctx.beginPath();ctx.arc(540,1035,76,0,Math.PI*2);ctx.fillStyle='#fff7d0';ctx.fill();ctx.fillStyle=W.tone;ctx.font='900 72px system-ui';ctx.fillText(W.symbol,540,1060);
  ctx.fillStyle='white';ctx.font='800 38px system-ui';ctx.fillText(`Nivel ${(worldIndex+1)*10} · Destino ${worldIndex+1} de 10`,540,1160);ctx.font='750 31px system-ui';ctx.fillStyle='#ffe29a';ctx.fillText('¿PUEDES SUPERARME?',540,1220);ctx.font='600 25px system-ui';ctx.fillStyle='#d8ebfb';ctx.fillText('lagi2000.github.io/claret-logic',540,1280);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw Error('No se pudo preparar la tarjeta');
  return new File([blob],`claret-logic-${worldIndex+1}.png`,{type:'image/png'});
}
async function shareAchievement(){
  if(pendingAchievement===null)return;
  const button=$('#shareAchievement'),worldIndex=pendingAchievement,W=worlds[worldIndex];button.disabled=true;
  let file;
  try{
    file=await (shareCardPromise??createAchievementCard(worldIndex));
    if(!file)throw Error('No se pudo preparar la tarjeta');
    const url=new URL('./',location.href).href,text=`He conseguido ${W.rank} en Claret Logic (nivel ${(worldIndex+1)*10}). ¿Puedes superarme? ${url}`;
    if(navigator.share&&navigator.canShare?.({files:[file]})){
      await navigator.share({title:'Mi logro en Claret Logic',text,files:[file]});button.textContent='Tarjeta compartida';
    }else{
      downloadAchievement(file);button.textContent='Tarjeta guardada';
    }
  }catch(error){if(error?.name!=='AbortError'){
    if(file){downloadAchievement(file);button.textContent='Tarjeta guardada';}
    else button.textContent='Reintentar compartir';
  }}
  finally{button.disabled=false;}
}
function downloadAchievement(file){const objectUrl=URL.createObjectURL(file),link=document.createElement('a');link.href=objectUrl;link.download=file.name;link.click();setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);}
$('#shareAchievement').onclick=shareAchievement;
function continueAchievement(){if(pendingAchievement===null)return;const finished=pendingAchievement===9;
  if(!state.celebratedWorlds.includes(pendingAchievement))state.celebratedWorlds.push(pendingAchievement);
  $('#achievement').close();pendingAchievement=null;shareCardPromise=null;if(!finished)nextLevel(state);persist();openMap(finished?9:worldIndexForLevel(state.index));}
$('#achievementContinue').onclick=continueAchievement;
$('#achievement').addEventListener('cancel',e=>{e.preventDefault();continueAchievement();});
function continueWorldIntro(){const world=worldIndexForLevel(state.index);if(!state.seenWorlds.includes(world))state.seenWorlds.push(world);persist();$('#worldIntro').close();repairActiveScreen();react('ready','¡Comienza el viaje!');board.focus();queueMissionIntro();}
$('#worldIntroContinue').onclick=continueWorldIntro;
$('#worldIntro').addEventListener('cancel',e=>{e.preventDefault();continueWorldIntro();});
function continueMissionIntro(){$('#missionIntro').close();repairActiveScreen();board.focus();}
$('#missionIntroContinue').onclick=continueMissionIntro;
$('#missionIntro').addEventListener('cancel',e=>{e.preventDefault();continueMissionIntro();});
$('#how').onclick=()=>$('#rules').showModal();$('#help').onclick=()=>$('#rules').showModal();
$('[data-close="rules"]').onclick=()=>$('#rules').close();
$('#tutorial').onclick=()=>{onboarding=!state.tutorialDone;practice=beginTutorial(state,!onboarding);redraw();startGame();};$('#leavePractice').onclick=leavePractice;
$('#toolClaret').onclick=()=>setTool('c');$('#toolX').onclick=()=>setTool('x');$('#hint').onclick=showHint;$('#check').onclick=check;
function retryLevel(){if(!resetRound(current()))return;cancelGesture();persist();redraw();message('Nuevo intento: tres vidas. ¡Vamos a pensar!');board.focus();}
$('#reset').onclick=retryLevel;
$('#sound').onclick=()=>{state.sound=!state.sound;persist();stats();play('place',state.sound);};
$('#heart').onclick=()=>{const previousBest=state.daily.best,result=activateDay(state);persist();renderDaily();stats();if(result.changed){$('#heart').classList.add('lit');$('#dailyMessage').textContent=result.reward?'Has recuperado una ayuda. ¡Racha encendida!':state.daily.best>previousBest&&previousBest>0?`¡Nuevo récord: ${state.daily.best} días! Vuelve mañana.`:'Racha encendida. Vuelve mañana para continuar.';play('heart',state.sound);haptic();$('#dailyContinue').focus();}};
$('#dailyContinue').onclick=()=>closeDaily();
$('#dailySkip').onclick=()=>closeDaily();$('#dailyClose').onclick=()=>closeDaily();$('#dailyBackdrop').onclick=()=>closeDaily();
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('#daily').open){e.preventDefault();closeDaily();}else if(!$('#installOverlay').hidden){e.preventDefault();closeInstallGuide();}});
window.addEventListener('storage',event=>{if(event.key!==KEY||!event.newValue)return;try{
  const previousIndex=state.index;state=load(storage).state;cleanRound(state);
  if(practice)return;
  if(previousIndex!==state.index){
    for(const selector of ['#worldIntro','#missionIntro','#achievement'])if($(selector).open)$(selector).close();
    pendingAchievement=null;shareCardPromise=null;openMap();
  }else{
    redraw();if(!$('#worldMap').hidden)drawMap();
    if($('#daily').open)renderDaily();
    message('Partida actualizada desde otra pestaña.');
  }
}catch{}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){repairActiveScreen();if(!$('#start').hidden&&!practice)stats();}});
window.addEventListener('pageshow',()=>{if($('#daily').open)closeDaily(false);repairActiveScreen();});
// Keep the current board and dialogs intact while a new offline version installs.
// Fresh files are loaded the next time the player opens the game.
if('serviceWorker' in navigator){
  const wasControlled=Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(wasControlled)$('#updateNotice').hidden=false;});
  $('#applyUpdate').onclick=()=>{persist();location.reload();};
  $('#dismissUpdate').onclick=()=>{$('#updateNotice').hidden=true;};
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(registration=>registration.update()).catch(()=>{ /* Online play remains available. */ });
}
repairActiveScreen();redraw();$('#play').focus();

// Fixed teaching diagrams: examples illustrate one rule, not puzzle solutions.
const ruleCards=[
 {title:'UNO POR FILA Y COLUMNA',text:'Dos Claret no pueden compartir fila ni columna.',marks:[0,2],colors:[0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3],caption:'Así no: estos dos Claret comparten fila.'},
 {title:'UNO POR ZONA DE COLOR',text:'Coloca un solo Claret en cada región de color.',marks:[0,7],colors:[0,0,0,0,1,1,0,0,1,1,2,2,3,3,3,2],caption:'Así no: hay dos Claret en la zona rosa.'},
 {title:'NO PUEDEN TOCARSE',text:'Deja espacio entre los Claret. Tampoco pueden tocarse en diagonal.',marks:[5,10],colors:[0,0,1,1,0,0,1,1,2,2,3,3,2,2,3,3],caption:'Así no: estos dos Claret se tocan en diagonal.'}
];
let rulePage=0,afterRules=null;
const cards=document.createElement('dialog');cards.className='rulecards';cards.setAttribute('aria-labelledby','ruleCardTitle');
cards.innerHTML='<p class="rule-step" id="ruleStep"></p><h2 id="ruleCardTitle" tabindex="-1"></h2><p class="rule-copy" id="ruleCopy"></p><figure><div class="rule-diagram" role="img" id="ruleDiagram"></div><figcaption id="ruleCaption"></figcaption></figure><nav aria-label="Pasos de las normas"><button class="secondary" id="ruleBack">Anterior</button><button class="primary" id="ruleNext">Siguiente</button></nav>';
document.body.append(cards);
function drawRuleCard(){
 const card=ruleCards[rulePage];$('#ruleStep').textContent=`NORMA ${rulePage+1} DE 3`;
 $('#ruleCardTitle').textContent=card.title;$('#ruleCopy').textContent=card.text;$('#ruleCaption').textContent=card.caption;
 const diagram=$('#ruleDiagram');diagram.replaceChildren();diagram.setAttribute('aria-label',card.caption);
 card.colors.forEach((color,k)=>{const cell=document.createElement('span');cell.style.background=palette[color];if(card.marks.includes(k)){const img=document.createElement('img');img.src='./assets/claret.jpeg';img.alt='';cell.append(img);cell.className='rule-conflict';}diagram.append(cell);});
 $('#ruleBack').disabled=rulePage===0;$('#ruleNext').textContent=rulePage===2?'¡A jugar!':'Siguiente';
 $('#ruleCardTitle').focus({preventScroll:true});
}
function openRuleCards(done){rulePage=0;afterRules=done;cards.showModal();drawRuleCard();}
$('#ruleBack').onclick=()=>{if(rulePage>0){rulePage--;drawRuleCard();}};
$('#ruleNext').onclick=()=>{if(rulePage<2){rulePage++;drawRuleCard();}else{cards.close();afterRules?.();}};
cards.addEventListener('cancel',()=>{$('#play').focus({preventScroll:true});});

// Measure the real text/control height instead of assuming one phone size.
// Keep scrolling available for enlarged text or exceptionally small windows.
let fitFrame=0;
function scheduleFit(){cancelAnimationFrame(fitFrame);fitFrame=requestAnimationFrame(()=>{
 const app=$('#game');if(app.hidden)return;
 if(matchMedia('(min-width:560px) and (max-height:520px)').matches){board.style.removeProperty('width');return;}
 const viewport=window.visualViewport?.height??window.innerHeight;
 const square=board.getBoundingClientRect(),top=$('.topbar').getBoundingClientRect();
 const visibleBottoms=[$('.arena'),$('#game footer')].map(el=>el.getBoundingClientRect()).filter(rect=>rect.height>0).map(rect=>rect.bottom);
 // Measure the real content span. Using app.height is incorrect because the
 // mobile layout deliberately has min-height:100svh and caused the board to
 // shrink a few pixels on every ResizeObserver pass.
 const contentHeight=Math.max(0,Math.max(top.bottom,...visibleBottoms)-top.top);
 const playStyle=getComputedStyle($('.play'));
 const maxWidth=$('.play').clientWidth-parseFloat(playStyle.paddingLeft)-parseFloat(playStyle.paddingRight);
 const size=fittedBoardSize({viewport,contentHeight,boardSize:square.height,maxWidth,air:20,min:Math.max(168,level().size*30)});
 if(Math.abs(square.width-size)>1)board.style.width=size+'px';
 });}
new ResizeObserver(scheduleFit).observe($('#game'));
window.addEventListener('resize',scheduleFit);
window.visualViewport?.addEventListener('resize',scheduleFit);
