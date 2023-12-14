import { Logger } from '@aws-lambda-powertools/logger'
import { type APIGatewayProxyEvent, type Handler } from 'aws-lambda'
import * as httpError from 'http-errors'
import { type GetSubjectIdOrDeviceId, type GraphDataPointRespiratory, type GraphGet, type IntervalLabels } from 'schema'
import {
  apiGatewayProxyResult,
  type ApiGatewayProxyResultInterface,
  dbQuery,
  getDBConnectionPROJECTAlgo,
  getDBConnectionPROJECT,
  getIntervalLabels,
  getSubjectIdOrDeviceId,
  isValidDateISOString,
  isValidDateObject
} from 'utils'
import { validate } from 'uuid'

const logger = new Logger({
  logLevel: 'INFO',
  serviceName: 'PROJECT_graphType1'
})

function calcLastDate (dte: Date, interval: string): Date {
  const dt = new Date(dte.getTime())
  if (interval === 'DAILY') {
    dt.setDate(dt.getDate() + 1)
  }
  if (interval === 'WEEKLY') {
    dt.setDate(dt.getDate() + 7)
  }
  if (interval === 'MONTHLY') {
    dt.setMonth(dt.getMonth() + 1)
  }
  return dt
}

async function PROJECTGraphRespiratory ({
  subject_id,
  refDate,
  interval
}: GraphGet): Promise<GraphDataPointRespiratory[]> {
  const dbConnection = await getDBConnectionPROJECTAlgo()
  try {
    const { deviceId }:
    GetSubjectIdOrDeviceId = await getSubjectIdOrDeviceId({ subject_id })
    if (deviceId !== null && deviceId !== undefined) {
      const getIntervals: IntervalLabels[] = getIntervalLabels({
        interval,
        refDate
      })
      getIntervals.sort((a, b) => {
        return (a.labelDate.getTime() - b.labelDate.getTime())
      })
      const query: string[] = []
      getIntervals.forEach((item, idx) => {
        const startDate: Date = item.labelDate
        const endDate = idx + 1 === getIntervals.length
          ? calcLastDate(item.labelDate, interval)
          : getIntervals[idx + 1].labelDate
        query.push(`SELECT '${item.label}'                      as label,
                                   '${item.labelDate.toISOString()}'    as labelDate,
                                   AVG(PROJECT.deviceAnalytics.bpm) as mean,
                                   'RPM'                                as RPM
                            FROM PROJECT.deviceAnalytics
                            WHERE deviceId = '${deviceId}'
                              AND state = 'breathing'
                              AND timestamp(from_unixtime(PROJECT.deviceAnalytics.createdAt))
                                >= '${startDate.toISOString()}'
                              AND timestamp(from_unixtime(PROJECT.deviceAnalytics.createdAt))
                                < '${endDate.toISOString()}'
                `)
      })
      const queryString = query.join('\nUNION\n')
      const dbConnection = await getDBConnectionPROJECT()
      try {
        const response = await dbQuery<GraphDataPointRespiratory[]>({
          connect: dbConnection,
          params: {
            sql: queryString,
            values: []
          }
        })
        if (dbConnection.state === 'authenticated') {
          dbConnection.end()
        }
        if (response !== undefined && response !== null && response.length > 0) {
          const result = response.map((el) => {
            return ({
              label: el.label,
              labelDate: el.labelDate,
              mean: el.mean,
              RPM: el.RPM
            }
            )
          })
          return result
        }
      } catch (error: any | unknown) {
        if (dbConnection.state === 'authenticated') {
          dbConnection.end()
        }
        throw Error(`Failed response = await dbQuery catch::${JSON.stringify(error.message)}`)
      }
    }
    throw Error('Failed deviceId !== null')
  } catch (error: any | unknown) {
    if (dbConnection.state === 'authenticated') {
      dbConnection.end()
    }
    throw Error(`Failed catch::${JSON.stringify(error.message)}`)
  }
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiGatewayProxyResultInterface> => {
  logger.info('Hello PROJECT_graph_respiratory')
  logger.info(`Event: ${JSON.stringify(event, null, 2)}`)

  if (
    (event.queryStringParameters == null) &&
        event.requestContext.httpMethod === 'GET'
  ) {
    throw new httpError.BadRequest('No queryString provided.')
  }
  if ((event.body == null) && event.requestContext.httpMethod !== 'GET') {
    throw new httpError.BadRequest('No Body provided.')
  }
  if (event.pathParameters === null) {
    throw new httpError.BadRequest('No path parameter provided.')
  }
  if (event.queryStringParameters === null) {
    throw new httpError.BadRequest('No path parameter provided.')
  }
  if (event.pathParameters.subject === null) {
    throw new httpError.BadRequest('No path subjectId provided.')
  }
  const subject_id: string = event.pathParameters.subject as string
  logger.error(`The subject_id::::.', ${JSON.stringify(subject_id)}`)
  if (!validate(subject_id)) {
    logger.error('The subject_id is not correct.')
    throw new httpError.BadRequest('The subject_id is not correct.')
  }
  const refDateIncoming: string | undefined = event.queryStringParameters.refDate as string
  let refDate: Date = new Date()

  if (refDateIncoming !== undefined) {
    if (!isValidDateISOString(refDateIncoming)) {
      logger.error('Reference Date not in ISO format.')
      throw new httpError.BadRequest('Reference Date not in ISO format.')
    }
    refDate = new Date(refDateIncoming)
  }
  if (!isValidDateObject(refDate)) {
    logger.error('Invalid Date Object.')
    throw new httpError.BadRequest('Invalid Date Object.')
  }
  const interval: string | undefined = event.queryStringParameters?.interval
  if ((interval === null) ||
        (interval !== 'DAILY' &&
            interval !== 'WEEKLY' &&
            interval !== 'MONTHLY')
  ) {
    logger.error('Invalid interval string, please provide DAILY | WEEKLY | MONTHLY.')
    throw new httpError.BadRequest('Interval (DAILY, WEEKLY, MONTHLY) not provided or incorrect.')
  }

  const intervalAsEnum: 'DAILY' | 'WEEKLY' | 'MONTHLY' = interval

  const result: GraphDataPointRespiratory[] = await PROJECTGraphRespiratory({
    subject_id,
    refDate,
    interval: intervalAsEnum
  })
  return (apiGatewayProxyResult('200', JSON.stringify(result)))
}
