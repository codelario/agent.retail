import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { factory } from '../ioc/ServiceFactory';
import { schemaValidatorMiddleware } from '../middleware/schemaValidator';
import { bookAppointmentSchema } from '../schemas/bookAppointment.schema';
import type { BookAppointmentInput } from '../usecases/bookAppointmentUsecase';

const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const input = event.body as unknown as BookAppointmentInput;

  factory.logger.info('Booking appointment', { patient_id: input.patient_id, slot_id: input.slot_id });
  const appointment = await factory.bookAppointmentUsecase.execute(input);
  factory.logger.debug('Appointment booked', { id: appointment.id });

  return {
    statusCode: 201,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointment),
  };
};

export const handler = middy(baseHandler)
  .use(httpJsonBodyParser())
  .use(schemaValidatorMiddleware(bookAppointmentSchema))
  .use(cors())
  .use(httpErrorHandler());
