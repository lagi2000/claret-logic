export const worlds = [
  {place:'Sallent',range:'Retos 1–10',rank:'Explorador',art:'01-sallent.webp',tone:'#cb6a35',description:'El origen: la Casa Natal, el telar familiar y el paisaje del Bages.',symbol:'✦'},
  {place:'Vic',range:'Retos 11–20',rank:'Aprendiz',art:'02-vic.webp',tone:'#9a3158',description:'La formación y la fundación: el Temple-Sepulcre y la Catedral de Vic.',symbol:'◇'},
  {place:'Cuba',range:'Retos 21–30',rank:'Observador',art:'03-cuba.webp',tone:'#0788a4',description:'La misión: Santiago de Cuba, el Parque Céspedes y El Cobre.',symbol:'◉'},
  {place:'Madrid · Palacio Real',range:'Retos 31–40',rank:'Estratega',art:'04-madrid.webp',tone:'#324b92',description:'Decidir con criterio en el corazón del Madrid histórico.',symbol:'♟'},
  {place:'Las Palmas de Gran Canaria',range:'Retos 41–50',rank:'Experto',art:'05-las-palmas.webp',tone:'#087f9d',description:'Vegueta, Santa Ana y la memoria misionera del Padrito.',symbol:'★'},
  {place:'Don Benito',range:'Retos 51–60',rank:'Maestro',art:'06-don-benito.webp',tone:'#68832f',description:'La Plaza de España y las tierras abiertas de Vegas Altas.',symbol:'◆'},
  {place:'Sevilla',range:'Retos 61–70',rank:'Mente brillante',art:'07-sevilla.webp',tone:'#d16022',description:'Heliópolis, sus naranjos y la Giralda como horizonte.',symbol:'✧'},
  {place:'Carvalhos',range:'Retos 71–80',rank:'Genio lógico',art:'08-carvalhos.webp',tone:'#397c63',description:'Aprender y crecer entre el verde del norte de Portugal.',symbol:'∞'},
  {place:'Zimbabue',range:'Retos 81–90',rank:'Gran estratega',art:'09-zimbabue.webp',tone:'#a9542c',description:'Comunidad, educación y misión entre piedra y tierra roja.',symbol:'♛'},
  {place:'Fátima',range:'Retos 91–100',rank:'Mente Claret',art:'10-fatima.webp',tone:'#bb8a17',description:'El destino final: luz, esperanza y Corazón de María.',symbol:'♥'}
];

export const routePoints = [[20,87],[52,79],[76,71],[48,63],[22,55],[38,47],[70,39],[58,31],[28,24],[52,18]];

export function worldIndexForLevel(levelIndex){return Math.min(9,Math.max(0,Math.floor(levelIndex/10)));}
export function unlockedWorldIndex(state){return worldIndexForLevel(state.completed>=100?99:state.index);}
