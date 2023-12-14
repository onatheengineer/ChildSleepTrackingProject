import {
  DeleteCommand,
  type DeleteCommandInput,
  GetCommand,
  type GetCommandInput,
  type GetCommandOutput,
  PutCommand,
  type PutCommandInput,
  type PutCommandOutput,
  UpdateCommand,
  type UpdateCommandInput,
  type UpdateCommandOutput
} from '@aws-sdk/lib-dynamodb'
import { type APIGatewayProxyEvent, type Handler } from 'aws-lambda'
import * as httpError from 'http-errors'
import {
  CHealthIssuePROJECTCode,
  type HealthIssueDDBDeleteGet,
  type HealthIssueDDBPost,
  type HealthIssueDDBUpdate,
  type HealthIssueItem,
  type HealthIssueItemPost,
  type HealthIssueItemPut,
  type ResponseMutation
} from 'schema'
import {
  apiGatewayProxyResult,
  type ApiGatewayProxyResultInterface,
  getDynamoDocClient,
  getSubjectIdOrDeviceId,
  isValidDateISOString,
  isValidDateObject
} from 'utils'
import { v4 as uuidv4, validate } from 'uuid'

// const logger = new Logger({
//   logLevel: 'WARN',
//   serviceName: 'PROJECT_healthtrack_healthissue'
// })

const ddbDocClient = getDynamoDocClient()
const prefix: string = process.env.prefix !== undefined ? process.env.prefix : ''
const dynamoTable = `${prefix}-PROJECT_healthtracker_healthissue`

async function postHealthIssue ({
  subject_id,
  refDate,
  PROJECTCode,
  isSurvey,
  initialResponse,
  notes
}: HealthIssueItemPost): Promise<ResponseMutation> {
  const uuidID: string = uuidv4()
  const paramsHealthIssue: PutCommandInput & HealthIssueDDBPost = {
    TableName: dynamoTable,
    Item: {
      healthissue_id: uuidID,
      createdAt: refDate,
      subject_id,
      PROJECTCode,
      isSurvey,
      initialResponse,
      notes
    }
  }
  try {
    const response: PutCommandOutput = await ddbDocClient.send(new PutCommand(paramsHealthIssue))
    return {
      status: true,
      message: `${JSON.stringify(
                response
            )} Successfully created HealthIssue Item, please take note of the healthissue_id uuid:: ${uuidID}.`
    }
  } catch (err: any) {
    throw new httpError.InternalServerError(err.message)
  }
}

async function updateHealthIssue ({
  healthissue_id,
  refDate,
  PROJECTCode,
  notes
}: HealthIssueItemPut): Promise<ResponseMutation> {
  const paramsHealthIssue: UpdateCommandInput & HealthIssueDDBUpdate = {
    TableName: dynamoTable,
    Key: {
      healthissue_id
    },
    UpdateExpression: 'set createdAt = :d, PROJECTCode = :m, notes = :n',
    ExpressionAttributeValues: {
      ':d': refDate, ':m': PROJECTCode, ':n': notes
    },
    ReturnValues: 'UPDATED_NEW'
  }
  try {
    const response: UpdateCommandOutput = await ddbDocClient.send(new UpdateCommand(paramsHealthIssue))
    return {
      status: true,
      message: `Successfully Put HealthIssue Item, please take note of the response: ${JSON.stringify(
                response
            )} ${JSON.stringify(paramsHealthIssue)}`
    }
  } catch (err: any) {
    throw new httpError.InternalServerError(err.message)
  }
}

async function deleteHealthIssue (
  healthissue_id: string): Promise<ResponseMutation> {
  const paramsHealthIssue: DeleteCommandInput & HealthIssueDDBDeleteGet = {
    TableName: dynamoTable,
    Key: {
      healthissue_id
    }
  }
  try {
    const response = await ddbDocClient.send(new DeleteCommand(paramsHealthIssue))
    return {
      status: true,
      message: `Successfully Deleted HealthIssue Item, please take note of the response: ${JSON.stringify(
                response
            )} ${JSON.stringify(paramsHealthIssue)}`
    }
  } catch (err: any) {
    throw new httpError.InternalServerError(err.message)
  }
}

