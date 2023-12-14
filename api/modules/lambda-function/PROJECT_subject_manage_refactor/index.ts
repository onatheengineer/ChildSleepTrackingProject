import { Logger } from '@aws-lambda-powertools/logger'
import { UpdateCommand, type UpdateCommandInput } from '@aws-sdk/lib-dynamodb'
import { type Handler } from 'aws-lambda'
import * as httpError from 'http-errors'
import { getDynamoDocClient, getSubjectIdOrDeviceId } from 'utils'
import { validate } from 'uuid'

const logger = new Logger({
  logLevel: 'INFO',
  serviceName: 'PROJECT_subject_manage_refactor'
})
const ddbDocClient = getDynamoDocClient()

async function subjectManageRefactor (
  deviceId: string, action: string
): Promise<void> {
  const subject = await getSubjectIdOrDeviceId({ deviceId })
  try {
    if (subject.subject_id === null || subject.subject_id === undefined) {
      throw new httpError.BadRequest('No subject_id found.')
    }
    if (validate(subject.subject_id)) {
      if (action === 'delete') {
        const paramsSubjectDeviceLinker: UpdateCommandInput = {
          TableName: 'PROJECT_subject_device_link',
          Key: {
            subject_id: subject.subject_id
          },
          UpdateExpression: 'set deviceId = :d',
          ExpressionAttributeValues: {
            ':d': `refactor_${deviceId}_${new Date().toISOString()}`
          }
        }
        await ddbDocClient.send(new UpdateCommand(paramsSubjectDeviceLinker))
      }
    }
  } catch (error: any) {
    throw new httpError.InternalServerError(error.message)
  }
}

export const handler: Handler = async (
  event: { deviceId: string, action: string }
): Promise<string> => {
  if (
    (event === null)
  ) {
    throw new Error('No Event.')
  }

  const deviceId: string | undefined = event.deviceId

  if (((deviceId === null) || (deviceId === '') || deviceId === undefined)) {
    logger.error('No deviceId provided.')
    throw new Error('No deviceId provided.')
  }
  if (deviceId.length >= 13) {
    throw new Error(`It is possible this device has been refactored:::${JSON.stringify(deviceId)}.`)
  }
  const action: string | undefined = event.action
  logger.error(`action:: ${JSON.stringify(action)}`)

  if (((action === null) || (action === '') || action === undefined)) {
    logger.error('No action provided.')
    throw new Error('No action provided.')
  }
  try {
    await subjectManageRefactor(
      deviceId, action)
    return (`Successfully unlinked deviceId:::${deviceId}`)
  } catch (error: any) {
    logger.error(`Failed Method error in catch:: ${JSON.stringify(error.message)}`)
    throw new Error(`Failed Method error in catch:: ${JSON.stringify(error.message)}`)
  }
}
