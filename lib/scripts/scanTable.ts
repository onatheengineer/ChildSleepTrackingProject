import { type AttributeValue, DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'

interface ScanTableProps {
  tableName: string
  startDate: AttributeValue
  endDate: AttributeValue
  startKey: Record<string, AttributeValue> | undefined
}

// interface ScanTableReturn {
//   tableName: string
//   startDate: AttributeValue
//   endDate: AttributeValue
//   LastEvaluatedKey: Record<string, AttributeValue>
// }

const scanTable = async ({
  tableName,
  startDate,
  endDate,
  startKey = undefined
}: ScanTableProps): Promise<Array<Record<string, AttributeValue>>> => {
  const DEFAULT_REGION = ''
  const ddbClient = new DynamoDBClient({ region: DEFAULT_REGION })
  const { Items, LastEvaluatedKey } = await ddbClient.send(
    new ScanCommand({
      ConsistentRead: true,
      TableName: tableName,
      ExpressionAttributeNames: { '#c': 'createdAt' },
      FilterExpression: '#c BETWEEN :d1 AND :d2',
      ExpressionAttributeValues: { ':d1': startDate, ':d2': endDate },
      ExclusiveStartKey: startKey
    })
  )

  if ((LastEvaluatedKey != null) && Array.isArray(Items)) {
    return Items.concat(
      await scanTable({
        tableName,
        startDate,
        endDate,
        startKey: LastEvaluatedKey
      })
    )
  } else {
    if (Items === undefined) {
      return []
    }
    return Items
  }
}

// scanTable(
//
//
// )
