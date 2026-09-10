/** Pure game rules. No solutions or browser APIs are used by this module. */
export const active = (level, rule) => level.activeRules.includes(rule);
export const row = (k, n) => Math.floor(k / n);
export function conflictRules(L, a, b) {
  if (a === b) return [];
  const n = L.size, ar = row(a,n), br = row(b,n), ac = a%n, bc = b%n;
  const rules=[];
  if(active(L,'region') && L.regions[ar][ac]===L.regions[br][bc]) rules.push('región');
  if(active(L,'rowcol') && ar===br) rules.push('fila');
  if(active(L,'rowcol') && ac===bc) rules.push('columna');
  if(active(L,'touch') && Math.abs(ar-br)<=1 && Math.abs(ac-bc)<=1) rules.push('contacto');
  return rules;
}
export function autoMarks(L, marks) {
  const result = new Set();
  for(const [key, value] of Object.entries(marks)) if(value==='c') {
    for(let k=0;k<L.size**2;k++) if(conflictRules(L, +key,k).length) result.add(k);
  }
  return result;
}
export function diagnose(L, marks) {
  const positions=Object.keys(marks).filter(k=>marks[k]==='c').map(Number);
  for(let i=0;i<positions.length;i++) for(let j=i+1;j<positions.length;j++) {
    const rules=conflictRules(L,positions[i],positions[j]);
    if(rules.length) return {ok:false, conflict:true, cells:[positions[i],positions[j]], rule:rules[0], message:rules[0]==='contacto'?'Dos Claret se tocan, también cuenta la diagonal.':`Hay dos Claret en la misma ${rules[0]}.`};
  }
  if(positions.length!==L.size) return {ok:false, cells:[], message:`Coloca ${L.size-positions.length} Claret más, uno en cada región.`};
  return {ok:true,cells:[],message:'¡Correcto!'};
}
export function groups(L) {
  const n=L.size, all=Array.from({length:n*n},(_,k)=>k), result=[];
  for(let g=0;g<n;g++) result.push({kind:'región',index:g,cells:all.filter(k=>L.regions[row(k,n)][k%n]===g)});
  if(active(L,'rowcol')) {
    for(let r=0;r<n;r++) result.push({kind:'fila',index:r,cells:all.filter(k=>row(k,n)===r)});
    for(let c=0;c<n;c++) result.push({kind:'columna',index:c,cells:all.filter(k=>k%n===c)});
  }
  return result;
}
export function connectedRegions(L) {
  const n=L.size;
  if(!Number.isInteger(n)||n<1||L.regions.length!==n||L.regions.some(r=>r.length!==n))return false;
  if(L.regions.flat().some(v=>!Number.isInteger(v)||v<0||v>=n)) return false;
  for(let g=0;g<n;g++) {
    const cells=groups(L).find(x=>x.kind==='región'&&x.index===g).cells;
    if(!cells.length)return false;
    const seen=new Set([cells[0]]), stack=[cells[0]];
    while(stack.length) {const k=stack.pop();for(const q of [k-n,k+n,...(k%n?[k-1]:[]),...(k%n<n-1?[k+1]:[])]) {
      if(q>=0&&q<n*n&&L.regions[row(q,n)][q%n]===g&&!seen.has(q)){seen.add(q);stack.push(q);}
    }}
    if(seen.size!==cells.length)return false;
  }
  return true;
}
