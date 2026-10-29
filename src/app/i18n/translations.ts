import type { MenuItem, OptionsItem, TitleItem } from '../console/core/console-state';
import type { NoticeId } from '../console/core/easter-eggs';

export type Lang = 'es' | 'en';

/** Texto con sus dos variantes de idioma, para el contenido de `console/content/`. */
export interface Localized {
  es: string;
  en: string;
}

/** Textos de la interfaz de la consola. */
export interface Translations {
  console: {
    label: string;
    brand: string;
    pocketName: string;
    playerName: string;
    powerTv: string;
    powerHint: string;
    pocketHint: string;
    rotateHint: string;
    skip: string;
    soundToggle: string;
    withSound: string;
    title: Record<TitleItem, string>;
    menu: Record<MenuItem, string>;
    options: Record<OptionsItem, string> & { on: string; off: string; languageName: string };
    pad: { up: string; down: string; left: string; right: string; a: string; b: string; start: string };
    player: {
      avatarAlt: string;
      classLabel: string;
      levelLabel: string;
      languagesLabel: string;
      shortcuts: string;
    };
    skills: {
      tabs: string;
      previous: string;
      next: string;
      achievements: string;
      unlocked: string;
    };
    projects: {
      shelf: string;
      inserting: string;
      technologies: string;
      code: string;
      play: string;
      live: string;
      opensNewTab: string;
    };
    contact: {
      player2: string;
      pressStart: string;
      links: string;
    };
    room: {
      /** Nombre accesible del grupo de objetos de la habitación. */
      objects: string;
      /** Lo que muestra la tele mientras se explora la habitación. */
      hint: string;
      /** Botón de la caja de diálogo: pasa de página o, en la última, la cierra. */
      next: string;
      close: string;
    };
    textMode: {
      /** Link de la consola al modo texto (RF-66). */
      link: string;
      /** Link del modo texto de vuelta a la consola (RF-68). */
      back: string;
      /** Botón que cambia al otro idioma: dice el nombre del idioma al que pasa. */
      language: string;
      /** Link a simpsonsdle.com en el modo texto. */
      play: string;
    };
    /** Carteles de los secretos (RF-71). */
    notice: Record<NoticeId, string>;
    /** Snake, el juego del cartucho secreto (RF-76, RF-77). */
    snake: {
      hint: string;
      score: string;
      best: string;
      paused: string;
      resume: string;
      gameOver: string;
      retry: string;
      /** Nombre accesible del tablero. */
      board: string;
    };
  };
}

