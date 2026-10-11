# Controles directos y campaña ampliada · 3.8.0

Referencias revisadas: los dos vídeos aportados (95 y 112 segundos), incluyendo los niveles iniciales y el nivel 48; ficha oficial de Oakever Games en Google Play, https://play.google.com/store/apps/details?id=com.oakever.meowdoku (10 de octubre de 2026).

## Observación y adaptación

- Marcado continuo de descartes y doble toque para la figura: incorporados con un solo puntero activo, protección ante interrupciones y descarte de clics duplicados del navegador.
- Arrastrar desde una X borra descartes. Nunca borra figuras; doble toque retira las figuras que no sean guías fijas.
- Resolución automática por cumplimiento de las tres reglas, independientemente del orden de las jugadas. No se exige usar una primera deducción predeterminada.
- Feedback inmediato ante conflictos entre figuras. Los descartes siguen siendo notas del jugador, sin penalizaciones por hipótesis. Las vidas mantienen su funcionamiento aprobado.
- Cabecera compacta, recordatorio de las tres reglas y cruces más grandes. La identidad, las ilustraciones y los diez destinos pertenecen a Claret Logic.
- Dificultad: nuevas regiones originales, de 4×4 a 9×9 en los diez primeros retos (nivel 9: 9×9), alternancia 8×8/9×9 hasta el 30 y 9×9/10×10 después. Los tableros de cada tamaño se ordenan por complejidad de deducción. No se copian tableros de Meowdoku. La comparación de dificultad es orientativa, no una equivalencia demostrada mediante pruebas con jugadores.
- Migración: conserva niveles superados, rangos, racha y ayudas. Reinicia únicamente la cuadrícula en curso, porque sus regiones han cambiado. Las partidas de la nueva campaña sí se recuperan completas.
- Paleta de diez regiones y mínimo táctil de 30 px por casilla cuando el ancho disponible lo permite. En pantallas excepcionalmente bajas se permite desplazamiento antes que reducir las casillas a un tamaño inutilizable.
- No se añaden anuncios, compras ni puntuaciones arbitrarias.

## Verificación

Pruebas del reconocedor de gestos: toque, doble toque, arrastre de marcado, arrastre de borrado, regreso sobre casillas ya recorridas, figura protegida, segundo dedo, salida del tablero y cancelación. La suite completa mantiene pruebas de campaña, persistencia, racha, final y PWA.

La certificación de los 100 retos comprueba solución única, deducción y ausencia de patrones de solución duplicados. No equivale a probar los gestos en un iPhone físico.
