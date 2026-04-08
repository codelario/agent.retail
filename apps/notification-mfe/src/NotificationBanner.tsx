interface NotificationBannerProps {
  message: string;
}

export function NotificationBanner({ message }: NotificationBannerProps) {
  return (
    <div style={{ padding: '16px', background: '#e8f5e9', border: '1px solid #27ae60', borderRadius: '4px' }}>
      <strong>Notificación:</strong> {message}
    </div>
  );
}