export const TRANSLATIONS: Record<Lang, Translations> = {
  es: {
    console: {
      label: 'Consola FZ-16',
      brand: 'FZ-16 SYSTEM',
      pocketName: 'FZ-16 POCKET',
      playerName: 'FRANCO ZERDA',
      powerTv: 'Encender la tele',
      powerHint: 'Hacé clic en la tele o presioná Enter',
      pocketHint: 'Presioná Start',
      rotateHint: 'Girá el teléfono para jugar mejor',
      skip: 'Saltear',
      soundToggle: 'Sonido',
      withSound: 'con sonido',
      title: { start: 'PRESS START', continue: 'CONTINUE', newGame: 'NEW GAME', options: 'Opciones' },
      menu: {
        player: 'Jugador',
        about: 'Sobre mí',
        skills: 'Skills',
        projects: 'Proyectos',
        simpsonsdle: 'Simpsonsdle',
        contact: 'Contacto',
        options: 'Opciones',
        credits: 'Créditos'
      },
      options: {
        language: 'Idioma',
        sound: 'Sonido',
        crt: 'Efectos CRT',
        back: 'Volver',
        on: 'Sí',
        off: 'No',
        languageName: 'Español'
      },
      pad: {
        up: 'Arriba',
        down: 'Abajo',
        left: 'Izquierda',
        right: 'Derecha',
        a: 'Botón A',
        b: 'Botón B',
        start: 'Start'
      },
      player: {
        avatarAlt: 'Avatar en pixel art de Franco Zerda',
        classLabel: 'Clase',
        levelLabel: 'Nivel',
        languagesLabel: 'Idiomas',
        shortcuts: 'Accesos'
      },
      skills: {
        tabs: 'Categorías',
        previous: 'Categoría anterior',
        next: 'Categoría siguiente',
        achievements: 'Logros',
        unlocked: 'Logro desbloqueado'
      },
      projects: {
        shelf: 'Estante de cartuchos',
        inserting: 'Insertando cartucho…',
        technologies: 'Tecnologías',
        code: 'Ver código',
        play: 'PLAY',
        live: 'En vivo',
        opensNewTab: '(se abre en una pestaña nueva)'
      },
      contact: {
        player2: 'PLAYER 2',
        pressStart: 'PRESS START TO JOIN',
        links: 'Links de contacto'
      },
      room: {
        objects: 'Objetos de la habitación',
        hint: 'Explorá la habitación. Elegí la tele para volver al menú.',
        next: 'Siguiente',
        close: 'Cerrar'
      },
      textMode: {
        link: 'Ver versión texto',
        back: 'Volver a FZ-16',
        language: 'English',
        play: 'Jugar en simpsonsdle.com'
      },
      notice: {
        cyclone: '¡Vamos Ciclón!',
        secret: '¡Encontraste un cartucho secreto! Está en Proyectos.'
      },
      snake: {
        hint: 'Mové la serpiente con las flechas o la cruz. A pausa el juego.',
        score: 'PUNTOS',
        best: 'RÉCORD',
        paused: 'PAUSA',
        resume: 'Presioná A para seguir.',
        gameOver: 'GAME OVER',
        retry: 'REINTENTAR',
        board: 'Snake: tablero de 20 por 15'
      }
    }
  },
  en: {
    console: {
      label: 'FZ-16 console',
      brand: 'FZ-16 SYSTEM',
      pocketName: 'FZ-16 POCKET',
      playerName: 'FRANCO ZERDA',
      powerTv: 'Turn on the TV',
      powerHint: 'Click the TV or press Enter',
      pocketHint: 'Press Start',
      rotateHint: 'Rotate your phone for a better game',
      skip: 'Skip',
      soundToggle: 'Sound',
      withSound: 'with sound',
      title: { start: 'PRESS START', continue: 'CONTINUE', newGame: 'NEW GAME', options: 'Options' },
      menu: {
        player: 'Player',
        about: 'About me',
        skills: 'Skills',
        projects: 'Projects',
        simpsonsdle: 'Simpsonsdle',
        contact: 'Contact',
        options: 'Options',
        credits: 'Credits'
      },
      options: {
        language: 'Language',
        sound: 'Sound',
        crt: 'CRT effects',
        back: 'Back',
        on: 'On',
        off: 'Off',
        languageName: 'English'
      },
      pad: {
        up: 'Up',
        down: 'Down',
        left: 'Left',
        right: 'Right',
        a: 'A button',
        b: 'B button',
        start: 'Start'
      },
      player: {
        avatarAlt: 'Pixel art avatar of Franco Zerda',
        classLabel: 'Class',
        levelLabel: 'Level',
        languagesLabel: 'Languages',
        shortcuts: 'Shortcuts'
      },
      skills: {
        tabs: 'Categories',
        previous: 'Previous category',
        next: 'Next category',
        achievements: 'Achievements',
        unlocked: 'Achievement unlocked'
      },
      projects: {
        shelf: 'Cartridge shelf',
        inserting: 'Inserting cartridge…',
        technologies: 'Technologies',
        code: 'View code',
        play: 'PLAY',
        live: 'Live',
        opensNewTab: '(opens in a new tab)'
      },
      contact: {
        player2: 'PLAYER 2',
        pressStart: 'PRESS START TO JOIN',
        links: 'Contact links'
      },
      room: {
        objects: 'Room objects',
        hint: 'Explore the room. Pick the TV to go back to the menu.',
        next: 'Next',
        close: 'Close'
      },
      textMode: {
        link: 'View text version',
        back: 'Back to FZ-16',
        language: 'Español',
        play: 'Play at simpsonsdle.com'
      },
      // Queda en castellano: es un canto, como "PRESS START" queda en inglés.
      notice: {
        cyclone: '¡Vamos Ciclón!',
        secret: 'You found a secret cartridge! It’s in Projects.'
      },
      snake: {
        hint: 'Move the snake with the arrow keys or the D-pad. A pauses the game.',
        score: 'SCORE',
        best: 'BEST',
        paused: 'PAUSED',
        resume: 'Press A to continue.',
        gameOver: 'GAME OVER',
        retry: 'RETRY',
        board: 'Snake: 20 by 15 board'
      }
    }
  }
};
