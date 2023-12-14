import {
  DeleteCommand,
  type DeleteCommandInput,
  GetCommand,
  type GetCommandInput,
  type GetCommandOutput,
  PutCommand,
  type PutCommandInput,
  type PutCommandOutput,
  UpdateCommand,
  type UpdateCommandInput,
  type UpdateCommandOutput
} from '@aws-sdk/lib-dynamodb'
import { type APIGatewayProxyEvent, type Handler } from 'aws-lambda'
import createError from 'http-errors'
import {
  type HeightDDBDeleteGet,
  type HeightDDBPost,
  type HeightDDBUpdate,
  type HeightItem,
  type HeightItemPost,
  type HeightItemPut,
  type ResponseMutation
} from 'schema'
import {
  apiGatewayProxyResult,
  type ApiGatewayProxyResultInterface,
  getDynamoDocClient,
  isValidDateISOString,
  isValidDateObject
} from 'utils'
import { v4 as uuidv4, validate } from 'uuid'

// const logger = new Logger({
//   logLevel: 'WARN',
//   serviceName: 'PROJECT_healthtrack_height'
// })
const ddbDocClient = getDynamoDocClient()
const prefix: string = process.env.prefix !== undefined ? process.env.prefix : ''
const dynamoTable = `${prefix}-PROJECT_healthtracker_height`

async function postHeight ({
  subject_id,
  refDate,
  height,
  subHeight,
  units,
  subUnits,
  notes
}: HeightItemPost): Promise<ResponseMutation> {
  const uuidID: string = uuidv4()
  const paramsHeight: PutCommandInput & HeightDDBPost = {
    TableName: dynamoTable,
    Item: {
      height_id: uuidID,
      createdAt: refDate,
      subject_id,
      height,
      subHeight,
      units,
      subUnits,
      notes
    }
  }
  try {
    const response: PutCommandOutput = await ddbDocClient.send(new PutCommand(paramsHeight))
    return {
      status: true,
      message: `${JSON.stringify(
                response
            )} Successfully created height Item, please take note of the height_id uuid:: ${uuidID}.`
    }
  } catch (err: any) {
    throw new createError.InternalServerError(err.message)
  }
}

async function updateHeight ({
  height_id,
  refDate,
  height,
  subHeight,
  units,
  subUnits,
  notes
}: HeightItemPut): Promise<ResponseMutation> {
  const paramsHeight: UpdateCommandInput & HeightDDBUpdate = {
    TableName: dynamoTable,
    Key: {
      height_id
    },
    UpdateExpression: 'set createdAt = :d, height = :h, subHeight = :sh, units = :u, subUnits = :su, notes = :n',
    ExpressionAttributeValues: {
      ':d': refDate, ':h': height, ':sh': subHeight, ':u': units, ':su': subUnits, ':n': notes
    },
    ReturnValues: 'UPDATED_NEW'
  }
  try {
    const response: UpdateCommandOutput = await ddbDocClient.send(new UpdateCommand(paramsHeight))
    return {
      status: true,
      message: `Successfully Put Height Item, please take note of the response: ${JSON.stringify(
                response
            )}`
    }
  } catch (err: any) {
    throw new createError.InternalServerError(err.message)
  }
}

async function deleteHeight (
  height_id: string): Promise<ResponseMutation> {
  const paramsHeight: DeleteCommandInput & HeightDDBDeleteGet = {
    TableName: dynamoTable,
    Key: {
      height_id
    }
  }
  try {
    const response = await ddbDocClient.send(new DeleteCommand(paramsHeight))
    return {
      status: true,
      message: `Successfully Delete Height Item, please take note of the response: ${JSON.stringify(
                response
            )}`
    }
  } catch (err: any) {
    throw new createError.InternalServerError(err.message)
  }
}

