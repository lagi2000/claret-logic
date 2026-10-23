export function journeyStatus(state){
  const completedLevel=state.index+1;
  const solvedCurrent=state.round?.solved===true&&state.completed===completedLevel;
  if(!solvedCurrent)return {kind:'current',world:Math.min(9,Math.floor(state.index/10))};
  if(completedLevel%10===0){
    const world=Math.min(9,Math.floor(state.index/10));
    if(!state.celebratedWorlds?.includes(world))return {kind:'achievement',world,final:completedLevel===100};
    if(completedLevel===100)return {kind:'complete',world,final:true};
  }
  return {kind:'advance',nextIndex:state.index+1,world:Math.min(9,Math.floor((state.index+1)/10))};
}

export function solvedActionLabel({practice=false,index=0,onboarding=false,milestone=false}={}){
  if(practice){
    if(index<2)return 'Siguiente práctica';
    return onboarding?'Empezar los retos':'Volver a mi partida';
  }
  return milestone?'Ver logro':(index+1)%10===0?'Ver recorrido':'Siguiente reto';
}
