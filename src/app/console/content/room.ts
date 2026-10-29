import type { Localized } from '../../i18n/translations';
import type { Rect } from '../core/camera';

export type RoomObjectId =
  | 'window'
  | 'flag'
  | 'favaloro'
  | 'poster'
  | 'trophies'
  | 'tv'
  | 'consoles'
  | 'pc'
  | 'mate'
  | 'recordPlayer'
  | 'globe'
  | 'bear'
  | 'pocho'
  | 'negra'
  | 'ball'
  | 'racket'
  | 'flaco'
  | 'nymeria';

/** Ilustración en pixel art que acompaña a una historia (RF-37). */
export type MemoryId = 'team' | 'bear' | 'stands' | 'languages';

/** Sonido de cada mascota al elegirla (RF-35). */
export type PetSound = 'barkSmall' | 'barkMedium' | 'barkBig' | 'meow';

interface RoomObjectBase {
  id: RoomObjectId;
  name: Localized;
  /** Fila del orden de lectura: 0 es lo más alto de la pared y 3 el piso (RF-34). */
  row: number;
  /** Lugar en la escena, en unidades del SVG de la habitación (100 por alto de pantalla). */
  rect: Rect;
}

export type RoomObject = RoomObjectBase &
  (
    | { kind: 'story'; pages: readonly Localized[]; memory?: MemoryId }
    /** Una página y una zona del estante por consola, en orden (RF-36). */
    | { kind: 'consoles'; pages: readonly Localized[]; slots: readonly Rect[] }
    /** Elegirla vuelve al menú (RF-38). */
    | { kind: 'tv' }
    | { kind: 'pet'; sound: PetSound }
  );

/** Lo que entra en la caja de diálogo sin scroll, en las dos carcasas. */
export const MAX_PAGE_CHARS = 160;

/** Las páginas del diálogo de un objeto; la tele y las mascotas no tienen. */
export function pagesOf(object: RoomObject): readonly Localized[] {
  return object.kind === 'story' || object.kind === 'consoles' ? object.pages : [];
}

/** Las consolas del estante: 22 × 32 unidades cada una, con 4 de separación. */
const CONSOLE_SLOTS: readonly Rect[] = [0, 1, 2, 3, 4].map((i) => ({
  x: 192 + i * 26,
  y: -16,
  width: 22,
  height: 32
}));

