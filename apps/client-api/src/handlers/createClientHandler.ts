import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { factory } from '../ioc/ServiceFactory';
import type { CreateClientInput } from '../usecases/createClientUsecase';
import { schemaValidatorMiddleware } from '../middleware/schemaValidator';
import { createClientSchema } from '../schemas/createClient.schema';
import { mockJwtMiddleware } from '../middleware/mockJwt';

const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  // event.body ya está parseado (httpJsonBodyParser) y validado (schemaValidator).
  // El cast es seguro — el middleware garantiza que la forma del objeto es correcta.
  const client = event.body as unknown as CreateClientInput;
  await factory.createClientUsecase.execute(client);

  factory.logger.info('Client created', { name: client.name, email: client.email });

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Client created successfully' }),
  };
};

// Cadena de middlewares (se ejecutan en orden antes del handler):
// 1. httpJsonBodyParser()           → parsea el body string a objeto JS
// 2. mockJwtMiddleware()            → verifica Authorization header → 401 si falta o es inválido
// 3. schemaValidatorMiddleware()    → valida contra el JSON Schema → 400 si falla
// 4. cors()                        → agrega headers CORS a la respuesta
// 5. httpErrorHandler()            → captura errores no manejados → respuesta HTTP
export const handler = middy(baseHandler)
  .use(httpJsonBodyParser())
  .use(mockJwtMiddleware())
  .use(schemaValidatorMiddleware(createClientSchema))
  .use(cors())
  .use(httpErrorHandler());
