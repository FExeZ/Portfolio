import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

interface Project {
  title: string;
  description: string;
  role: string;
  technologies: string[];
  repoUrl: string;
  type: 'FullStack' | 'Frontend' | 'Backend' | 'Java';
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  projects: Project[] = [
    {
      title: 'MusicApp',
      description: 'Aplicación creada junto a colegas de la universidad como proyecto final de POO. Permite registrar usuarios con perfil de artista o entusiasta, subir música y descubrir artistas independientes.',
      role: 'Desarrollador FullStack',
      technologies: ['Java 17', 'Spring', 'Hibernate', 'PostgreSQL', 'HTML', 'CSS', 'JavaScript', 'Bootstrap'],
      repoUrl: 'https://github.com/FExeZ/-poo2024-junin-grupo10',
      type: 'FullStack'
    },
    {
      title: 'GetTaskedApp',
      description: 'Aplicación de gestión de tareas enfocada en organización y asignación colectiva. Proyecto personal para poner en práctica React junto a un backend Spring.',
      role: 'Desarrollador FullStack',
      technologies: ['Java 21', 'Spring', 'Hibernate', 'PostgreSQL', 'React', 'HTML', 'CSS', 'JavaScript'],
      repoUrl: 'https://github.com/FExeZ/GetTaskedApp',
      type: 'FullStack'
    },
    {
      title: 'COPLAC',
      description: 'Aplicación Frontend creada para un desafío técnico. Simulador de comisiones escalable, con foco en creatividad y adaptación en tiempo limitado.',
      role: 'Desarrollador Frontend',
      technologies: ['React', 'JavaScript', 'HTML', 'CSS'],
      repoUrl: 'https://github.com/FExeZ/simulador-comisiones',
      type: 'Frontend'
    },
    {
      title: 'APIRest',
      description: 'Proyecto demostrativo de backend con inyección de dependencias, construcción de endpoints REST y testing con Postman.',
      role: 'Desarrollador Backend',
      technologies: ['Java 17', 'Spring', 'Hibernate', 'PostgreSQL'],
      repoUrl: 'https://github.com/FExeZ/APIRest',
      type: 'Backend'
    },
    {
      title: 'CRUD Java MySQL',
      description: 'Uno de mis primeros proyectos backend: un CRUD con interfaz Swing conectado a MySQL, aplicando los métodos GET, POST, PUT y DELETE.',
      role: 'Desarrollador Backend',
      technologies: ['Java 8', 'Swing', 'MySQL'],
      repoUrl: 'https://github.com/FExeZ/CRUD_java_mySql',
      type: 'Backend'
    },
    {
      title: 'Maqueta Web Pizzería',
      description: 'Proyecto final del curso de HTML, CSS y JavaScript en TodoCode. Sitio web de una pizzería ficticia con 4 páginas y sin lógica backend.',
      role: 'Desarrollador Frontend',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      repoUrl: 'https://github.com/FExeZ/Plantilla-HTML-CSS-JS',
      type: 'Frontend'
    },
    {
      title: 'FaseLunarApp',
      description: 'Aplicación Java Swing que determina la fase lunar según la fecha de nacimiento del usuario. Ejecutable en cualquier entorno.',
      role: 'Desarrollador Java',
      technologies: ['Java 11', 'Swing'],
      repoUrl: 'https://github.com/FExeZ/FaseLunarApp',
      type: 'Java'
    },
    {
      title: 'Conversor de Monedas',
      description: 'Aplicación Java Swing para conversión de divisas. Enfocada en la aplicación de conceptos de POO.',
      role: 'Desarrollador Java',
      technologies: ['Java 11', 'Swing'],
      repoUrl: 'https://github.com/FExeZ/ConvertidorDeMonedas',
      type: 'Java'
    }
  ];

  badgeClass(type: string): string {
    return type.toLowerCase();
  }
}
