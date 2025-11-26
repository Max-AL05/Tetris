# Tetris: Edición Quiz & Co-op

Una versión moderna y rediseñada del clásico juego de Tetris, construida con tecnologías web (HTML, CSS, JS). Este proyecto no solo ofrece la experiencia clásica de apilar bloques, sino que introduce un **innovador modo para 2 jugadores** que mezcla habilidad arcade con conocimientos de cultura general.

<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/59efdc9d-fac8-490e-91cf-831a4fc739d0" />


## Características Principales

* **Modo Clásico (1 Jugador):** Disfruta de la experiencia tradicional de Tetris. Completa líneas, acumula puntos y evita que los bloques lleguen a la cima.
* **Modo Dúo (2 Jugadores ):** Una mecánica única donde la cooperación (o el caos) es clave:
    * **Jugador 1:** Controla el tablero de Tetris.
    * **Jugador 2:** Responde preguntas de cultura general.
    * **Mecánica de Penalización:** ¡Cuidado! Si el Jugador 2 responde incorrectamente, se añade un **Strike** y la velocidad del Tetris aumenta drásticamente. Al llegar a **5 Strikes**, el juego termina.
    * **Asistencia:** El Jugador 2 puede ayudar moviendo la pieza del Jugador 1 con sus propias teclas ("A" y "B").
* **Estilo Visual "Aurora":** Interfaz moderna con estética neón/cyberpunk, fondos animados, botones con efectos de estrellas y tipografía personalizada.
* **Sistema de Pausa:** Menú de pausa integrado para detener la acción cuando lo necesites (Tecla `P`).
* **Navegación Full Teclado:** Todo el juego, incluidos los menús, se puede controlar sin necesidad de usar el ratón.

## Controles

### General
| Acción | Tecla |
| :--- | :--- |
| **Pausar Juego** | `P` |
| **Navegar Menú** | `W` (Arriba) / `S` (Abajo) |
| **Seleccionar** | `Enter` / `Espacio` |

### Jugador 1 (Tetris)
| Acción | Tecla |
| :--- | :--- |
| **Mover Izquierda** | `Flecha Izquierda` |
| **Mover Derecha** | `Flecha Derecha` |
| **Acelerar Caída** | `Flecha Abajo` |
| **Rotar Pieza** | `Espacio` |

### Jugador 2 (Quiz & Asistencia)
| Acción | Tecla |
| :--- | :--- |
| **Seleccionar Respuesta** | `W` (Arriba) / `S` (Abajo) |
| **Confirmar Respuesta** | `Q` o `Enter` |
| **Mover Pieza (Ayuda)** | `A` (Izquierda) / `D` (Derecha) |

## Tecnologías Usadas

* **HTML5:** Estructura semántica y Canvas para el renderizado del juego.
* **CSS3:** Animaciones (keyframes), Flexbox para el diseño responsivo y efectos visuales (sombras, gradientes).
* **JavaScript (ES6+):** Lógica del juego modularizada (`script.js` para Tetris, `quiz.js` para preguntas), manejo de estados y sistema de colisiones.
* **Fuentes:** Google Fonts (Zain, Roboto).

---

## Instalación y Uso

1.  Clona este repositorio:
    ```bash
    git clone [https://github.com/tu-usuario/tu-repo-tetris.git](https://github.com/tu-usuario/tu-repo-tetris.git)
    ```
2.  Navega a la carpeta del proyecto.
3.  Abre el archivo `index.html` en tu navegador web favorito.
4.  ¡A jugar!

---
¡Gracias por jugar!
