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
  type ResponseMutation,
  type TemperatureDDBDeleteGet,
  type TemperatureDDBPost,
  type TemperatureDDBUpdate,
  type TemperatureItem,
  type TemperatureItemPost,
  type TemperatureItemPut
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
//   serviceName: 'PROJECT_healthtrack_Temperature'
// })
const ddbDocClient = getDynamoDocClient()
const prefix: string = process.env.prefix !== undefined ? process.env.prefix : ''
const dynamoTable = `${prefix}-PROJECT_healthtracker_temperature`

async function postTemperature ({
  subject_id,
  refDate,
  degree,
  units,
  notes
}: TemperatureItemPost): Promise<ResponseMutation> {
  const uuidID: string = uuidv4()
  const paramsTemperature: PutCommandInput & TemperatureDDBPost = {
    TableName: dynamoTable,
    Item: {
      temperature_id: uuidID,
      createdAt: refDate,
      subject_id,
      degree,
      units,
      notes
    }
  }
  try {
    const response: PutCommandOutput = await ddbDocClient.send(new PutCommand(paramsTemperature))
    return {
      status: true,
      message: `${JSON.stringify(
                response
            )} Successfully created Temperature Item, please take note of the temperature_id uuid:: ${uuidID}.`
    }
  } catch (err: any) {
    throw new createError.InternalServerError(err.message)
  }
}

async function updateTemperature ({
  temperature_id,
  refDate,
  degree,
  units,
  notes
}: TemperatureItemPut): Promise<ResponseMutation> {
  const paramsTemperature: UpdateCommandInput & TemperatureDDBUpdate = {
    TableName: dynamoTable,
    Key: {
      temperature_id
    },
    UpdateExpression: 'set createdAt = :ca, degree = :d, units = :u, notes = :n',
    ExpressionAttributeValues: {
      ':ca': refDate, ':d': degree, ':u': units, ':n': notes
    },
    ReturnValues: 'UPDATED_NEW'
  }
  try {
    const response: UpdateCommandOutput = await ddbDocClient.send(new UpdateCommand(paramsTemperature))
    return {
      status: true,
      message: `Successfully UPDATE Temperature Item, please take note of the response: ${JSON.stringify(
                response
            )}`
    }
  } catch (err: any) {
    throw new createError.InternalServerError(err.message)
  }
}

async function deleteTemperature (
  temperature_id: string): Promise<ResponseMutation> {
  const paramsTemperature: DeleteCommandInput & TemperatureDDBDeleteGet = {
    TableName: dynamoTable,
    Key: {
      temperature_id
    }
  }
  try {
    const response = await ddbDocClient.send(new DeleteCommand(paramsTemperature))
    return {
      status: true,
      message: `Successfully Delete Temperature Item, please take note of the response: ${JSON.stringify(
                response
            )}`
    }
  } catch (err: any) {
    throw new createError.InternalServerError(err.message)
  }
}

async function getTemperature (
  temperature_id: string): Promise<TemperatureItem> {
  const paramsTemperature: GetCommandInput & TemperatureDDBDeleteGet = {
    TableName: dynamoTable,
    Key: {
      temperature_id
    }
  }
  try {
    const response: GetCommandOutput = await ddbDocClient.send(
      new GetCommand(paramsTemperature)
    )
    if (response.Item !== undefined) {
      return response.Item as TemperatureItem
    } else {
      throw new createError.BadRequest('Not All GET Temperature Parameters Are Valid')
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
          const { refDate, degree, units, notes }: TemperatureItemPost = JSON.parse(event.body)
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
          if (degree === undefined || degree <= 0) {
            throw new Error('Degree is undefined or not greater than zero.')
          }
          if ((units === undefined) || (units !== 'F' && units !== 'C')) {
            throw new Error('No units given or undefined, or the units that are provided are not one of the a permissible values.')
          }
          if (
            (units === 'F' || units === 'C')
          ) {
            try {
              const postResult: ResponseMutation = await postTemperature({
                subject_id,
                refDate: refDateCopy.toISOString(),
                units,
                degree,
                notes
              })
              return (apiGatewayProxyResult('201', JSON.stringify(postResult)))
            } catch (error: any) {
              throw new Error(`Failed Post Method::: ${JSON.stringify(error)}`)
            }
          } else {
            throw new Error('Malformed request for Post method, parameters may not be permissible values.')
          }
        } else {
          throw new Error('Malformed request, no body for POST method given.')
        }
      }
      case 'PUT': {
        if (event?.body !== undefined && event?.body !== null) {
          const {
            temperature_id,
            refDate,
            degree,
            units,
            notes
          }: TemperatureItemPut = JSON.parse(event.body)
          if (temperature_id === undefined) {
            throw new Error('temperature_id is undefined.')
          }
          if (!validate(temperature_id)) {
            throw new Error('temperature_id is not a valid uuidv4.')
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
          if (degree === undefined || degree <= 0) {
            throw new Error('Degree is undefined or not greater than zero.')
          }
          if ((units === undefined) || (units !== 'F' && units !== 'C')) {
            throw new Error('No units given or undefined, or the units that are provided are not one of the a permissible values.')
          }
          try {
            const updateResult: ResponseMutation = await updateTemperature({
              temperature_id,
              refDate,
              degree,
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
          const temperature_id: string | undefined = event?.queryStringParameters?.temperature_id
          if (temperature_id === undefined) {
            throw new Error('temperature_id is undefined.')
          }
          if (!validate(temperature_id)) {
            throw new Error('temperature_id is not a valid uuidv4.')
          }
          try {
            const deleteResult: ResponseMutation = await deleteTemperature(temperature_id)
            return (apiGatewayProxyResult('200', JSON.stringify(deleteResult)))
          } catch (error: unknown) {
            throw new Error(`Failed Delete Method::: ${JSON.stringify(error)}`)
          }
        } else {
          throw new Error('No queryStringParameters provided for Delete method.')
        }
      }
      case 'GET': {
        const temperature_id: string | undefined = event.queryStringParameters?.temperature_id
        if (temperature_id === undefined) {
          throw new Error('temperature_id is undefined.')
        }
        if (!validate(temperature_id)) {
          throw new Error('temperature_id is not a valid uuidv4.')
        }
        try {
          const getResult: TemperatureItem = await getTemperature(
            temperature_id
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
