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
  UpdateCommand,
  type UpdateCommandInput,
  type UpdateCommandOutput
} from '@aws-sdk/lib-dynamodb'
import { type APIGatewayProxyEvent, type Handler } from 'aws-lambda'
import createError from 'http-errors'
import {
  CFoodCategory,
  CFoodDelivery,
  CFoodUnits,
  type FoodDDBDeleteGet,
  type FoodDDBPost,
  type FoodDDBUpdate,
  type FoodItem,
  type FoodItemPost,
  type FoodItemPut,
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

const ddbDocClient = getDynamoDocClient()
const prefix: string = process.env.prefix !== undefined ? process.env.prefix : ''
const dynamoTable = `${prefix}-PROJECT_healthtracker_food`
const logger = new Logger({
  logLevel: 'WARN',
  serviceName: `${prefix}-PROJECT_healthtracker_food`
})

async function postFood ({
  subject_id,
  refDate,
  category,
  delivery,
  solidFoodType,
  amount,
  units,
  notes
}: FoodItemPost): Promise<ResponseMutation> {
  const uuidID: string = uuidv4()
  const paramsFood: PutCommandInput & FoodDDBPost = {
    TableName: dynamoTable,
    Item: {
      food_id: uuidID,
      createdAt: refDate,
      subject_id,
      delivery,
      category,
      solidFoodType,
      amount,
      units,
      notes
    }
  }
  try {
    const response: PutCommandOutput = await ddbDocClient.send(new PutCommand(paramsFood))
    return {
      status: true,
      message: `${JSON.stringify(
                response
            )} Successfully created Food Item, please take note of the food_id uuid:: ${uuidID}.`
    }
  } catch (err: any) {
    logger.error('Error', err.stack)
    throw new createError.InternalServerError(err.message)
  }
}

async function updateFood ({
  food_id,
  refDate,
  delivery,
  category,
  solidFoodType,
  amount,
  units,
  notes
}: FoodItemPut): Promise<ResponseMutation> {
  const paramsFood: UpdateCommandInput & FoodDDBUpdate = {
    TableName: dynamoTable,
    Key: {
      food_id
    },
    UpdateExpression: 'set createdAt = :ca, delivery = :d, category = :c, solidFoodType = :s, amount = :a, units = :u, notes = :n',
    ExpressionAttributeValues: {
      ':ca': refDate,
      ':d': delivery,
      ':c': category,
      ':s': solidFoodType !== undefined ? solidFoodType : null,
      ':a': amount !== undefined ? amount : null,
      ':u': units,
      ':n': notes
    },
    ReturnValues: 'UPDATED_NEW'
  }
  try {
    const response: UpdateCommandOutput = await ddbDocClient.send(new UpdateCommand(paramsFood))
    return {
      status: true,
      message: `Successfully Put Food Item, please take note of the response: ${JSON.stringify(
                response
            )}`
    }
  } catch (err: any) {
    logger.error('Error', err.stack)
    throw new createError.InternalServerError(err.message)
  }
}

async function deleteFood (
  food_id: string): Promise<ResponseMutation> {
  const paramsFood: DeleteCommandInput & FoodDDBDeleteGet = {
    TableName: dynamoTable,
    Key: {
      food_id
    }
  }
  try {
    const response = await ddbDocClient.send(new DeleteCommand(paramsFood))
    return {
      status: true,
      message: `Successfully Delete Food Item, please take note of the response: ${JSON.stringify(
                response
            )}`
    }
  } catch (err: any) {
    logger.error('Error', err.stack)
    throw new createError.InternalServerError(err.message)
  }
}

async function getFood (
  food_id: string
): Promise<FoodItem> {
  const paramsFood: GetCommandInput & FoodDDBDeleteGet = {
    TableName: dynamoTable,
    Key: {
      food_id
    }
  }
  try {
    const response: GetCommandOutput = await ddbDocClient.send(
      new GetCommand(paramsFood)
    )
    if (response.Item !== undefined) {
      return response.Item as FoodItem
    } else {
      throw new createError.BadRequest('Not All GET Food Parameters Are Valid')
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
          const {
            refDate,
            category,
            delivery,
            solidFoodType,
            amount,
            units,
            notes
          }: FoodItemPost = JSON.parse(event.body)
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
          if (category !== 'SOLID' && amount === undefined) {
            throw new Error('Amount is undefined or not sent in correctly for POST method.')
          }
          if (
            (category === undefined) ||
                        ((!CFoodCategory.includes(category)))
          ) {
            throw new Error('Category is either undefined or it is not one of the a permissible value.')
          }
          if ((units === undefined) || ((!CFoodUnits.includes(units)))) {
            throw new Error('No units given or undefined, if there are no units to provide then give `NA`, or the units that are provided are not one of the a permissible values.')
          }
          if (
            (delivery === undefined) ||
                        (!CFoodDelivery.includes(delivery))
          ) {
            throw new Error('No Delivery given, or undefined, or the delivery given is not one of the a permissible values.')
          }
          if (
            (CFoodDelivery.includes(delivery)) &&
                        (CFoodCategory.includes(category)) &&
                        Boolean(CFoodUnits.includes(units))
          ) {
            try {
              const postResult: ResponseMutation = await postFood({
                subject_id,
                refDate: refDateCopy.toISOString(),
                delivery,
                solidFoodType,
                units,
                amount,
                category,
                notes
              })
              return (apiGatewayProxyResult('201', JSON.stringify(postResult)))
            } catch (error: unknown) {
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
            food_id,
            refDate,
            category,
            delivery,
            solidFoodType,
            amount,
            units,
            notes
          }: FoodItemPut = JSON.parse(event.body)
          if (food_id === undefined) {
            throw new Error('food_id is undefined.')
          }
          if (!validate(food_id)) {
            throw new Error('food_id is not a valid uuidv4.')
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
          if (category !== 'SOLID' && amount === undefined) {
            throw new Error('Amount is undefined or not sent in correctly for PUT method.')
          }
          if (
            (category === undefined) ||
                        ((!CFoodCategory.includes(category)))
          ) {
            throw new Error('Category is either undefined or it is not one of the a permissible value.')
          }
          if ((units === undefined) || ((!CFoodUnits.includes(units)))) {
            throw new Error('No units given or undefined, if there are no units to provide then give `NA`, or the units that are provided are not one of the a permissible values.')
          }
          if (
            (delivery === undefined) ||
                        (!CFoodDelivery.includes(delivery))
          ) {
            throw new Error('No Delivery given, or undefined, or the delivery given is not one of the a permissible values.')
          }
          if (
            (CFoodDelivery.includes(delivery)) &&
                        (CFoodCategory.includes(category)) &&
                        Boolean(CFoodUnits.includes(units))
          ) {
            try {
              const updateResult: ResponseMutation = await updateFood({
                food_id,
                refDate: refDateCopy.toISOString(),
                delivery,
                category,
                solidFoodType,
                amount,
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
        } else {
          throw new Error('Failed body given parameters, check permissible values for PUT method.')
        }
      }
      case 'DELETE': {
        if (event?.queryStringParameters !== undefined) {
          const food_id: string | undefined = event?.queryStringParameters?.food_id
          if (food_id === undefined) {
            throw new Error('food_id is undefined.')
          }
          if (!validate(food_id)) {
            throw new Error('food_id is not a valid uuidv4.')
          }
          try {
            const deleteResult: ResponseMutation = await deleteFood(food_id)
            return (apiGatewayProxyResult('200', JSON.stringify(deleteResult)))
          } catch (error: unknown) {
            throw new Error(`Failed Delete Method::: ${JSON.stringify(error)}`)
          }
        } else {
          throw new Error('No queryStringParameters provided for Delete method.')
        }
      }
      case 'GET': {
        const food_id: string | undefined = event?.queryStringParameters?.food_id
        if (food_id === undefined) {
          throw new Error('food_id is undefined.')
        }
        if (!validate(food_id)) {
          throw new Error('food_id is not a valid uuidv4.')
        }
        try {
          const getResult: FoodItem = await getFood(
            food_id
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
