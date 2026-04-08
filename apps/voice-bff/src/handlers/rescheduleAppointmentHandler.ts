import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { factory } from '../ioc/ServiceFactory';
import { schemaValidatorMiddleware } from '../middleware/schemaValidator';
import { rescheduleAppointmentSchema } from '../schemas/rescheduleAppointment.schema';
import type { RescheduleAppointmentInput } from '../usecases/rescheduleAppointmentUsecase';

const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const appointmentId = event.pathParameters?.['id'] ?? '';

  if (!appointmentId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing appointment id in path' }),
    };
  }

  const { new_slot_id } = event.body as unknown as RescheduleAppointmentInput;

  factory.logger.info('Rescheduling appointment', { appointmentId, new_slot_id });
  const appointment = await factory.rescheduleAppointmentUsecase.execute(appointmentId, new_slot_id);
  factory.logger.debug('Appointment rescheduled', { id: appointment.id, new_slot_id });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointment),
  };
};

export const handler = middy(baseHandler)
  .use(httpJsonBodyParser())
  .use(schemaValidatorMiddleware(rescheduleAppointmentSchema))
  .use(cors())
  .use(httpErrorHandler());
