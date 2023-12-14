import { ScanCommand, type ScanCommandInput, type ScanCommandOutput } from '@aws-sdk/lib-dynamodb'
import { getDynamoDocClient } from './getDynamoDocClient.ts'

const ddbDocClient = getDynamoDocClient()
const prefix: string | undefined = process.env.prefix
if (prefix === undefined) {
  throw new Error('Prefix for table name is not defined.')
}
const dynamoTable = `${prefix.toString()}-PROJECT_healthissue_PROJECTcodes`

const getHealthIssuePROJECTCodes = async (): Promise<Record<string, string>> => {
  const paramsHealthIssuePROJECTCodes: ScanCommandInput = {
    TableName: dynamoTable
  }
  try {
    const response: ScanCommandOutput = await ddbDocClient.send(
      new ScanCommand(paramsHealthIssuePROJECTCodes)
    )
    if (response.Items !== undefined) {
      const PROJECTCodes: Record<string, string> = {}
      response.Items.forEach((el) => {
        PROJECTCodes[el?.PROJECTCodeKey] = el?.description
      })
      return PROJECTCodes
    } else {
      throw new Error('Failed GET QueryCommand. Not All GET HealthIssue Parameters Are Valid')
    }
  } catch (err: any) {
    throw new Error(err.message)
  }
}

export { getHealthIssuePROJECTCodes }
