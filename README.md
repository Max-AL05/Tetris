# Tetris

Un clon moderno del clásico juego Tetris, desarrollado con **Ruby (Sinatra)** en el backend y **JavaScript Vanilla** en el frontend. Este proyecto presenta una estética estilo "Espacio/Neón", música dinámica y un sistema de estadísticas en tiempo real.

## Características Principales

* **Gameplay Clásico:** Mecánicas tradicionales de Tetris con rotación, caída suave y limpieza de líneas.
* **Estilo Visual Neón:** Interfaz inmersiva con efectos de brillo y tema espacial.
* **Banda Sonora Dinámica:**
    * Música ambiental para el Menú.
    * Soundtrack energético durante el Juego.
    * Música dramática para el Game Over.
* **Persistencia de Datos:** Base de datos **SQLite3** para guardar las puntuaciones de los jugadores automáticamente.
  
## Tecnologías Utilizadas

* **Backend:** Ruby, Sinatra, ActiveRecord, SQLite3.
* **Frontend:** HTML5 (Canvas API), CSS3 (Flexbox, Grid, Animaciones), JavaScript (ES6+).
* **Base de Datos:** SQLite3 (para almacenar Top Scores).

## Controles

| Tecla | Acción |
| :---: | :--- |
| **⬅️ Flecha Izq** | Mover pieza a la izquierda |
| **➡️ Flecha Der** | Mover pieza a la derecha |
| **⬇️ Flecha Abajo** | Acelerar caída (Soft Drop) |
| **Espacio** | Rotar pieza |
| **P** | Pausar / Reanudar juego |

## Instalación y Ejecución

Sigue estos pasos para correr el juego en tu computadora local:

### 1. Prerrequisitos
Asegúrate de tener instalado:
* [Ruby](https://www.ruby-lang.org/es/) (versión 2.7 o superior recomendada)
* Bundler (`gem install bundler`)

### 2. Clonar el repositorio
```bash
git clone https://github.com/Max-AL05/Tetris.git
cd tetris-space-neon
