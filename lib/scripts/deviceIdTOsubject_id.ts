// npx env-cmd ts-node deviceIdTOsubject_id.ts
import { Logger } from '@aws-lambda-powertools/logger'
import {
  PutCommand,
  type PutCommandInput,
  ScanCommand,
  type ScanCommandInput,
  type ScanCommandOutput
} from '@aws-sdk/lib-dynamodb'
import { type DeviceInfoRDSETL } from 'schema'
import { dbQuery, getDBConnectionPROJECT, getDynamoDocClient } from 'utils'
import { v4 as uuidv4 } from 'uuid'

const logger = new Logger({
  logLevel: 'INFO',
  serviceName: 'PROJECT_subject'
})
const ddbDocClient = getDynamoDocClient()

async function deviceIdTOSubject_id (): Promise<void> {
  const dbConnection = await getDBConnectionPROJECT()
  try {
    const responsePROJECT = await dbQuery<DeviceInfoRDSETL[]>({
      connect: dbConnection,
      params: {
        sql: `SELECT PROJECT.device.deviceId,
                             PROJECT.device.subjectDob,
                             MAX(PROJECT.deviceHistory.createdAt) as maxCreatedAt
                      FROM PROJECT.device
                               LEFT JOIN PROJECT.deviceHistory ON PROJECT.deviceHistory.deviceId
                          = PROJECT.device.deviceId
                      Group by PROJECT.device.deviceId`,
        values: []
      }
    })
    if (dbConnection.state === 'authenticated') {
      dbConnection.end()
    }
    if (responsePROJECT !== undefined && responsePROJECT !== null && responsePROJECT.length > 0) {
      for (const responseRDSItem of responsePROJECT) {
        if (responseRDSItem.subjectDob !== null || responseRDSItem.subjectDob !== undefined || responseRDSItem.maxCreatedAt !== null || responseRDSItem.maxCreatedAt !== undefined) {
          if (responseRDSItem.deviceId === undefined) {
            throw new Error('No deviceId provided.')
          }
          const paramsSubject: ScanCommandInput =
                        {
                          TableName: 'PROJECT_subject_device_link',
                          IndexName: 'deviceId_index',
                          FilterExpression: 'deviceId = :d OR begins_with(deviceId, :refactor)',
                          ExpressionAttributeValues: {
                            ':d': responseRDSItem.deviceId,
                            ':refactor': `refactor_${responseRDSItem.deviceId}`
                          }
                        }
          try {
            const responseDynamo: ScanCommandOutput = await ddbDocClient.send(
              new ScanCommand(paramsSubject)
            )
            logger.error(`QueryCommandOutput response:::: ${JSON.stringify(responseDynamo)}`)
            if (responseDynamo !== null) {
              if (responseDynamo.Items !== null && responseDynamo.Items !== undefined) {
                if (responseDynamo.Items.length === 0) {
                  const uuidID: string = uuidv4()
                  const createdATDAte = responseRDSItem.maxCreatedAt
                  console.log('createdATDAte::::', createdATDAte)
                  const createdISOHistoryDATEobj = new Date(responseRDSItem.maxCreatedAt)
                  console.log('createdISOHistoryDATEobj::::', createdISOHistoryDATEobj)
                  const createdISOHistory = createdISOHistoryDATEobj.toISOString()
                  console.log('createdISOHistory::::', createdISOHistory)
                  const dobItem = new Date(responseRDSItem.subjectDob)
                  const dobItemfinal = `${dobItem.getFullYear()}-${(dobItem.getMonth() + 1)}-${dobItem.getDate()}`
                  const paramsSubject: PutCommandInput = {
                    TableName: 'PROJECT_subject_device_link',
                    Item: {
                      subject_id: uuidID,
                      deviceId: responseRDSItem.deviceId,
                      dob: dobItemfinal,
                      createdAt: createdISOHistory
                    }
                  }
                  logger.warn(`PARAMSsubject", ${JSON.stringify(paramsSubject)}`)
                  try {
                    await ddbDocClient.send(new PutCommand(paramsSubject))
                  } catch (err: any) {
                    logger.error('Error', err.message)
                    throw new Error(err.message)
                  }
                } else {
                  continue
                }
              } else {
                logger.error('Error responseDynamoItems != null::::')
                throw new Error('Error responseDynamoItems != null::::')
              }
            } else {
              logger.error('Error responseDynamo != null:::')
              throw new Error('Error responseDynamo != null:::')
            }
          } catch (error: unknown) {
            logger.error('script whole function::::', error as Error)
            throw error
          }
        }
      }
    } else {
      logger.error('PROJECT is undefined:::')
      throw new Error('PROJECT is undefined:::')
    }
  } catch (error: unknown) {
    logger.error('script', error as Error)
    throw error
  }
}

void deviceIdTOSubject_id().then(() => {
})
