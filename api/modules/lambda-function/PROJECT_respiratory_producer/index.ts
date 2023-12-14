// // when debugging open logger up to logLevel: INFO
// import { Logger } from '@aws-lambda-powertools/logger'
// import { type Handler } from 'aws-lambda'
// import * as httpErrors from 'http-errors'
// import { type Connection } from 'mysql'
//
// const logger = new Logger({
//   logLevel: 'INFO',
//   serviceName: 'PROJECT_subject_idDateMorningProducer'
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
//         throw new httpErrors.BadRequest('Failed to set db information - Connect to Data.')
//       }
//     }
//   } catch (error: unknown) {
//     throw new httpErrors.BadRequest('Failed to Connect to Data.')
//   }
// }
//
// const sqsClient: SQSClient = new SQSClient({ region: '' })
//
// let totalItems = 0
// let totalSuccess = 0
// let totalFailed = 0
//
// const processBatch = async (dbConnect: Connection, batch: SendMessageBatchRequestEntry[]): Promise<void> => {
//   logger.info(`Process Batch to Insert into SQS ${JSON.stringify(batch)}`)
//   const command = new SendMessageBatchCommand({
//     Entries: batch,
//     QueueUrl: QUEUE_URL_SQS_MORNING
//   } as SendMessageBatchRequest)
//   const response: SendMessageBatchCommandOutput = await sqsClient.send(command)
//   logger.info('SQS RESPONSE::', JSON.stringify(response))
//   if (response.Successful) {
//     for (const i of response.Successful) {
//       totalSuccess += 1
//       const batchMessageSuccessful = batch.find((entry) => {
//         return entry.Id === i.Id
//       })
//       logger.info(`Batch Message Found of Success :: ${JSON.stringify(batchMessageSuccessful)}`)
//       if (batchMessageSuccessful) {
//         try {
//           await dbQuery<DeviceAnalyticsSummaryTrackerDBTable>({
//             connect: dbConnect,
//             params: {
//               sql: 'INSERT INTO PROJECT.deviceAnalyticsSummaryTracker(subject_id, date, sqsDate, producerStatus) VALUES (?,?,NOW(),TRUE) ON DUPLICATE KEY UPDATE sqsDate=NOW(), producerStatus=TRUE',
//               values: [batchMessageSuccessful.MessageAttributes?.subject_id?.StringValue, batchMessageSuccessful.MessageAttributes?.Date?.StringValue]
//             }
//           })
//         } catch (error: unknown) {
//           logger.error('responseSuccess failed status INSERT into deviceAnalyticsSummaryTracker', error as Error)
//         }
//       } else {
//         logger.error(`batchMessage entryId is not defined - failed INSERT into deviceAnalyticsSummaryTracker ${JSON.stringify(i)}`)
//       }
//     }
//     logger.info(`Response.Successful Insert into SQS ${JSON.stringify(response)}`)
//   }
//   if (response.Failed) {
//     for (const i of response.Failed) {
//       totalFailed += 1
//       const batchMessageFailed: SendMessageBatchRequestEntry | undefined = batch.find((entry) => {
//         return entry.Id === i.Id
//       })
//       try {
//         if (batchMessageFailed) {
//           logger.error(`Found failed batchMessageFailed:::", ${JSON.stringify(batchMessageFailed)}`)
//           await dbQuery<DeviceAnalyticsSummaryTrackerDBTable>({
//             connect: dbConnect,
//             params: {
//               sql: 'INSERT INTO PROJECT.deviceAnalyticsSummaryTracker(subject_id, date, sqsDate, producerStatus) VALUES (?,?,NOW(),FALSE) ON DUPLICATE KEY UPDATE sqsDate=NOW(), producerStatus=FALSE',
//               values: [batchMessageFailed.MessageAttributes?.subject_id?.StringValue, batchMessageFailed.MessageAttributes?.Date?.StringValue]
//             }
//           })
//         } else {
//           logger.error(`batchMessageFailed: ${batchMessageFailed} failed producerStatus INSERT deviceAnalyticsSummaryTracker`)
//         }
//       } catch (error: unknown) {
//         logger.error(`responseFailed: ${response.Failed} failed producerStatus INSERT into deviceAnalyticsSummaryTracker`, error as AWSError)
//       }
//     }
//     logger.info(`Response.Failed Insert into SQS ${JSON.stringify(response)}`)
//   }
// }
//
// async function PROJECT_subject_idDateMorningProducer () {
//   totalItems = 0
//   totalFailed = 0
//   totalSuccess = 0
//   const dbConnect: Connection = dbConnection({ host: dbHost!, pass: dbPass!, user: dbUser! })
//   try {
//     dbConnect.connect()
//     const response: DeviceAnalyticsSummaryDBTable[] = await dbQuery<DeviceAnalyticsSummaryDBTable>({
//       connect: dbConnect,
//       params: {
//         sql: 'SELECT deviceAnalyticsSummary.subject_id, deviceAnalyticsSummary.date ' +
//                     'FROM PROJECT.deviceAnalyticsSummary ' +
//                     'LEFT JOIN PROJECT.deviceAnalyticsSummaryTracker ' +
//                     'ON deviceAnalyticsSummary.subject_id = deviceAnalyticsSummaryTracker.subject_id ' +
//                     'AND deviceAnalyticsSummary.date = deviceAnalyticsSummaryTracker.date ' +
//                     'WHERE deviceAnalyticsSummaryTracker.sqsDate IS NULL AND deviceAnalyticsSummary.date = CURRENT_DATE() LIMIT 1000',
//         values: []
//       }
//     })
//     const messages: SendMessageBatchRequestEntry[] = []
//     if (response) {
//       for (const item of response) {
//         totalItems += 1
//         logger.info(`itemresponse:::: ${JSON.stringify(item)} MessagesLength: ${messages.length}`)
//         if (item.subject_id && item.date) {
//           const formattedDate: string = formatDateAs(item.date)
//           logger.info(`formattedDate::${formattedDate} for ${item.date}`)
//           try {
//             messages.push({
//               Id: `${item.subject_id}-${formattedDate}`,
//               MessageAttributes: {
//                 subject_id: {
//                   DataType: 'String',
//                   StringValue: item.subject_id
//                 },
//                 Date: {
//                   DataType: 'String',
//                   StringValue: formattedDate
//                 }
//               },
//               MessageBody: JSON.stringify({
//                 subject_id: item.subject_id,
//                 date: item.date
//               }
//               )
//             })
//             if (messages.length === 10) {
//               logger.info('processing Batch')
//               logger.info(JSON.stringify(messages))
//               try {
//                 await processBatch(dbConnect, messages)
//               } catch (error: unknown) {
//                 logger.error('Failed to Process Batch, Continuing', error as AWSError)
//               }
//               messages.length = 0
//             }
//           } catch (error: unknown) {
//             logger.error(`subject_id: ${item.subject_id}-${item.date} failed to insert into SQS.`, error as AWSError)
//           }
//         } else {
//           logger.error(`subject_id: ${item.subject_id} or Date: ${item.date} is undefined.`)
//         }
//       }
//       if (messages.length > 0) {
//         await processBatch(dbConnect, messages)
//       }
//     }
//     logger.warn(`Producer Summary Total Items=${totalItems}  Successful=${totalSuccess}  Failed=${totalFailed}`)
//     await dbEnd(dbConnect)
//   } catch (error: unknown) {
//     await dbEnd(dbConnect)
//     logger.error('subject_idDateMorningProducer', error as Error)
//     throw error
//   }
// }
//
// export const handler: Handler = async (): Promise<Record<string, unknown>> => {
//   // if lambda is warm we don't need to decrypt again -- keeping these vars outside the handler
//   await getSecrets()
//   await PROJECT_respiratory_producer()
//   return {
//     statusCode: 200,
//     headers: { 'Access-Control-Allow-Origin': '*' },
//     body: JSON.stringify({
//       message: 'Successfully ran Producer'
//     })
//   }
// }
