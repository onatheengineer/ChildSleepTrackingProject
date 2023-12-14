import { Logger } from '@aws-lambda-powertools/logger'
import { QueryCommand, type QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import { type APIGatewayProxyEvent, type Handler } from 'aws-lambda'
import * as httpError from 'http-errors'
import {
  type DailyTrackerItemGet,
  type DailyTrackerItemGetReturn,
  type DiaperItem,
  type FoodItem,
  type HealthIssueItem,
  type HeightItem,
  type TemperatureItem,
  type WeightItem
} from 'schema'
import {
  apiGatewayProxyResult,
  type ApiGatewayProxyResultInterface,
  getDynamoDocClient,
  isValidDateISOString,
  isValidDateObject,
  unitConverter
} from 'utils'
import { validate } from 'uuid'

const logger = new Logger({
  logLevel: 'INFO',
  serviceName: 'PROJECT_dailytracker'
})
const ddbDocClient = getDynamoDocClient()
const prefix: string = process.env.prefix !== undefined ? process.env.prefix : ''

async function getDailyTracker ({
  subject_id, refDate, startDate
}: DailyTrackerItemGet
): Promise<Record<string, DailyTrackerItemGetReturn>> {
  const dailyTrackerReturn: Record<string, DailyTrackerItemGetReturn> = {
    healthissue: {
      feature: 'Empty State',
      data: []
    },
    bottleFeed: {
      feature: 'Empty State',
      data: []
    },
    breastFeed: {
      feature: 'Empty State',
      data: []
    },
    solidFood: {
      feature: 'Empty State',
      data: []
    },
    diaperChange: {
      feature: 'Empty State',
      data: []
    },
    height: {
      feature: 'Empty State',
      data: []
    },
    weight: {
      feature: 'Empty State',
      data: []
    },
    temperature: {
      feature: 'Empty State',
      data: []
    }
  }
  try {
    // Health Issue
    const paramsHealthIssue = {
      TableName: `${prefix}-PROJECT_healthtracker_healthissue`,
      IndexName: 'subject_id_createdAt_index',
      KeyConditionExpression: 'subject_id = :s AND createdAt BETWEEN :start AND :end',
      ExpressionAttributeValues: {
        ':s': subject_id,
        ':start': startDate.toISOString(),
        ':end': refDate.toISOString()
      },
      ScanIndexForward: false
    }
    logger.info(`paramsHelthIssue::${JSON.stringify(paramsHealthIssue)}`)
    try {
      const responseHealthIssue: QueryCommandOutput = await ddbDocClient.send(
        new QueryCommand(paramsHealthIssue)
      )
      logger.info(`responseHealthIssue:::${JSON.stringify(responseHealthIssue)}`)
      if (responseHealthIssue.Items !== undefined && responseHealthIssue.Items !== null && responseHealthIssue.Items.length > 0) {
        logger.info(`responseHealthIssue.Items:::${JSON.stringify(responseHealthIssue.Items)}`)
        dailyTrackerReturn.healthissue = {
          feature: 'Health issue',
          data: responseHealthIssue.Items as HealthIssueItem[]
        }
      }
    } catch (error: any) {
      throw new httpError.InternalServerError(error.message)
    }

    // Bottle Feed
    const paramsBottle = {
      TableName: `${prefix}-PROJECT_healthtracker_food`,
      IndexName: 'subject_id_createdAt_index',
      KeyConditionExpression: 'subject_id = :s AND createdAt BETWEEN :start AND :end',
      FilterExpression: 'delivery = :d',
      ExpressionAttributeValues: {
        ':s': subject_id,
        ':start': startDate.toISOString(),
        ':end': refDate.toISOString(),
        ':d': 'BOTTLE'
      },
      ScanIndexForward: false
    }
    logger.info(`paramsBottle:::${JSON.stringify(paramsBottle)}`)

    try {
      const responseBottle: QueryCommandOutput = await ddbDocClient.send(
        new QueryCommand(paramsBottle)
      )
      logger.info(`responseBottle:::${JSON.stringify(responseBottle)}`)

      if (responseBottle.Items !== undefined && responseBottle.Items !== null && responseBottle.Items.length > 0) {
        let valueTotal: number = 0
        const unitsDisplay: string = responseBottle.Items[0].units
        for (const el of responseBottle.Items) {
          valueTotal += +unitConverter({ unit: el.units, value: el.amount, unitDisplay: unitsDisplay })
        }
        dailyTrackerReturn.bottleFeed = {
          feature: 'Bottle Feed',
          totalDailyAmount: valueTotal,
          unit: responseBottle.Items[0].units,
          createdAt: responseBottle.Items[0].createdAt,
          data: responseBottle.Items as FoodItem[]
        }
      }
    } catch (error: any) {
      throw new httpError.InternalServerError(error.message)
    }
    // Breast
    const paramsBreast = {
      TableName: `${prefix}-PROJECT_healthtracker_food`,
      IndexName: 'subject_id_createdAt_index',
      KeyConditionExpression: 'subject_id = :s AND createdAt BETWEEN :start AND :end',
      FilterExpression: 'delivery = :d OR delivery = :l',
      ExpressionAttributeValues: {
        ':s': subject_id,
        ':start': startDate.toISOString(),
        ':end': refDate.toISOString(),
        ':d': 'RIGHTBREAST',
        ':l': 'LEFTBREAST'
      },
      ScanIndexForward: false
    }
    try {
      const responseBreast: QueryCommandOutput = await ddbDocClient.send(
        new QueryCommand(paramsBreast)
      )
      logger.info(`responseBreast:::${JSON.stringify(responseBreast)}`)

      if (responseBreast.Items !== undefined && responseBreast.Items !== null && responseBreast.Items.length > 0) {
        let valueTotal: number = 0
        const unitsDisplay: string = responseBreast.Items[0].units
        for (const el of responseBreast.Items) {
          valueTotal += +unitConverter({ unit: el.units, value: el.amount, unitDisplay: unitsDisplay })
        }
        dailyTrackerReturn.breastFeed = {
          feature: 'Breast Feed',
          totalDailyAmount: valueTotal,
          unit: responseBreast.Items[0].units,
          createdAt: responseBreast.Items[0].createdAt,
          data: responseBreast.Items as FoodItem[]
        }
      }
    } catch (error: any) {
      throw new httpError.InternalServerError(error.message)
    }
    // Solid food
    const paramsSolid = {
      TableName: `${prefix}-PROJECT_healthtracker_food`,
      IndexName: 'subject_id_createdAt_index',
      KeyConditionExpression: 'subject_id = :s AND createdAt BETWEEN :start AND :end',
      FilterExpression: 'delivery = :d',
      ExpressionAttributeValues: {
        ':s': subject_id,
        ':start': startDate.toISOString(),
        ':end': refDate.toISOString(),
        ':d': 'UTENSIL'
      },
      ScanIndexForward: false
    }
    try {
      const responseSolidFood: QueryCommandOutput = await ddbDocClient.send(
        new QueryCommand(paramsSolid)
      )
      logger.info(`paramsSolid:::${JSON.stringify(paramsSolid)}`)
      if (responseSolidFood.Items !== undefined && responseSolidFood.Items !== null && responseSolidFood.Items.length > 0) {
        dailyTrackerReturn.solidFood = {
          feature: 'Solid Food',
          solidFoodType: responseSolidFood.Items[0].solidFoodType,
          createdAt: responseSolidFood.Items[0].createdAt,
          data: responseSolidFood.Items as FoodItem[]
        }
      }
    } catch (error: any) {
      throw new httpError.InternalServerError(error.message)
    }
    // diaper
    const paramsDiaper = {
      TableName: `${prefix}-PROJECT_healthtracker_diaper`,
      IndexName: 'subject_id_createdAt_index',
      KeyConditionExpression: 'subject_id = :s AND createdAt BETWEEN :start AND :end',
      ExpressionAttributeValues: {
        ':s': subject_id,
        ':start': startDate.toISOString(),
        ':end': refDate.toISOString()
      },
      ScanIndexForward: false
    }
    try {
      const responseDiaper: QueryCommandOutput = await ddbDocClient.send(
        new QueryCommand(paramsDiaper)
      )
      logger.info(`responseDiaper:::${JSON.stringify(responseDiaper)}`)
      if (responseDiaper.Items !== undefined && responseDiaper.Items !== null && responseDiaper.Items.length > 0) {
        let valueTotal: number = 0
        for (const el of responseDiaper.Items) {
          valueTotal += +el.amount
        }
        dailyTrackerReturn.diaperChange = {
          feature: 'Diaper Change',
          totalDailyAmount: valueTotal,
          createdAt: responseDiaper.Items[0].createdAt,
          data: responseDiaper.Items as DiaperItem[]
        }
      }
    } catch (error: any) {
      throw new httpError.InternalServerError(error.message)
    }
    //  Weight
    const paramsWeight = {
      TableName: `${prefix}-PROJECT_healthtracker_weight`,
      IndexName: 'subject_id_createdAt_index',
      KeyConditionExpression: 'subject_id = :s AND createdAt BETWEEN :start AND :end',
      ExpressionAttributeValues: {
        ':s': subject_id,
        ':start': startDate.toISOString(),
        ':end': refDate.toISOString()
      },
      ScanIndexForward: false
    }
    try {
      const responseWeight: QueryCommandOutput = await ddbDocClient.send(
        new QueryCommand(paramsWeight)
      )
      if (responseWeight.Items !== undefined && responseWeight.Items !== null && responseWeight.Items.length > 0) {
        dailyTrackerReturn.weight = {
          feature: 'Weight',
          data: responseWeight.Items as WeightItem[]
        }
      }
    } catch (error: any) {
      throw new httpError.InternalServerError(error.message)
    }
    // Height
    const paramsHeight = {
      TableName: `${prefix}-PROJECT_healthtracker_height`,
      IndexName: 'subject_id_createdAt_index',
      KeyConditionExpression: 'subject_id = :s AND createdAt BETWEEN :start AND :end',
      ExpressionAttributeValues: {
        ':s': subject_id,
        ':start': startDate.toISOString(),
        ':end': refDate.toISOString()
      },
      ScanIndexForward: false
    }
    try {
      const responseHeight: QueryCommandOutput = await ddbDocClient.send(
        new QueryCommand(paramsHeight)
      )
      if (responseHeight.Items !== undefined && responseHeight.Items !== null && responseHeight.Items.length > 0) {
        dailyTrackerReturn.height = {
          feature: 'Height',
          data: responseHeight.Items as HeightItem[]
        }
      }
    } catch (error: any) {
      throw new httpError.InternalServerError(error.message)
    }
    // Temperature
    const paramsTemperature = {
      TableName: `${prefix}-PROJECT_healthtracker_temperature`,
      IndexName: 'subject_id_createdAt_index',
      KeyConditionExpression: 'subject_id = :s AND createdAt BETWEEN :start AND :end',
      ExpressionAttributeValues: {
        ':s': subject_id,
        ':start': startDate.toISOString(),
        ':end': refDate.toISOString()
      },
      ScanIndexForward: false
    }
    try {
      const responseTemperature: QueryCommandOutput = await ddbDocClient.send(
        new QueryCommand(paramsTemperature)
      )
      if (responseTemperature.Items !== undefined && responseTemperature.Items !== null && responseTemperature.Items.length > 0) {
        dailyTrackerReturn.temperature = {
          feature: 'Temperature',
          data: responseTemperature.Items as TemperatureItem[]
        }
      }
    } catch (error: any) {
      throw new httpError.InternalServerError(error.message)
    }
    logger.info(`dailyTrackerReturn:::${JSON.stringify(dailyTrackerReturn)}`)
    return dailyTrackerReturn
  } catch (error: any) {
    throw new httpError.InternalServerError(error.message)
  }
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiGatewayProxyResultInterface> => {
  try {
    logger.info(`event:::${JSON.stringify(event)}`)
    if (event.pathParameters === undefined) {
      throw new Error('No path parameter provided.')
    }
    if (event?.pathParameters?.subject === undefined) {
      throw new Error('No path subject_id provided.')
    }
    const subject_id: string = event.pathParameters.subject
    if (!validate(subject_id)) {
      throw new Error('The subject_id is not a valid uuidv4.')
    }
    logger.info(`subject_id:::${JSON.stringify(subject_id)}`)
    if (
      (event.queryStringParameters === undefined) &&
            event.requestContext.httpMethod === 'GET'
    ) {
      throw new Error('No queryString provided.')
    }
    const refDateIncoming: string | undefined = event?.queryStringParameters?.refDate as string
    let refDate: Date = new Date()
    if (refDateIncoming !== undefined) {
      if (!isValidDateISOString(refDateIncoming)) {
        throw new Error('Reference Date not in ISO format.')
      }
      refDate = new Date(refDateIncoming)
    }
    logger.info(`refDateIncoming:::${JSON.stringify(refDateIncoming)}`)
    logger.info(`refDate:::${JSON.stringify(refDate)}`)
    logger.info(`refDateISO:::${JSON.stringify(refDate.toISOString())}`)

    const startDateIncoming: string | undefined = event?.queryStringParameters?.startDate as string
    let startDate: Date = new Date()
    if (startDateIncoming !== undefined) {
      if (!isValidDateISOString(startDateIncoming)) {
        throw new Error('Reference Date not in ISO format.')
      }
      startDate = new Date(startDateIncoming)
    }
    if (!isValidDateObject(startDate)) {
      throw new Error('Invalid date object.')
    }
    if (startDate.getTime() >= refDate.getTime()) {
      throw new Error(`Invalid date range, startDate:::${JSON.stringify(startDate)} can not be equal to or greater than refDate"""${JSON.stringify(refDate)}.`)
    }
    logger.info(`startDateIncoming:::${JSON.stringify(startDateIncoming)}`)
    logger.info(`startDate:::${JSON.stringify(startDate)}`)
    logger.info(`startDateISO:::${JSON.stringify(startDate.toISOString())}`)
    try {
      const getResult: Record<string, DailyTrackerItemGetReturn> = await getDailyTracker(
        { subject_id, refDate, startDate }
      )
      logger.info(`getResult:::${JSON.stringify(getResult)}`)
      return (apiGatewayProxyResult('200', JSON.stringify(getResult)))
    } catch (error: any) {
      throw new Error(`Failed GET Method:: ${JSON.stringify(error.message)}`)
    }
  } catch (error: any) {
    return (apiGatewayProxyResult('400', JSON.stringify({
      status: false,
      message: `Failed GET Method:: ${JSON.stringify(error.message)}`
    })))
  }
}
