import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NotificationBanner } from './NotificationBanner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationBanner message="Hola desde notification-mfe (modo standalone)" />
  </StrictMode>
);
