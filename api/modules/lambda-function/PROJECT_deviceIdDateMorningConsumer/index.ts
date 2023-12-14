// import { injectLambdaContext, Logger } from '@aws-lambda-powertools/logger'
// import { DeleteMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
// import { type SQSEvent, type SQSHandler, type SQSRecord } from 'aws-lambda'
// import * as AWS from 'aws-sdk'
// import { type AWSError } from 'aws-sdk'
// import * as mysql from "mysql";
// import { type Connection } from 'mysql'
//
// // when debugging open logger up to logLevel: INFO
// const logger = new Logger({
//   logLevel: 'INFO',
//   serviceName: 'PROJECT_deviceIdDateMorningConsumer'
// })
//
// // const encryptedDBUser = process.env.dbUser
// // const encryptedDBPass = process.env.dbPass
// // const dbHost = process.env.dbHost
//
// let dbUser: string | undefined
// let dbPass: string | undefined
//
// AWS.config.region = ''
// const stepFunctions = new AWS.StepFunctions()
// const sqsClient = new SQSClient({ region: '' })
//
// interface deviceIdDateMorningConsumer {
//   deviceId: string
//   date: string
// }
//
// const deleteMessage = async (message: SQSRecord): Promise<void> => {
//   const deleteParams = {
//     QueueUrl: QUEUE_URL_SQS_MORNING,
//     ReceiptHandle: message.receiptHandle
//   }
//   try {
//     const data = await sqsClient.send(new DeleteMessageCommand(deleteParams))
//     logger.info(`Message deleted", ${data}`)
//   } catch (error: unknown) {
//     logger.error('Error', error as AWS.AWSError)
//   }
// }
//
// async function PROJECT_deviceIdDateMorningConsumer (payload: deviceIdDateMorningConsumer): Promise<void> {
//   logger.info(`PAYLOAD::${JSON.stringify(payload)}`)
//   const params = {
//     name: payload.deviceId + '-' + payload.date,
//     input: JSON.stringify(payload),
//     stateMachineArn: 'arn:aws:states:....:stateMachine:PROJECT_StateMachine-Morning'
//   }
//   const secretString = await secretsDB012Read()
//   if (secretString !== undefined) {
//     if (secretString.username !== undefined && secretString.password !== undefined && secretString.host !== undefined) {
//       const dbUser = secretString.username
//       const dbPass = secretString.password
//       const dbHost = secretString.host
//
//       const db: Connection = mysql.createConnection({
//         connectTimeout: 4000,
//         host: dbHost,
//         user: dbUser,
//         password: dbPass
//       })
//       try {
//         db.connect()
//
//
//   logger.info('PARAMS', JSON.stringify(params))
//   try {
//     stepFunctions.startExecution(params, function (error: AWS.AWSError) {
//       if (error) {
//         logger.error(`error while executing step function ${payload.deviceId}-${payload.date}`)
//       } else {
//         logger.info(`started execution of step function ${payload.deviceId}-${payload.date}`)
//       }
//     })
//     try {
//       await dbQuery<DeviceAnalyticsSummaryTrackerDBTable>({
//         connect: dbConnect,
//         params: {
//           sql: 'UPDATE PROJECT.deviceAnalyticsSummaryTracker SET consumerStatus=TRUE WHERE deviceId=? AND date=?',
//           values: [payload.deviceId, payload.date]
//         }
//       })
//     } catch (error: unknown) {
//       logger.error('Failed to connect to PROJECTAlgo', error as AWSError)
//     }
//   } catch (error: unknown) {
//     try {
//       await dbQuery<DeviceAnalyticsSummaryTrackerDBTable>({
//         connect: dbConnect,
//         params: {
//           sql: 'UPDATE PROJECT.deviceAnalyticsSummaryTracker SET consumerStatus=FALSE WHERE deviceId=? AND date=?',
//           values: [payload.deviceId, payload.date]
//         }
//       })
//     } catch (error: unknown) {
//       logger.error('Failed to connect to PROJECTAlgo', error as AWSError)
//     }
//     logger.error('Failed to execute stepFunction', error as AWS.AWSError)
//   }
//   try {
//     await dbEnd(dbConnect)
//   } catch (error: unknown) {
//     logger.error('Failed to connect to PROJECTAlgo', error as AWSError)
//   }
// }
//
// export const handler: SQSHandler = async (sqsEvent: SQSEvent) => {
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
//       if (dbUserData.Plaintext != null) {
//         dbUser = decodeUINT8Array(dbUserData.Plaintext)
//       }
//       if (dbPassData.Plaintext != null) {
//         dbPass = decodeUINT8Array(dbPassData.Plaintext)
//       }
//     } catch (error: unknown) {
//       throw error
//     }
//   }
//   // if we still don't have encrypted data
//   if (!dbUser || !dbPass || !dbHost) {
//     throw new Error('no db env info')
//   }
//   const message: SQSRecord | undefined = sqsEvent.Records[0]
//   logger.info(`MESSAGE:: ${JSON.stringify(message)}`)
//   if (message != null) {
//     if ('deviceId' in message.messageAttributes && 'Date' in message.messageAttributes) {
//       const deviceId: string | undefined = message.messageAttributes?.deviceId?.stringValue
//       const date: string | undefined = message.messageAttributes?.Date?.stringValue
//       if (deviceId && date) {
//         const payload: deviceIdDateMorningConsumer = { deviceId, date }
//         try {
//           await PROJECT_deviceIdDateMorningConsumer(payload)
//         } catch (error: unknown) {
//           logger.error('Failed to execute PROJECT_deviceIdDateMorningConsumer', error as AWS.AWSError)
//         }
//       } else {
//         logger.error('Failed to receiveSqs messageAttributes deviceId and date')
//       }
//     } else {
//       logger.error('Failed to receiveSqs messageAttributes')
//     }
//     try {
//       await deleteMessage(message)
//     } catch (error: unknown) {
//       logger.error('Failed to deleteMessage message - PROJECT_deviceIdDateMorningConsumer', error as AWS.AWSError)
//     }
//   } else {
//     logger.error('Failed to receiveSqs message')
//   }
// }
//
