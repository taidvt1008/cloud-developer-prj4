import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils'
import { createAttachmentPresignedUrl } from '../../businessLogic/todos'

import { createLogger } from '../../utils/logger'
const logger = createLogger("generateUploadUrl")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // DONE: Return a presigned URL to upload a file for a TODO item with the provided id

    //validate param todoId
    if (!todoId || todoId.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Invalid todo id ${todoId}`
        })
      }
    }

    try {
      const userId: string = getUserId(event)
      logger.info(`Creating AttachmentPresignedUrl of user ${userId} with todoId=${todoId}`)

      const uploadUrl: string = await createAttachmentPresignedUrl(userId, todoId)

      return {
        statusCode: 200,
        body: JSON.stringify({ uploadUrl })
      }

    } catch (err) {

      logger.error(`Create AttachmentPresignedUrl for todoId=${todoId} failure: ${err}`)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Create AttachmentPresignedUrl for todoId=${todoId} failure: ${err}`
        })
      }

    }
  }
)

handler
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))