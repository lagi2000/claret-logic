export function fittedBoardSize({viewport,contentHeight,boardSize,maxWidth,air=20,min=168}){
  const fixedHeight=Math.max(0,contentHeight-boardSize);
  const available=Math.floor(viewport-fixedHeight-air);
  const lower=Math.min(min,maxWidth);
  return Math.floor(Math.min(maxWidth,Math.max(lower,available)));
}
