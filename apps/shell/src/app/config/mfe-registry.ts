export interface MfeConfig {
  /** URL principal del remoteEntry.js (dev local o CDN de la versión activa) */
  primary: string;
  /** URL de respaldo si primary falla. null = sin fallback configurado */
  fallback: string | null;
  /** Nombre del container de Module Federation (debe coincidir con el build del MFE) */
  containerName: string;
  /** Módulo expuesto en vite-plugin-federation (./bootstrap, ./App, etc.) */
  exposedModule: string;
}

/**
 * Registro central de MFEs del monorepo.
 *
 * Cada entrada define dónde vive un MFE y cuál es su URL de respaldo.
 * El Shell ya no tiene URLs hardcodeadas en los componentes — solo nombres.
 *
 * En producción, primary y fallback apuntarían a versiones en CDN:
 *   primary:  CDN con la versión más reciente (puede tener un bug)
 *   fallback: CDN con la última versión estable conocida
 */
export const mfeRegistry: Record<string, MfeConfig> = {
  clientMfe: {
    primary: 'http://localhost:3001/assets/remoteEntry.js',
    fallback: null, // en prod: 'https://cdn.example.com/client-mfe/stable/remoteEntry.js'
    containerName: 'clientMfe',
    exposedModule: './bootstrap',
  },
  notificationMfe: {
    primary: 'http://localhost:3002/assets/remoteEntry.js',
    fallback: null, // en prod: 'https://cdn.example.com/notification-mfe/stable/remoteEntry.js'
    containerName: 'notificationMfe',
    exposedModule: './bootstrap',
  },
};