async function getHealthIssue (
  healthissue_id: string
): Promise<HealthIssueItem> {
  const paramsHealthIssue: GetCommandInput & HealthIssueDDBDeleteGet = {
    TableName: dynamoTable,
    Key: {
      healthissue_id
    }
  }
  try {
    const response: GetCommandOutput = await ddbDocClient.send(
      new GetCommand(paramsHealthIssue)
    )
    if (response.Item !== undefined) {
      return response.Item as HealthIssueItem
    } else {
      throw new httpError.BadRequest('Failed GET QueryCommand. Not All GET HealthIssue Parameters Are Valid')
    }
  } catch (err: any) {
    throw new httpError.InternalServerError(err.message)
  }
}

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<ApiGatewayProxyResultInterface> => {
  const hasPROJECTHeader: boolean = event.headers?.['x-PROJECT-source'] === 'PROJECT-Webview'
  try {
    let subject_id: string = ''
    if (hasPROJECTHeader) {
      if (event.pathParameters === undefined) {
        throw new Error('No path parameter provided.')
      }
      if (event?.pathParameters?.subject === undefined) {
        throw new Error('No path subjectId provided.')
      }
      subject_id = event.pathParameters.subject
      if (!validate(subject_id)) {
        throw new Error('The subject_id is not a valid uuidv4.')
      }
    }
    if (event.requestContext.httpMethod === 'POST' && !hasPROJECTHeader) {
      const deviceId: string | undefined = event.queryStringParameters?.deviceId
      try {
        const subject = await getSubjectIdOrDeviceId({ deviceId })
        if (subject.subject_id !== undefined) {
          subject_id = subject.subject_id
        }
        if (!validate(subject.subject_id as string)) {
          throw new Error('The subject_id is not a valid uuidv4 after getSubjectIdOrDeviceId using deviceId.')
        }
      } catch (err: any) {
        throw new Error(`No deviceId provided::: ${JSON.stringify(err.message)}`)
      }
    }
    if ((event.body === undefined) && event.requestContext.httpMethod !== 'GET') {
      throw new Error('No Body provided.')
    }
    if (
      (event.queryStringParameters === undefined) &&
            event.requestContext.httpMethod === 'GET'
    ) {
      throw new Error('No queryString provided.')
    }
    switch (event.requestContext.httpMethod) {
      case 'POST': {
        if (event?.body !== undefined && event?.body !== null) {
          const {
            refDate,
            PROJECTCode,
            initialResponse,
            notes
          }: HealthIssueItemPost = JSON.parse(event.body)
          let refDateCopy = new Date()
          if (refDate !== undefined) {
            if (!isValidDateISOString(refDate)) {
              throw new Error('Reference Date not in ISO format.')
            }
            refDateCopy = new Date(refDate)
          }
          if (!isValidDateObject(refDateCopy)) {
            throw new Error('Invalid date object.')
          }
          if (
            (PROJECTCode === undefined)) {
            throw new Error('PROJECTCode is undefined.')
          }
          if (
            (initialResponse === undefined && !hasPROJECTHeader)) {
            throw new Error('initialResponse is undefined.')
          }
          const hasPermissibleValesOnly = PROJECTCode?.every(el => CHealthIssuePROJECTCode.includes(el))
          if (hasPermissibleValesOnly === undefined) {
            throw new Error('HealthIssue symptom provided is not one of the permissible values.')
          }
          try {
            const postResult: ResponseMutation = await postHealthIssue({
              subject_id,
              refDate: refDateCopy.toISOString(),
              PROJECTCode,
              isSurvey: !hasPROJECTHeader,
              initialResponse: !hasPROJECTHeader ? initialResponse : 'na',
              notes
            })
            return (apiGatewayProxyResult('201', JSON.stringify(postResult)))
          } catch (error: unknown) {
            throw new Error(`Failed Post Method::: ${JSON.stringify(error)}`)
          }
        } else {
          throw new Error('Malformed request for Post method.')
        }
      }
      case 'PUT': {
        if (event?.body !== undefined && event?.body !== null) {
          const {
            healthissue_id,
            refDate,
            PROJECTCode,
            notes
          }: HealthIssueItemPut = JSON.parse(event.body)
          if (healthissue_id === undefined) {
            throw new Error('healthissue_id is undefined.')
          }
          if (!validate(healthissue_id)) {
            throw new Error('healthissue_id is not a valid uuidv4.')
          }
          let refDateCopy = new Date()
          if (refDate !== undefined) {
            if (!isValidDateISOString(refDate)) {
              throw new Error('Reference Date not in ISO format.')
            }
            refDateCopy = new Date(refDate)
          }
          if (!isValidDateObject(refDateCopy)) {
            throw new Error('Invalid date object.')
          }
          const hasPermissibleValesOnly = PROJECTCode?.every(el => CHealthIssuePROJECTCode.includes(el))
          if (hasPermissibleValesOnly === undefined) {
            throw new Error('HealthIssue symptom provided is not one of the permissible values.')
          }
          try {
            const updateResult: ResponseMutation = await updateHealthIssue({
              healthissue_id,
              refDate: refDateCopy.toISOString(),
              PROJECTCode,
              notes
            })
            return (apiGatewayProxyResult('201', JSON.stringify(updateResult)))
          } catch (error: unknown) {
            throw new Error(`Failed Put Method::: ${JSON.stringify(error)}`)
          }
        } else {
          throw new Error('No body for PUT method.')
        }
      }
      case 'DELETE': {
        const healthissue_id: string | undefined = event?.queryStringParameters?.healthissue_id
        if (healthissue_id === undefined) {
          throw new Error('healthissue_id is undefined for Delete Method.')
        }
        if (!validate(healthissue_id)) {
          throw new Error('healthissue_id is not a valid uuidv4.')
        }
        try {
          const deleteResult: ResponseMutation = await deleteHealthIssue(healthissue_id)
          return (apiGatewayProxyResult('200', JSON.stringify(deleteResult)))
        } catch (error: unknown) {
          throw new Error(`Failed Delete Method::: ${JSON.stringify(error)}`)
        }
      }
      case 'GET': {
        const healthissue_id: string | undefined = event?.queryStringParameters?.healthissue_id
        if (healthissue_id === undefined) {
          throw new Error('healthissue_id is undefined for Get method.')
        }
        if (!validate(healthissue_id)) {
          throw new Error('healthissue_id is not a valid uuidv4.')
        }
        try {
          const getResult: HealthIssueItem = await getHealthIssue(
            healthissue_id
          )
          return (apiGatewayProxyResult('200', JSON.stringify(getResult)))
        } catch (error: any) {
          throw new Error(`Failed GET Method:: ${JSON.stringify(error.message)}`)
        }
      }
      default:
        throw new Error('Failed to execute, check incoming parameters.')
    }
  } catch (error: any) {
    return (apiGatewayProxyResult('400', JSON.stringify({
      status: false,
      message: error.message
    })))
  }
}
