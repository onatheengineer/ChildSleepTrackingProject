import { Logger } from '@aws-lambda-powertools/logger'
import { InvokeCommand, LambdaClient, LogType } from '@aws-sdk/client-lambda'
import { DeleteMessageCommand, type DeleteMessageCommandOutput, SQSClient } from '@aws-sdk/client-sqs'
import { type SQSEvent, type SQSHandler, type SQSRecord } from 'aws-lambda'
import * as httpError from 'http-errors'
import { QUEUE_URL_SQS_NIGHTSLEEPQUALITY } from 'schema'

// when debugging open logger up to logLevel: INFO
const logger = new Logger({
  logLevel: 'INFO',
  serviceName: 'PROJECT_nightsleepquality_sqs_consumer'
})

const sqsClient = new SQSClient({ region: '' })

interface NightSleepQualityConsumer {
  deviceId: string
  date: string
}

const deleteMessage = async (message: SQSRecord): Promise<void> => {
  const deleteParams = {
    QueueUrl: QUEUE_URL_SQS_NIGHTSLEEPQUALITY,
    ReceiptHandle: message.receiptHandle
  }
  try {
    const data: DeleteMessageCommandOutput = await sqsClient.send(new DeleteMessageCommand(deleteParams))
    logger.error(`Message deleted:::", ${JSON.stringify(data)}`)
  } catch (error: any) {
    logger.error(`deleteMessage Error:::${JSON.stringify(error.message)}`)
  }
}
const invokeNightlySummary = async (funcName: string, payload: NightSleepQualityConsumer): Promise<void> => {
  const lambdaClient = new LambdaClient('region: ')
  const command = new InvokeCommand({
    // arn:aws:lambda:....:function:nightly_summary
    FunctionName: funcName,
    InvocationType: 'Event',
    Payload: Buffer.from(JSON.stringify(payload)),
    LogType: LogType.Tail
  })
  await lambdaClient.send(command)
}

export const handler: SQSHandler = async (sqsEvent: SQSEvent) => {
  logger.error(`sqsEvent:: ${JSON.stringify(sqsEvent)}`)
  const message: SQSRecord | undefined = sqsEvent.Records[0]
  logger.error(`MESSAGE:: ${JSON.stringify(message)}`)
  if (message !== null || message !== undefined) {
    if ('deviceId' in message.messageAttributes && 'refDate' in message.messageAttributes) {
      const deviceId: string | undefined = message.messageAttributes?.deviceId?.stringValue
      const date: string | undefined = message.messageAttributes?.refDate?.stringValue
      if (deviceId === null || date === null || deviceId === undefined || date === undefined) {
        logger.error('Failed to receiveSqs messageAttributes deviceId and or date is null or undefined.')
      }
      if (deviceId !== null && date !== null && deviceId !== undefined && date !== undefined) {
        const payload: NightSleepQualityConsumer = { deviceId, date }
        try {
          await invokeNightlySummary('nightly_summary', payload)
          logger.error(`invokeNightlySummary Susscessful:::${JSON.stringify(payload)}`)
        } catch (error: any) {
          logger.error(`Failed to execute PROJECT_sqs_queue_nightsleepquality_consumer:::${JSON.stringify(error.message)}`)
        }
        try {
          //  VisibilityTimeout: 20 -- I have 20 seconds to delete this message ounce processed
          await deleteMessage(message)
        } catch (error: any) {
          logger.error(`Failed to execute deleteMessage:::${JSON.stringify(error.message)}`)
        }
      }
    }
  } else {
    logger.error('Failed to receiveSqs message')
    throw new httpError.InternalServerError('FAILED message !== null || message !== undefined.')
  }
}
