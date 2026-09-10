# Publicar en la web del colegio

La decisión de los tutoriales está aprobada y los 100 retos están certificados. Al alojar esta candidata, comprobar instalación y recarga offline bajo HTTPS antes de difundirla; véase QA_RELEASE.md.

## Alojamiento estático

No requiere PHP, base de datos, cuentas ni un proceso Node en producción.

1. Crear una carpeta exclusiva para el juego, por ejemplo `/juegos/claret-logic/`, dentro del alojamiento del colegio.
2. Subir **el contenido de dist/** a esa carpeta. Mantener las carpetas js/ y assets/.
3. Servir `index.html` cuando se abre la carpeta.
4. Usar HTTPS con certificado válido.
5. Abrir la URL de la carpeta y comprobar portada, corazón, una partida y su recuperación al recargar.

No subir docs/, tests/, scripts/ ni el ZIP entero como sustituto de la web. No pegar index.html en el editor de una página WordPress: deben alojarse sus archivos estáticos. Se puede enlazar al juego desde cualquier página del centro.

## Cabeceras y tipos de archivo

- `.js`: `text/javascript` o `application/javascript`.
- `.css`: `text/css`.
- `.webmanifest`: `application/manifest+json`.
- `.png`: `image/png`; `.jpeg`: `image/jpeg`.
- `sw.js` e `index.html`: `Cache-Control: no-cache` para permitir comprobación de actualizaciones.
- No aplicar transformaciones automáticas que mezclen o renombren módulos sin actualizar referencias.

Manifest y service worker tienen alcance relativo. Subirlos a la carpeta del juego, no a la raíz general de la web. El service worker solo responde a sus recursos conocidos y no debe interceptar páginas de la web del colegio.

## Comprobar el modo sin conexión

1. Abrir con conexión y esperar a que el service worker se instale y precargue los recursos.
2. Cerrar la página y volver a abrirla para que quede controlada.
3. Desconectar la red y recargar la URL del juego.
4. Confirmar carga de portada, tablero, imágenes y recuperación de la partida.
5. Volver a activar la red.

La instalación como aplicación depende del navegador y del sistema. El manifest ofrece nombre, iconos y modo de pantalla independiente; el servidor debe ofrecer HTTPS. No se garantiza conservación indefinida si el sistema borra los datos del navegador.

## Actualizaciones y reversión

1. Conservar el ZIP de la versión anterior.
2. Ejecutar `npm run build` después de modificar recursos: cambia la firma de caché.
3. Subir todos los archivos de la nueva versión de forma conjunta/atómica si el alojamiento lo permite.
4. El nuevo service worker espera hasta que se cierran las pestañas de la versión anterior; evita mezclar código y cachés en mitad de una partida.
5. Cerrar todas las pestañas del juego y reabrir para comprobar la actualización.
6. Para revertir, restaurar el contenido dist/ de la versión anterior y volver a cerrar/reabrir.

La actualización no borra el progreso. El esquema actual tiene versión 4 y migra las claves del MVP cuando están disponibles en el mismo origen y navegador. Si cambia el dominio/origen, el navegador no comparte el guardado. Los números anteriores se traducen descontando las dos prácticas, ahora independientes. Los 98 puzzles de RC1 se conservan en RC2 y se añaden dos; respecto al MVP original puede cambiar la geometría.

## Datos y dispositivos compartidos

No se recopilan datos personales. El progreso se guarda en almacenamiento local del origen. Sin cuentas ni sincronización entre dispositivos. En un mismo perfil de navegador, varias personas compartirán partida; para separarlas, usar perfiles de navegador diferentes. Borrar los datos de la web borra el progreso.

Se recomienda una única instalación del juego por origen. Las cachés offline se aíslan por subcarpeta, pero el guardado usa una clave común del origen para conservar la migración de V2. Un piloto independiente debe utilizar otro origen o perfil de navegador.
