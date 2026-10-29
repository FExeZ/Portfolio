# FZ-16: portfolio de Franco Zerda

Portfolio de Franco Zerda, desarrollador full stack, armado como una consola retro de 16 bits. El visitante entra a una habitación, enciende la consola FZ-16 y recorre el contenido como si jugara: la ficha de jugador, la historia detrás de cada objeto de la habitación, las skills, los proyectos, Simpsonsdle y el contacto. Funciona en español y en inglés, con una carcasa de escritorio y otra portátil para el celular.

El sitio está publicado en https://fexez.github.io/Portfolio/. Para quien prefiere leer sin la consola, todo el contenido está también en una versión texto, en https://fexez.github.io/Portfolio/#/text.

## Requisitos

Node.js en una versión compatible con Angular 21 y npm.

## Instalación y ejecución

```bash
npm install
```

```bash
npm start
```

El servidor de desarrollo queda en `http://localhost:4200/`.

## Tests

```bash
npm test -- --watch=false
```

Los tests usan Vitest. La lógica de la consola es TypeScript puro y está cubierta con tests: navegación, cámara, sonidos, preferencias y juego.

## Build y publicación

```bash
npm run build
```

El sitio se publica en GitHub Pages con `npm run deploy`, que compila con la ruta base `/Portfolio/` y sube el build a la rama `gh-pages`.

## Estructura

La aplicación vive en `src/app/console/`:

- `core/`: la lógica pura. Un reducer recibe el estado y una acción y devuelve el estado nuevo, sin tocar el navegador.
- `content/`: los textos en los dos idiomas y los dibujos en pixel art, escritos como texto.
- `console.store.ts`: el único lugar que usa las APIs del navegador (temporizadores, guardado, historial y audio).
- Componentes de las carcasas, la pantalla, la habitación y el modo texto.

Las traducciones de la interfaz están en `src/app/i18n/translations.ts`.

## Recursos

Los dibujos son pixel art original, y los sonidos se sintetizan con Web Audio, sin archivos de audio. Las fuentes Press Start 2P y VT323 están en `src/fonts/`, con sus licencias OFL.
