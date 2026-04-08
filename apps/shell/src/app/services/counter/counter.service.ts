import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CounterService {
  private _count$ = new BehaviorSubject<number>(0);

  count$ = this._count$.asObservable();

  increment(): void {
    this._count$.next(this._count$.getValue() + 1);
  }

  decrement(): void {
    this._count$.next(this._count$.getValue() - 1);
  }

  reset(): void {
    this._count$.next(0);
  }
}
