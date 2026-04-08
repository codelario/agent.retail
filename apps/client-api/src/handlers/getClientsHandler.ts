import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { factory } from '../ioc/ServiceFactory';

const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const status = event.queryStringParameters?.['status'];

  factory.logger.info('Fetching clients', { status });
  const clients = await factory.getClientsUsecase.execute({ status });
  factory.logger.debug('Clients fetched', { count: clients.length });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clients),
  };
};

// Middy envuelve el handler con middlewares:
// cors()             → agrega headers CORS a cada respuesta
// httpErrorHandler() → captura errores y los formatea como respuesta HTTP
export const handler = middy(baseHandler)
  .use(cors())
  .use(httpErrorHandler());
