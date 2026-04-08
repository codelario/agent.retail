import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { factory } from '../ioc/ServiceFactory';
import { schemaValidatorMiddleware } from '../middleware/schemaValidator';
import { lookupPatientSchema } from '../schemas/lookupPatient.schema';
import type { LookupPatientInput } from '../usecases/lookupPatientUsecase';

const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const input = event.body as unknown as LookupPatientInput;

  factory.logger.info('Looking up patient', { first_name: input.first_name, last_name: input.last_name });
  const patient = await factory.lookupPatientUsecase.execute(input);

  if (!patient) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Patient not found' }),
    };
  }

  factory.logger.debug('Patient found', { id: patient.id });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patient),
  };
};

// Middy chain:
// 1. httpJsonBodyParser()        → parsea body string a objeto JS
// 2. schemaValidatorMiddleware() → valida contra JSON Schema → 400 si falla
// 3. cors()                      → agrega headers CORS a la respuesta
// 4. httpErrorHandler()          → captura errores no manejados → respuesta HTTP
export const handler = middy(baseHandler)
  .use(httpJsonBodyParser())
  .use(schemaValidatorMiddleware(lookupPatientSchema))
  .use(cors())
  .use(httpErrorHandler());
