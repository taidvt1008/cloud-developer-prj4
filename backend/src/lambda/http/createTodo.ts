import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

import { createLogger } from '../../utils/logger'
const logger = createLogger("createTodo")

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // DONE: Implement creating a new TODO item

    //validate all required fields: name, dueDate
    if (!newTodo.name || newTodo.name.trim() == "") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `todo.name is required`
        })
      }
    }
    if (!newTodo.dueDate || newTodo.dueDate.trim() == "") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `todo.dueDate is required`
        })
      }
    }

    try {

      const userId = getUserId(event);
      logger.info(`${userId} is creating a new todo item: ${newTodo}`)

      const todoItem = await createTodo(userId, newTodo)
      return {
        statusCode: 201,
        body: JSON.stringify({ item: todoItem })
      }

    } catch (err) {

      logger.error(`Create new todo failure: ${err}`)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Create new todo failure: ${err}`
        })
      }

    }
  })

handler
  .use(httpErrorHandler())
  .use(cors({ credentials: true }))
