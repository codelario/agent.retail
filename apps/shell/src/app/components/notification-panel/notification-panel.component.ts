import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit, inject, signal } from '@angular/core';
import { MfeLoaderService } from '../../services/mfe-loader/mfe-loader.service';
import { mfeRegistry } from '../../config/mfe-registry';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (mfeReady()) {
      <learning-notification message="Hola desde el MFE!" />
    } @else if (mfeError()) {
      <p>Notification MFE no disponible. ¿Está corriendo localhost:3002?</p>
    } @else {
      <p>Cargando notificaciones...</p>
    }
  `,
})
export class NotificationPanelComponent implements OnInit {
  private mfeLoader = inject(MfeLoaderService);

  mfeReady = signal(false);
  mfeError = signal(false);

  async ngOnInit() {
    try {
      await this.mfeLoader.loadMfeWithFallback(mfeRegistry['notificationMfe']);
      this.mfeReady.set(true);
    } catch {
      this.mfeError.set(true);
    }
  }
}
