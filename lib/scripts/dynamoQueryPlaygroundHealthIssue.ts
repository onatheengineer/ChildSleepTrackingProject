// npx env-cmd ts-node dynamoQueryPlaygroundHealthIssue.ts
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { getDynamoDocClient } from 'utils'

const ddbDocClient = getDynamoDocClient()

const subject_id = '574c915c-bbfe-4693-9f41-c28f2f67eee8'
const refDate = new Date()
const startDate = new Date(refDate)
// startDate.setHours(0, 0, 0, 0)

startDate.setDate(new Date().getDate() - 100)

// const endDate = new Date(startDate.getTime() + (2 * 86400 * 1000))
// const endDdate = new Date(new Date().setDate(new Date().getDate()-1))

console.log('startDate::::', startDate.toISOString())
console.log('refDate:::', refDate.toISOString())
const params = {
  TableName: 'PROJECT_healthtracker_healthissue',
  IndexName: 'subject_id_createdAt_index',
  KeyConditionExpression: 'subject_id = :s AND createdAt BETWEEN :start AND :end',
  ExpressionAttributeValues: {
    ':s': subject_id,
    ':start': startDate.toISOString(),
    ':end': refDate.toISOString()
  }
}

ddbDocClient.send(new QueryCommand(params)).then((res) => {
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
