// to run script: npx env-cmd ts-node ddbToddbHeight.ts
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { type GetSubjectIdOrDeviceId } from 'schema/subject.js'
import { getDynamoDocClient, getSubjectIdOrDeviceId, isValidDateObject } from 'utils'

import { v4 as uuidv4, validate } from 'uuid'

const ddbDocClient = getDynamoDocClient()
const params: { TableName: string, FilterExpression: string, ExpressionAttributeValues: any, ScanIndexForward: any, ExclusiveStartKey: any } = {
  TableName: 'ContentServer',
  FilterExpression: 'contains(epoch_contentId, :h)',
  ExpressionAttributeValues: {
    ':h': 'userContent_healthTrackerHeight_000'
  },
  ScanIndexForward: true,
  ExclusiveStartKey: undefined
}

const ddbToddbHeight = async (): Promise<void> => {
  try {
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
      console.log(data.Count)

      if ((data?.Items) != null) {
        for (const element of data.Items) {
          console.log('DATA::', JSON.stringify(element.content.data))
          // console.log("deviceId:::::::",JSON.stringify(element?.['deviceId']))
          // console.log(`elements:: ${element?.['deviceId']?} , ${element?.['epoch_contentId']?}`)
          // console.log(JSON.stringify(element?.['content']))

          const height_id = uuidv4()
          const epochSplit = element?.epoch_contentId?.split('_')[0]
          let epochISO
          let epochFinal
          if (epochSplit !== null) {
            epochISO = new Date(parseInt(epochSplit) * 1000)
            isValidDateObject(epochISO)
            epochFinal = epochISO.toISOString()
          }
          const contentTemp = element?.content

          const dataDisplayUnit =
                        contentTemp?.data?.displayUnit?.toLowerCase()
          let displayUnitFinal = dataDisplayUnit?.replace('s', '')
          const dataStorageUnit =
                        contentTemp?.data?.storageUnit?.toLowerCase()
          let valueFinal
          if ((contentTemp?.data?.value) != null) {
            valueFinal = parseFloat(contentTemp?.data?.value)

            if (dataDisplayUnit === 'ft' && dataStorageUnit === 'cm') {
              displayUnitFinal = 'cm'
            }
            if (dataDisplayUnit === 'ft' && dataStorageUnit === 'in') {
              displayUnitFinal = 'in'
            }
            if (dataDisplayUnit === 'in' && dataStorageUnit === 'ft') {
              valueFinal = valueFinal * 12
              displayUnitFinal = 'in'
            }
            if (dataDisplayUnit === 'in' && dataStorageUnit === 'cm') {
              valueFinal = valueFinal / 2.54
              displayUnitFinal = 'in'
            }
            if (dataDisplayUnit === 'cm' && dataStorageUnit === 'ft') {
              valueFinal = valueFinal * 30.48
              displayUnitFinal = 'cm'
            }
            if (dataDisplayUnit === 'cm' && dataStorageUnit === 'in') {
              valueFinal = valueFinal * 2.54
              displayUnitFinal = 'cm'
            }
          }
          if (element.deviceId !== null) {
            let subject: GetSubjectIdOrDeviceId
            try {
              console.info({ element })
              subject = await getSubjectIdOrDeviceId({ deviceId: element.deviceId })
            } catch (err: any) {
              console.error(`PARMS ERROR::${JSON.stringify(err.message)}`)
              console.error(`PARMS ERROR::${JSON.stringify(element)}`)
              continue
            }
            if ((subject.subject_id !== null || validate(subject.subject_id)) && valueFinal !== undefined) {
              const paramsHeight = {
                TableName: 'PROJECT_healthtracker_height',
                Item: {
                  height_id,
                  subject_id: subject.subject_id,
                  height: parseFloat(valueFinal.toFixed(2)),
                  units: displayUnitFinal,
                  notes: contentTemp?.data?.notes !== ''
                    ? contentTemp?.data?.notes
                    : contentTemp?.description,
                  createdAt: epochFinal
                }
              }

              console.log('paramsHeight:::::::', JSON.stringify(paramsHeight))
              try {
                await ddbDocClient.send(new PutCommand(paramsHeight))
                // console.log("Success - item added::::::", element);
              } catch (err: any) {
                console.log('Error', err.stack)
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
  } catch (e: any) {
    console.error('scan ERROR::', e)
  }
}

ddbToddbHeight().then(
  (result) => {
    console.log('Dynamo RESULT::', result)
  },
  (error) => {
    console.error('ERROR:::', error)
  }
)
