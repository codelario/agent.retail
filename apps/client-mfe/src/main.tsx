import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClientContainer } from './containers/ClientContainer';
import './index.css';

// Entry point para desarrollo standalone (sin Shell Angular)
// En producción el Shell carga bootstrap-export.tsx via Module Federation
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClientContainer userRole="admin" />
  </StrictMode>
);
