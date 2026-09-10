# CLARET LOGIC — HANDOFF PARA CHATGPT WORK

## 1. Objetivo del proyecto
Profesionalizar **Claret Logic** hasta convertirlo en un juego web/PWA de lógica visual de alta calidad para la comunidad educativa, especialmente orientado a alumnado desde 4.º de Primaria, pero atractivo también para adolescentes y adultos.

Objetivos cognitivos principales:
- percepción espacial;
- razonamiento lógico-matemático;
- atención y concentración;
- memoria de trabajo;
- planificación;
- deducción y exclusión;
- flexibilidad cognitiva;
- resolución de problemas;
- perseverancia y metacognición.

La identidad claretiana debe ser clara, positiva y elegante, pero el producto debe sentirse primero como **un videojuego de lógica excelente**, no como una ficha escolar gamificada.

## 2. Mecánica central cerrada
Reglas nucleares:
1. Exactamente un Claret por región de color.
2. Exactamente un Claret por fila.
3. Exactamente un Claret por columna.
4. Dos Claret no pueden tocarse, tampoco en diagonal.

Interacción:
- Herramienta **Claret** y herramienta **X** separadas.
- Un toque/clic ejecuta la herramienta seleccionada.
- El jugador puede colocar Claret donde quiera: no debe validarse instantáneamente contra la solución.
- Al colocar un Claret, se muestran automáticamente con X las consecuencias lógicas directas de esa hipótesis:
  - misma fila;
  - misma columna;
  - misma región;
  - casillas contiguas, incluida diagonal.
- Esas X automáticas NO significan que la hipótesis sea correcta.
- El jugador puede corregir marcas individuales sin perder vida.
- Reiniciar todo el tablero consume una vida.

## 3. Vidas
- 3 vidas por nivel.
- No se pierde vida por probar, colocar, borrar o modificar casillas.
- Se pierde una vida al **reiniciar el tablero completo**.
- Si se gastan las 3, se reinicia ese mismo nivel con 3 vidas.
- Nunca se pierde el progreso general.

## 4. Ayudas
- Máximo acumulable: 3.
- Se pueden utilizar varias en un mismo nivel.
- Andamiaje progresivo:
  1. ayuda de observación: indica dónde mirar;
  2. ayuda de focalización: acota el razonamiento;
  3. ayuda de deducción: realiza solo un descarte o paso concreto.
- Nunca revelar directamente la solución completa.
- Cada 15 niveles consecutivos superados sin ayuda: +1 ayuda si el jugador tiene menos de 3.
- Si usa una ayuda, la racha de 15 se reinicia.
- Durante el tutorial, las ayudas pedagógicas pueden ser gratuitas.

## 5. Tutorial
Público inicial: desde 4.º de Primaria.

Progresión inicial:
- Nivel 1: 3×3, regla de regiones.
- Nivel 2: 3×3, regiones + fila/columna.
- Nivel 3 en adelante: reglas completas.
- El 3×3 se usa solo como tutorial parcial porque con las reglas completas no resulta adecuado para la estructura matemática del juego.
- El tutorial debe enseñar jugando, con muy poco texto.

## 6. Progresión y dificultad
100 retos totales.

La dificultad NO significa 100 filas/columnas/colores. Debe crecer por complejidad lógica.

Principio de diseño:
- mantener tamaños visualmente cómodos;
- variar geometría de regiones;
- aumentar interdependencia de deducciones;
- evitar patrones repetitivos;
- no obligar a adivinar.

La versión actual ya incluye 100 niveles y una progresión de tamaños. Work debe revisar y profesionalizar la curva real de dificultad.

Requisito crítico:
**ningún tablero puede publicarse si no tiene exactamente una solución.**

Debe existir un pipeline profesional:
GENERADOR → SOLVER DE UNICIDAD → VALIDADOR DE REGLAS → MEDIDOR DE DIFICULTAD → SELECCIÓN.

El solver debe verificar:
- exactamente una solución;
- una por fila;
- una por columna;
- una por región;
- no contacto;
- regiones conectadas;
- coherencia entre nivel y solución.

Además, crear un **solver pedagógico** para estimar dificultad humana y rechazar niveles que requieran ensayo aleatorio.

