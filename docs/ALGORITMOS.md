# Generación, validación y dificultad

## Proceso reproducible

Semilla: 20260909. Generador congruencial de 32 bits, sin librerías externas.

1. Partir de geometrías del MVP de cada tamaño.
2. Mutar casillas fronterizas copiando la región de una vecina ortogonal. No se cambian las reglas ni el tamaño.
3. Rechazar regiones vacías, identificadores incoherentes y regiones desconectadas mediante recorrido de vecinos ortogonales.
4. Enumerar respuestas con un solver independiente. Detener al encontrar la segunda durante la selección; conservar únicamente una.
5. Resolver con deducciones hacia delante. Rechazar si el solver pedagógico se atasca.
6. Eliminar duplicados equivalentes por giros, reflejos o cambios de nombre de región.
7. Seleccionar una progresión según dificultad, evitando repetir la solución del tablero anterior.

La certificación vuelve a contar soluciones y verifica las posiciones de referencia. La clave de respuesta no interviene al colocar una hipótesis ni en el solver pedagógico.

## Solver pedagógico

Dos reglas de inferencia, ambas sin adivinación:

- **Posición única:** una región, fila o columna pendiente conserva una sola candidata; colocarla y aplicar sus exclusiones directas.
- **Exclusión común:** todas las candidatas de una región, fila o columna entran en conflicto con una casilla exterior; esa casilla no puede contener a Claret.

Las exclusiones comunes abarcan interacciones entre regiones y líneas, y proximidad a todas las candidatas. Se guardan premisas, candidatas, objetivo y casillas descartadas en una traza. Ningún paso realiza búsqueda por hipótesis. Que el solver se atasque no prueba que un humano no pueda resolverlo: el generador rechaza esos tableros porque no puede certificar su deducibilidad con este repertorio.

Las ayudas recorren la traza hasta el primer paso pendiente. Primero muestran la unidad, después sus candidatas y finalmente aplican **una sola colocación o un solo descarte** con explicación. Las hipótesis del jugador no se usan como si fueran verdades certificadas. Si ya hay un conflicto de reglas, la ayuda señala ese conflicto.

## Rating humano aproximado

`rating = pasos + 8 × exclusiones comunes + 2 × suma de candidatas de esas exclusiones`

Mide longitud de la resolución, deducciones entre unidades y amplitud de comparación. No utiliza el tamaño ni los nodos de búsqueda como puntuación de dificultad. Es una estimación lógica, no una medida empírica del tiempo o de la dificultad para alumnado de 4.º.

Bandas de selección: 4×4, 0–45; 5×5, 0–45; 6×6, 18–65; 7×7, 32–100. El orden crece aproximadamente dentro de cada tamaño. El comienzo de un nuevo tamaño introduce un descanso relativo para adaptarse a la superficie. Evitar una respuesta consecutiva idéntica puede introducir pequeñas oscilaciones locales. No se promete una curva estrictamente ascendente en cada nivel.

La tabla completa está en difficulty.csv. Los intervalos finales son 4–43, 5–44, 19–64 y 33–91 para 4×4 a 7×7. Conviene calibrarlos después con observación de jugadores; no se añade telemetría ni se recopilan datos en esta versión.

## Garantía y frontera

100/100 retos de campaña tienen unicidad, conectividad, respuesta coherente y traza deductiva. Las dos prácticas están fuera de la campaña por decisión expresa de Luis. El comando estricto termina correctamente y registra logicCertified=true. Ese campo certifica la lógica, no los navegadores de destino.


RC2 conserva los 98 puzzles seleccionados para RC1, renumera desde 1 y añade dos puzzles 7×7 certificados al final. Total de campaña: dos 4×4, catorce 5×5, treinta 6×6 y cincuenta y cuatro 7×7.
