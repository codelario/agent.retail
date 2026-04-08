import r2wc from '@r2wc/react-to-web-component';
import { NotificationBanner } from './NotificationBanner';

const NotificationWebComponent = r2wc(NotificationBanner, {
  props: {
    message: 'string',
  },
});

customElements.define('learning-notification', NotificationWebComponent);
