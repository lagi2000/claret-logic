# Auditoría de estrellas y continuidad · 3.12.0

Se revisaron generación de resultado, guardado, carga, repetición, mapa, mundos pendientes, ayudas, vidas, racha, hitos, final y recursos gráficos.

Hallazgos corregidos: el desbloqueo dependía del nivel seleccionado al repetir, en vez de los niveles completados. Los niveles anteriores a las estrellas no tenían representación de puntuación y parecían perderla. Los guardados de ediciones antiguas podían omitir campos nuevos sin un respaldo independiente. La presentación de estrellas no reservaba tres posiciones ni mostraba el resultado en la victoria.

Ahora se conserva el máximo registrado y se recuperan los resultados desde un respaldo local ante un guardado atrasado, incompleto o corrupto. Esto no sincroniza dispositivos, navegadores ni instalaciones con almacenamiento separado. No recupera puntuaciones que nunca se registraron o que ya fueron eliminadas antes de existir el respaldo. No se atribuye esta causa al teléfono del usuario sin disponer de su guardado.

Validación: suite de 187 pruebas, certificación independiente de 100 soluciones únicas deductivas, auditoría de los 102 tableros y revisión de los diez contenedores WebP. Comprobación del flujo publicado: victoria con vidas restantes, mapa, repetir, mejorar, recargar y visualizar estrellas. La prueba de UI en navegador remoto no equivale a una prueba en iPhone físico.
