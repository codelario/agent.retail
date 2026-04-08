import { Injectable } from '@angular/core';
import { MfeConfig } from '../../config/mfe-registry';

interface FederationContainer {
  init: (scope: unknown) => void | Promise<void>;
  get: (module: string) => Promise<() => Record<string, unknown>>;
}

@Injectable({ providedIn: 'root' })
export class MfeLoaderService {
  private loaded = new Set<string>();

  /**
   * Carga un MFE usando su configuración del registro.
   * Intenta la URL primary primero. Si falla el health check, intenta fallback.
   * Si ambas fallan, lanza un error — el componente lo captura y muestra el estado de error.
   */
  async loadMfeWithFallback(config: MfeConfig): Promise<void> {
    if (this.loaded.has(config.containerName)) return;

    const url = await this.resolveUrl(config);
    await this.loadFromUrl(url, config.containerName, config.exposedModule);
    this.loaded.add(config.containerName);
  }

  /**
   * Determina qué URL usar: primary si responde, fallback si no, error si ninguna.
   * El health check usa HEAD con timeout de 3 segundos — no descarga el archivo completo.
   */
  private async resolveUrl(config: MfeConfig): Promise<string> {
    const primaryOk = await this.healthCheck(config.primary);
    if (primaryOk) return config.primary;

    if (config.fallback) {
      const fallbackOk = await this.healthCheck(config.fallback);
      if (fallbackOk) return config.fallback;
    }

    throw new Error(
      `[MfeLoader] ${config.containerName} no disponible — primary y fallback fallaron`
    );
  }

  /**
   * Hace un HEAD request liviano a la URL del remoteEntry.
   * HEAD no descarga el body — solo verifica que el servidor responde y el archivo existe.
   * AbortSignal.timeout(3000) evita que el Shell quede bloqueado esperando un servidor caído.
   */
  private async healthCheck(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Ejecuta la carga real del MFE via Module Federation.
   * new Function() bypasses el análisis estático de Webpack/Vite —
   * el browser ejecuta el import() nativo en runtime, fuera del bundler.
   */
  private async loadFromUrl(url: string, containerName: string, exposedModule: string): Promise<void> {
    const container = await (new Function(`return import("${url}")`))() as FederationContainer;
    await container.init({});
    const factory = await container.get(exposedModule);
    factory();
  }
}
