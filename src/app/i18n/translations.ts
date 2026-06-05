export type Lang = 'es' | 'en';

/** Texto con sus dos variantes de idioma (para datos como proyectos, skills, etc.). */
export interface Localized {
  es: string;
  en: string;
}

/** Diccionario de textos estáticos de la interfaz. */
export interface Translations {
  nav: { home: string; about: string; projects: string; contact: string };
  hero: { greeting: string; subtitle: string; viewProjects: string; contactMe: string };
  about: {
    titlePre: string;
    titleHi: string;
    bio1: string;
    bio2: string;
    personalPre: string;
    personalHi: string;
    prev: string;
    next: string;
  };
  simpsonsdle: {
    titlePre: string;
    titleHi: string;
    live: string;
    lead: string;
    p1: string;
    p2: string;
    play: string;
  };
  skills: { titlePre: string; titleHi: string; certifications: string };
  projects: {
    titlePre: string;
    titleHi: string;
    filterAll: string;
    showingPre: string;
    showingMid: string;
    showingPost: string;
    role: string;
  };
  contact: { title: string; sub1: string; sub2: string };
  footer: { rights: string; builtWith: string };
}

export const TRANSLATIONS: Record<Lang, Translations> = {
  es: {
    nav: { home: 'Inicio', about: 'Sobre mí', projects: 'Proyectos', contact: 'Contacto' },
    hero: {
      greeting: '¡Hola! Soy',
      subtitle: 'Software Developer | Java, Spring & Web Technologies',
      viewProjects: 'Ver Proyectos',
      contactMe: 'Contactame'
    },
    about: {
      titlePre: 'Sobre',
      titleHi: 'Mí',
      bio1: 'Soy desarrollador con especial interés en el backend, con experiencia en Java y Spring, y conocimientos en tecnologías frontend como Angular, React y Bootstrap.',
      bio2: 'Me apasiona crear soluciones eficientes y bien estructuradas, priorizando el rendimiento y la escalabilidad. Actualmente curso la carrera de Ingeniería en Informática y sigo explorando nuevas herramientas y desafíos para mejorar mis habilidades en el desarrollo de software.',
      personalPre: 'Acerca de',
      personalHi: 'Mí',
      prev: '← Anterior',
      next: 'Siguiente →'
    },
    simpsonsdle: {
      titlePre: 'Mi proyecto',
      titleHi: 'destacado',
      live: 'En vivo',
      lead: 'Soy el <strong>creador de Simpsonsdle</strong>, el juego diario de adivinar personajes de Los Simpson.',
      p1: 'La idea nació de algo muy simple: estar siempre con amigos enganchados a los juegos diarios estilo <em>"dle"</em>. Un día me pregunté si existía uno dedicado a la familia más famosa de la televisión… y no lo encontré. Así que decidí construirlo yo.',
      p2: 'Lo llevé de punta a punta —idea, diseño, desarrollo full stack, infraestructura y despliegue— hasta publicarlo con su propio dominio. Hoy Simpsonsdle está online y disponible para que cualquiera lo juegue.',
      play: 'Jugar'
    },
    skills: { titlePre: 'Mis', titleHi: 'Habilidades', certifications: 'Certificaciones' },
    projects: {
      titlePre: 'Mis',
      titleHi: 'Proyectos',
      filterAll: 'Todos',
      showingPre: 'Mostrando',
      showingMid: 'de',
      showingPost: 'proyectos',
      role: 'Rol:'
    },
    contact: {
      title: 'Contactame',
      sub1: '¿Tenés alguna pregunta o propuesta? ¡No dudes en escribirme!',
      sub2: 'Estoy siempre abierto a nuevas oportunidades y colaboraciones.'
    },
    footer: { rights: 'Todos los derechos reservados', builtWith: 'Desarrollado con Angular & CSS' }
  },
  en: {
    nav: { home: 'Home', about: 'About', projects: 'Projects', contact: 'Contact' },
    hero: {
      greeting: "Hi! I'm",
      subtitle: 'Software Developer | Java, Spring & Web Technologies',
      viewProjects: 'View Projects',
      contactMe: 'Contact Me'
    },
    about: {
      titlePre: 'About',
      titleHi: 'Me',
      bio1: 'I am a developer with a special interest in the backend, with experience in Java and Spring, and knowledge of frontend technologies such as Angular, React and Bootstrap.',
      bio2: "I'm passionate about building efficient, well-structured solutions, prioritizing performance and scalability. I'm currently studying Computer Engineering and keep exploring new tools and challenges to sharpen my software development skills.",
      personalPre: 'More about',
      personalHi: 'me',
      prev: '← Previous',
      next: 'Next →'
    },
    simpsonsdle: {
      titlePre: 'My featured',
      titleHi: 'project',
      live: 'Live',
      lead: 'I am the <strong>creator of Simpsonsdle</strong>, the daily game of guessing characters from The Simpsons.',
      p1: 'The idea was born from something very simple: always being with friends hooked on daily <em>"dle"</em>-style games. One day I wondered whether one existed dedicated to the most famous family on television… and I couldn\'t find it. So I decided to build it myself.',
      p2: 'I took it end to end —idea, design, full stack development, infrastructure and deployment— all the way to publishing it on its own domain. Today Simpsonsdle is online and available for anyone to play.',
      play: 'Play'
    },
    skills: { titlePre: 'My', titleHi: 'Skills', certifications: 'Certifications' },
    projects: {
      titlePre: 'My',
      titleHi: 'Projects',
      filterAll: 'All',
      showingPre: 'Showing',
      showingMid: 'of',
      showingPost: 'projects',
      role: 'Role:'
    },
    contact: {
      title: 'Contact Me',
      sub1: "Got a question or a proposal? Don't hesitate to reach out!",
      sub2: "I'm always open to new opportunities and collaborations."
    },
    footer: { rights: 'All rights reserved', builtWith: 'Built with Angular & CSS' }
  }
};
