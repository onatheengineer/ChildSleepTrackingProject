import { Logger } from '@aws-lambda-powertools/logger'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { type APIGatewayProxyEvent, type Handler } from 'aws-lambda'
import * as httpError from 'http-errors'
import { type GetSubjectIdOrDeviceId, type RespiratoryItemGet, type RespiratoryItemReturn } from 'schema'
import {
  apiGatewayProxyResult,
  type ApiGatewayProxyResultInterface,
  dbQuery,
  getDBConnectionPROJECT,
  getDynamoDocClient,
  getSubjectIdOrDeviceId,
  isValidDateISOString,
  isValidDateObject
} from 'utils'
import { validate } from 'uuid'

const logger = new Logger({
  logLevel: 'WARN',
  serviceName: 'PROJECT_respiratory'
})

const ddbDocClient = getDynamoDocClient()

async function getRespiratory ({
  subject_id, refDate
}: RespiratoryItemGet
): Promise<RespiratoryItemReturn> {
  try {
    let responseSubjectNameAndGenderRDS
    const { deviceId }: GetSubjectIdOrDeviceId = await getSubjectIdOrDeviceId({ subject_id })
    if (deviceId !== null && deviceId !== undefined) {
      try {
        responseSubjectNameAndGenderRDS = await getSubjectNameAndGender(deviceId)
      } catch (e) {
        throw new httpError.BadRequest('Error retrieving from the RDS getSubjectNameAndGender:::')
      }

      const startDate = new Date(refDate.getTime() - (8 * 86400 * 1000))
      const paramsIllnessDetectionAndNighlySummary = {
        TableName: 'ContentServer',
        // IndexName: "person_id-event_date-index",
        KeyConditionExpression: 'deviceId = :d and epoch_contentId BETWEEN :f AND :t',
        ExpressionAttributeValues: {
          ':d': deviceId,
          ':f': (startDate.getTime() / 1000).toString(),
          ':t': (refDate.getTime() / 1000).toString()
        }
      }
      let illnessAttention: 'lower' | 'consistent' | 'inconsistentHigh' | 'higher' | 'na' = 'consistent'
      let middleRPM: number = -1
      let statement: string = ''
      const subStatement: '' | 'Make sure that your baby sleeps under the PROJECT Monitor through the night' = ''
      let videoStatement: string = ''
      let videoURL: string = ''
      let subjectGenderFull: string = 'their'
      let illnessTodayDatetime: Date | undefined
      const metricsStatement: string = 'Sleep and breathing metrics are regularly analyzed for changes in ' +
                'your baby\'s regular patterns. Caregivers will be notified if a deviation from the trend occurs.'
      try {
        const response = await ddbDocClient.send(new QueryCommand(paramsIllnessDetectionAndNighlySummary))
        if (response === null || response === undefined) {
          return {
            lastUpdatedAt: refDate.toISOString(),
            middleNumberRPM: -1,
            statement: 'Breathing rate could not be analyzed',
            subStatement,
            attention: 'Error',
            illnessInformation: {
              metricsStatement: '',
              videoStatement: '',
              videoURL: ''
            }
          }
        }
        if (response.Items === null || response.Items === undefined) {
          return {
            lastUpdatedAt: refDate.toISOString(),
            middleNumberRPM: -1,
            statement: 'Breathing summary will be available after 10AM',
            subStatement,
            attention: 'na',
            illnessInformation: {
              metricsStatement: '',
              videoStatement: '',
              videoURL: ''
            }
          }
        }
        if (response.Items !== null && response.Items !== undefined) {
          const nightlySummaryDaily = response.Items
            .filter((item) => item.epoch_contentId.includes('nightlySummary'))
          const nightlySummaryToday = nightlySummaryDaily.find((el) => {
            if (el !== undefined) {
              return el.content.date === refDate.toISOString().slice(0, 10)
            }
            return false
          })
          if (nightlySummaryToday === undefined) {
            return {
              lastUpdatedAt: refDate.toISOString(),
              middleNumberRPM: -1,
              statement: `${responseSubjectNameAndGenderRDS.subjectName}'s breathing summary is not available`,
              subStatement: 'Make sure that your baby sleeps under the PROJECT Monitor through the night',
              attention: 'na',
              illnessInformation: {
                metricsStatement: '',
                videoStatement: '',
                videoURL: ''
              }
            }
          }
          if (nightlySummaryToday.content.totalAvgBpm === undefined) {
            return {
              lastUpdatedAt: refDate.toISOString(),
              middleNumberRPM: -1,
              statement: `${responseSubjectNameAndGenderRDS.subjectName}'s breathing summary is not available, make sure that your baby sleeps under the PROJECT Monitor through the night`,
              subStatement: 'Make sure that your baby sleeps under the PROJECT Monitor through the night',
              attention: 'na',
              illnessInformation: {
                metricsStatement: '',
                videoStatement: '',
                videoURL: ''
              }
            }
          }
          middleRPM = nightlySummaryToday.content.totalAvgBpm
          const illnessDetection = response.Items
            .filter((item) => item.epoch_contentId.includes('advancedAnalytic_breathingData_illnessDetection'))
          const illnessToday = illnessDetection.find((el) => {
            if (el !== undefined) {
              return el.content.date === refDate.toISOString().slice(0, 10)
            }
            return false
          })
          const illnessNotToday = illnessDetection.find((el) => {
            if (el !== undefined) {
              return el.content.date !== refDate.toISOString().slice(0, 10)
            }
            return false
          })
          if (illnessToday !== undefined) {
            illnessAttention = 'higher'
            if (illnessToday.content.thresholdRPM !== undefined) {
              middleRPM = Math.round((parseFloat(illnessToday.content.thresholdRPM) + Number.EPSILON) * 100) / 100
            }
            if (illnessToday.content.epoch !== undefined) {
              illnessTodayDatetime = new Date(illnessToday.content.epoch)
            }
          } else if (illnessNotToday !== undefined) {
            illnessAttention = 'inconsistentHigh'
          }
        }
      } catch (err: any) {
        logger.error('Error', err.message)
      }
      if (responseSubjectNameAndGenderRDS.subjectGender === 'f') {
        subjectGenderFull = 'her'
      }
      if (responseSubjectNameAndGenderRDS.subjectGender === 'm') {
        subjectGenderFull = 'his'
      }
      if (illnessAttention === 'higher') {
        statement = `${responseSubjectNameAndGenderRDS.subjectName}'s breathing rate was higher than ${subjectGenderFull} usual breathing rate.`
        videoStatement = 'What an increase in breathing rate could mean?'
        videoURL = ''
      }
      if (illnessAttention === 'inconsistentHigh') {
        statement = 'A variation in breathing rate has been detected in the past seven days.'
        videoStatement = 'What an increase in breathing rate could mean?'
        videoURL = ''
      }
      if (illnessAttention === 'consistent') {
        statement = 'Breathing rate seems consistent for the past week.'
        videoStatement = 'What an increase in breathing rate could mean?'
        videoURL = ''
      }
      return {
        lastUpdatedAt: illnessTodayDatetime?.toISOString(),
        middleNumberRPM: middleRPM,
        statement,
        subStatement: '',
        attention: illnessAttention,
        illnessInformation: {
          metricsStatement,
          videoStatement,
          videoURL
        }
      }
    }
  } catch (err: any) {
    throw new httpError.InternalServerError(err.message)
  }
  return {
    lastUpdatedAt: refDate.toISOString(),
    middleNumberRPM: -1,
    statement: 'Breathing rate could not be analyzed',
    subStatement: '',
    attention: 'Error',
    illnessInformation: {
      metricsStatement: '',
      videoStatement: '',
      videoURL: ''
    }
  }
}

const getSubjectNameAndGender = async (deviceId: string): Promise<{ subjectName: string, subjectGender: string }> => {
  const dbConnection = await getDBConnectionPROJECT()
  try {
    const responseSubjectNameAndGenderRDS = await dbQuery<Array<{ subjectName: string, subjectGender: string }>>({
      connect: dbConnection,
      params: {
        sql: `SELECT PROJECT.device.subjectName, PROJECT.device.subjectGender
                      from PROJECT.device
                      WHERE deviceId = ?`,
        values: [
          deviceId
        ]
      }
    })
    if (dbConnection.state === 'authenticated') {
      dbConnection.end()
    }
    if (responseSubjectNameAndGenderRDS !== undefined && responseSubjectNameAndGenderRDS !== null && responseSubjectNameAndGenderRDS.length > 0) {
      return responseSubjectNameAndGenderRDS[0]
    }
    throw new Error('responseSubjectNameRDS')
  } catch (error: unknown) {
    if (dbConnection.state === 'authenticated') {
      dbConnection.end()
    }
    throw new httpError.BadRequest('Params did not retrieve a responseSubjectNameRDS.')
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
      const getResult: RespiratoryItemReturn = await getRespiratory(
        { subject_id, refDate }
      )
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