## 7. Rangos
Cada 10 niveles se obtiene un rango/insignia:
1. Explorador
2. Aprendiz
3. Observador
4. Estratega
5. Experto
6. Maestro
7. Mente brillante
8. Genio lógico
9. Gran estratega
10. Mente Claret

Los cambios de rango deben tener una celebración específica, no ruido visual constante.

## 8. Racha diaria
Concepto deseado:
**“Toca el corazón de María y enciende la racha.”**

Debe aparecer como experiencia diaria al abrir el juego.
Guardar localmente:
- racha actual;
- mejor racha;
- último día activado.

La identidad visual debe usar un **Corazón de María atractivo, claretiano y cuidado**.

Recompensa propuesta:
- cada 7 días de racha: +1 ayuda si tiene menos de 3.

## 9. Guardado
V1 sin cuentas ni servidor.
Usar almacenamiento local del navegador:
- nivel alcanzado;
- ayudas;
- racha de 15;
- racha diaria;
- mejor racha;
- rango/insignias;
- ajustes de sonido.

Debe funcionar sin necesidad de gestionar 2.200 cuentas.
Limitación aceptada: el progreso no se sincroniza entre dispositivos.

## 10. Plataforma
Objetivo: **web app responsive / PWA**.
Debe funcionar muy bien en:
- móvil;
- tablet;
- PC/Mac;
- Chromebook.

Debe poder:
- alojarse en la web del colegio;
- abrirse mediante URL;
- añadirse a pantalla de inicio cuando el dispositivo lo permita;
- funcionar offline cuando sea viable.

## 11. UX/UI
Dirección visual:
- limpia;
- divertida;
- profesional;
- moderna;
- atractiva para niños desde 4.º pero no infantilizada;
- tablero protagonista;
- poco texto durante la partida;
- reglas bajo botón “?”;
- feedback mediante microanimaciones;
- Claret como acompañante visual;
- sonidos opcionales;
- vibración/háptica cuando el dispositivo lo permita.

Evitar:
- interfaces recargadas;
- textos pedagógicos largos;
- celebraciones constantes;
- sensación de “actividad escolar disfrazada de juego”.

## 12. Portada
Existe una portada visual aprobada e integrada.
Debe mantenerse como referencia estética principal:
- título CLARET LOGIC;
- lema “PIENSA · COLOCA · AVANZA”;
- Claret de cuerpo completo;
- estética de videojuego móvil;
- botón JUGAR.

La portada actual es una referencia, no un límite: Work puede mejorar integración, escalado, accesibilidad y responsive sin alterar su espíritu.

## 13. Sonido y estímulos
- feedback suave al colocar Claret;
- feedback distinto para X;
- error no agresivo;
- secuencia ascendente al superar un nivel;
- vibración breve compatible;
- confeti solo en hitos/cambios de rango/final;
- sonido desactivable.

No usar música constante por defecto.

## 14. Comprobación
Al pulsar “Comprobar”:
- si es correcto: feedback positivo breve;
- si hay conflicto: indicar qué regla se incumple y resaltar las casillas implicadas;
- no revelar qué Claret concreto debe moverse ni la solución completa.

## 15. Estado actual
El directorio contiene la versión prototipo **V2.8**.
Es un MVP funcional, NO código final de producción.

Work debe:
- revisar la arquitectura desde cero;
- conservar las decisiones de producto;
- refactorizar el código cuando sea necesario;
- separar datos, motor lógico, UI, persistencia y assets;
- añadir pruebas automatizadas;
- revisar accesibilidad;
- probar tamaños de pantalla;
- asegurar que no se rompa la lógica al cambiar niveles;
- eliminar deuda técnica del prototipo.

## 16. Resultado esperado de Work
Entregar una versión “release candidate” profesional con:
1. código limpio y modular;
2. 100 niveles certificados;
3. generador/solver documentado;
4. curva de dificultad revisada;
5. tutorial pulido;
6. portada;
7. racha diaria;
8. vidas y ayudas;
9. guardado local;
10. responsive completo;
11. PWA;
12. accesibilidad básica;
13. pruebas automáticas;
14. checklist QA;
15. instrucciones de despliegue en hosting/web del colegio;
16. ZIP final listo para publicar.

## 17. Regla de gobernanza
No rediseñar las decisiones pedagógicas/producto cerradas sin justificarlo.
Si se detecta un problema, proponer alternativas antes de cambiar la mecánica.

Luis actúa como Product Owner y valida cambios de producto.
