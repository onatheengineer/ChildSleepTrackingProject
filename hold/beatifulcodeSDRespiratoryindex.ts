// import { Logger } from '@aws-lambda-powertools/logger'
// import { type APIGatewayProxyEvent, type APIGatewayProxyResult, type Handler } from 'aws-lambda'
// import * as httpError from 'http-errors'
// import * as mysql from 'mysql'
// import { type Connection } from 'mysql'
// import { type BPMSDRDS, type GetSubjectIdOrDeviceId, type RespiratoryItemGet, type RespiratoryItemReturn } from 'schema'
// import {
//   dbEnd,
//   dbQuery,
//   getSubjectIdOrDeviceId,
//   isValidDateISOString,
//   isValidDateObject,
//   secretsDB012Read
// } from 'utils'
// import { validate } from 'uuid'
//
// const logger = new Logger({
//   logLevel: 'WARN',
//   serviceName: 'PROJECT_respiratory'
// })
//
// let dbUser: string | undefined
// let dbPass: string | undefined
// let dbHost: string | undefined
//
// const getSecrets = async (): Promise<void> => {
//   try {
//     const secretString = await secretsDB012Read()
//     if (secretString !== undefined) {
//       if (secretString.username !== undefined && secretString.password !== undefined && secretString.host !== undefined) {
//         dbUser = secretString.username
//         dbPass = secretString.password
//         dbHost = secretString.host
//       }
//       // if we still don't have encrypted data
//       if ((dbUser === null) || (dbPass === null) || (dbHost === null)) {
//         throw new httpError.BadRequest('Failed to set db information - Connect to Data.')
//       }
//     }
//   } catch (error: unknown) {
//     throw new httpError.BadRequest('Failed getSecrets.')
//   }
// }
//
// // const ddbDocClient = getDynamoDocClient()
//
// async function getRespiratory ({
//   subject_id, refDate
// }: RespiratoryItemGet
// ): Promise<RespiratoryItemReturn> {
//   try {
//     const { deviceId }: GetSubjectIdOrDeviceId = await getSubjectIdOrDeviceId({ subject_id })
//     if (deviceId !== null && deviceId !== undefined) {
//       const responseSubjectNameRDS = await getSubjectName(deviceId)
//       const responseRes = await getBPMSDRDS(deviceId, refDate)
//       logger.info(`SDResponse:: ${JSON.stringify(responseRes)}`)
//       if (responseRes.length > 0) {
//         const weekSD = responseRes.find((el) => el.timeinterval === 'week')
//         const daySD = responseRes.find((el) => el.timeinterval === 'day')
//         if (weekSD !== undefined && daySD !== undefined && weekSD.mean !== undefined) {
//           const bpmMeanLast7Days: number = weekSD.mean
//           const bpmMeanLast7Days1SD: number = +weekSD.mean + +weekSD.sdv
//           // const bpmMeanLast7Days2SD: number = weekSD.mean + weekSD.sdv * 2
//           // const bpmMeanLast7Days3SD: number = weekSD.mean + weekSD.sdv * 3
//           const bpmMeanLast7DaysNeg1SD: number = weekSD.mean - weekSD.sdv
//           // const bpmMeanLast7DaysNeg2SD: number = weekSD.mean - weekSD.sdv * 2
//           // const bpmMeanLast7DaysNeg3SD: number = weekSD.mean - weekSD.sdv * 3
//           const bpmMeanLast24hours = daySD.mean
//           const lastUpdatedAt = weekSD.maxcreatedat
//
//           if (bpmMeanLast7Days <= bpmMeanLast7Days1SD && bpmMeanLast7Days >= bpmMeanLast7DaysNeg1SD) {
//             return {
//               lastUpdatedAt,
//               bpmMeanLast24hours,
//               statement: `${responseSubjectNameRDS.subjectName} breathing rate for the last 24 hours is consistent with the last 7 days.`,
//               attention: 'consistent'
//             }
//           }
//           if (bpmMeanLast7Days > bpmMeanLast7Days1SD) {
//             return {
//               lastUpdatedAt,
//               bpmMeanLast24hours,
//               statement: `${responseSubjectNameRDS.subjectName} breathing rate for the last 24 hours is higher than the last 7 days.`,
//               attention: 'higher'
//             }
//           }
//           if (bpmMeanLast7Days < bpmMeanLast7DaysNeg1SD) {
//             return {
//               lastUpdatedAt,
//               bpmMeanLast24hours,
//               statement: `${responseSubjectNameRDS.subjectName} breathing rate for the last 24 hours is lower than the last 7 days.`,
//               attention: 'lower'
//             }
//           }
//         }
//       }
//     }
//     return {
//       lastUpdatedAt: refDate,
//       bpmMeanLast24hours: -1,
//       statement: 'Breathing rate could not be analyzed',
//       attention: 'na'
//     }
//   } catch (err: any) {
//     logger.error('Error', err.stack)
//     throw new httpError.InternalServerError(err.message)
//   }
// }
//
// const getSubjectName = async (deviceId: string): Promise<{ subjectName: string }> => {
//   const db: Connection = mysql.createConnection({
//     connectTimeout: 4000,
//     host: dbHost,
//     user: dbUser,
//     password: dbPass
//   })
//   try {
//     db.connect()
//     const responseSubjectNameRDS = await dbQuery<Array<{ subjectName: string }>>({
//       connect: db,
//       params: {
//         sql: `SELECT PROJECT.device.subjectName
//                       from PROJECT.device
//                       WHERE deviceId = ?`,
//         values: [
//           deviceId
//         ]
//       }
//     })
//     await dbEnd(db)
//     if (responseSubjectNameRDS !== undefined && responseSubjectNameRDS !== null && responseSubjectNameRDS.length > 0) {
//       return responseSubjectNameRDS[0]
//     }
//     throw new Error('responseSubjectNameRDS')
//   } catch (error: unknown) {
//     await dbEnd(db)
//     throw new httpError.BadRequest('Params did not retrieve a responseSubjectNameRDS.')
//   }
// }
//
// const getBPMSDRDS = async (deviceId: string, refDate: Date): Promise<BPMSDRDS[]> => {
//   const db: Connection = mysql.createConnection({
//     connectTimeout: 4000,
//     host: dbHost,
//     user: dbUser,
//     password: dbPass
//   })
//   try {
//     db.connect()
//     const responseRDS = await dbQuery<BPMSDRDS[]>({
//       connect: db,
//       params: {
//         sql: `SELECT 'week'                                       as timeinterval,
//                              STDDEV_SAMP(PROJECT.deviceAnalytics.bpm) as sdv,
//                              AVG(PROJECT.deviceAnalytics.bpm)         as mean,
//                              MAX(PROJECT.deviceAnalytics.createdAt)   as maxcreatedat
//                       FROM PROJECT.deviceAnalytics
//                       WHERE deviceId = ?
//                         AND state = 'breathing'
//                         AND timestamp(from_unixtime(PROJECT.deviceAnalytics.createdAt)) >=
//                             ? - INTERVAL 7 DAY
//                         AND timestamp(from_unixtime(PROJECT.deviceAnalytics.createdAt)) <= ?
//                       UNION
//                       SELECT 'day'                                        as timeinterval,
//                              STDDEV_SAMP(PROJECT.deviceAnalytics.bpm) as sdv,
//                              AVG(PROJECT.deviceAnalytics.bpm)         as mean,
//                              MAX(PROJECT.deviceAnalytics.createdAt)   as maxcreatedat
//                       FROM PROJECT.deviceAnalytics
//                       WHERE deviceId = ?
//                         AND state = 'breathing'
//                         AND timestamp(from_unixtime(PROJECT.deviceAnalytics.createdAt)) >=
//                             ? - INTERVAL 1 DAY
//                         AND timestamp(from_unixtime(PROJECT.deviceAnalytics.createdAt)) <= ?`,
//         values: [
//           deviceId,
//           refDate.toISOString().slice(0, 19).replace('T', ' '),
//           refDate.toISOString().slice(0, 19).replace('T', ' '),
//           deviceId,
//           refDate.toISOString().slice(0, 19).replace('T', ' '),
//           refDate.toISOString().slice(0, 19).replace('T', ' ')
//         ]
//       }
//     })
//     await dbEnd(db)
//     if (responseRDS !== undefined && responseRDS !== null && responseRDS.length > 0) {
//       return responseRDS
//     } else {
//       throw new Error('responseRDS !== undefined && responseRDS !== null && responseRDS.length > 0 :: Failed try/catch function:: getBPMSDRDS.')
//     }
//   } catch (error: unknown) {
//     await dbEnd(db)
//     throw new httpError.BadRequest(`Failed try/catch function:: getBPMSDRDS:: ${JSON.stringify(error)}`)
//   }
// }
//
// export const handler: Handler = async (
//   event: APIGatewayProxyEvent
// ): Promise<APIGatewayProxyResult> => {
//   if (
//     (event.queryStringParameters == null) &&
//         event.requestContext.httpMethod === 'GET'
//   ) {
//     throw new httpError.BadRequest('No queryString provided.')
//   }
//   if ((event.body == null) && event.requestContext.httpMethod !== 'GET') {
//     throw new httpError.BadRequest('No Body provided.')
//   }
//   if (event.pathParameters === null) {
//     throw new httpError.BadRequest('No path parameter provided.')
//   }
//   if (event.queryStringParameters === null) {
//     throw new httpError.BadRequest('No path parameter provided.')
//   }
//   if (event.pathParameters.subject === null) {
//     throw new httpError.BadRequest('No path subjectId provided.')
//   }
//   const subject_id: string = event.pathParameters.subject as string
//   logger.error(`The subject_id::::.', ${JSON.stringify(subject_id)}`)
//   if (!validate(subject_id)) {
//     logger.error('The subject_id is not correct.')
//     throw new httpError.BadRequest('The subject_id is not correct.')
//   }
//   const refDateIncoming: string = event.queryStringParameters.refDate as string
//   logger.error(`The refDateIncoming::::.', ${JSON.stringify(refDateIncoming)}`)
//   if (refDateIncoming === null) {
//     logger.error('The subject_id is not correct.')
//     throw new httpError.BadRequest('The date is not correct.')
//   }
//   if (refDateIncoming !== '') {
//     if (!isValidDateISOString(refDateIncoming)) {
//       logger.error('Reference Date not in ISO format.')
//       throw new httpError.BadRequest('Reference Date not in ISO format.')
//     }
//   }
//   const refDate = refDateIncoming !== ''
//     ? new Date(refDateIncoming)
//     : new Date()
//
//   if (!isValidDateObject(refDate)) {
//     logger.warn('Invalid Reference Date')
//     throw new httpError.BadRequest('Invalid Reference Date.')
//   }
//   try {
//     await getSecrets()
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         status: false,
//         message: `Failed to get Secrets::: ${JSON.stringify(error)}`
//       })
//     }
//   }
//   try {
//     const getResult: RespiratoryItemReturn = await getRespiratory(
//       { subject_id, refDate }
//     )
//     return {
//       statusCode: 200,
//       body: JSON.stringify(getResult)
//     }
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         status: false,
//         message: `Failed Get Method::: ${JSON.stringify(error)}`
//       })
//     }
//   }
// }
