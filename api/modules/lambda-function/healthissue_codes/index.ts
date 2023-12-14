import { type Handler } from 'aws-lambda'
import { apiGatewayProxyResult, type ApiGatewayProxyResultInterface, getHealthIssuePROJECTCodes } from 'utils'

export const handler: Handler = async (): Promise<ApiGatewayProxyResultInterface> => {
  try {
    return (apiGatewayProxyResult('200', JSON.stringify({ PROJECTCodes: await getHealthIssuePROJECTCodes() })))
  } catch (error: any) {
    return (apiGatewayProxyResult('400', JSON.stringify({
      status: false,
      message: error.message
    })))
  }
}
