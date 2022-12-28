import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

import { createLogger } from '../utils/logger'
const logger = createLogger("todosAccess")

const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getTodo(userId: string): Promise<TodoItem[]> {
        logger.info(`getTodo with user ${userId}`)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        return result.Items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info(`createTodo with item: ${todo}`)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        return todo
    }

    async updateTodo(userId: string, todoId: string, todo: TodoUpdate): Promise<void> {
        logger.info(`updateTodo ${todo} having todoId=${todoId} with user ${userId}`)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":name": todo.name,
                ":dueDate": todo.dueDate,
                ":done": todo.done
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()
    }

    async deleteTodo(userId: string, todoId: string): Promise<void> {
        logger.info(`deleteTodo todoId=${todoId} with user ${userId}`)

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId
            }
        }).promise();
    }

    async updateTodoAttachmentUrl(userId: string, todoId: string, attachmentUrl: string): Promise<void> {
        logger.info(`updateTodoAttachmentUrl attachmentUrl=${attachmentUrl}, todoId=${todoId}, user ${userId}`)

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                "todoId": todoId,
                "userId": userId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl,
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()
    }
}
