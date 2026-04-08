import r2wc from '@r2wc/react-to-web-component';
import { ClientContainer } from './containers/ClientContainer';

// La validación vive en ClientContainer — r2wc maneja el ciclo de vida sin intermediarios.
const ClientWebComponent = r2wc(ClientContainer, {
  props: {
    userRole: 'string',
  },
});

customElements.define('learning-client', ClientWebComponent);
