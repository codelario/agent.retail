import { useAuthToken } from '@learning/auth';
import { ClientCard } from '../components/ClientCard/ClientCard';
import { CreateClientForm } from '../components/CreateClientForm/CreateClientForm';
import { useClientsQuery } from '../store/useClientsQuery';
import type { ClientActionEvent, UserRole } from '../types/client.types';
import { logger } from '@learning/logger';

const VALID_ROLES: UserRole[] = ['admin', 'viewer', 'editor'];

interface ClientContainerProps {
  userRole: UserRole;
  onClientAction?: (event: ClientActionEvent) => void;
}

export function ClientContainer({ userRole, onClientAction }: ClientContainerProps) {
  const { clients, selectClient, loading, error, refetch } = useClientsQuery();
  const authToken = useAuthToken();

  if (userRole && !VALID_ROLES.includes(userRole)) {
    logger.warn(`[client-mfe] userRole inválido: "${userRole}"`);
    return null;
  }

  const handleAction = (clientId: string, type: ClientActionEvent['type']) => {
    selectClient(clientId);

    const event: ClientActionEvent = { type, clientId, userRole };

    window.dispatchEvent(
      new CustomEvent('learning.client-action', { detail: event, bubbles: true })
    );

    onClientAction?.(event);
  };

  if (loading) return <p>Cargando clientes...</p>;
  if (error) return <p>Error: {error}. ¿Está corriendo la API en localhost:3010?</p>;

  return (
    <div>
      <h2>Client List — Role: {userRole}</h2>
      <p>Token recibido: {authToken ?? 'esperando...'}</p>
      {clients.map(client => (
        <ClientCard
          key={client.id}
          client={client}
          userRole={userRole}
          onAction={(type) => handleAction(client.id, type)}
        />
      ))}
      <CreateClientForm onSuccess={() => refetch()} authToken={authToken} />
    </div>
  );
}
