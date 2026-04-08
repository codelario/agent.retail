// Naming convention: *Command — patrón CQRS-light
// Este hook es la mitad de escritura (Command) del patrón CQRS aplicado en el frontend.
// Solo envía mutaciones al servidor — no lee ni mantiene el estado de la lista.
// La mitad de lectura (Query) vive en useClientsQuery.ts.
import { useState } from 'react';
import type { Client } from '../types/client.types';

const API_URL = `${import.meta.env.VITE_CLIENT_API_URL}/clients`;

export function useClientsCommand(onSuccess?: () => void) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createClient = (client: Omit<Client, 'id'>, authToken: string | null) => {
        setLoading(true);
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken || ''}`
            },
            body: JSON.stringify(client)
        })
            .then(res => {
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                onSuccess?.();
            })
            .catch(err => setError(err instanceof Error ? err.message : 'Error desconocido'))
            .finally(() => setLoading(false));
    }

    return { createClient, loading, error };
}
