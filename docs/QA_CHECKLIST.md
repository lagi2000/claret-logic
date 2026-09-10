> Checklist original del handoff, conservado como referencia. El resultado actualizado de la RC2 está en QA_RELEASE.md y test-results.txt.

# CHECKLIST QA — CLARET LOGIC

## Lógica
- [ ] Cada nivel tiene exactamente una solución.
- [ ] Una solución cumple fila, columna, región y no contacto.
- [ ] Todas las regiones están conectadas.
- [ ] Los 100 niveles pasan validación automática.
- [ ] Colocar una hipótesis incorrecta no revela que es incorrecta.
- [ ] Las X automáticas solo expresan consecuencias de la hipótesis.
- [ ] Comprobar identifica conflictos sin revelar la solución.

## Vidas y ayudas
- [ ] Reiniciar consume 1 vida.
- [ ] Borrar una casilla no consume vida.
- [ ] Tras 3 reinicios, se reinicia solo ese nivel.
- [ ] Máximo 3 ayudas.
- [ ] Las ayudas son progresivas.
- [ ] Cada 15 niveles sin ayuda puede recuperar 1 ayuda.
- [ ] La racha se reinicia al usar ayuda.

## Persistencia
- [ ] Nivel guardado localmente.
- [ ] Ayudas guardadas.
- [ ] Rachas guardadas.
- [ ] Sonido guardado.
- [ ] Reiniciar progreso requiere confirmación.

## UI/UX
- [ ] Tablero protagonista.
- [ ] Correcto en móvil.
- [ ] Correcto en tablet.
- [ ] Correcto en escritorio.
- [ ] Botones táctiles adecuados.
- [ ] No depende solo del color.
- [ ] Sonido desactivable.
- [ ] Reglas accesibles desde “?”.
- [ ] Portada fluida y responsive.
- [ ] Cambios de rango celebrados sin exceso.

## PWA
- [ ] Manifest válido.
- [ ] Iconos.
- [ ] Instalación.
- [ ] Service worker.
- [ ] Offline básico.
- [ ] Sin errores de consola.

## Entrega
- [ ] README.
- [ ] Instrucciones de despliegue.
- [ ] ZIP release.
- [ ] Registro de pruebas.
