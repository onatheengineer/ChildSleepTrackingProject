// to run script: npx env-cmd ts-node ddbToddbDiaper.ts
import { ScanCommand, type ScanCommandInput, type ScanCommandOutput } from '@aws-sdk/lib-dynamodb'
import { type GetSubjectIdOrDeviceId } from 'schema/subject.js'
import { getDynamoDocClient, getSubjectIdOrDeviceId, isValidDateObject } from 'utils'

import { v4 as uuidv4, validate } from 'uuid'

const ddbDocClient = getDynamoDocClient()
const prefix: string | undefined = process.env.prefix
if (prefix === undefined) {
  throw new Error('No Prefix ENV set')
}
const params: { TableName: string, FilterExpression: string, ExpressionAttributeValues: any, ScanIndexForward: any, ExclusiveStartKey: any } = {
  TableName: 'ContentServer',
  FilterExpression: 'contains(epoch_contentId, :d)',
  ExpressionAttributeValues: {
    ':d': 'userContent_healthTrackerDiaper'
  },
  ScanIndexForward: true,
  ExclusiveStartKey: undefined
}

const ddbToddbDiaper = async (): Promise<void> => {
  try {
    const routingParams: ScanCommandInput = {
      TableName: 'PROJECTSmartRouting'
    }
    const responseDynamo: ScanCommandOutput = await ddbDocClient.send(
      new ScanCommand(routingParams)
    )
    if (responseDynamo.Items !== undefined) {
      const testDevices: string[] = responseDynamo.Items.filter((item) => item.routing === 'test').map((item) => item.deviceId)
      const stageDevices: string[] = responseDynamo.Items.filter((item) => item.routing === 'stage').map((item) => item.deviceId)
      console.log({ testDevices, stageDevices })
      let lastKey
      let crank = 0
      let totalScanned = 0
      while (true) {
        const prm = { ...params }
        if (lastKey !== undefined) {
          prm.ExclusiveStartKey = lastKey
        }
        crank += 1
        if (crank % 10 === 0) {
          console.log(`CRANK ${crank} TotalScanned: ${totalScanned}`)
        }
        // console.log(prm)
        const data = await ddbDocClient.send(new ScanCommand(prm))
        // console.log('dataCount', data.Count)
        if (data?.Items !== null && data?.Items !== undefined) {
          for (const element of data.Items) {
            // console.log('DATA::', JSON.stringify(element.content.data))

            const diaper_id = uuidv4()
            const epochSplit = element?.epoch_contentId?.split('_')[0]
            let epochISO
            let epochFinal
            if (epochSplit != null) {
              epochISO = new Date(parseInt(epochSplit) * 1000)
              isValidDateObject(epochISO)
              epochFinal = epochISO.toISOString()
            }
            const contentTemp: { description: string, text: string, data: { value: string, type: string, notes: string } } = element?.content
            console.log('contentTemp.data.notes:::', contentTemp.data.notes)
            console.log('contentTemp.description:::', contentTemp.description)
            // console.info('contentTemp.data:::', contentTemp.data)
            let amountParsed: number | undefined
            const amountItem = contentTemp.data.value
            if (amountItem !== undefined) {
              amountParsed = parseInt(amountItem)
            }
            // console.log('amountParsed', amountParsed)
            let catFinal: string | undefined
            if (Array.isArray(contentTemp.data.type) && contentTemp.data.type !== null) {
              // console.log('categoryItem.data.type', contentTemp.data.type)
              if (contentTemp.data.type.includes('dirty') !== null && contentTemp.data.type.includes('wet') !== null) {
                catFinal = 'BOTH'
              }
              if (contentTemp.data.type.includes('dirty') !== null && contentTemp.data.type.includes('wet') === null) {
                catFinal = 'DIRTY'
              }
              if (contentTemp.data.type.includes('dirty') === null && contentTemp.data.type.includes('wet') !== null) {
                catFinal = 'WET'
              }
              if (contentTemp.data.type.includes('dirtywet') !== null || contentTemp.data.type.includes('wetdirty') !== null) {
                catFinal = 'BOTH'
              }
            } else {
              catFinal = contentTemp.data.type.toUpperCase()
            }

            // console.log('catFinal', catFinal)
            if (element.deviceId !== null) {
              let subject: GetSubjectIdOrDeviceId
              try {
                // console.info({ element })
                subject = await getSubjectIdOrDeviceId({ deviceId: element.deviceId })
                // console.log('element.deviceId::', element.deviceId)
                // console.log('subject::', subject)
              } catch (err: any) {
                // console.error(`PARMS ERROR::${JSON.stringify(err.message)}`)
                // console.error(`PARMS ERROR::${JSON.stringify(element)}`)
                continue
              }
              if ((subject.subject_id !== null || subject.subject_id !== undefined || validate(subject.subject_id)) && amountParsed !== undefined && catFinal !== undefined) {
                const paramsDiaper = {
                  TableName: testDevices.includes(element.deviceId)
                    ? 'PROJECT-test-PROJECT_healthtracker_diaper'
                    : stageDevices.includes(element.deviceId)
                      ? 'PROJECT-stage-PROJECT_healthtracker_diaper'
                      : 'PROJECT-prod-PROJECT_healthtracker_diaper',
                  Item: {
                    diaper_id,
                    subject_id: subject.subject_id,
                    category: catFinal,
                    amount: parseInt(amountParsed.toFixed(0)),
                    notes: contentTemp.description !== '' ? contentTemp.description : contentTemp.data.notes,
                    createdAt: epochFinal
                  }
                }
                console.log('paramsTemp:::::::', JSON.stringify(paramsDiaper.TableName))
                try {
                  // await ddbDocClient.send(new PutCommand(paramsDiaper))
                  // console.log("Success - item added::::::", element);
                } catch (err: any) {
                  console.error(`scan ERROR::${JSON.stringify(err.message)}`)
                  throw new Error('SCAN Err.message', err.message)
                }
              }
            }
          }
        }

        // console.log(data)
        if (data.ScannedCount !== null && data.ScannedCount !== undefined) {
          totalScanned += data.ScannedCount
        }
        if (data.LastEvaluatedKey !== undefined) {
          // console.log("LASTKEY::",data.LastEvaluatedKey)
          lastKey = data.LastEvaluatedKey
        } else {
          console.log('LASTKEY::', data.LastEvaluatedKey)
          break
        }
      }
    }
  } catch (error: any) {
    console.error(`whole function ERROR::${JSON.stringify(error)}`)
    throw new Error(`whole function Err.message:: ${JSON.stringify(error)}`)
  }
}

ddbToddbDiaper().then(
  (result) => {
    console.log('Dynamo RESULT::', result)
  },
  (error) => {
    console.error(`ERROR from function promise::${JSON.stringify(error)}`)
    throw new Error('ERROR from function promise Err.message', error.message)
  }
)
