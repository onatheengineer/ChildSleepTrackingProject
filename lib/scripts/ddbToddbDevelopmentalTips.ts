// to run script: npx env-cmd ts-node ddbtoddbDevelopmentalTips.ts
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { isValidDateObject } from 'utils'
import { v4 as uuidv4 } from 'uuid'

// Create an Amazon DynamoDB service client object.
const ddbClient = new DynamoDBClient({ region: '' })
const marshallOptions = {
  convertEmptyValues: false,
  removeUndefinedValues: false,
  convertClassInstanceToMap: false
}
const unmarshallOptions = {
  wrapNumbers: false
}

const translateConfig = { marshallOptions, unmarshallOptions }

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig)
const params = {
  TableName: 'ContentElements',
  FilterExpression: 'contains(contentId, :d)',
  ExpressionAttributeValues: {
    ':d': {
      S: 'developmentalTips'
    }
  },
  ScanIndexForward: true,
  ExclusiveStartKey: undefined
}

const ddbtoddbDevelopmentalTips = async (): Promise<string> => {
  try {
    let lastKey
    let crank = 0
    let totalScanned = 0
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const prm = { ...params }
      if (lastKey != null) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error because the first time it loops
        prm.ExclusiveStartKey = lastKey
      }
      crank += 1
      if (crank % 10 === 0) {
        console.log(`CRANK ${crank} TotalScanned: ${totalScanned}`)
      }
      // console.log(prm)
      const data = await ddbDocClient.send(new ScanCommand(prm))
      if ((data?.Items) != null) {
        for (const element of data.Items) {
          // console.log("deviceId:::::::",JSON.stringify(element?.['deviceId']))
          // console.log(`elements:: ${element?.['deviceId']?.S} , ${element?.['epoch_contentId']?.S}`)
          // console.log(JSON.stringify(element?.['content']))

          const temperature_id = uuidv4()
          const epochSplit = element?.epoch_contentId?.S?.split('_')[0]
          let epochISO
          let epochFinal
          if (epochSplit !== null && epochSplit !== undefined) {
            epochISO = new Date(parseInt(epochSplit) * 1000)
            isValidDateObject(epochISO)
            epochFinal = epochISO.toISOString()
          }
          const contentTemp = element?.content?.M

          const dataDisplayunits =
                        contentTemp?.data?.M?.displayunits?.S?.toUpperCase()
          let displayunitsFinal = dataDisplayunits?.replace('°', '')
          const dataStorageunits =
                        contentTemp?.data?.M?.storageunits?.S?.toUpperCase()
          let valueFinal
          if (contentTemp !== null && contentTemp !== undefined) {
            if ((contentTemp?.data?.M?.value?.S) != null) {
              valueFinal = parseFloat(contentTemp?.data?.M?.value?.S)
              if (dataDisplayunits === '°F' && dataStorageunits === '°C') {
                valueFinal = valueFinal * (9 / 5) + 32
                displayunitsFinal = 'F'
              }
              if (dataDisplayunits === '°C' && dataStorageunits === '°F') {
                valueFinal = (valueFinal - 32) / 1.8
                displayunitsFinal = 'C'
              }
            }
          }

          const paramsTemperature = {
            TableName: 'PROJECT_developmental-tips',
            Item: {
              temperature_id,
              deviceId: element?.deviceId?.S,
              amount: valueFinal,
              units: displayunitsFinal,
              notes: ((contentTemp?.data?.M?.notes?.S) != null)
                ? contentTemp?.data?.M?.notes?.S
                : contentTemp?.description?.S,
              createdAt: epochFinal
            }
          }
          console.log('paramsTemp:::::::', JSON.stringify(paramsTemperature))
          try {
            await ddbDocClient.send(new PutCommand(paramsTemperature))
            // console.log("Success - item added::::::", element);
          } catch (err: any) {
            console.log('Error', err.stack)
          }
        }
      }

      // console.log(data)
      if (data.ScannedCount != null) {
        totalScanned += data.ScannedCount
      }
      if (data.LastEvaluatedKey != null) {
        // console.log("LASTKEY::",data.LastEvaluatedKey)
        lastKey = data.LastEvaluatedKey
      } else {
        break
      }
    }
  } catch (e: any) {
    console.error('scan ERROR::', e)
  }
  return 'done'
}

ddbtoddbDevelopmentalTips().then(
  (result) => {
    console.log('Dynamo RESULT::', result)
  },
  (error) => {
    console.error('ERROR:::', error)
  }
)