// Textos nuevos escritos por Claude a partir de lo que contó Franco; los revisa en T40.
// Las historias del portfolio anterior (póster, trofeos, globo y oso) se migraron con
// los errores de tipeo corregidos.
// Cada rectángulo mide lo mismo que su dibujo en room-sprites.ts (por PIXEL_UNITS). El piso
// empieza en y = 175: lo que está contra la pared apoya ahí, y lo de adelante, más abajo.
export const ROOM_OBJECTS: readonly RoomObject[] = [
  {
    id: 'window',
    name: { es: 'Ventana a Boedo', en: 'Window onto Boedo' },
    row: 0,
    rect: { x: -226, y: -126, width: 80, height: 70 },
    kind: 'story',
    pages: [
      {
        es: 'Boedo es mi barrio y el lugar de mi corazón.',
        en: 'Boedo is my neighborhood and the place closest to my heart.'
      },
      {
        es: 'Ya soy socio de San Lorenzo, y mi sueño es festejar algún día en Boedo con la cancha llena. Espero que sea pronto.',
        en: 'I’m already a San Lorenzo member, and my dream is to celebrate in Boedo someday with a packed stadium. I hope it’s soon.'
      }
    ]
  },
  {
    id: 'flag',
    name: { es: 'Bandera argentina', en: 'Argentine flag' },
    row: 0,
    rect: { x: -130, y: -120, width: 60, height: 40 },
    kind: 'story',
    pages: [
      {
        es: 'Estoy muy orgulloso de mi país: para mí es el más lindo del mundo, y amo todo lo que sea argentino.',
        en: 'I’m very proud of my country: to me it’s the most beautiful in the world, and I love everything Argentine.'
      },
      {
        es: 'Miro cualquier deporte donde haya un argentino y apoyo a cada artista que nos represente. Es un amor como de hijo a madre.',
        en: 'I watch any sport with an Argentine in it and support every artist who represents us. It’s a love like a child’s for their mother.'
      }
    ]
  },
  {
    id: 'favaloro',
    name: { es: 'Retrato de Favaloro', en: 'Portrait of Favaloro' },
    row: 0,
    rect: { x: 190, y: -124, width: 40, height: 52 },
    kind: 'story',
    // RF-40: su legado y sus valores, sin las circunstancias de su muerte.
    pages: [
      {
        es: 'René Favaloro fue el cirujano argentino que desarrolló el bypass coronario, una técnica que hoy salva vidas en todo el mundo.',
        en: 'René Favaloro was the Argentine surgeon who developed coronary bypass surgery, a technique that saves lives all over the world today.'
      },
      {
        es: 'Me cautivan su genialidad y su simpleza para hablar y defender los derechos del pueblo. Es un prócer que me identifica.',
        en: 'I’m captivated by his brilliance and by how simply he spoke and stood up for people’s rights. He’s a national hero I identify with.'
      },
      {
        es: 'Su ética, su humildad y su conciencia social son mis estandartes de vida.',
        en: 'His ethics, his humility and his social conscience are the standards I live by.'
      }
    ]
  },
  {
    id: 'poster',
    name: { es: 'Póster de San Lorenzo', en: 'San Lorenzo poster' },
    row: 0,
    rect: { x: 290, y: -126, width: 50, height: 70 },
    kind: 'story',
    memory: 'stands',
    pages: [
      {
        es: 'Desde que mi abuela me puso la casaca del Ciclón, los colores traspasaron mi piel y tiñeron mi corazón. Mi canción favorita: Pasaron 100 años.',
        en: 'Ever since my grandmother put the “Ciclón” jersey on me, the colors went through my skin and dyed my heart. My favorite song: Pasaron 100 años.'
      }
    ]
  },
  {
    id: 'trophies',
    name: { es: 'Estante de trofeos', en: 'Trophy shelf' },
    row: 1,
    rect: { x: -216, y: -24, width: 90, height: 44 },
    kind: 'story',
    memory: 'team',
    pages: [
      {
        es: 'Competí en League of Legends y, junto a mi equipo, fuimos campeones de los JJBB en 2021 y 2023. En 2024 llegamos juntos a las finales de la BA Gaming.',
        en: 'I competed in League of Legends and, with my team, we won the JJBB in 2021 and 2023. In 2024 we reached the BA Gaming finals together.'
      },
      {
        es: 'Gané jugando de support y de top. Me identifico mucho con Camille: con ella ayudé a mi equipo a conseguir la victoria en la final.',
        en: 'I won playing support and top. Camille means a lot to me: with her I helped my team win the final.'
      }
    ]
  },
  {
    id: 'tv',
    name: { es: 'Televisor', en: 'TV' },
    row: 1,
    // El cuerpo del televisor, igual que el botón de encendido de la carcasa.
    rect: { x: -20, y: -18, width: 173.33, height: 136 },
    kind: 'tv'
  },
  {
    id: 'consoles',
    name: { es: 'Estante de consolas', en: 'Console shelf' },
    row: 1,
    rect: { x: 190, y: -20, width: 130, height: 40 },
    kind: 'consoles',
    slots: CONSOLE_SLOTS,
    pages: [
      {
        es: 'Family: donde empezó todo. El juego que marcó esa etapa fue Balloon Fight, uno de mis retro favoritos.',
        en: 'Family: where it all began. The game of that era was Balloon Fight, one of my favorite retro games.'
      },
      {
        es: 'Sega: la etapa de Sunset Riders, mi otro retro favorito.',
        en: 'Sega: the Sunset Riders era, my other favorite retro game.'
      },
      {
        es: 'PS2: GTA San Andreas, uno de los juegos que más marcaron mi vida.',
        en: 'PS2: GTA San Andreas, one of the games that shaped my life the most.'
      },
      {
        es: 'PS3: Bioshock, mi juego y mi saga favoritos.',
        en: 'PS3: Bioshock, my favorite game and series.'
      },
      {
        es: 'PC: Minecraft. Por él empecé a preguntarme cómo funcionaban las cosas en una computadora, y así llegué a programar.',
        en: 'PC: Minecraft. It made me wonder how things worked inside a computer, and that’s how I got into coding.'
      }
    ]
  },
  {
    id: 'pc',
    name: { es: 'PC', en: 'PC' },
    row: 2,
    rect: { x: -226, y: 80, width: 64, height: 60 },
    kind: 'story',
    pages: [
      {
        es: 'Empecé a programar a los 15, por curiosidad: quería entender cómo funcionaban las cosas en una computadora, sobre todo juegos como Minecraft.',
        en: 'I started coding at 15, out of curiosity: I wanted to understand how things worked inside a computer, especially games like Minecraft.'
      },
      {
        es: 'Por eso elegí Java. Mi primer programa fue un Snake hecho en Python. Aprendí solo y hoy estoy en 4.º año de Ingeniería en Informática.',
        en: 'That’s why I chose Java. My first program was a Snake game in Python. I’m self-taught, and today I’m in my 4th year of Computer Engineering.'
      },
      {
        es: 'Soy desarrollador con especial interés en el backend, con experiencia en Java y Spring, y conocimientos de Angular, React y Bootstrap.',
        en: 'I’m a developer with a special interest in the backend, with experience in Java and Spring, and knowledge of Angular, React and Bootstrap.'
      },
      {
        es: 'Me apasiona crear soluciones eficientes y bien estructuradas, y sigo buscando herramientas y desafíos nuevos para mejorar.',
        en: 'I’m passionate about building efficient, well-structured solutions, and I keep looking for new tools and challenges to improve.'
      }
    ]
  },
  {
    id: 'mate',
    name: { es: 'Mate y café', en: 'Mate and coffee' },
    row: 2,
    rect: { x: -152, y: 114, width: 36, height: 26 },
    kind: 'story',
    pages: [
      {
        es: '¿Mate o café? Los dos, según el humor del día.',
        en: 'Mate or coffee? Both, depending on my mood.'
      }
    ]
  },
  {
    id: 'recordPlayer',
    name: { es: 'Tocadiscos', en: 'Record player' },
    row: 2,
    // Con su mueble, apoyado en el piso.
    rect: { x: 190, y: 131, width: 60, height: 44 },
    kind: 'story',
    pages: [
      {
        es: 'Me gustan todos los géneros, pero con el que más me identifico es el rock argentino: de Charly García a los Redonditos de Ricota.',
        en: 'I like every genre, but the one I identify with most is Argentine rock: from Charly García to Los Redonditos de Ricota.'
      }
    ]
  },
  {
    id: 'globe',
    name: { es: 'Globo terráqueo', en: 'Globe' },
    row: 2,
    rect: { x: 280, y: 109, width: 40, height: 66 },
    kind: 'story',
    memory: 'languages',
    pages: [
      {
        es: 'Hablo español, inglés y portugués gracias a los videojuegos: la mayoría no venían traducidos y me perdía las historias.',
        en: 'I speak Spanish, English and Portuguese thanks to video games: most of them weren’t translated, and I was missing the stories.'
      },
      {
        es: 'Más tarde fui a un instituto y obtuve el First Certificate.',
        en: 'Later I attended an institute and earned the First Certificate.'
      },
      {
        es: 'También me encanta conocer la comida de otros países. Hasta ahora, mis favoritas son la japonesa y la brasileña.',
        en: 'I also love discovering food from other countries. So far, my favorites are Japanese and Brazilian.'
      }
    ]
  },
  {
    id: 'bear',
    name: { es: 'Oso de peluche', en: 'Teddy bear' },
    row: 3,
    rect: { x: -230, y: 196, width: 36, height: 42 },
    kind: 'story',
    memory: 'bear',
    pages: [
      {
        es: 'Me encantan los osos: me parecen animales increíbles y los admiro. Además, de niño mi película favorita fue Tierra de Osos.',
        en: 'I love bears: I find them incredible animals and I admire them. Also, as a kid my favorite movie was Brother Bear.'
      },
      {
        es: 'Face reveal: yes, I’m a bear.',
        en: 'Face reveal: yes, I’m a bear.'
      }
    ]
  },
  {
    id: 'pocho',
    name: { es: 'Pocho', en: 'Pocho' },
    row: 3,
    rect: { x: -176, y: 224, width: 22, height: 18 },
    kind: 'pet',
    sound: 'barkSmall'
  },
  {
    id: 'negra',
    name: { es: 'Negra', en: 'Negra' },
    row: 3,
    rect: { x: -144, y: 208, width: 42, height: 36 },
    kind: 'pet',
    sound: 'barkBig'
  },
  {
    id: 'ball',
    name: { es: 'Pelota de fútbol', en: 'Football' },
    row: 3,
    rect: { x: 222, y: 236, width: 18, height: 18 },
    kind: 'story',
    pages: [
      {
        es: 'Jugué y todavía juego al fútbol de vez en cuando. Mi puesto: el 9.',
        en: 'I played football and still do now and then. My position: number 9, up front.'
      }
    ]
  },
  {
    id: 'racket',
    name: { es: 'Raqueta de tenis', en: 'Tennis racket' },
    row: 3,
    rect: { x: 246, y: 226, width: 30, height: 28 },
    kind: 'story',
    pages: [
      {
        es: 'Jugaba al tenis y me sigue gustando, aunque hoy lo miro menos. Mi tenista favorito era Federer.',
        en: 'I used to play tennis and I still like it, though I watch it less these days. Federer was my favorite player.'
      }
    ]
  },
  {
    id: 'flaco',
    name: { es: 'Flaco', en: 'Flaco' },
    row: 3,
    rect: { x: 282, y: 214, width: 46, height: 36 },
    kind: 'pet',
    sound: 'barkMedium'
  },
  {
    id: 'nymeria',
    name: { es: 'Nymeria', en: 'Nymeria' },
    row: 3,
    rect: { x: 334, y: 220, width: 32, height: 30 },
    kind: 'pet',
    sound: 'meow'
  }
];
