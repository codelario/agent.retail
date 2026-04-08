import type { Client, UserRole } from '../../types/client.types';

interface ClientCardProps {
  client: Client;
  userRole: UserRole;
  onAction: (type: 'select' | 'bookmark' | 'delete') => void;
}

export function ClientCard({ client, userRole, onAction }: ClientCardProps) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '0.5rem' }}>
      <h3>{client.name}</h3>
      <p>{client.email}</p>
      <span>Status: {client.status}</span>
      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => onAction('select')}>Select</button>
        <button onClick={() => onAction('bookmark')}>Bookmark</button>
        {userRole === 'admin' && (
          <button onClick={() => onAction('delete')}>Delete</button>
        )}
      </div>
    </div>
  );
}
