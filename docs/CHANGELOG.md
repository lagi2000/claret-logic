## 3.12.0 · Auditoría de estrellas y progreso

- Estrellas de tres posiciones visibles en todos los retos completados; las puntuaciones antiguas desconocidas se distinguen con contornos y explicación, sin inventar vidas históricas.
- Respaldo independiente de mejores estrellas, victorias, derrotas y progreso; no retrocede ante una pestaña con guardado atrasado o una edición sin los campos nuevos.
- Recuperación de puntuación de un intento ya resuelto cuando conserva sus vidas.
- Corregido bloqueo de mundos después de repetir un nivel antiguo: desbloqueo según progreso total.
- Estrellas también en el mensaje de victoria. 187 pruebas y certificación de los 102 tableros.

## 3.11.1 · Recursos gráficos e instalación

- Recuperada la ilustración original de Sevilla: el archivo publicado estaba vacío.
- La compilación rechaza archivos vacíos; las pruebas comprueban cabeceras y longitud de los diez WebP.
- Icono Apple 180×180 explícito y convencional, con la cara de Claret. Guía de instalación indica abrir Safari fuera del visor del chat.
- No se borran datos ni se altera progreso. Un icono ya guardado por iOS no puede sustituirse a distancia.

## 3.11.0 · Exploración del recorrido

- Deslizamiento horizontal entre diez destinos, además de botones anterior/siguiente.
- Vista completa de destinos pendientes sin desbloquear retos ni modificar progreso.
- Los retos completados siguen disponibles para mejorar estrellas.
- Avatar de Claret también en las rutas antiguas de iconos para evitar servir la C.
- 181 pruebas automáticas. iOS puede mantener un icono ya instalado; la web no puede forzar su sustitución.

## 3.10.0 · Ayudas para aprender y saludo

- Ayudas recalculadas desde marcas actuales; buscan una colocación segura mediante cadena deductiva, sin exigir un orden predeterminado.
- Una ayuda por deducción. Explicación ampliable, conservada tras recargar; el jugador realiza la colocación final.
- Detección de cruces personales que impiden avanzar. Feedback breve de deducción, sin cuestionarios ni pantallas nuevas.
- Saludo de Claret de dos fotogramas, dentro de la casilla, sin bloquear controles y desactivado con reducción de movimiento.
- 180 pruebas: cadenas lógicas de los 100 retos, dos órdenes de colocación, ayudas, persistencia, vidas y estrellas.
- No se incluyen tarjetas biográficas. Se mantiene la curva de cuadrículas 4×4–10×10.

## 3.9.0 · Vidas, errores y estrellas

- Claret incorrecto pierde una vida y deja una cruz roja fija. Las notas normales no penalizan.
- Tres errores terminan el intento; reintentar limpia solo ese nivel. Recargar no recupera vidas.
- Contadores persistentes de victorias/derrotas de campaña; mejores estrellas por nivel (vidas restantes).
- Mapa conserva números y permite repetir retos ya superados. No se inventan estrellas de partidas antiguas.
- Verificados los 102 tableros y todas las posiciones correctas en cualquier orden, incluido el reto 16.

## 3.8.0 · Campaña ampliada y gestos directos

- Toque/arrastre para descartes, doble toque para Claret y final automático por las tres normas.
- 100 tableros originales 4×4–10×10, con solución única y prueba deductiva; nivel 9 de 9×9.
- Diez colores, tamaño mínimo de casilla, cálculo de misiones reutilizado y guardado de hasta cien casillas.
- Migración preserva progreso, ayudas, rangos y racha. Descarta solamente marcas de la antigua cuadrícula.
- 174 pruebas automáticas y certificación de los 102 tableros, incluidos los tutoriales.

## 3.6.1 · Actualización visible

- La instalación PWA descarga recursos frescos; aviso de actualización sin interrumpir la partida.
- Acceso a actualizar desde portada y versión visible. La recuperación conserva localStorage.
- El tablero mantiene los números de región únicamente en nombres accesibles.

# 3.6.0 · cierre de flujo

