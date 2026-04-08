import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-counter-display',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <button (click)="decrement.emit()">-</button>
      <span>{{ count }}</span>
      <button (click)="increment.emit()">+</button>
      <button (click)="reset.emit()">Reset</button>
    </div>
  `
})
export class CounterDisplayComponent {
  @Input() count: number = 0;
  @Output() increment = new EventEmitter<void>();
  @Output() decrement = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
}
