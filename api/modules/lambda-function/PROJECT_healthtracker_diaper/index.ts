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
  CDiaperCategory,
  type DiaperDDBDeleteGet,
  type DiaperDDBPost,
  type DiaperDDBUpdate,
  type DiaperItem,
  type DiaperItemPost,
  type DiaperItemPut,
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
const dynamoTable = `${prefix}-PROJECT_healthtracker_diaper`

async function postDiaper ({
  subject_id,
  refDate,
  category,
  amount,
  notes
}: DiaperItemPost): Promise<ResponseMutation> {
  const uuidID: string = uuidv4()
  const paramsDiaper: PutCommandInput & DiaperDDBPost = {
    TableName: dynamoTable,
    Item: {
      diaper_id: uuidID,
      createdAt: refDate,
      subject_id,
      category,
      amount,
      notes
    }
  }
  try {
    const response: PutCommandOutput = await ddbDocClient.send(new PutCommand(paramsDiaper))
    return {
      status: true,
      message: `${JSON.stringify(
                response
            )} Successfully created diaper Item, please take note of the diaper_id uuid:: ${uuidID}.`
    }
  } catch (err: any) {
    return {
      status: true,
      message: `${JSON.stringify(
                err.message
            )} ::: Failed the POST method using PutCommand`
    }
  }
}

async function updateDiaper ({
  diaper_id,
  refDate,
  amount,
  category,
  notes
}: DiaperItemPut): Promise<ResponseMutation> {
  const paramsDiaper: UpdateCommandInput & DiaperDDBUpdate = {
    TableName: dynamoTable,
    Key: {
      diaper_id
    },
    UpdateExpression: 'set createdAt = :d, amount = :a, category = :c, notes = :n',
    ExpressionAttributeValues: {
      ':d': refDate, ':a': amount, ':c': category, ':n': notes
    },
    ReturnValues: 'UPDATED_NEW'
  }
  try {
    const response: UpdateCommandOutput = await ddbDocClient.send(new UpdateCommand(paramsDiaper))
    return {
      status: true,
      message: `Successfully Put Diaper Item, please take note of the response: ${JSON.stringify(
                response
            )}`
    }
  } catch (err: any) {
    return {
      status: true,
      message: `${JSON.stringify(
                err.message
            )} ::: Failed PutCommand`
    }
  }
}

async function deleteDiaper (
  diaper_id: string): Promise<ResponseMutation> {
  const paramsDiaper: DeleteCommandInput & DiaperDDBDeleteGet = {
    TableName: dynamoTable,
    Key: {
      diaper_id
    }
  }
  try {
    const response = await ddbDocClient.send(new DeleteCommand(paramsDiaper))
    return {
      status: true,
      message: `Successfully Delete Diaper Item, please take note of the response: ${JSON.stringify(
                response
            )}`
    }
  } catch (err: any) {
    return {
      status: true,
      message: `${JSON.stringify(
                err.message
            )} ::: Failed DELETECommand`
    }
  }
}

async function getDiaper (
  diaper_id: string): Promise<DiaperItem> {
  const paramsDiaper: GetCommandInput & DiaperDDBDeleteGet = {
    TableName: dynamoTable,
    Key: {
      diaper_id
    }
  }
  try {
    const response: GetCommandOutput = await ddbDocClient.send(
      new GetCommand(paramsDiaper)
    )
    if (response.Item !== undefined) {
      return response.Item as DiaperItem
    } else {
      throw new createError.BadRequest('Not All GET Diaper Parameters Are Valid')
    }
  } catch (err: any) {
    throw new createError.InternalServerError(err.message)
  }
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiGatewayProxyResultInterface> => {
  try {
    if (prefix === undefined) {
      throw new Error('No Prefix Env Set')
    }

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
          const { refDate, amount, category, notes }: DiaperItemPost = JSON.parse(event.body)
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
          if (amount === undefined) {
            throw new Error('Not all parameters are being sent in correctly.')
          }
          if (
            (category === undefined) ||
                        ((!CDiaperCategory.includes(category)))
          ) {
            throw new Error('Category is either undefined or it is not one of the a permissible value.')
          }
          if (
            amount > 0 && amount < 60 &&
                        ((CDiaperCategory.includes(category)))
          ) {
            try {
              const postResult: ResponseMutation = await postDiaper({
                subject_id,
                refDate: refDateCopy.toISOString(),
                amount,
                category,
                notes
              })
              return (apiGatewayProxyResult('201', JSON.stringify(postResult)))
            } catch (error: unknown) {
              throw new Error(`Failed Post Method::: ${JSON.stringify(error)}`)
            }
          } else {
            throw new Error('Malformed request for Post method, either no amount of diaper changes were provided or there have been over 60 and just too many diaper changes!')
          }
        } else {
          throw new Error('Malformed request, no body for POST method given.')
        }
      }
      case 'PUT': {
        if (event?.body !== undefined && event?.body !== null) {
          const {
            diaper_id,
            refDate,
            amount,
            category,
            notes
          }: DiaperItemPut = JSON.parse(event.body)
          if (diaper_id === undefined) {
            throw new Error('diaper_id is undefined.')
          }
          if (!validate(diaper_id)) {
            throw new Error('diaper_id is not a valid uuidv4.')
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
          if (amount === undefined || amount <= 0) {
            throw new Error('Amount number is undefined or not being sent in correctly.')
          }
          if (
            (category === undefined) ||
                        ((!CDiaperCategory.includes(category)))
          ) {
            throw new Error('Category is either undefined or it is not one of the a permissible value.')
          }
          if (
            amount > 0 && amount < 60 &&
                        ((CDiaperCategory.includes(category)))
          ) {
            try {
              const updateResult: ResponseMutation = await updateDiaper({
                diaper_id,
                refDate: refDateCopy.toISOString(),
                amount,
                category,
                notes
              })
              return (apiGatewayProxyResult('201', JSON.stringify(updateResult)))
            } catch (error: unknown) {
              throw new Error(`Failed Put Method::: ${JSON.stringify(error)}`)
            }
          } else {
            throw new Error('Malformed request for Post method, either no amount of diaper changes were provided or there have been over 60 and just too many diaper changes!')
          }
        } else {
          throw new Error('Malformed request for Put method.')
        }
      }
      case 'DELETE': {
        if (event?.queryStringParameters !== undefined) {
          const diaper_id: string | undefined = event?.queryStringParameters?.diaper_id
          if (diaper_id === undefined) {
            throw new Error('diaper_id is undefined.')
          }
          if (!validate(diaper_id)) {
            throw new Error('diaper_id is not a valid uuidv4.')
          }
          try {
            const deleteResult: ResponseMutation = await deleteDiaper(diaper_id)
            return (apiGatewayProxyResult('200', JSON.stringify(deleteResult)))
          } catch (error: unknown) {
            throw new Error(`Failed Delete Method::: ${JSON.stringify(error)}`)
          }
        } else {
          throw new Error('No queryStringParameters provided for Delete method.')
        }
      }
      case 'GET': {
        const diaper_id: string | undefined = event?.queryStringParameters?.diaper_id
        if (diaper_id === undefined) {
          throw new Error('diaper_id is undefined.')
        }
        if (!validate(diaper_id)) {
          throw new Error('diaper_id is not a valid uuidv4.')
        }
        try {
          const getResult: DiaperItem = await getDiaper(
            diaper_id
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
