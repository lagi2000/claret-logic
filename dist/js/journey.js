export function journeyStatus(state){
  const completedLevel=state.index+1;
  const solvedCurrent=state.round?.solved===true&&state.completed===completedLevel;
  if(!solvedCurrent)return {kind:'current',world:Math.min(9,Math.floor(state.index/10))};
  if(completedLevel%10===0)return {kind:'achievement',world:Math.min(9,Math.floor(state.index/10)),final:completedLevel===100};
  return {kind:'advance',nextIndex:state.index+1,world:Math.min(9,Math.floor((state.index+1)/10))};
}
