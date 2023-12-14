// npx env-cmd ts-node dynamoPlaygroundContentServer.ts
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { getDynamoDocClient } from 'utils'

const ddbDocClient = getDynamoDocClient()

const deviceId = '0307192A48D7'
const startDate = new Date(1661360630000 - (86400 * 1000))
const endDate = new Date(startDate.getTime() + (2 * 86400 * 1000))
console.log(startDate.getTime() / 1000)
console.log(endDate.getTime() / 1000)
const params = {
  TableName: 'ContentServer',
  KeyConditionExpression: 'deviceId = :d and epoch_contentId BETWEEN :f AND :t',
  ExpressionAttributeValues: {
    ':d': deviceId,
    ':f': (startDate.getTime() / 1000).toString(),
    ':t': (endDate.getTime() / 1000).toString()
  }
}

ddbDocClient.send(new QueryCommand(params)).then((res) => {
  console.log(res)
  if (res.Items != null) {
    res.Items
      .filter((item) => item.epoch_contentId.includes('advancedAnalytic_breathingData_illnessDetection'))
      .forEach((item) => {
        console.log(item)
      })
  }
}).catch((err) => {
  console.log(err)
})
