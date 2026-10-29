import type { Localized } from '../../i18n/translations';

export interface Skill {
  name: string;
  /** Abreviatura de la insignia pixelada: reemplaza al logo de la marca (RNF-2). */
  short: string;
  description: Localized;
}

export interface SkillCategory {
  title: Localized;
  /** Fondo de las insignias de la categoría; el texto va en blanco. */
  color: string;
  skills: readonly Skill[];
}

export interface Certification {
  title: Localized;
  issuer: string;
}

// Descripciones escritas por Claude y aprobadas por Franco en T30.
export const SKILL_CATEGORIES: readonly SkillCategory[] = [
  {
    title: { es: 'Backend', en: 'Backend' },
    color: '#c42b2b',
    skills: [
      {
        name: 'Java',
        short: 'JV',
        description: {
          es: 'Mi lenguaje principal. Minecraft me llevó a programar y Java fue el primero que elegí.',
          en: 'My main language. Minecraft got me into coding, and Java was the first language I chose.'
        }
      },
      {
        name: 'Spring Boot',
        short: 'SB',
        description: {
          es: 'Mi base para construir APIs y servicios backend en Java.',
          en: 'My go-to base for building APIs and backend services in Java.'
        }
      },
      {
        name: 'Spring Data',
        short: 'SD',
        description: {
          es: 'Acceso a datos con repositorios de JPA, sin escribir SQL repetitivo.',
          en: 'Data access through JPA repositories, without repetitive SQL.'
        }
      },
      {
        name: 'REST',
        short: 'RS',
        description: {
          es: 'Diseño y consumo de APIs REST: endpoints claros, códigos de estado y JSON.',
          en: 'Designing and consuming REST APIs: clear endpoints, status codes and JSON.'
        }
      },
      {
        name: 'SOAP',
        short: 'SP',
        description: {
          es: 'Integración con servicios SOAP y contratos WSDL, todavía comunes en sistemas empresariales.',
          en: 'Integration with SOAP services and WSDL contracts, still common in enterprise systems.'
        }
      }
    ]
  },
  {
    title: { es: 'Frontend', en: 'Frontend' },
    color: '#1d3fd1',
    skills: [
      {
        name: 'Angular',
        short: 'NG',
        description: {
          es: 'El framework con el que está hecha esta consola, con componentes y signals.',
          en: 'The framework this console is built with, using components and signals.'
        }
      },
      {
        name: 'React',
        short: 'RE',
        description: {
          es: 'Interfaces con componentes y hooks; lo usé en GetTaskedApp y COPLAC.',
          en: 'Component and hook based interfaces; I used it in GetTaskedApp and COPLAC.'
        }
      },
      {
        name: 'JavaScript',
        short: 'JS',
        description: {
          es: 'El lenguaje de la web, para darle comportamiento a cada página.',
          en: 'The language of the web, for giving every page its behavior.'
        }
      },
      {
        name: 'HTML5',
        short: 'H5',
        description: {
          es: 'La estructura de cada página, con etiquetas semánticas y accesibles.',
          en: 'The structure of every page, with semantic, accessible markup.'
        }
      },
      {
        name: 'CSS3',
        short: 'C3',
        description: {
          es: 'Estilos, layouts con grid y flexbox, y animaciones como el zoom de esta tele.',
          en: 'Styles, grid and flexbox layouts, and animations like this TV’s zoom.'
        }
      }
    ]
  },
  {
    title: { es: 'Bases de datos', en: 'Databases' },
    color: '#0f7a55',
    skills: [
      {
        name: 'Oracle SQL',
        short: 'OR',
        description: {
          es: 'Consultas y modelado de datos sobre bases Oracle.',
          en: 'Queries and data modeling on Oracle databases.'
        }
      },
      {
        name: 'PostgreSQL',
        short: 'PG',
        description: {
          es: 'Mi base relacional de cabecera: la uso en Simpsonsdle y en mis APIs.',
          en: 'My go-to relational database: I use it in Simpsonsdle and in my APIs.'
        }
      },
      {
        name: 'MySQL',
        short: 'MY',
        description: {
          es: 'Donde aprendí bases relacionales; mi primer CRUD la usaba.',
          en: 'Where I learned relational databases; my first CRUD used it.'
        }
      },
      {
        name: 'MongoDB',
        short: 'MG',
        description: {
          es: 'Base de datos de documentos, para datos flexibles en formato JSON.',
          en: 'Document database, for flexible data in JSON format.'
        }
      }
    ]
  },
  {
    title: { es: 'DevOps & Cloud', en: 'DevOps & Cloud' },
    color: '#6a3fb5',
    skills: [
      {
        name: 'Docker',
        short: 'DK',
        description: {
          es: 'Contenedores para que cada proyecto corra igual en cualquier máquina.',
          en: 'Containers so every project runs the same on any machine.'
        }
      },
      {
        name: 'Kubernetes',
        short: 'K8',
        description: {
          es: 'Orquestación de contenedores: despliegues, réplicas y servicios.',
          en: 'Container orchestration: deployments, replicas and services.'
        }
      },
      {
        name: 'Tomcat',
        short: 'TC',
        description: {
          es: 'Servidor de aplicaciones Java para desplegar aplicaciones web.',
          en: 'Java application server for deploying web apps.'
        }
      },
      {
        name: 'AWS',
        short: 'AW',
        description: {
          es: 'Servicios en la nube de Amazon para alojar y escalar aplicaciones.',
          en: 'Amazon’s cloud services for hosting and scaling apps.'
        }
      },
      {
        name: 'Azure',
        short: 'AZ',
        description: {
          es: 'La nube de Microsoft, para servicios y despliegues.',
          en: 'Microsoft’s cloud, for services and deployments.'
        }
      }
    ]
  },
  {
    title: { es: 'Herramientas', en: 'Tools' },
    color: '#8a5a14',
    skills: [
      {
        name: 'Git',
        short: 'GT',
        description: {
          es: 'Control de versiones en todos mis proyectos, con ramas y pull requests.',
          en: 'Version control in all my projects, with branches and pull requests.'
        }
      },
      {
        name: 'Postman',
        short: 'PM',
        description: {
          es: 'Para probar APIs: lo usé en APIRest para cada endpoint.',
          en: 'For testing APIs: I used it in APIRest for every endpoint.'
        }
      },
      {
        name: 'Jira',
        short: 'JR',
        description: {
          es: 'Seguimiento de tareas y sprints en equipos ágiles.',
          en: 'Task and sprint tracking in agile teams.'
        }
      },
      {
        name: 'Oracle BPM',
        short: 'BP',
        description: {
          es: 'Modelado y automatización de procesos de negocio.',
          en: 'Business process modeling and automation.'
        }
      }
    ]
  },
  {
    title: { es: 'Otros lenguajes', en: 'Other languages' },
    color: '#3a3a46',
    skills: [
      {
        name: 'Python',
        short: 'PY',
        description: {
          es: 'Mi primer programa fue un Snake hecho en Python.',
          en: 'My first program was a Snake game written in Python.'
        }
      },
      {
        name: 'Go',
        short: 'GO',
        description: {
          es: 'Un lenguaje simple y rápido para servicios concurrentes.',
          en: 'A simple, fast language for concurrent services.'
        }
      }
    ]
  }
];

export const CERTIFICATIONS: readonly Certification[] = [
  {
    title: { es: 'Bases de Datos Relacionales (MySQL)', en: 'Relational Databases (MySQL)' },
    issuer: 'TodoCode Academy'
  },
  {
    title: { es: 'Introducción a Git y GitHub', en: 'Introduction to Git & GitHub' },
    issuer: 'TodoCode Academy'
  },
  {
    title: {
      es: 'EF SET Certificate · English C1 Advanced',
      en: 'EF SET Certificate · English C1 Advanced'
    },
    issuer: 'EF Standard English Test'
  },
  {
    title: { es: 'Cambridge English B2 First', en: 'Cambridge English B2 First' },
    issuer: 'Instituto Leicester'
  }
];
