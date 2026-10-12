export function swipeDirection(dx,dy){return Math.abs(dx)>=55&&Math.abs(dx)>Math.abs(dy)*1.4?(dx<0?1:-1):0;}
export function bindMapSwipe(scene,change){
 let start=null,suppressUntil=0;
 scene.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;start={id:e.pointerId,x:e.clientX,y:e.clientY};});
 scene.addEventListener('pointerup',e=>{if(!start||start.id!==e.pointerId)return;const dir=swipeDirection(e.clientX-start.x,e.clientY-start.y);start=null;if(dir){suppressUntil=performance.now()+350;change(dir);}});
 scene.addEventListener('click',e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 scene.addEventListener('pointercancel',()=>start=null);window.addEventListener('blur',()=>start=null);
}