- Corregido el bucle del logro final de Mente Claret: el cierre queda registrado y se recupera tras recargar. Los otros nueve logros avanzan exactamente un reto al continuar.
- El botón «Ver logro» permanece pulsable incluso si otra ventana ha aplazado la celebración. El paso al mapa se realiza sin temporizador vulnerable a dobles pulsaciones.
- Unificada la entrada en las casillas con el clic nativo, válido para toque, ratón y teclado; arrastrar ya no se interpreta como jugada. La portada recuerda la partida sin volver a imponer el carrusel a quien ya terminó el tutorial.
- Tarjeta de rango compartible con nivel, destino, enlace público y reto amistoso; descarga de imagen si la plataforma no admite compartir archivos.
- Corazón de María con señal sonora propia y aviso de récord diario. Ventanas de logro y destino desplazables en pantallas de poca altura; avisos de recompensa sin interceptar toques.
- HTML y módulos de la PWA se leen desde una sola versión de caché; la próxima apertura adopta la actualización descargada. Verificados 102 tableros, 100 soluciones deductivas y el recorrido completo de 100 retos con diez rangos.

# 3.5.0 · publicación

- Evitada la recarga automática de las pestañas abiertas al actualizar la PWA: la racha, las misiones y el tablero conservan su interacción durante la partida.
- Las presentaciones de misión pendientes comprueban el reto y la pantalla activos antes de abrirse; los logros esperan a que se cierre cualquier otro diálogo.
- Verificados 102 tableros (dos prácticas y cien retos), 100 soluciones únicas distintas, 100 caminos completables desde sus misiones y 159 pruebas automáticas.

# 3.1.0 RC1

- Corregido el cálculo responsive que reducía progresivamente el tablero en algunos iPhone; ahora prioriza el ancho útil y mide solo la altura real del contenido.
- En teléfonos de poca altura se ocultan dos textos redundantes para ampliar el área táctil del tablero sin introducir scroll.
- Incorporado un recorrido visual de diez mundos: Sallent, Vic, Cuba, Madrid, Las Palmas de Gran Canaria, Don Benito, Sevilla, Carvalhos, Zimbabue y Fátima.
- Cada mundo reúne diez retos, conserva el rango aprobado y ofrece un escenario ilustrado propio, una ruta numerada y estados de progreso inequívocos.
- Añadidas celebraciones de rango al superar cada bloque de diez y una colección acumulativa de diez insignias; el reto 100 mantiene un cierre especial de Mente Claret.
- Regenerada y recertificada la campaña: 100/100 soluciones únicas, regiones conectadas, deducción sin adivinación, cero duplicados geométricos y cero disposiciones de solución repetidas dentro de un mismo tamaño.
- Recuperación robusta tras recargar justo al completar un reto o un bloque de diez.
- Los diez escenarios y toda la aplicación quedan incluidos en la caché PWA para jugar tras una instalación correcta.

# 3.0.0 RC4

- Añadido a la portada el crédito «Creado por: Luis A. García · Claret Sevilla».
- Integrado como placa discreta y responsive sin alterar la composición ni el acceso al juego.
- Centrado vertical móvil con aire superior e inferior y respeto de las zonas seguras del dispositivo.

# Ajuste pedagógico · pensamiento autónomo

- Cruces automáticas limitadas a las dos prácticas iniciales.
- Desde el reto 1, todos los descartes los coloca el jugador.
- Claret ocupa la casilla completa, asomado como a una ventana.
- Instrucciones y mensajes adaptados a la nueva dinámica.

# Actualización visual · corazón de María

- Ilustración original aportada integrada en la racha, con activación y cifra reales.
- Escenario azul, controles con relieve y rango dorado.
- Progreso lateral en escritorio y superior en móvil; tablero ajustado al ancho y altura.
- Reglas, niveles y recompensas conservados.

# 3.0.0 RC2

- Aprobado: dos prácticas fuera de la numeración, después 100 retos únicos.
- 100/100 certificados; sin duplicados geométricos ni respuestas consecutivas repetidas desde 5×5.
- Preservados los 98 puzzles previos y añadidos dos; rangos por diez retos de campaña.
- Prácticas guardadas, reanudables y repetibles sin afectar a las recompensas.
- Migración al esquema v4 conservando las claves anteriores.
- Completadas pruebas de navegador de introducción, ayudas, reinicios, teclado, cuatro anchuras, texto ampliado y final del reto 100.
- Tipografía relativa y reflujo mejorado.
- Código modular, PWA y documentación de despliegue.

La revisión RC1 queda superada por esta versión. La instalación/offline reales y la comprobación en dispositivos físicos se realizan en el alojamiento HTTPS; consultar QA_RELEASE.md.
