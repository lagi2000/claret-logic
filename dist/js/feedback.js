let context;
const patterns={
  place:{notes:[440],wave:'sine',gain:.035,step:.08},
  x:{notes:[300],wave:'triangle',gain:.025,step:.08},
  logical:{notes:[523,659],wave:'triangle',gain:.04,step:.07},
  error:{notes:[220,196],wave:'sine',gain:.035,step:.09},
  win:{notes:[523,659,784],wave:'sine',gain:.04,step:.085},
  badge:{notes:[392,523,659,784,1047],wave:'triangle',gain:.045,step:.09}
};
export function play(kind,enabled=true) {
  if(!enabled)return;
  try {
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
    context??=new Audio();if(context.state==='suspended')void context.resume();
    const sound=patterns[kind]??patterns.place;
    sound.notes.forEach((frequency,i)=>{
      const t=context.currentTime+i*sound.step,o=context.createOscillator(),gain=context.createGain();
      o.type=sound.wave;o.frequency.value=frequency;gain.gain.setValueAtTime(sound.gain,t);gain.gain.exponentialRampToValueAtTime(.0001,t+.14);
      o.connect(gain);gain.connect(context.destination);o.start(t);o.stop(t+.15);o.onended=()=>{o.disconnect();gain.disconnect();};
    });
  }catch{/* Audio support is optional. */}
}
export function haptic(kind='tap'){try{navigator.vibrate?.(kind==='win'?[22,35,35]:18);}catch{}}
export function celebrate(milestone) {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const box=document.createElement('div');box.className='confetti'+(milestone?'':' mini');box.setAttribute('aria-hidden','true');
  const count=milestone?34:14;
  for(let i=0;i<count;i++){const bit=document.createElement('i');bit.style.cssText=`left:${Math.random()*100}%;background:${['#e5006d','#ffc928','#36bd95','#4089ff','#a875ff'][i%5]};animation-delay:${Math.random()*.25}s`;box.append(bit);}
  document.body.append(box);setTimeout(()=>box.remove(),milestone?1800:950);
}
