import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { factory } from '../ioc/ServiceFactory'
import { schemaValidatorMiddleware } from '../middleware/schemaValidator'
import { aiRespondSchema } from '../schemas/aiRespond.schema'
import type { AiRespondInput } from '../usecases/aiRespondUsecase'

const baseHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const input = event.body as unknown as AiRespondInput

  factory.logger.info('AI respond request', { nodeName: input.nodeName, nodeId: input.nodeId })

  const result = await factory.aiRespondUsecase.execute(input)

  factory.logger.debug('AI respond result', { agentType: result.agentType, modelId: result.modelId })

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  }
}

export const handler = middy(baseHandler)
  .use(httpJsonBodyParser())
  // .use(schemaValidatorMiddleware(aiRespondSchema))
  .use(cors())
  .use(httpErrorHandler())
