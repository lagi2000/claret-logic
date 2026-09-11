# Claret Logic · 3.1.0 RC2

Dos prácticas iniciales y **100 retos certificados de solución única**, organizados en un recorrido visual de diez mundos. Juego estático sin cuentas, base de datos, analítica ni dependencias de ejecución. Portada, reglas, vidas, ayudas, rangos y racha diaria conservados.

El certificado lógico estricto pasa: 100/100 retos con una solución, regiones conectadas, traza de deducción sin adivinación y **100 disposiciones de respuesta distintas dentro de su tamaño**. Las dos prácticas 4×4 son independientes, tienen solución única y aplican desde el inicio las tres reglas completas.

## Probar y publicar

- Para probar en ordenador: descomprimir, abrir terminal en esta carpeta y ejecutar `npm run dev` con Node.js 20 o superior. Abrir `http://localhost:4173`.
- No requiere `npm install`.
- Para publicarlo en GitHub Pages: subir el repositorio, activar **Settings → Pages → Source: GitHub Actions** y ejecutar el flujo incluido. La aplicación se publica automáticamente desde `dist/`.
- Para alojarlo directamente en la web del colegio: subir **solo el contenido de dist/** a una carpeta HTTPS. Instrucciones en docs/DESPLIEGUE.md.
- No abrir index.html con doble clic: los módulos requieren HTTP o HTTPS.
- Es una PWA instalable en móvil, tablet y ordenador. En iPhone: Safari → Compartir → Añadir a pantalla de inicio. En Android/Chrome: Instalar aplicación o Añadir a pantalla de inicio.

## Arquitectura

| Archivo/carpeta | Función |
|---|---|
| dist/js/engine.js | Reglas y descartes; no consulta soluciones |
| dist/js/pedagogy.js | Deducciones y ayudas en tres fases |
| dist/js/state.js | Vidas, progreso, rachas, prácticas y migración |
| dist/js/feedback.js | Sonido opcional, vibración e hitos |
| dist/js/app.js | Interfaz, teclado, diálogos y coordinación |
| dist/js/journey.js | Transiciones verificables entre reto, mapa e hitos |
| dist/js/worlds.js | Diez escenarios, rangos y recorrido por bloques |
| dist/js/levels.js | Cien puzzles certificados |
| dist/js/tutorials.js | Dos prácticas 4×4, completas y sin puntuación |
| scripts/solver.mjs | Solver exhaustivo independiente |
| scripts/generate.mjs | Generador determinista y selección |
| scripts/certify.mjs | Certificación estricta de la campaña |
| scripts/build.mjs | Verificación de archivos y service worker |
| tests/ | Pruebas y banco de QA excluido de producción |
| docs/ | Auditoría, decisión aprobada, QA y despliegue |

## Validación reproducible

1. `npm run generate`
2. `npm run build`
3. `npm test`
4. `npm run certify`
5. `npm run audit`

Todos deben terminar con código 0. `npm run audit` revisa las 102 cuadrículas publicadas; el diagnóstico histórico del MVP se conserva aparte en docs/audit-original.json.

La dificultad es una estimación por longitud y complejidad de las deducciones; se aconseja observar su recepción en el aula. No se recopilan datos de los jugadores.
