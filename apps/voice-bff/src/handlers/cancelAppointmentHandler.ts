import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { factory } from '../ioc/ServiceFactory';

const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const appointmentId = event.pathParameters?.['id'] ?? '';

  if (!appointmentId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing appointment id in path' }),
    };
  }

  factory.logger.info('Cancelling appointment', { appointmentId });
  await factory.cancelAppointmentUsecase.execute(appointmentId);
  factory.logger.debug('Appointment cancelled', { appointmentId });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Appointment cancelled successfully' }),
  };
};

export const handler = middy(baseHandler)
  .use(cors())
  .use(httpErrorHandler());
