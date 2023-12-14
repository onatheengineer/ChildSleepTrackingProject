import { Logger } from '@aws-lambda-powertools/logger'
import {
  DeleteCommand,
  type DeleteCommandInput,
  GetCommand,
  type GetCommandInput,
  type GetCommandOutput,
  PutCommand,
  type PutCommandInput,
  type PutCommandOutput,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb'
import { type UpdateCommandInput, type UpdateCommandOutput } from '@aws-sdk/lib-dynamodb/dist-types/commands'
import { type APIGatewayProxyEvent, type Handler } from 'aws-lambda'
import createError from 'http-errors'
import {
  type ResponseMutation,
  type WeightDDBDeleteGet,
  type WeightDDBPost,
  type WeightDDBUpdate,
  type WeightItem,
  type WeightItemPost,
  type WeightItemPut
} from 'schema'
import {
  apiGatewayProxyResult,
  type ApiGatewayProxyResultInterface,
  getDynamoDocClient,
  isValidDateISOString,
  isValidDateObject
} from 'utils'
import { v4 as uuidv4, validate } from 'uuid'

const logger = new Logger({
  logLevel: 'WARN',
  serviceName: 'PROJECT_healthtrack_weight'
})
const ddbDocClient = getDynamoDocClient()
const prefix: string = process.env.prefix !== undefined ? process.env.prefix : ''
const dynamoTable = `${prefix}-PROJECT_healthtracker_weight`

async function postWeight ({
  subject_id,
  refDate,
  weight,
  units,
  notes
}: WeightItemPost): Promise<ResponseMutation> {
  const uuidID: string = uuidv4()
  const paramsWeight: PutCommandInput & WeightDDBPost = {
    TableName: dynamoTable,
    Item: {
      weight_id: uuidID,
      createdAt: refDate,
      subject_id,
      weight,
      units,
      notes
    }
  }
  try {
    const response: PutCommandOutput = await ddbDocClient.send(new PutCommand(paramsWeight))
    return {
      status: true,
      message: `${JSON.stringify(
                response
            )} Successfully created weight Item, please take note of the weight_id uuid:: ${uuidID}.`
    }
  } catch (err: any) {
    logger.error('Error', err.stack)
    throw new createError.InternalServerError(err.message)
  }
}

async function updateWeight ({
  weight_id,
  refDate,
  weight,
  units,
  notes
}: WeightItemPut): Promise<ResponseMutation> {
  const paramsWeight: UpdateCommandInput & WeightDDBUpdate = {
    TableName: dynamoTable,
    Key: {
      weight_id
    },
    UpdateExpression: 'set createdAt = :d, weight = :w, units = :u, notes = :n',
    ExpressionAttributeValues: {
      ':d': refDate, ':w': weight, ':u': units, ':n': notes
    },
    ReturnValues: 'UPDATED_NEW'
  }
  try {
    const response: UpdateCommandOutput = await ddbDocClient.send(new UpdateCommand(paramsWeight))
    return {
      status: true,
      message: `Successfully Put Weight Item, please take note of the response: ${JSON.stringify(
                response
            )}`
    }
  } catch (err: any) {
    logger.error('Error', err.stack)
    throw new createError.InternalServerError(err.message)
  }
}

async function deleteWeight (
  weight_id: string): Promise<ResponseMutation> {
  const paramsWeight: DeleteCommandInput & WeightDDBDeleteGet = {
    TableName: dynamoTable,
    Key: {
      weight_id
    }
  }
  try {
    const response = await ddbDocClient.send(new DeleteCommand(paramsWeight))
    return {
      status: true,
      message: `Successfully Delete Weight Item, please take note of the response: ${JSON.stringify(
                response
            )}`
    }
  } catch (err: any) {
    logger.error('Error', err.stack)
    throw new createError.InternalServerError(err.message)
  }
}

async function getWeight (
  weight_id: string
): Promise<WeightItem> {
  const paramsWeight: GetCommandInput & WeightDDBDeleteGet = {
    TableName: dynamoTable,
    Key: {
      weight_id
    }
  }
  try {
    const response: GetCommandOutput = await ddbDocClient.send(
      new GetCommand(paramsWeight)
    )
    if (response.Item !== undefined) {
      return response.Item as WeightItem
    } else {
      throw new createError.BadRequest('Not All GET Weight Parameters Are Valid')
    }
  } catch (err: any) {
    logger.error('Error', err.stack)
    throw new createError.InternalServerError(err.message)
  }
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiGatewayProxyResultInterface> => {
  try {
    if (event.pathParameters === undefined) {
      throw new Error('No path parameter provided.')
    }
    if (event?.pathParameters?.subject === undefined) {
      throw new Error('No path subjectId provided.')
    }
    const subject_id: string = event.pathParameters.subject
    if (!validate(subject_id)) {
      throw new Error('The subject_id is not a valid uuidv4.')
    }
    if ((event.body === undefined) && event.requestContext.httpMethod !== 'GET') {
      throw new Error('No Body provided.')
    }
    if (
      (event.queryStringParameters === undefined) &&
            event.requestContext.httpMethod === 'GET'
    ) {
      throw new Error('No queryString provided.')
    }
    switch (event.requestContext.httpMethod) {
      case 'POST': {
        if (event?.body !== undefined && event?.body !== null) {
          const { refDate, weight, units, notes }: WeightItemPost = JSON.parse(event.body)
          let refDateCopy = new Date()
          if (refDate !== undefined) {
            if (!isValidDateISOString(refDate)) {
              throw new Error('Reference Date not in ISO format.')
            }
            refDateCopy = new Date(refDate)
          }
          if (!isValidDateObject(refDateCopy)) {
            throw new Error('Invalid date object.')
          }
          if (weight === undefined || weight <= 0) {
            throw new Error('Weight number is undefined or not being sent in correctly.')
          }
          if (units === undefined || (units !== 'lb' && units !== 'kg')) {
            throw new Error('Units are undefined or not being sent in correctly, please check permissible values.')
          }
          try {
            const postResult: ResponseMutation = await postWeight({
              subject_id,
              refDate: refDateCopy.toISOString(),
              weight,
              units,
              notes
            })
            return (apiGatewayProxyResult('201', JSON.stringify(postResult)))
          } catch (error: unknown) {
            throw new Error(`Failed Post Method::: ${JSON.stringify(error)}`)
          }
        } else {
          throw new Error('Malformed request for Post method, parameters may not be permissible values.')
        }
      }
      case 'PUT': {
        if (event?.body !== undefined && event?.body !== null) {
          const {
            weight_id,
            refDate,
            weight,
            units,
            notes
          }: WeightItemPut = JSON.parse(event.body)
          if (weight_id === undefined) {
            throw new Error('weight_id is undefined.')
          }
          if (!validate(weight_id)) {
            throw new Error('weight_id is not a valid uuidv4.')
          }
          let refDateCopy = new Date()
          if (refDate !== undefined) {
            if (!isValidDateISOString(refDate)) {
              throw new Error('Reference Date not in ISO format.')
            }
            refDateCopy = new Date(refDate)
          }
          if (!isValidDateObject(refDateCopy)) {
            throw new Error('Invalid date object.')
          }
          if (weight === undefined || weight <= 0) {
            throw new Error('Weight number is undefined or not being sent in correctly.')
          }
          if (units === undefined || (units !== 'lb' && units !== 'kg')) {
            throw new Error('Units are undefined or not being sent in correctly, please check permissible values.')
          }
          try {
            const updateResult: ResponseMutation = await updateWeight({
              weight_id,
              refDate,
              weight,
              units,
              notes
            })
            return (apiGatewayProxyResult('201', JSON.stringify(updateResult)))
          } catch (error: unknown) {
            throw new Error(`Failed Put Method::: ${JSON.stringify(error)}`)
          }
        } else {
          throw new Error('Failed body in PUT method.')
        }
      }
      case 'DELETE': {
        if (event?.queryStringParameters !== undefined) {
          const weight_id: string | undefined = event?.queryStringParameters?.weight_id
          if (weight_id === undefined) {
            throw new Error('weight_id is undefined.')
          }
          if (!validate(weight_id)) {
            throw new Error('weight_id is not a valid uuidv4.')
          }
          try {
            const deleteResult: ResponseMutation = await deleteWeight(weight_id)
            return (apiGatewayProxyResult('200', JSON.stringify(deleteResult)))
          } catch (error: unknown) {
            throw new Error(`Failed Delete Method::: ${JSON.stringify(error)}`)
          }
        } else {
          throw new Error('No queryStringParameters provided for Delete method.')
        }
      }
      case 'GET': {
        const weight_id: string | undefined = event.queryStringParameters?.weight_id
        if (weight_id === undefined) {
          throw new Error('weight_id is undefined.')
        }
        if (!validate(weight_id)) {
          throw new Error('weight_id is not a valid uuidv4.')
        }
        try {
          const getResult: WeightItem = await getWeight(
            weight_id
          )
          return (apiGatewayProxyResult('200', JSON.stringify(getResult)))
        } catch (error: any) {
          throw new Error(`Failed GET Method:: ${JSON.stringify(error.message)}`)
        }
      }
      default:
        throw new Error('Failed to execute, check incoming parameters.')
    }
  } catch (error: any) {
    return (apiGatewayProxyResult('400', JSON.stringify({
      status: false,
      message: `Failed Method:: ${JSON.stringify(error.message)}`
    })))
  }
}
