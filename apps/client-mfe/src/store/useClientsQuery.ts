// Naming convention: *Query — patrón CQRS-light
// Este hook es la mitad de lectura (Query) del patrón CQRS aplicado en el frontend.
// Solo obtiene y mantiene el estado de la lista de clientes — no modifica datos.
// La mitad de escritura (Command) vive en useClientsCommand.ts.
import { useState, useEffect } from 'react';
import type { Client } from '../types/client.types';
import { clientsArraySchema } from '../schemas/client.schema';

const API_URL = `${import.meta.env.VITE_CLIENT_API_URL}/clients`;

export function useClientsQuery() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = () => {
    fetch(API_URL)
      .then(async res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const raw = await res.json();
        const result = clientsArraySchema.safeParse(raw);
        if (!result.success) throw new Error('Invalid API response');
        return result.data;
      })
      .then(data => setClients(data))
      .catch(err => setError(err instanceof Error ? err.message : 'Error desconocido'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchClients();
  }, []);

  const selectClient = (id: string) => setSelectedId(id);

  return { clients, selectedId, selectClient, refetch: fetchClients, loading, error };
}
