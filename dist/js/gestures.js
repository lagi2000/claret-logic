// One pointer owns a stroke. State lives on the board, never on replaced cells.
export function gestureSession({read,write,place,now=()=>performance.now()}){
  let stroke=null,lastTap=null;
  return {
    down(id,cell){if(stroke||cell==null)return false;stroke={id,start:cell,visited:new Set(),drag:false,value:read(cell)==='x'?null:'x'};return true;},
    move(id,cells){if(!stroke||stroke.id!==id)return;const next=cells.filter(k=>k!=null);if(next.some(k=>k!==stroke.start))stroke.drag=true;if(!stroke.drag)return;lastTap=null;for(const k of [stroke.start,...next])if(!stroke.visited.has(k)){stroke.visited.add(k);if(read(k)!=='c')write(k,stroke.value);}},
    up(id,cell){if(!stroke||stroke.id!==id)return;const s=stroke;stroke=null;if(s.drag||cell!==s.start)return;const time=now();if(lastTap?.cell===cell&&time-lastTap.time<360){lastTap=null;place(cell);}else{lastTap={cell,time};if(read(cell)!=='c')write(cell,read(cell)==='x'?null:'x');}},
    cancel(){stroke=null;lastTap=null;}
  };
}

export function bindBoardGestures(board,options){
  const session=gestureSession(options);let pointer=null,previous=null;
  const cellAt=(x,y)=>{const r=board.getBoundingClientRect(),n=options.size();if(x<r.left||x>=r.right||y<r.top||y>=r.bottom)return null;return Math.floor((y-r.top)/r.height*n)*n+Math.floor((x-r.left)/r.width*n);};
  board.addEventListener('pointerdown',e=>{if(e.button!==0||!options.enabled())return;const k=cellAt(e.clientX,e.clientY);if(!session.down(e.pointerId,k))return;pointer=e.pointerId;previous={x:e.clientX,y:e.clientY};board.setPointerCapture(e.pointerId);e.preventDefault();});
  board.addEventListener('pointermove',e=>{if(pointer!==e.pointerId||!previous)return;const r=board.getBoundingClientRect(),step=Math.max(1,Math.min(r.width,r.height)/options.size()/3),count=Math.ceil(Math.hypot(e.clientX-previous.x,e.clientY-previous.y)/step),cells=[];for(let i=1;i<=count;i++)cells.push(cellAt(previous.x+(e.clientX-previous.x)*i/count,previous.y+(e.clientY-previous.y)*i/count));session.move(pointer,cells);previous={x:e.clientX,y:e.clientY};});
  board.addEventListener('pointerup',e=>{if(pointer!==e.pointerId)return;session.up(pointer,cellAt(e.clientX,e.clientY));pointer=null;previous=null;});
  const cancel=()=>{pointer=null;previous=null;session.cancel();};
  board.addEventListener('pointercancel',cancel);board.addEventListener('lostpointercapture',()=>{if(pointer!==null)cancel();});window.addEventListener('blur',cancel);document.addEventListener('visibilitychange',cancel);
  return cancel;
}
