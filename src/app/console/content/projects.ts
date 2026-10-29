import type { Localized } from '../../i18n/translations';

/** Ícono propio de la etiqueta de cada cartucho (RF-45); los dibuja `sprites.ts`. */
export type CartridgeIcon =
  | 'note'
  | 'checklist'
  | 'percent'
  | 'plug'
  | 'database'
  | 'pizza'
  | 'moon'
  | 'coin'
  | 'donut'
  | 'snake';

export interface Project {
  title: Localized;
  description: Localized;
  technologies: readonly string[];
  repoUrl: string;
  icon: CartridgeIcon;
}

/** Los 8 proyectos, en el orden de RF-44. Textos migrados sin cambios del portfolio anterior. */
export const PROJECTS: readonly Project[] = [
  {
    title: { es: 'MusicApp', en: 'MusicApp' },
    description: {
      es: 'Aplicación creada junto a colegas de la universidad como proyecto final de POO. Permite registrar usuarios con perfil de artista o entusiasta, subir música y descubrir artistas independientes.',
      en: 'App built with university colleagues as the final project for OOP. It lets users register with an artist or enthusiast profile, upload music and discover independent artists.'
    },
    technologies: ['Java 17', 'Spring', 'Hibernate', 'PostgreSQL', 'HTML', 'CSS', 'JavaScript', 'Bootstrap'],
    repoUrl: 'https://github.com/FExeZ/-poo2024-junin-grupo10',
    icon: 'note'
  },
  {
    title: { es: 'GetTaskedApp', en: 'GetTaskedApp' },
    description: {
      es: 'Aplicación de gestión de tareas enfocada en organización y asignación colectiva. Proyecto personal para poner en práctica React junto a un backend Spring.',
      en: 'Task management app focused on organization and collective assignment. A personal project to put React into practice alongside a Spring backend.'
    },
    technologies: ['Java 21', 'Spring', 'Hibernate', 'PostgreSQL', 'React', 'HTML', 'CSS', 'JavaScript'],
    repoUrl: 'https://github.com/FExeZ/GetTaskedApp',
    icon: 'checklist'
  },
  {
    title: { es: 'COPLAC', en: 'COPLAC' },
    description: {
      es: 'Aplicación Frontend creada para un desafío técnico. Simulador de comisiones escalable, con foco en creatividad y adaptación en tiempo limitado.',
      en: 'Frontend app built for a technical challenge. A scalable commission simulator, focused on creativity and adaptability within a limited timeframe.'
    },
    technologies: ['React', 'JavaScript', 'HTML', 'CSS'],
    repoUrl: 'https://github.com/FExeZ/simulador-comisiones',
    icon: 'percent'
  },
  {
    title: { es: 'APIRest', en: 'APIRest' },
    description: {
      es: 'Proyecto demostrativo de backend con inyección de dependencias, construcción de endpoints REST y testing con Postman.',
      en: 'A backend demo project featuring dependency injection, building REST endpoints and testing with Postman.'
    },
    technologies: ['Java 17', 'Spring', 'Hibernate', 'PostgreSQL'],
    repoUrl: 'https://github.com/FExeZ/APIRest',
    icon: 'plug'
  },
  {
    title: { es: 'CRUD Java MySQL', en: 'CRUD Java MySQL' },
    description: {
      es: 'Uno de mis primeros proyectos backend: un CRUD con interfaz Swing conectado a MySQL, aplicando los métodos GET, POST, PUT y DELETE.',
      en: 'One of my first backend projects: a CRUD with a Swing interface connected to MySQL, applying the GET, POST, PUT and DELETE methods.'
    },
    technologies: ['Java 8', 'Swing', 'MySQL'],
    repoUrl: 'https://github.com/FExeZ/CRUD_java_mySql',
    icon: 'database'
  },
  {
    title: { es: 'Maqueta Web Pizzería', en: 'Pizzeria Web Mockup' },
    description: {
      es: 'Proyecto final del curso de HTML, CSS y JavaScript en TodoCode. Sitio web de una pizzería ficticia con 4 páginas y sin lógica backend.',
      en: 'Final project of the HTML, CSS and JavaScript course at TodoCode. A website for a fictional pizzeria with 4 pages and no backend logic.'
    },
    technologies: ['HTML', 'CSS', 'JavaScript'],
    repoUrl: 'https://github.com/FExeZ/Plantilla-HTML-CSS-JS',
    icon: 'pizza'
  },
  {
    title: { es: 'FaseLunarApp', en: 'FaseLunarApp' },
    description: {
      es: 'Aplicación Java Swing que determina la fase lunar según la fecha de nacimiento del usuario. Ejecutable en cualquier entorno.',
      en: 'Java Swing application that determines the moon phase based on the user’s date of birth. Runnable in any environment.'
    },
    technologies: ['Java 11', 'Swing'],
    repoUrl: 'https://github.com/FExeZ/FaseLunarApp',
    icon: 'moon'
  },
  {
    title: { es: 'Conversor de Monedas', en: 'Currency Converter' },
    description: {
      es: 'Aplicación Java Swing para conversión de divisas. Enfocada en la aplicación de conceptos de POO.',
      en: 'Java Swing application for currency conversion. Focused on applying OOP concepts.'
    },
    technologies: ['Java 11', 'Swing'],
    repoUrl: 'https://github.com/FExeZ/ConvertidorDeMonedas',
    icon: 'coin'
  }
];

/** Presentación de Simpsonsdle (RF-47). Textos migrados sin el HTML que tenían. */
export const SIMPSONSDLE: {
  title: string;
  icon: CartridgeIcon;
  url: string;
  technologies: readonly string[];
  story: readonly Localized[];
} = {
  title: 'Simpsonsdle',
  icon: 'donut',
  url: 'https://www.simpsonsdle.com',
  technologies: ['Angular', 'Spring', 'PostgreSQL'],
  story: [
    {
      es: 'Soy el creador de Simpsonsdle, el juego diario de adivinar personajes de Los Simpson.',
      en: 'I am the creator of Simpsonsdle, the daily game of guessing characters from The Simpsons.'
    },
    {
      es: 'La idea nació de algo muy simple: estar siempre con amigos enganchados a los juegos diarios estilo "dle". Un día me pregunté si existía uno dedicado a la familia más famosa de la televisión… y no lo encontré. Así que decidí construirlo yo.',
      en: 'The idea was born from something very simple: always being with friends hooked on daily "dle"-style games. One day I wondered whether one existed dedicated to the most famous family on television… and I couldn’t find it. So I decided to build it myself.'
    },
    {
      es: 'Lo llevé de punta a punta —idea, diseño, desarrollo full stack, infraestructura y despliegue— hasta publicarlo con su propio dominio. Hoy Simpsonsdle está online y disponible para que cualquiera lo juegue.',
      en: 'I took it end to end —idea, design, full stack development, infrastructure and deployment— all the way to publishing it on its own domain. Today Simpsonsdle is online and available for anyone to play.'
    }
  ]
};

/** Cartucho secreto (RF-74): aparece en el estante al descubrirlo y abre Snake (RF-76). */
export const SECRET_CARTRIDGE: { title: Localized; icon: CartridgeIcon } = {
  title: { es: 'Mi primer programa', en: 'My first program' },
  icon: 'snake'
};
