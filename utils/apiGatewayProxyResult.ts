interface ApiGatewayProxyResultInterface {
  statusCode: string
  headers: {
    'Content-Type': string
    'Access-Control-Allow-Headers': string
    'Access-Control-Allow-Origin': string
    'Access-Control-Allow-Methods': string
  }
  body: string
}

const apiGatewayProxyResult = (statusCode: string, body: string): ApiGatewayProxyResultInterface => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,x-amzn-RequestId,x-amz-apigw-id,X-Amzn-Trace-Id,*',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, PUT, DELETE, GET'
    },
    body
  }
}

export { apiGatewayProxyResult, type ApiGatewayProxyResultInterface }
