// import { injectLambdaContext, Logger } from '@aws-lambda-powertools/logger'
// import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms'
// import {
//   SendMessageBatchCommand,
//   type SendMessageBatchCommandOutput,
//   type SendMessageBatchRequestEntry,
//   SQSClient
// } from '@aws-sdk/client-sqs'
// import { type SendMessageBatchRequest } from '@aws-sdk/client-sqs/dist-types/models/models_0'
// import middy from '@middy/core'
// import errorLogger from '@middy/error-logger'
// import { type Handler } from 'aws-lambda'
// import { type AWSError } from 'aws-sdk'
// import { type Connection } from 'mysql'
// import { QUEUE_URL_SQS_MORNING } from 'schema/constants.ts'
// import {
//   dbConnection,
//   dbEnd,
//   dbQuery,
//   decodeUINT8Array,
//   type DeviceAnalyticsSummaryDBTable,
//   type DeviceAnalyticsSummaryTrackerDBTable,
//   formatDateAs
// } from 'utils'
//
// // when debugging open logger up to logLevel: INFO
// const logger = new Logger({
//   logLevel: 'WARN',
//   serviceName: 'PROJECT_deviceIdDateMorningProducer'
// })
//
// const encryptedDBUser = process.env.dbUser
// const encryptedDBPass = process.env.dbPass
// const dbHost = process.env.dbHost
//
// let dbUser: string | undefined
// let dbPass: string | undefined
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
//               sql: 'INSERT INTO PROJECT.deviceAnalyticsSummaryTracker(deviceId, date, sqsDate, producerStatus) VALUES (?,?,NOW(),TRUE) ON DUPLICATE KEY UPDATE sqsDate=NOW(), producerStatus=TRUE',
//               values: [batchMessageSuccessful.MessageAttributes?.deviceId?.StringValue, batchMessageSuccessful.MessageAttributes?.Date?.StringValue]
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
//               sql: 'INSERT INTO PROJECT.deviceAnalyticsSummaryTracker(deviceId, date, sqsDate, producerStatus) VALUES (?,?,NOW(),FALSE) ON DUPLICATE KEY UPDATE sqsDate=NOW(), producerStatus=FALSE',
//               values: [batchMessageFailed.MessageAttributes?.deviceId?.StringValue, batchMessageFailed.MessageAttributes?.Date?.StringValue]
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
// async function PROJECT_deviceIdDateMorningProducer () {
//   totalItems = 0
//   totalFailed = 0
//   totalSuccess = 0
//   const dbConnect: Connection = dbConnection({ host: dbHost!, pass: dbPass!, user: dbUser! })
//   try {
//     dbConnect.connect()
//     const response: DeviceAnalyticsSummaryDBTable[] = await dbQuery<DeviceAnalyticsSummaryDBTable>({
//       connect: dbConnect,
//       params: {
//         sql: 'SELECT deviceAnalyticsSummary.deviceId, deviceAnalyticsSummary.date ' +
//                     'FROM PROJECT.deviceAnalyticsSummary ' +
//                     'LEFT JOIN PROJECT.deviceAnalyticsSummaryTracker ' +
//                     'ON deviceAnalyticsSummary.deviceId = deviceAnalyticsSummaryTracker.deviceId ' +
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
//         if (item.deviceId && item.date) {
//           const formattedDate: string = formatDateAs(item.date)
//           logger.info(`formattedDate::${formattedDate} for ${item.date}`)
//           try {
//             messages.push({
//               Id: `${item.deviceId}-${formattedDate}`,
//               MessageAttributes: {
//                 deviceId: {
//                   DataType: 'String',
//                   StringValue: item.deviceId
//                 },
//                 Date: {
//                   DataType: 'String',
//                   StringValue: formattedDate
//                 }
//               },
//               MessageBody: JSON.stringify({
//                 deviceId: item.deviceId,
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
//             logger.error(`deviceId: ${item.deviceId}-${item.date} failed to insert into SQS.`, error as AWSError)
//           }
//         } else {
//           logger.error(`deviceId: ${item.deviceId} or Date: ${item.date} is undefined.`)
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
//     logger.error('deviceIdDateMorningProducer', error as Error)
//     throw error
//   }
// }
//
// export const lambdaHandler: Handler = async (): Promise<{} | void> => {
//   // if lambda is warm we don't need to decrypt again -- keeping these vars outside the handler
//   if (!dbUser || !dbPass || !dbHost) {
//     try {
//       const client = new KMSClient({ region: '' })
//       const dbUserCommand = new DecryptCommand({
//         CiphertextBlob: Buffer.from(encryptedDBUser as string, 'base64')
//       })
//       const dbUserData = await client.send(dbUserCommand)
//       const dbPassCommand = new DecryptCommand({
//         CiphertextBlob: Buffer.from(encryptedDBPass as string, 'base64')
//       })
//       const dbPassData = await client.send(dbPassCommand)
//
//       if (dbUserData.Plaintext) {
//         dbUser = decodeUINT8Array(dbUserData.Plaintext)
//       }
//       if (dbPassData.Plaintext) {
//         dbPass = decodeUINT8Array(dbPassData.Plaintext)
//       }
//     } catch (error: unknown) {
//       return {
//         statusCode: 500,
//         headers: { 'Access-Control-Allow-Origin': '*' },
//         body: JSON.stringify({ message: 'Failed to Connect to Data', error })
//       }
//     }
//   }
//   // if we still don't have encrypted data
//   if (!dbUser || !dbPass || !dbHost) {
//     return {
//       statusCode: 500,
//       headers: { 'Access-Control-Allow-Origin': '*' },
//       body: JSON.stringify({
//         message: 'Failed to set db information - Connect to Data'
//       })
//     }
//   }
//   await PROJECT_deviceIdDateMorningProducer()
//   return {
//     statusCode: 200,
//     headers: { 'Access-Control-Allow-Origin': '*' },
//     body: JSON.stringify({
//       message: 'Successfully ran Producer'
//     })
//   }
// }
// export const handler = middy(lambdaHandler)
//   .use(injectLambdaContext(logger))
//   .use(errorLogger())
