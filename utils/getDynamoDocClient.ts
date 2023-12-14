import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
// Create a service client module using ES6 syntax.
import { DynamoDBDocumentClient, type TranslateConfig } from '@aws-sdk/lib-dynamodb'
// Create the DynamoDB service client module using ES6 syntax.

const getDynamoDocClient = (): DynamoDBClient => {
  const DEFAULT_REGION = ''
  const ddbClient = new DynamoDBClient({ region: DEFAULT_REGION })

  const marshallOptions = {
    // Whether to automatically convert empty strings, blobs, and sets to `null`.
    convertEmptyValues: false, // false, by default.
    // Whether to remove undefined values while marshalling.
    removeUndefinedValues: true, // false, by default.
    // Whether to convert typeof object to map attribute.
    convertClassInstanceToMap: false // false, by default.
  }

  const unmarshallOptions = {
    // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
    wrapNumbers: false // false, by default.
  }

  const translateConfig: TranslateConfig = {
    marshallOptions,
    unmarshallOptions
  }
  // Create the DynamoDB document client.
  return DynamoDBDocumentClient.from(ddbClient, translateConfig)
}

export { getDynamoDocClient }
