import { TodosAccess } from './todosAccess'
import { generatePresignedUrl, getAttachmentUrl } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

import { createLogger } from '../utils/logger'
const logger = createLogger("todos")

// DONE: Implement businessLogic
const todoAccess = new TodosAccess();

export async function getTodo(userId: string): Promise<TodoItem[]> {
    logger.info(`getTodo with user ${userId}`)
    return todoAccess.getTodo(userId);
}

export async function createTodo(
    userId: string,
    createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {

    logger.info(`createTodo ${createTodoRequest} with user ${userId}`)

    return await todoAccess.createTodo({
        userId: userId,
        todoId: uuid.v4(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: new Date().toISOString(),
        done: false,
    })
}

export async function updateTodo(
    userId: string,
    todoId: string,
    updatedTodo: UpdateTodoRequest
): Promise<void> {

    logger.info(`updateTodo ${updatedTodo} having todoId=${todoId} with user ${userId}`)

    return todoAccess.updateTodo(userId, todoId, updatedTodo)
}

export async function deleteTodo(
    userId: string,
    todoId: string
): Promise<void> {

    logger.info(`deleteTodo todoId=${todoId} with user ${userId}`)

    return todoAccess.deleteTodo(userId, todoId);
}

export async function createAttachmentPresignedUrl(
    userId: string,
    todoId: string
): Promise<string> {

    logger.info(`createAttachmentPresignedUrl todoId=${todoId} with user ${userId}`)

    const imageId = uuid.v4()
    await todoAccess.updateTodoAttachmentUrl(userId, todoId, getAttachmentUrl(imageId))

    return generatePresignedUrl(imageId)
}