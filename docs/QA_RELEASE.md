# QA · Claret Logic RC2

## Estado

Decisión de producto aprobada y aplicada. Certificación lógica: **100/100**, sin bloqueos. Release candidate entregada para alojamiento estático. No desplegada en la web del colegio.

## Pruebas automáticas

**131 pruebas superadas, cero fallos.** Registro completo en test-results.txt. Cobertura:

- Unicidad independiente, conectividad y coherencia de referencia de los 100 retos.
- Todas las deducciones de las trazas, sin recurrir a la clave de respuesta.
- Las dos prácticas fuera de la campaña, sin contar para rangos ni recompensas.
- Recuperación de práctica, repetición aislada y migración RC1 → RC2.
- Marcas libres y X según reglas activas; detección de conflictos al solicitarlo.
- Vidas tras tres reinicios y mantenimiento del uso de ayuda.
- Ayudas agotadas, recarga, finalización idempotente y recompensas de quince niveles.
- Racha diaria, límites, cambios de mes/año y mejor marca.
- Guardado bloqueado/corrupto y valores inválidos.
- Manifest y service worker: precarga, respuestas cacheadas sin red, aislamiento por subcarpeta y exclusión de peticiones ajenas, probados en entorno simulado.

## Navegador real, Chrome

| Comprobación | Resultado |
|---|---|
| Portada, Jugar, corazón diario y Continuar | Correcto |
| Completar práctica 1 y pasar a práctica 2 | Correcto |
| Recargar durante práctica 2 | Recupera la práctica 2 |
| Completar ambas y comenzar reto 1 | 0 retos premiados, racha 0, tres ayudas |
| Tres ayudas consecutivas en reto 1 | Un único Claret colocado; ayuda desactivada al agotarse |
| Tres reinicios de tablero | Mismo reto con tres vidas |
| Flecha derecha dentro del tablero | El foco pasa a la siguiente casilla |
| Abrir reglas y pulsar Escape | Diálogo cerrado |
| Preparar y resolver reto 100 mediante la interfaz | Mensaje final, rango Mente Claret; botón final desactivado |
| Anchuras de marco 320, 390, 768 y 1280 px, tablero 7×7 | Sin desbordamiento horizontal |
| Texto al 200 % en marco de 390 px | Ampliación real comprobada (título 56 px); reflujo sin desbordamiento horizontal |

Las anchuras útiles registradas, descontando la barra vertical del navegador de escritorio, fueron 305, 375, 753 y 1265 px. Son pruebas responsive con marcos de navegador, no pruebas en dispositivos físicos. Se inspeccionaron visualmente el tablero estrecho, el tablero de escritorio y el texto ampliado. Se corrigió el reflujo y se sustituyeron tamaños de letra fijos por relativos.

## Límites de esta certificación

- Instalación y recarga offline **reales bajo HTTPS**: pendientes de comprobación en el alojamiento; la vista interna usa HTTP. No se equiparan los tests simulados con una prueba real de desconexión.
- Safari/iPhone, Android, tablet y Chromebook físicos: no probados en este entorno.
- Lector de pantalla y calibración de dificultad con alumnado: no certificados.

Estas comprobaciones de destino deben hacerse al alojar la candidata, antes de una difusión general. Véase DESPLIEGUE.md. La ausencia de errores en los recorridos probados no garantiza ausencia de todos los errores en cualquier dispositivo.

## Repetir la revisión

Ejecutar `npm run dev` y abrir `/__qa` en el servidor local. El banco permite escoger anchura, preparar niveles, iniciar prácticas, recargar y ampliar el texto. Sus controles solo existen en desarrollo; tests/ no se publica. No usar ese banco sobre datos reales.

## Actualización visual del 10 de septiembre

Corazón de María verificado visualmente y pulsado: racha 0 → 1, marca del día y Continuar habilitado. Tablero 7×7 comprobado en marcos de 320, 390, 768 y 1280 px sin desbordamiento horizontal. Inspección visual de móvil y escritorio. Se conserva el arte aportado sin alterarlo y se encuadra desde CSS.

## Ajuste de descartes

Verificado en navegador: al colocar a Claret en una práctica aparecen dos cruces automáticas; al repetir la misma acción en el reto 1 aparecen cero. La imagen de Claret cubre la casilla completa mediante recorte visual, sin modificar el archivo original.
