import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils';
import { getTodo as getTodoForUser } from '../../helpers/todos'

import { createLogger } from '../../utils/logger'
const logger = createLogger("getTodos")

// DONE: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event);
    logger.info(`Getting todo item of user ${userId}`)

    const todos = await getTodoForUser(userId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  })

handler
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
