import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuestionsContainerComponent } from './questions/questions-container/questions-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, QuestionsContainerComponent],
  template: `<questions-container></questions-container><router-outlet></router-outlet>`,
  styleUrl: './app.sass'
})
export class App {}
