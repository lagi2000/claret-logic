/** Independent exhaustive solver. Intentionally does not import the game engine. */
export function solve(L, limit=2) {
  const n=L.size, solutions=[], selected=[], usedCols=new Set(), usedRegions=new Set();let nodes=0;
  const rowcol=L.activeRules.includes('rowcol'), touch=L.activeRules.includes('touch');
  function search(depth) {
    nodes++;
    if(depth===n){solutions.push([...selected].sort((a,b)=>a-b));return solutions.length>=limit;}
    for(let k=0;k<n*n;k++) {
      const r=Math.floor(k/n),c=k%n,g=L.regions[r][c];
      if(rowcol ? r!==depth||usedCols.has(c)||usedRegions.has(g) : g!==depth)continue;
      if(touch&&selected.some(q=>Math.abs(Math.floor(q/n)-r)<=1&&Math.abs(q%n-c)<=1))continue;
      selected.push(k);usedCols.add(c);usedRegions.add(g);
      if(search(depth+1))return true;
      selected.pop();usedCols.delete(c);usedRegions.delete(g);
    }
    return false;
  }
  search(0); return {count:solutions.length,solutions,nodes,capped:solutions.length>=limit};
}
