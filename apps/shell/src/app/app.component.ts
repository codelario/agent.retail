import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav>
      <a routerLink="/clientes">Clientes</a>
      &nbsp;|&nbsp;
      <a routerLink="/notificaciones">Notificaciones</a>
    </nav>
    <hr />
    <router-outlet />
  `,
})
export class AppComponent {}
