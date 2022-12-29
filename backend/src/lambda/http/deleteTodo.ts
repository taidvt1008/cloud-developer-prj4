import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils'
import { deleteTodo } from '../../businessLogic/todos'

import { createLogger } from '../../utils/logger'
const logger = createLogger("deleteTodo")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // DONE: Remove a TODO item by id

    //validate param todoId
    if (!todoId || todoId.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Invalid todoId`
        })
      }
    }

    try {

      const userId = getUserId(event);
      logger.info(`Deleting todo item of user ${userId} with todoId=${todoId}`)

      await deleteTodo(userId, todoId);

      return {
        statusCode: 200,
        body: null
      }

    } catch (err) {

      logger.error(`Delete todo item with todoId=${todoId} failure: ${err}`)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Delete todo item with todoId=${todoId} failure: ${err}`
        })
      }

    }
  }
)

handler
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
