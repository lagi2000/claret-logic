export const tutorials = [
  {
    n: 1,
    size: 4,
    regions: [[0,0,0,0],[1,1,0,0],[3,2,2,2],[3,3,3,2]],
    solution: [2,0,3,1],
    rank: 'Explorador',
    difficulty: 'Tutorial',
    tip: 'Uno por color, fila y columna. No pueden tocarse, ni en diagonal.',
    activeRules: ['region','rowcol','touch']
  },
  {
    n: 2,
    size: 4,
    regions: [[0,0,0,0],[0,0,1,1],[2,2,2,3],[2,3,3,3]],
    solution: [1,3,0,2],
    rank: 'Explorador',
    difficulty: 'Tutorial',
    tip: 'Aplica las tres normas. Las cruces te ayudan a revisar tu elección.',
    activeRules: ['region','rowcol','touch']
  }
];