async function getHeight (
  height_id: string
): Promise<HeightItem> {
  const paramsHeight: GetCommandInput & HeightDDBDeleteGet = {
    TableName: dynamoTable,
    Key: {
      height_id
    }
  }
  try {
    const response: GetCommandOutput = await ddbDocClient.send(
      new GetCommand(paramsHeight)
    )
    if (response.Item !== undefined) {
      return response.Item as HeightItem
    } else {
      throw new createError.BadRequest('Not All GET Height Parameters Are Valid')
    }
  } catch (err: any) {
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
    const subject_id: string = event?.pathParameters?.subject
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
          const { refDate, height, subHeight, units, subUnits, notes }: HeightItemPost = JSON.parse(event.body)
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
          if (height === undefined) {
            throw new Error('Height number is undefined or not being sent in correctly, please check permissible values.')
          }
          if (units === undefined || (units !== 'in' && units !== 'cm' && units !== 'ft')) {
            throw new Error('Units are undefined or not being sent in correctly, please check permissible values.')
          }
          if (subUnits === undefined || (subUnits !== 'na' && subUnits !== 'ft')) {
            throw new Error('subUnits are undefined or not being sent in correctly, please check permissible values.')
          }
          if (units === 'cm' && height <= 0) {
            throw new Error('Height number must be greater than zero.')
          }
          try {
            const postResult: ResponseMutation = await postHeight({
              subject_id,
              refDate: refDateCopy.toISOString(),
              height,
              subHeight,
              units,
              subUnits,
              notes
            })
            return (apiGatewayProxyResult('201', JSON.stringify(postResult)))
          } catch (error: unknown) {
            throw new Error(`Failed Post Method::: ${JSON.stringify(error)}`)
          }
        } else {
          throw new Error('Malformed request for Post method::: does not met requirements: units.length > 0.')
        }
      }
      case 'PUT': {
        if (event?.body !== undefined && event?.body !== null) {
          const {
            height_id,
            refDate,
            height,
            subHeight, units, subUnits,
            notes
          }: HeightItemPut = JSON.parse(event.body)
          if (height_id === undefined) {
            throw new Error('height_id is undefined.')
          }
          if (!validate(height_id)) {
            throw new Error('height_id is not a valid uuidv4.')
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
          if (height === undefined) {
            throw new Error('Height number is undefined or not being sent in correctly, please check permissible values.')
          }
          if (units === undefined || (units !== 'in' && units !== 'cm' && units !== 'ft')) {
            throw new Error('Units are undefined or not being sent in correctly, please check permissible values.')
          }
          if (subUnits === undefined || (subUnits !== 'na' && subUnits !== 'ft')) {
            throw new Error('subUnits are undefined or not being sent in correctly, please check permissible values.')
          }
          if (units === 'cm' && height <= 0) {
            throw new Error('Height number must be greater than zero.')
          }
          try {
            const updateResult: ResponseMutation = await updateHeight({
              height_id,
              refDate: refDateCopy.toISOString(),
              height,
              subHeight,
              units,
              subUnits,
              notes
            })
            return (apiGatewayProxyResult('201', JSON.stringify(updateResult)))
          } catch (error: unknown) {
            throw new Error(`Failed Put Method::: ${JSON.stringify(error)}`)
          }
        } else {
          throw new Error('Malformed request for Post method:: body may be undefined or null.')
        }
      }
      case 'DELETE': {
        if (event?.queryStringParameters !== undefined) {
          const height_id: string | undefined = event?.queryStringParameters?.height_id
          if (height_id === undefined) {
            throw new Error('height_id is undefined.')
          }
          if (!validate(height_id)) {
            throw new Error('height_id is not a valid uuidv4.')
          }
          try {
            const deleteResult: ResponseMutation = await deleteHeight(height_id)
            return (apiGatewayProxyResult('200', JSON.stringify(deleteResult)))
          } catch (error: any) {
            throw new Error(`Failed Delete Method::: ${JSON.stringify(error)}`)
          }
        } else {
          throw new Error('No queryStringParameters provided for Delete method.')
        }
      }
      case 'GET': {
        const height_id: string | undefined = event.queryStringParameters?.height_id
        if (height_id === undefined) {
          throw new Error('height_id is undefined.')
        }
        if (!validate(height_id)) {
          throw new Error('height_id is not a valid uuidv4.')
        }
        try {
          const getResult: HeightItem = await getHeight(
            height_id
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
      message: error.message
    })))
  }
}
