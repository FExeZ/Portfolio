import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { LanguageService } from '../../services/language.service';
import { Localized } from '../../i18n/translations';

interface Skill {
  name: string;
  icon?: string; // clase de Devicon (ej: 'devicon-java-plain colored')
}

interface SkillCategory {
  title: Localized;
  icon: string; // clase de Bootstrap Icons para el encabezado
  skills: Skill[];
}

interface Certification {
  title: Localized;
  issuer: string;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent {
  private ls = inject(LanguageService);
  t = this.ls.t;
  lang = this.ls.lang;

  categories: SkillCategory[] = [
    {
      title: { es: 'Backend', en: 'Backend' },
      icon: 'bi-hdd-network',
      skills: [
        { name: 'Java', icon: 'devicon-java-plain colored' },
        { name: 'Spring Boot', icon: 'devicon-spring-plain colored' },
        { name: 'Spring Data', icon: 'devicon-spring-plain colored' },
        { name: 'REST' },
        { name: 'SOAP' }
      ]
    },
    {
      title: { es: 'Frontend', en: 'Frontend' },
      icon: 'bi-window',
      skills: [
        { name: 'Angular', icon: 'devicon-angular-plain colored' },
        { name: 'React', icon: 'devicon-react-original colored' },
        { name: 'JavaScript', icon: 'devicon-javascript-plain colored' },
        { name: 'HTML5', icon: 'devicon-html5-plain colored' },
        { name: 'CSS3', icon: 'devicon-css3-plain colored' }
      ]
    },
    {
      title: { es: 'Bases de datos', en: 'Databases' },
      icon: 'bi-database',
      skills: [
        { name: 'Oracle SQL', icon: 'devicon-oracle-original colored' },
        { name: 'PostgreSQL', icon: 'devicon-postgresql-plain colored' },
        { name: 'MySQL', icon: 'devicon-mysql-plain colored' },
        { name: 'MongoDB', icon: 'devicon-mongodb-plain colored' }
      ]
    },
    {
      title: { es: 'DevOps & Cloud', en: 'DevOps & Cloud' },
      icon: 'bi-cloud',
      skills: [
        { name: 'Docker', icon: 'devicon-docker-plain colored' },
        { name: 'Kubernetes', icon: 'devicon-kubernetes-plain colored' },
        { name: 'Tomcat', icon: 'devicon-tomcat-line colored' },
        { name: 'AWS', icon: 'devicon-amazonwebservices-plain-wordmark colored' },
        { name: 'Azure', icon: 'devicon-azure-plain colored' }
      ]
    },
    {
      title: { es: 'Herramientas', en: 'Tools' },
      icon: 'bi-tools',
      skills: [
        { name: 'Git', icon: 'devicon-git-plain colored' },
        { name: 'Postman', icon: 'devicon-postman-plain colored' },
        { name: 'Jira', icon: 'devicon-jira-plain colored' },
        { name: 'Oracle BPM' },
        { name: 'Time Tracker' }
      ]
    },
    {
      title: { es: 'Otros lenguajes', en: 'Other languages' },
      icon: 'bi-code-slash',
      skills: [
        { name: 'Python', icon: 'devicon-python-plain colored' },
        { name: 'Go', icon: 'devicon-go-original-wordmark colored' }
      ]
    }
  ];

  certifications: Certification[] = [
    {
      title: { es: 'Bases de Datos Relacionales (MySQL)', en: 'Relational Databases (MySQL)' },
      issuer: 'TodoCode Academy'
    },
    {
      title: { es: 'Introducción a Git y GitHub', en: 'Introduction to Git & GitHub' },
      issuer: 'TodoCode Academy'
    },
    {
      title: { es: 'EF SET Certificate · English C1 Advanced', en: 'EF SET Certificate · English C1 Advanced' },
      issuer: 'EF Standard English Test'
    },
    {
      title: { es: 'Cambridge English B2 First', en: 'Cambridge English B2 First' },
      issuer: 'Instituto Leicester'
    }
  ];
}
