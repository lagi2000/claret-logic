# PROMPT INICIAL PARA CHATGPT WORK

Quiero que profesionalices el proyecto adjunto **CLARET LOGIC** hasta dejar una versión candidata a publicación.

Lee primero `HANDOFF_WORK.md` completo y trata sus decisiones como requisitos de producto ya consensuados.

Tu objetivo no es improvisar un juego nuevo. Debes trabajar a partir del MVP existente, auditarlo y reconstruir/refactorizar lo necesario para convertirlo en un producto web/PWA robusto, atractivo y mantenible.

Prioridades, en este orden:

1. Audita el proyecto actual y detecta errores funcionales, lógicos, UX, responsive, accesibilidad y deuda técnica.
2. Propón un plan de profesionalización por fases antes de hacer cambios estructurales.
3. Separa motor lógico, datos de niveles, interfaz, persistencia, audio/háptica y assets.
4. Implementa un solver independiente que certifique unicidad de cada tablero.
5. Implementa un validador automático de los 100 niveles.
6. Diseña un sistema de rating de dificultad que mida algo más que el tamaño del tablero.
7. Revisa la curva de dificultad de los 100 niveles.
8. Mantén y pule portada, tutorial, vidas, ayudas, descartes automáticos, rangos, racha diaria y guardado local.
9. Optimiza móvil, tablet y escritorio.
10. Convierte la app en PWA, incluyendo offline cuando sea razonable.
11. Añade pruebas automáticas y una batería de QA.
12. Entrega una versión final lista para desplegar en la web de un colegio, con instrucciones claras de publicación.

Criterios no negociables:
- exactamente una solución por tablero;
- no validar inmediatamente la posición de Claret contra la solución;
- ningún sistema de cuentas ni servidor para guardar partidas en esta versión;
- progreso almacenado localmente;
- máximo 3 ayudas;
- 3 vidas vinculadas al reinicio completo del tablero;
- el juego debe sentirse primero como un puzzle excelente y después como un recurso educativo/claretiano;
- no infantilizar la interfaz;
- no revelar soluciones completas mediante ayudas.

Antes de comenzar cambios importantes, hazme una auditoría breve del estado actual y el plan de trabajo que seguirás. Después ejecuta el plan hasta obtener un entregable funcional.
