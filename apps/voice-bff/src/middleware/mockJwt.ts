export function mockJwtMiddleware() {
  return {
    before: async (request: {
      event: { headers?: Record<string, string>; user?: unknown };
      response?: unknown;
    }) => {
      const authHeader = request.event.headers?.['authorization'] ?? '';
      const token = authHeader.replace('Bearer ', '').trim();

      if (!token || !token.startsWith('mock-jwt-')) {
        request.response = {
          statusCode: 401,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Unauthorized — invalid or missing token' }),
        };
        return;
      }

      // En producción: jwt.verify(token, publicKey) via JWKS-RSA
      // Aquí simulamos el payload que el handler recibiría tras verificar la firma
      request.event.user = { id: 'mock-user-1', role: 'admin' };
    },
  };
}
