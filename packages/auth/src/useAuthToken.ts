import { useState, useEffect } from 'react';

/**
 * Hook reutilizable para recibir el auth token del Shell via CustomEvent handshake.
 *
 * Patrón:
 * 1. Registra listener para 'learning.auth-ready' (el Shell responderá con el token)
 * 2. Despacha 'learning.client-ready' para señalizar al Shell que estamos listos
 * 3. El Shell responde sincrónicamente → token recibido
 *
 * IMPORTANTE: el orden registro → dispatch es crítico porque CustomEvent es síncrono.
 * Si despachás antes de registrar el listener, el token se pierde.
 */
export function useAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const { token } = (e as CustomEvent<{ token: string }>).detail;
      setToken(token);
    };

    // 1. Primero registrar — después despachar
    window.addEventListener('learning.auth-ready', handler);
    window.dispatchEvent(new CustomEvent('learning.client-ready'));

    return () => window.removeEventListener('learning.auth-ready', handler);
  }, []);

  return token;
}
