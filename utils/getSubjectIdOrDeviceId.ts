import { QueryCommand, type QueryCommandInput, type QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import { type GetSubjectIdOrDeviceId } from 'schema'
import { validate } from 'uuid'
import { getDynamoDocClient } from './getDynamoDocClient.ts'

const ddbDocClient = getDynamoDocClient()
const dynamoTable = 'PROJECT_subject_device_link'

const getSubjectIdOrDeviceId = async ({
  deviceId,
  subject_id
}: GetSubjectIdOrDeviceId
): Promise<GetSubjectIdOrDeviceId> => {
  // console.info({ deviceId, subject_id })
  if (deviceId === undefined && subject_id === undefined) {
    throw new Error('Either no subject_id or no deviceId provided.')
  }
  const paramsSubject: QueryCommandInput = (subject_id !== undefined && validate(subject_id))
    ? {
        TableName: dynamoTable,
        KeyConditionExpression: 'subject_id = :s',
        ExpressionAttributeValues: {
          ':s': subject_id
        }
      }
    : {
        TableName: dynamoTable,
        IndexName: 'deviceId_index',
        KeyConditionExpression: 'deviceId = :d',
        ExpressionAttributeValues: {
          ':d': deviceId
        }
      }
  try {
    const response: QueryCommandOutput = await ddbDocClient.send(
      new QueryCommand(paramsSubject)
    )
    // console.error('response', response)
    if (response === null || response === undefined) {
      throw new Error('QueryCommandOutput Response is NULL:::')
    }
    if (response.Items === null || response.Items === undefined) {
      throw new Error('QueryCommandOutput Response ITems is NULL:::')
    }
    if (response.Items.length > 1) {
      console.error('Multiple subject_id or deviceId:::', response.Items)
      throw new Error('response.Items.length > 0')
    }
    if (response.Items.length === 0) {
      throw new Error('No Subject or Device Id for Given Parameters')
    }
    if (response.Items.length === 1) {
      const subjectItem = response.Items[0]
      if (subjectItem !== null && subjectItem !== undefined) {
        return {
          subject_id: subjectItem.subject_id,
          deviceId: subjectItem.deviceId
        }
      } else {
        throw new Error('response.Items is undefined or null')
      }
    }

    throw new Error('ERROR in function getSubjectToDeviceId::: ')
  } catch (err: any) {
    throw new Error(err.message)
  }
}

export { getSubjectIdOrDeviceId }
