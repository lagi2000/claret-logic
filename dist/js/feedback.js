let context;
export function play(kind,enabled=true) {
  if(!enabled)return;
  try {
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
    context??=new Audio();if(context.state==='suspended')void context.resume();
    const notes=kind==='win'?[523,659,784]:kind==='error'?[220,196]:kind==='x'?[300]:[440];
    notes.forEach((frequency,i)=>{
      const t=context.currentTime+i*.085,o=context.createOscillator(),gain=context.createGain();
      o.type='sine';o.frequency.value=frequency;gain.gain.setValueAtTime(.035,t);gain.gain.exponentialRampToValueAtTime(.0001,t+.12);
      o.connect(gain);gain.connect(context.destination);o.start(t);o.stop(t+.13);o.onended=()=>{o.disconnect();gain.disconnect();};
    });
  }catch{/* Audio support is optional. */}
}
export function haptic(){try{navigator.vibrate?.(18);}catch{}}
export function celebrate(milestone) {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const box=document.createElement('div');box.className='confetti'+(milestone?'':' mini');box.setAttribute('aria-hidden','true');
  const count=milestone?24:10;
  for(let i=0;i<count;i++){const bit=document.createElement('i');bit.style.cssText=`left:${Math.random()*100}%;background:${['#e5006d','#ffc928','#36bd95','#4089ff'][i%4]};animation-delay:${Math.random()*.2}s`;box.append(bit);}
  document.body.append(box);setTimeout(()=>box.remove(),milestone?1500:900);
}
