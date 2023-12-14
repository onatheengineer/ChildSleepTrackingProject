import { QueryCommand, type QueryCommandInput, type QueryCommandOutput } from '@aws-sdk/lib-dynamodb'
import { type APIGatewayProxyEvent, type Handler } from 'aws-lambda'
import * as httpError from 'http-errors'
import { type DeviceInfoRDS, type GetSubjectProps, type SubjectItem, type SubjectItemGet } from 'schema'
import {
  apiGatewayProxyResult,
  type ApiGatewayProxyResultInterface,
  dbQuery,
  getDBConnectionPROJECT,
  getDynamoDocClient
} from 'utils'
import { validate } from 'uuid'

// const logger = new Logger({
//   logLevel: 'INFO',
//   serviceName: 'PROJECT_subject'
// })
const ddbDocClient = getDynamoDocClient()

async function getSubject ({
  deviceId,
  subject_id
}: GetSubjectProps
): Promise<SubjectItemGet> {
  if (deviceId === undefined && subject_id === undefined) {
    throw new httpError.BadRequest('No subject_id deviceId provided.')
  }
  const paramsSubject: QueryCommandInput = subject_id !== undefined
    ? {
        TableName: 'PROJECT_subject_device_link',
        KeyConditionExpression: 'subject_id = :s',
        ExpressionAttributeValues: {
          ':s': subject_id
        }
      }
    : {
        TableName: 'PROJECT_subject_device_link',
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
    if (response !== null) {
      if (response.Items != null) {
        if (response.Items.length > 0) {
          const responseDynamo = response.Items[0] as SubjectItem
          if (!validate(responseDynamo.subject_id)) {
            throw new httpError.BadRequest('The subject_id is not correct.')
          }
          if (responseDynamo.dob === null || responseDynamo.dob === undefined) {
            throw new httpError.BadRequest('Date of birth in undefined.')
          }
          const responseRDS = await getDeviceInfoFrom(responseDynamo.deviceId)
          if (responseRDS.subjectName === null || responseRDS.subjectName === undefined) {
            throw new httpError.BadRequest('Subject name in undefined, it is possible this device has been refactored.')
          }
          return {
            subject_id: responseDynamo.subject_id,
            deviceId: responseRDS.deviceId,
            name: responseRDS.subjectName,
            dob: responseDynamo.dob,
            image: undefined,
            subscriptionStatus: Boolean(responseRDS.subscriptionStatusId),
            subscriptionStatusType: undefined,
            createdAt: new Date(responseDynamo.createdAt).toISOString()
          }
        }
      }
      throw new httpError.BadRequest('No subject_id found for deviceId')
    } else {
      throw new httpError.BadRequest('Not All GET Subject Parameters Are Valid')
    }
  } catch (error: any) {
    throw new httpError.InternalServerError(error.message)
  }
}

const getDeviceInfoFrom = async (deviceId: string): Promise<DeviceInfoRDS> => {
  const dbConnection = await getDBConnectionPROJECT()
  try {
    const response = await dbQuery<DeviceInfoRDS[]>({
      connect: dbConnection,
      params: {
        sql: `SELECT PROJECT.device.deviceId, subjectName, subscriptionStatusId
                      FROM PROJECT.device
                               LEFT JOIN PROJECT.deviceSubscriptions
                                         ON PROJECT.deviceSubscriptions.deviceId
                                             = PROJECT.device.deviceId
                      WHERE PROJECT.device.deviceId = ?`,
        values: [
          deviceId
        ]
      }
    })
    if (dbConnection.state === 'authenticated') {
      dbConnection.end()
    }
    if (response !== undefined && response !== null && response.length > 0) {
      return response[0]
    } else {
      throw new httpError.InternalServerError('ERROR::: getDeviceInfoFrom - response is undefined ')
    }
  } catch (error: any | unknown) {
    if (dbConnection.state === 'authenticated') {
      dbConnection.end()
    }
    throw Error(`Failed getDeviceInfoFrom catch::${JSON.stringify(error.message)}`)
  }
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiGatewayProxyResultInterface> => {
  if (
    (event.queryStringParameters == null)
  ) {
    return (apiGatewayProxyResult('400', JSON.stringify({
      status: false,
      message: 'No queryStringParameter for subjectId provided.'
    })))
  }
  const subject_id: string | undefined = event.queryStringParameters?.subject_id
  const deviceId: string | undefined = event.queryStringParameters?.deviceId

  if (((deviceId === null) || (deviceId === '')) && ((subject_id === null) || (subject_id === ''))) {
    return (apiGatewayProxyResult('400', JSON.stringify({
      status: false,
      message: 'Either no deviceId or subject_id provided.'
    })))
  }
  if (subject_id !== undefined && !validate(subject_id)) {
    return (apiGatewayProxyResult('400', JSON.stringify({
      status: false,
      message: 'The subject_id is not a valid uuidv4.'
    })))
  }
  try {
    if (deviceId !== undefined || subject_id !== undefined) {
      const getResult: SubjectItemGet = await getSubject(
        { deviceId, subject_id }
      )
      return (apiGatewayProxyResult('200', JSON.stringify(getResult)))
    } else {
      return (apiGatewayProxyResult('400', JSON.stringify({
        status: false,
        message: 'Either no deviceId or no subject_Id provide for GET method.'
      })))
    }
  } catch (error: any) {
    return (apiGatewayProxyResult('400', JSON.stringify({
      status: false,
      message: `Failed GET Method:: ${JSON.stringify(error.message)}`
    })))
  }
}
