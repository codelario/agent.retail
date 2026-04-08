import { CUSTOM_ELEMENTS_SCHEMA, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MfeLoaderService } from '../../services/mfe-loader/mfe-loader.service';
import { mfeRegistry } from '../../config/mfe-registry';
import { logger } from '@learning/logger';
import { AuthService } from '../../services/auth/AuthService';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @if (mfeReady()) {
      <learning-client userRole="admin" />
    } @else if (mfeError()) {
      <p>MFE is not available. Is localhost:3001 running ?</p>
    } @else {
      <p>Loading MFE...</p>
    }
  `,
})
export class ClientDashboardComponent implements OnInit, OnDestroy {
  private mfeLoader = inject(MfeLoaderService);
  private authService = inject(AuthService);

  mfeReady = signal(false);
  mfeError = signal(false);

  private clientActionHandler = (e: Event) => {
    const { type, clientId } = (e as CustomEvent).detail;
    logger.info(`[Shell] Acción del MFE — tipo: ${type}, cliente: ${clientId}`);
  };

  async ngOnInit() {
    window.addEventListener('learning.client-ready', () => {
      const token = this.authService.token;
      window.dispatchEvent(
        new CustomEvent('learning.auth-ready', { detail: { token } })
      );
    });

    window.addEventListener('learning.client-action', this.clientActionHandler);

    try {
      await this.mfeLoader.loadMfeWithFallback(mfeRegistry['clientMfe']);
      this.mfeReady.set(true);
    } catch {
      this.mfeError.set(true);
    }
  }

  ngOnDestroy() {
    window.removeEventListener('learning.client-action', this.clientActionHandler);
  }
}
