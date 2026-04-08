import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CounterDisplayComponent } from '../counter-display/counter-display.component';
import { CounterService } from '../../services/counter/counter.service';

@Component({
  selector: 'app-counter-container',
  standalone: true,
  imports: [AsyncPipe, CounterDisplayComponent],
  template: `
    <app-counter-display
      [count]="(counterService.count$ | async) ?? 0"
      (increment)="counterService.increment()"
      (decrement)="counterService.decrement()"
      (reset)="counterService.reset()">
    </app-counter-display>
  `
})
export class CounterContainerComponent {
  protected counterService = inject(CounterService);
}
