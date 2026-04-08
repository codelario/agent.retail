import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { factory } from '../ioc/ServiceFactory';

const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const location_id = event.queryStringParameters?.['location_id'] ?? '';
  const date        = event.queryStringParameters?.['date'];

  if (!location_id) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing required query param: location_id' }),
    };
  }

  factory.logger.info('Fetching available slots', { location_id, date });
  const slots = await factory.getAvailableSlotsUsecase.execute(location_id, date);
  factory.logger.debug('Slots fetched', { count: slots.length });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slots),
  };
};

export const handler = middy(baseHandler)
  .use(cors())
  .use(httpErrorHandler());
