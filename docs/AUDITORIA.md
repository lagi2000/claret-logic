# Auditoría histórica del MVP; resuelta en RC2

La multiplicidad de los tutoriales se resolvió con aprobación de Luis: dos prácticas independientes y 100 retos únicos. El resto de este informe describe el diagnóstico inicial; véase DECISION_PRODUCTO.md y QA_RELEASE.md para el estado vigente.

# Auditoría del MVP y profesionalización

Fuente: paquete CLARET_LOGIC_HANDOFF_WORK.zip, V2.8. Se leyeron íntegros HANDOFF_WORK.md y PROMPT_INICIAL_WORK.md antes de modificar el proyecto.

| Hallazgo | Impacto | Resolución |
|---|---|---|
| Tutoriales con 27 y 4 soluciones | Incompatible con unicidad universal | Conservados; bloqueo de publicación y propuesta de decisión |
| Las X aplicaban fila, columna y contacto en tutoriales donde no estaban activos | Enseñanza contradictoria | Motor común de reglas activas |
| Tutorial reiniciaba progreso sin confirmación | Pérdida de progreso | Práctica separada, sin borrar campaña |
| Marcas, vidas y estado superado no persistían | Reinicios gratuitos y repetición de recompensas | Guardado íntegro y finalización idempotente |
| Tercer reinicio borraba la marca de ayuda usada | Rachas incorrectas | Se conserva el uso de ayuda durante todo el nivel |
| Ayudas escogían coordenadas de la respuesta | Ausencia de explicación y riesgo de revelación gratuita | Traza de deducción, tres fases, un solo paso |
| Calendario marcaba todos los días anteriores de la semana | Historial ficticio | Días derivados de la racha realmente activada |
| Rango anticipado y cierre del nivel 100 incompleto | Hitos desalineados | Rango ganado cada diez completados; final persistente |
| Un AudioContext por nota | Recursos de audio innecesarios | Contexto único y desconexión de nodos |
| Celdas div sin teclado ni nombres accesibles | Barreras de acceso | Botones, flechas, nombres, foco y regiones numeradas |
| Color como única referencia | Regiones difíciles de identificar | Números y bordes además del color |
| Ventanas con aria-hidden fijo y sin cierre accesible | Navegación confusa | Dialog nativo y botón de cierre |
| Portada con botón dibujado y botón separado | Interacción poco clara | Botón real superpuesto en la posición de Jugar, sin alterar imagen |
| Monolito con datos e imágenes incrustadas | Mantenimiento y tamaño | Módulos separados y recursos locales |
| Manifest insuficiente, sin service worker | Sin offline | Manifest, iconos, precarga y caché versionada por subcarpeta |
| Tableros derivados de geometrías similares | Repetición y dificultad poco medida | Generación, deduplicación geométrica y rating por deducciones |

## Resultado del análisis matemático original

Los 100 mapas tienen regiones conectadas y sus respuestas de referencia satisfacen sus reglas activas. Los niveles 3–100 tienen solución única y admiten una resolución por el solver pedagógico. No se han atribuido al MVP fallos de unicidad en los niveles completos.

El registro original está en audit-original.json. La selección profesionalizada y su traza están en certification.json. Se mantienen los tamaños del MVP: 2 niveles 3×3; 2 de 4×4; 14 de 5×5; 30 de 6×6; 52 de 7×7.
