import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent {
  skills = [
    'Java', 'Spring Boot', 'Hibernate', 'Angular', 'TypeScript',
    'React', 'JavaScript', 'HTML5', 'CSS3',
    'PostgreSQL', 'MySQL', 'Git', 'GitHub'
  ];
}
