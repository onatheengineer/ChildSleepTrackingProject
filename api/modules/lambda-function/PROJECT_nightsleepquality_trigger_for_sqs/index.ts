import { Logger } from '@aws-lambda-powertools/logger'
import {
  SendMessageCommand,
  type SendMessageCommandInput,
  type SendMessageCommandOutput,
  SQSClient
} from '@aws-sdk/client-sqs'
import { type Handler } from 'aws-lambda'
import * as httpError from 'http-errors'
import { QUEUE_URL_SQS_NIGHTSLEEPQUALITY } from 'schema'

const logger = new Logger({
  logLevel: 'INFO',
  serviceName: 'PROJECT_nightsleepquality_trigger_for_sqs'
})

const processMessage = async (sendMessage: SendMessageCommandInput): Promise<SendMessageCommandOutput> => {
  logger.error(`Process sendMessage to Insert into SQS ${JSON.stringify(sendMessage)}`)
  const sqsClient: SQSClient = new SQSClient({ region: '' })
  const command = new SendMessageCommand(sendMessage)
  const response = await sqsClient.send(command)
  logger.error(`Process Response into SQS ${JSON.stringify(response)}`)
  return response
}

async function intoSQS (
  deviceId: string, refDate: string
): Promise<SendMessageCommandOutput> {
  try {
    const QUEUE_URL_SQS = QUEUE_URL_SQS_NIGHTSLEEPQUALITY
    const sendMessage = {
      QueueUrl: QUEUE_URL_SQS,
      DelaySeconds: 0,
      Id: `${deviceId}-${refDate}`,
      MessageAttributes: {
        deviceId: {
          DataType: 'String',
          StringValue: deviceId
        },
        date: {
          DataType: 'String',
          StringValue: refDate
        }
      },
      MessageBody: JSON.stringify({
        deviceId,
        refDate
      }
      )
    }
    return await processMessage(sendMessage)
  } catch (error: any) {
    throw new httpError.InternalServerError(error.message)
  }
}

export const handler: Handler = async (
  event: { deviceId: string, date: string, action: string }
): Promise<string> => {
  logger.error(`EVENT::: ${JSON.stringify(event)}`)
  if (
    (event === null)
  ) {
    throw new Error('No Event.')
  }

  // this value coming from a mySQL trigger
  const deviceId: string | undefined = event.deviceId

  if (((deviceId === null) || (deviceId === '') || deviceId === undefined)) {
    logger.error('No deviceId provided.')
    throw new httpError.InternalServerError('No deviceId provided.')
  }
  if (deviceId.length >= 13) {
    throw new Error(`It is possible this device has been refactored:::${JSON.stringify(deviceId)}.`)
  }
  // this value coming from a mySQL trigger
  const refDate: string | undefined = event.date
  logger.error(`refDate:: ${JSON.stringify(refDate)}`)

  if (((refDate === null) || (refDate === '') || refDate === undefined)) {
    logger.error('No refDate provided.')
    throw new httpError.InternalServerError('No refDate provided.')
  }
  // this value coming from a mySQL trigger
  const action: string | undefined = event.action
  logger.error(`action:: ${JSON.stringify(action)}`)
  if (((action === null) || (action === '') || action === undefined)) {
    logger.error('No action provided.')
  }
  try {
    const messagesResponse = await intoSQS(
      deviceId, refDate)
    return (`Successfully retrieved deviceId:::${deviceId} messageResponse:::${JSON.stringify(messagesResponse)}`)
  } catch (error: any) {
    logger.error(`Failed Method error in catch:: ${JSON.stringify(error.message)}`)
    throw new Error(`Failed Method error in catch:: ${JSON.stringify(error.message)}`)
  }
}
