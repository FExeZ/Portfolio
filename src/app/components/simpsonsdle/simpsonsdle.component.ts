import { Component, inject } from '@angular/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-simpsonsdle',
  standalone: true,
  imports: [ScrollRevealDirective],
  templateUrl: './simpsonsdle.component.html',
  styleUrls: ['./simpsonsdle.component.css']
})
export class SimpsonsdleComponent {
  t = inject(LanguageService).t;
}
