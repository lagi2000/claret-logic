import {levels} from './levels.js';
import {tutorials} from './tutorials.js';
import {autoMarks,diagnose,groups} from './engine.js';
import {nextHint} from './pedagogy.js';
import {KEY,beginTutorial,advanceTutorial,fresh,load,save,normalize,resetRound,complete,spendHint,nextLevel,dateKey,activateDay,earnedRank,activeDates} from './state.js';
import {play,haptic,celebrate} from './feedback.js';
import {worlds,routePoints,worldIndexForLevel,unlockedWorldIndex} from './worlds.js';
import {fittedBoardSize} from './layout.js';
import {journeyStatus,solvedActionLabel} from './journey.js';
import {missionFor,seedMission,missionGate,missionProgress} from './missions.js';
const $=s=>document.querySelector(s), board=$('#board');
let storage;try{storage=window.localStorage;}catch{}
const initial=load(storage);let state=initial.state,practice=null,onboarding=false,tool='c',focusCell=0,highlights=[],pendingHint=null,mapWorld=worldIndexForLevel(initial.state.index),pendingAchievement=null;
const palette=['#ffc8d9','#bde9d2','#bfe2ff','#ffe69b','#d9c8ff','#ffd5ad','#bdeef0'];
const current=()=>practice??state, level=()=>practice?tutorials[practice.index]:levels[state.index];
function persist(){if(practice&&onboarding){state.tutorialIndex=practice.index;state.tutorialRound=structuredClone(practice.round);}if(!save(storage,state))$('#storageWarning').hidden=false;}
function cleanRound(s){const n=levels[s.index].size;s.round.marks=Object.fromEntries(Object.entries(s.round.marks).filter(([k])=>+k<n*n));if(s.round.solved&&!diagnose(levels[s.index],s.round.marks).ok)s.round.solved=false;}
cleanRound(state);
$('#storageWarning').hidden=!initial.warning;
function message(text,kind=''){$('#message').textContent=text;$('#message').className='message '+kind;}
function stats(){
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
  const milestone=!practice&&s.round.solved&&(s.index+1)%10===0;
  $('#check').textContent=s.round.solved?solvedActionLabel({practice,index:s.index,onboarding,milestone}):'Comprobar';
  $('#check').disabled=milestone;
  $('#reset').disabled=s.round.solved;$('#hint').disabled=s.round.solved||(!practice&&s.helps===0);
  $('#leavePractice').hidden=!practice||onboarding;
  $('#sound').setAttribute('aria-pressed',String(state.sound));$('#sound').setAttribute('aria-label',state.sound?'Desactivar sonido':'Activar sonido');$('#sound').textContent=state.sound?'♪':'♪̸';
  $('#resume').textContent=state.completed===100?'Has completado los 100 retos.':state.index?`Continúa en el reto ${state.index+1}.`:'100 retos. A tu ritmo.';
}
function drawBoard(){
  const s=current(),L=level(),n=L.size,mission=practice?null:missionFor(s.index,L),auto=practice?autoMarks(L,s.round.marks):new Set();
  board.replaceChildren();board.style.gridTemplateColumns=`repeat(${n},minmax(0,1fr))`;board.style.gridTemplateRows=`repeat(${n},minmax(0,1fr))`;board.setAttribute('aria-label',`Tablero de ${n} filas y ${n} columnas`);
  for(let k=0;k<n*n;k++) {
    const r=Math.floor(k/n),c=k%n,region=L.regions[r][c],v=s.round.marks[k],isX=v!=='c'&&(v==='x'||auto.has(k));
    const b=document.createElement('button');b.type='button';b.className='cell';b.dataset.cell=k;b.tabIndex=k===focusCell?0:-1;
    b.style.backgroundColor=palette[region];
    if(r>0&&L.regions[r-1][c]!==region)b.style.borderTop='2px solid #17385c';
    if(c>0&&L.regions[r][c-1]!==region)b.style.borderLeft='2px solid #17385c';
    b.classList.toggle('auto',isX&&v!=='x');b.classList.toggle('hi',highlights.includes(k));b.classList.toggle('fixed',mission?.fixed?.includes(k));
    b.setAttribute('aria-label',`Fila ${r+1}, columna ${c+1}, región ${region+1}: ${v==='c'?(mission?.fixed?.includes(k)?'Claret guía':'Claret'):isX?(v==='x'?'descarte manual':'descarte automático'):'vacía'}`);
    b.setAttribute('aria-pressed',String(v==='c'));b.setAttribute('aria-disabled',String(s.round.solved));
    const id=document.createElement('span');id.className='regionid';id.textContent=region+1;id.setAttribute('aria-hidden','true');b.append(id);
    if(v==='c'){const img=document.createElement('img');img.src='./assets/claret.jpeg';img.alt='';b.append(img);}
    else if(isX){const cross=document.createElement('span');cross.className='cross';cross.textContent='×';cross.setAttribute('aria-hidden','true');b.append(cross);}
    b.onclick=()=>mark(k);b.onkeydown=e=>{
      let target=k;if(e.key==='ArrowLeft')target=Math.max(r*n,k-1);else if(e.key==='ArrowRight')target=Math.min(r*n+n-1,k+1);else if(e.key==='ArrowUp')target=Math.max(0,k-n);else if(e.key==='ArrowDown')target=Math.min(n*n-1,k+n);else if(e.key==='Home')target=r*n;else if(e.key==='End')target=r*n+n-1;else return;
      e.preventDefault();focusCell=target;board.querySelectorAll('button').forEach(cell=>cell.tabIndex=Number(cell.dataset.cell)===target?0:-1);board.querySelector(`[data-cell="${target}"]`).focus();
    };board.append(b);
  }
  stats();
}
function redraw(){
  const s=current();if(!practice)seedMission(s.index,level(),s.round);
  highlights=[];pendingHint=null;focusCell=0;$('#hintText').hidden=true;drawBoard();
  const mission=practice?null:missionFor(s.index,level());
  message(s.round.solved?'¡Reto superado! Puedes continuar.':mission?.type==='intruder'?'Compara los dos Claret. Uno de ellos rompe una norma.':mission?.type==='logical'?'Busca primero una deducción completamente segura.':'Elige una casilla para empezar.',s.round.solved?'success':'');
}
function mark(k){
  const s=current();if(s.round.solved)return;
  focusCell=k;const marks=s.round.marks,L=level(),mission=practice?null:missionFor(s.index,L),gate=missionGate(mission,marks,tool,k),auto=practice?autoMarks(L,marks):new Set();
  if(gate){highlights=mission?.type==='intruder'?[...mission.fixed,mission.intruder]:mission?.fixed??[];drawBoard();message(gate,'error');play('error',state.sound);return;}
  if(tool==='x'&&marks[k]==='c'){message('Selecciona Claret para retirar esa figura.');return;}
  if(tool==='x'&&auto.has(k)&&marks[k]!=='x'){message('Esta X depende de tu hipótesis. Retira el Claret que la provoca para revisarla.');return;}
  if(marks[k]===tool)delete marks[k];else marks[k]=tool;
  highlights=[];pendingHint=null;s.round.helpStep=0;$('#hintText').hidden=true;
  persist();drawBoard();const cell=board.querySelector(`[data-cell="${k}"]`);cell.focus({preventScroll:true});if(tool==='c'&&marks[k]==='c')cell.classList.add('selected');
  const missionMoment=mission?.type==='intruder'&&k===mission.intruder&&!marks[k]?'¡Intruso localizado! Ahora completa el tablero.':mission?.type==='logical'&&k===mission.target&&marks[k]===mission.expected?'¡Primera deducción conseguida! Continúa con el tablero.':'';
  message(missionMoment|| (tool==='c'?(practice?'Hipótesis actualizada. Revisa sus consecuencias.':'Claret colocado. Ahora decide tus descartes.'):'Descarte actualizado.'),missionMoment?'success':'');play(tool==='c'?'place':'x',state.sound);haptic();
}
function setTool(value){tool=value;$('#toolClaret').setAttribute('aria-pressed',String(value==='c'));$('#toolX').setAttribute('aria-pressed',String(value==='x'));}
function showHint(){
  const s=current(),L=level();if(s.round.solved)return;
  let h=pendingHint;
  if(!h){
    h=nextHint(L,s.round.marks);
    if(!h&&practice){
      const g=groups(L).find(g=>!g.cells.some(k=>s.round.marks[k]==='c'));
      if(g)h={type:'tutorial',group:g,candidates:g.cells,reason:L.n===1?'Esta región necesita un Claret. Prueba una casilla y observa las X.':'Busca una casilla de esta región que no comparta fila ni columna con otro Claret.'};
    }
    if(!h){message('Revisa las marcas y pulsa Comprobar.');return;}
    pendingHint=h;
  }
  if(!spendHint(s,!!practice))return;
  const stage=s.round.helpStep||3;
  if(h.type==='conflict') {
    highlights=h.cells;$('#hintText').textContent=h.reason+' Revisa estas dos casillas.';
  }else if(h.type==='tutorial') {
    highlights=h.group.cells;$('#hintText').textContent=h.reason;
  }else if(stage===1){
    highlights=h.group.cells;$('#hintText').textContent=`Observa la ${h.group.kind} ${h.group.index+1}. ¿Qué posibilidades le quedan?`;
  }else if(stage===2){
    highlights=h.candidates;$('#hintText').textContent=h.type==='place'?'Mira las X y compara las posibilidades de la zona señalada. Solo una casilla permite cumplir sus reglas.':`Compara las ${h.candidates.length} posibilidades señaladas: ¿qué casillas impiden todas ellas?`;
  }else{
    s.round.marks[h.target]=h.type==='place'?'c':'x';highlights=[h.target];$('#hintText').textContent=h.reason+' He realizado solo ese paso.';pendingHint=null;
  }
  $('#hintText').hidden=false;persist();drawBoard();play('place',state.sound);
}
function check(){
  const s=current();if(s.round.solved){if(practice){const more=advanceTutorial(state,practice,onboarding);persist();if(!more){leavePractice();return;}redraw();board.focus();return;}if(nextLevel(s)){persist();openMap();}else openMap(9);return;}
  const result=diagnose(level(),s.round.marks);highlights=result.cells;
  if(result.ok){
    if(practice)s.round.solved=true;else complete(s);persist();drawBoard();
    const milestone=!practice&&(s.index+1)%10===0;
    message(practice?'¡Correcto! Práctica completada.':s.index===99?'¡Has completado Claret Logic! Tu rango es Mente Claret.':milestone?`¡Reto superado! Nuevo rango: ${earnedRank(s.completed)}.`:'¡Correcto! Reto superado.','success');
    $('#hintText').hidden=true;play('win',state.sound);haptic();celebrate(milestone);
    if(milestone){pendingAchievement=worldIndexForLevel(s.index);setTimeout(openAchievement,450);}
  }else{drawBoard();message(result.message,'error');play('error',state.sound);}
}
function startGame(){
  if(!practice&&!state.tutorialDone){practice=beginTutorial(state);onboarding=true;}
  $('#start').hidden=true;$('#worldMap').hidden=true;$('#worldMap').inert=true;$('#game').hidden=false;$('#game').inert=false;
  // The map changes state.index without keeping a game screen mounted. Always
  // rebuild here so the selected node cannot reuse the previous board's DOM.
  redraw();$('#toolClaret').focus();if(state.daily.last<dateKey())openDaily();
}
function home(){persist();practice=null;onboarding=false;$('#start').hidden=false;$('#worldMap').hidden=true;$('#worldMap').inert=true;$('#game').hidden=true;$('#game').inert=true;redraw();$('#play').focus();}
function leavePractice(){practice=null;onboarding=false;redraw();openMap();}
function renderDaily(){
  $('#dailyCount').textContent=state.daily.current;$('#dailyBest').textContent=`Mejor racha: ${state.daily.best}`;
  const now=new Date(),today=dateKey(now),monday=new Date(now);monday.setDate(now.getDate()-(now.getDay()+6)%7);
  const dates=activeDates(state.daily);$('#week').replaceChildren();
  ['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'].forEach((name,i)=>{const d=new Date(monday);d.setDate(monday.getDate()+i);const key=dateKey(d),el=document.createElement('span'),b=document.createElement('b');el.textContent=name;b.className=(dates.has(key)?'on ':'')+(key===today?'today':'');b.textContent=dates.has(key)?'✓':'·';el.setAttribute('aria-label',`${key}: ${dates.has(key)?'racha activada':'sin activación'}`);el.append(b);$('#week').append(el);});
  const activated=state.daily.last>=today;$('#dailyContinue').disabled=!activated;$('#heart').disabled=activated;$('#heart').classList.toggle('lit',activated);
}
function openDaily(){renderDaily();$('#daily').showModal();}
function drawMap(){
  const W=worlds[mapWorld],unlocked=unlockedWorldIndex(state),start=mapWorld*10;
  $('#worldScene').style.setProperty('--world-tone',W.tone);$('#worldArt').src=`./assets/worlds/${W.art}`;$('#worldArt').alt=`Escenario de ${W.place}`;
  $('#worldNumber').textContent=`MUNDO ${mapWorld+1} DE 10`;$('#worldTitle').textContent=W.place;$('#worldRange').textContent=W.range;$('#worldRankLabel').textContent=state.completed>=(mapWorld+1)*10?'Rango':'Meta';$('#worldRank').textContent=W.rank;$('#worldDescription').textContent=W.description;
  $('#routeLine').setAttribute('points',routePoints.map(p=>p.join(',')).join(' '));
  const nodes=$('#levelNodes');nodes.replaceChildren();
  routePoints.forEach(([x,y],i)=>{
    const number=start+i+1,done=number<=state.completed,current=number===state.index+1&&state.completed<100,available=mapWorld<=unlocked&&(done||current);
    const mission=missionFor(number-1,levels[number-1]),b=document.createElement('button');b.type='button';b.className='levelnode';b.style.left=x+'%';b.style.top=y+'%';b.textContent=done?'✓':number;b.dataset.level=number;
    b.classList.toggle('done',done);b.classList.toggle('current',current);b.classList.toggle('locked',!available);b.disabled=!current;
    if(mission){b.classList.add('mission-node');b.dataset.mission=mission.symbol;}
    const missionName=mission?`, misión ${mission.short}`:'';
    b.setAttribute('aria-label',done?`Reto ${number}${missionName}, superado`:current?`Reto ${number}${missionName}, continuar`:`Reto ${number}${missionName}, bloqueado`);
    if(current)b.onclick=startGame;nodes.append(b);
  });
  $('#previousWorld').disabled=mapWorld===0;$('#nextWorld').disabled=mapWorld>=unlocked||mapWorld===9;
  $('#worldDots').textContent=worlds.map((_,i)=>i===mapWorld?'●':i<=unlocked?'•':'·').join(' ');
}
function openMap(index=worldIndexForLevel(state.completed>=100?99:state.index)){
  // A solved round can survive a refresh. Resume the journey without leaving
  // the player on a map where every visible node is disabled.
  const journey=journeyStatus(state);
  if(journey.kind==='advance'){nextLevel(state);index=worldIndexForLevel(state.index);}
  persist();practice=null;onboarding=false;mapWorld=Math.min(unlockedWorldIndex(state),Math.max(0,index));
  $('#start').hidden=true;$('#game').hidden=true;$('#game').inert=true;$('#worldMap').hidden=false;$('#worldMap').inert=false;drawMap();$('#levelNodes .current,#badges').focus({preventScroll:true});
  if(journey.kind==='achievement'){pendingAchievement=journey.world;setTimeout(openAchievement,120);}
}
function renderCollection(){
  const grid=$('#badgeGrid');grid.replaceChildren();
  worlds.forEach((W,i)=>{const unlocked=state.completed>=(i+1)*10,card=document.createElement('article');card.className='badgecard';card.classList.toggle('locked',!unlocked);card.innerHTML=`<span class="badge-medal" aria-hidden="true">${W.symbol}</span><strong>${unlocked?W.rank:'Por descubrir'}</strong><small>${W.place} · ${W.range}</small>`;grid.append(card);});
}
function renderJourney(){
  const active=worldIndexForLevel(state.completed>=100?99:state.index),list=$('#journeyList');list.replaceChildren();
  worlds.forEach((W,i)=>{
    const done=state.completed>=(i+1)*10,current=i===active&&!done,locked=i>active,button=document.createElement('button');
    button.type='button';button.className='journeycard';button.classList.toggle('done',done);button.classList.toggle('current',current);button.classList.toggle('locked',locked);button.disabled=locked;
    const known=!locked,status=done?`Rango ${W.rank} conseguido`:current?'Tu destino actual':'Permanece oculto hasta completar el mundo anterior';
    button.innerHTML=`<img src="./assets/worlds/${W.art}" alt="" width="120" height="80"><span><small>DESTINO ${i+1} · ${W.range}</small><strong>${known?W.place:'Por descubrir'}</strong><em>${status}</em></span>`;
    button.setAttribute('aria-label',locked?`Destino ${i+1}, ${W.range}, por descubrir`:done?`${W.place}, ${W.range}, superado`:`${W.place}, ${W.range}, destino actual`);
    if(!locked)button.onclick=()=>{$('#journeyOverview').close();mapWorld=i;drawMap();$('#levelNodes .current,#badges').focus({preventScroll:true});};
    list.append(button);
  });
}
function openAchievement(){
  if(pendingAchievement===null||$('#achievement').open)return;const W=worlds[pendingAchievement];
  $('#achievementBadge').textContent=W.symbol;$('#achievement').style.setProperty('--world-tone',W.tone);$('#achievementTitle').textContent=W.rank;
  $('#achievementCopy').textContent=pendingAchievement===9?'Has superado los 100 retos y alcanzado el rango máximo: Mente Claret.':'Has superado 10 nuevos retos. Tu insignia se ha añadido a la colección.';
  $('#achievementContinue').textContent=pendingAchievement===9?'Ver mi recorrido completo':'Descubrir el siguiente mundo';$('#achievement').showModal();$('#achievementContinue').focus();
}
$('#play').onclick=()=>openRuleCards(openMap);$('#home').onclick=e=>{e.preventDefault();home();};$('#mapHome').onclick=home;
$('#badges').onclick=()=>{renderCollection();$('#collection').showModal();};$('[data-close="collection"]').onclick=()=>$('#collection').close();
$('#journeyButton').onclick=()=>{renderJourney();$('#journeyOverview').showModal();$('#journeyList .current,#journeyList .done').focus({preventScroll:true});};$('[data-close="journey"]').onclick=()=>$('#journeyOverview').close();
$('#journeyCurrent').onclick=()=>{$('#journeyOverview').close();mapWorld=worldIndexForLevel(state.completed>=100?99:state.index);drawMap();$('#levelNodes .current,#badges').focus({preventScroll:true});};
$('#previousWorld').onclick=()=>{if(mapWorld>0){mapWorld--;drawMap();}};$('#nextWorld').onclick=()=>{if(mapWorld<unlockedWorldIndex(state)){mapWorld++;drawMap();}};
$('#achievementContinue').onclick=()=>{const finished=pendingAchievement===9;$('#achievement').close();pendingAchievement=null;if(!finished)nextLevel(state);persist();openMap(finished?9:worldIndexForLevel(state.index));};
$('#achievement').addEventListener('cancel',e=>e.preventDefault());
$('#how').onclick=()=>$('#rules').showModal();$('#help').onclick=()=>$('#rules').showModal();
$('[data-close="rules"]').onclick=()=>$('#rules').close();
$('#tutorial').onclick=()=>{onboarding=!state.tutorialDone;practice=beginTutorial(state,!onboarding);redraw();startGame();};$('#leavePractice').onclick=leavePractice;
$('#toolClaret').onclick=()=>setTool('c');$('#toolX').onclick=()=>setTool('x');$('#hint').onclick=showHint;$('#check').onclick=check;
$('#reset').onclick=()=>{const s=current();if(!resetRound(s))return;persist();redraw();message(s.round.lives===3?'Has gastado las 3 vidas. Sigues en este reto con 3 vidas.':'Tablero reiniciado. Has gastado una vida.');play('error',state.sound);};
$('#sound').onclick=()=>{state.sound=!state.sound;persist();stats();play('place',state.sound);};
$('#heart').onclick=()=>{const result=activateDay(state);persist();renderDaily();stats();if(result.changed){$('#heart').classList.add('lit');$('#dailyMessage').textContent=result.reward?'Has recuperado una ayuda. ¡Racha encendida!':'Racha encendida. Vuelve mañana para continuar.';play('win',state.sound);haptic();$('#dailyContinue').focus();}};
$('#dailyContinue').onclick=()=>{$('#daily').close();$('#toolClaret').focus();};
$('#daily').addEventListener('cancel',e=>{if(state.daily.last<dateKey())e.preventDefault();});
window.addEventListener('storage',event=>{if(event.key!==KEY||!event.newValue)return;try{state=normalize(JSON.parse(event.newValue));cleanRound(state);if(!practice){redraw();message('Partida actualizada desde otra pestaña.');}}catch{}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&!$('#start').hidden&&!practice)stats();});
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{ /* Online play remains available. */ });
redraw();$('#play').focus();

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
 const size=fittedBoardSize({viewport,contentHeight,boardSize:square.height,maxWidth,air:20});
 if(Math.abs(square.width-size)>1)board.style.width=size+'px';
 });}
new ResizeObserver(scheduleFit).observe($('#game'));
window.addEventListener('resize',scheduleFit);
window.visualViewport?.addEventListener('resize',scheduleFit);
