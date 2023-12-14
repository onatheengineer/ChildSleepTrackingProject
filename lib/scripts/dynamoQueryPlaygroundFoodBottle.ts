// npx env-cmd ts-node dynamoQueryPlaygroundFoodBottle.ts
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { getDynamoDocClient } from 'utils'

const ddbDocClient = getDynamoDocClient()

const subject_id = '574c915c-bbfe-4693-9f41-c28f2f67eee8'
const refDate = new Date('2023-06-09T23:55:50')
const startDate = new Date('2023-06-02T00:00:00')
startDate.setHours(0, 0, 0, 0)

// startDate.setDate(new Date().getDate() - 7)

// const endDate = new Date(startDate.getTime() + (2 * 86400 * 1000))
// const endDdate = new Date(new Date().setDate(new Date().getDate()-1))

console.log('startDate::::', startDate.toISOString())
console.log('refDate:::', refDate.toISOString())
const paramsBottle = {
  TableName: 'PROJECT_healthtracker_food',
  IndexName: 'subject_id_createdAt_index',
  KeyConditionExpression: 'subject_id = :s AND createdAt BETWEEN :start AND :end',
  FilterExpression: 'delivery = :d',
  ExpressionAttributeValues: {
    ':s': subject_id,
    ':start': startDate.toISOString(),
    ':end': refDate.toISOString(),
    ':d': 'BOTTLE'
  },
  ScanIndexForward: false
}

ddbDocClient.send(new QueryCommand(paramsBottle)).then((res) => {
  console.log('result::', res)
  if (res.Items !== null && res.Items !== undefined) {
    res.Items
      .forEach((item) => {
        console.log('item:::', item)
      })
  }
}).catch((err) => {
  console.log('Error:::', err.message)
})
