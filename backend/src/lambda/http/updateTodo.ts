import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils'
import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import { createLogger } from '../../utils/logger'
const logger = createLogger("updateTodo")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // DONE: Update a TODO item with the provided id using values in the "updatedTodo" object

    //validate param todoId
    if (!todoId || todoId.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Invalid todo id`
        })
      }
    }

    //validate all required fields: name, dueDate, done
    if (!updatedTodo.name || updatedTodo.name.trim() == "") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `todo.name is required`
        })
      }
    }
    if (!updatedTodo.dueDate || updatedTodo.dueDate.trim() == "") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `todo.dueDate is required`
        })
      }
    }
    if (updatedTodo.done === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `todo.done is required`
        })
      }
    }

    try {

      const userId = getUserId(event);
      logger.info(`${userId} is updating todo item id=${todoId} with new data: ${updatedTodo}`)

      await updateTodo(userId, todoId, updatedTodo)

      return {
        statusCode: 200,
        body: JSON.stringify({})
      }

    } catch (err) {

      logger.error(`Update item with todoId=${todoId} failure: ${err}`)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Update item with todoId=${todoId} failure: ${err}`
        })
      }

    }

  })

handler
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))