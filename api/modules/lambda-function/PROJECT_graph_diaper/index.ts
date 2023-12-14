import { Logger } from '@aws-lambda-powertools/logger'
import { QueryCommand, type QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import { type APIGatewayProxyEvent, type Handler } from 'aws-lambda'
import * as httpError from 'http-errors'
import { type DiaperItem, type GraphDataPoint, type GraphGet, type GraphReturn, type IntervalLabels } from 'schema'
import {
  apiGatewayProxyResult,
  type ApiGatewayProxyResultInterface,
  getDynamoDocClient,
  getIntervalLabels,
  getSubjectIdOrDeviceId,
  graphDataPointLabel,
  isValidDateISOString,
  isValidDateObject
} from 'utils'
import { validate } from 'uuid'

const logger = new Logger({
  logLevel: 'INFO',
  serviceName: 'PROJECT_graph_diaper'
})

const ddbDocClient = getDynamoDocClient()
const prefix: string = process.env.prefix !== undefined ? process.env.prefix : ''

async function PROJECT_graph_diaper ({
  subject_id, interval, refDate
}: GraphGet
): Promise<GraphReturn> {
  try {
    const getIntervals: IntervalLabels[] = getIntervalLabels({
      interval,
      refDate
    })
    getIntervals.sort((a, b) => {
      return (a.labelDate.getTime() - b.labelDate.getTime())
    })
    const startDate = new Date(getIntervals[0].labelDate.getTime())
    startDate.setHours(0, 0, 0, 0)
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
    let responseDiaper: QueryCommandOutput
    try {
      responseDiaper = await ddbDocClient.send(
        new QueryCommand(paramsDiaper)
      )
    } catch (error: any) {
      throw new Error(`Error from QueryCommand::: ${JSON.stringify(httpError.InternalServerError(error.message))}`)
    }
    try {
      const graphDataReturn: GraphReturn = { graphPoints: [] }
      const dataPoint: Record<string, GraphDataPoint> = {}
      getIntervals.forEach((intervalItem) => {
        dataPoint[intervalItem.label] = {
          label: intervalItem.label,
          labelDate: intervalItem.labelDate,
          dataPoints: {}
        }
      })
      if (responseDiaper.Items !== undefined && responseDiaper.Items !== null && responseDiaper.Items.length > 0) {
        for (const item of responseDiaper.Items as DiaperItem[]) {
          if (item.amount === undefined && item.amount === null) {
            logger.warn('Get graph diaper does not have an amount defined.')
            continue
          }
          const [itemDataPointlabel, itemDataPointLabelDate] = graphDataPointLabel({
            date: new Date(item.createdAt),
            interval
          })
          if (dataPoint[itemDataPointlabel] === undefined) {
            // in case the dataPoint[intervalItem.label] object does not get created for graphDataPointLabel label -- create it now:
            dataPoint[itemDataPointlabel] = {
              label: itemDataPointlabel,
              labelDate: itemDataPointLabelDate,
              dataPoints: {}
            }
          }
          if (dataPoint[itemDataPointlabel].dataPoints[item.category] === undefined) {
            dataPoint[itemDataPointlabel].dataPoints[item.category] = {
              type: item.category,
              value: 0
            }
          }
          dataPoint[itemDataPointlabel].dataPoints[item.category].value = +dataPoint[itemDataPointlabel].dataPoints[item.category].value + item.amount
        }
      }
      Object.keys(dataPoint).forEach((item) => {
        graphDataReturn.graphPoints.push(dataPoint[item])
      })
      return graphDataReturn
    } catch (error: any) {
      throw new httpError.InternalServerError(error.message)
    }
  } catch (error: any) {
    throw new httpError.InternalServerError(error.message)
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
      throw new Error('No path subject_id provided.')
    }
    const subject_id: string = event.pathParameters.subject
    if (!validate(subject_id)) {
      throw new Error('The subject_id is not a valid uuidv4.')
    }
    const check = await getSubjectIdOrDeviceId({ subject_id })
    logger.error(`sidcheck=${JSON.stringify(check)}`)
    const interval: string | undefined = event.queryStringParameters?.interval
    if (
      interval !== 'DAILY' &&
            interval !== 'WEEKLY' &&
            interval !== 'MONTHLY'
    ) {
      throw new Error('Interval (DAILY, WEEKLY, MONTHLY) Not Provided or Incorrect.')
    }
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
    if (!isValidDateObject(refDate)) {
      throw new Error('Invalid date object.')
    }
    try {
      const getResult: GraphReturn = await PROJECT_graph_diaper(
        { subject_id, interval, refDate }
      )
      logger.warn(`getResult:::subject_id:::${JSON.stringify(subject_id)}:::interval${JSON.stringify(interval)}:::refDate${JSON.stringify(refDate)}:::${JSON.stringify(getResult)})`)
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
