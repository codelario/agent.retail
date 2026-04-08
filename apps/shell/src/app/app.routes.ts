import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'clientes', pathMatch: 'full' },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./components/client-dashboard/client-dashboard.component')
        .then(m => m.ClientDashboardComponent),
  },
  {
    path: 'notificaciones',
    loadComponent: () =>
      import('./components/notification-panel/notification-panel.component')
        .then(m => m.NotificationPanelComponent),
  },
];
