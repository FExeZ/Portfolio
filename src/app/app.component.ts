import { Component } from '@angular/core';
import { ConsoleHostComponent } from './console/console-host.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [ConsoleHostComponent],
    templateUrl: './app.component.html'
})
export class AppComponent {}
