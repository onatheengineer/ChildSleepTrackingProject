// to run script: npx env-cmd ts-node ddbToddbTemperature.ts
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { type GetSubjectIdOrDeviceId } from 'schema/subject.js'
import { getDynamoDocClient, getSubjectIdOrDeviceId, isValidDateObject } from 'utils'

import { v4 as uuidv4, validate } from 'uuid'

const ddbDocClient = getDynamoDocClient()

const params: { TableName: string, FilterExpression: string, ExpressionAttributeValues: any, ScanIndexForward: any, ExclusiveStartKey: any } = {
  TableName: 'ContentServer',
  FilterExpression: 'contains(epoch_contentId, :t)',
  ExpressionAttributeValues: {
    ':t': 'userContent_healthTrackerTemperature'
  },
  ScanIndexForward: true,
  ExclusiveStartKey: undefined
}

const ddbToddbTemperature = async (): Promise<void> => {
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
      // console.log(JSON.stringify(data))
      if (data?.Items !== null && data?.Items !== undefined) {
        for (const element of data.Items) {
          // console.log('deviceId:::::::', JSON.stringify(element?.deviceId))
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          // console.log(`elements:: ${element?.deviceId?.S} , ${element?.epoch_contentId?.S}`)
          // console.log(JSON.stringify(element?.content))

          const temperature_id = uuidv4()
          const epochSplit = element?.epoch_contentId?.split('_')[0]
          let epochISO
          let epochFinal
          if (epochSplit != null) {
            epochISO = new Date(parseInt(epochSplit) * 1000)
            isValidDateObject(epochISO)
            epochFinal = epochISO.toISOString()
          }
          const contentTemp: { description: string, data: { displayUnit: string, storageUnit: string, notes: string, value: string, type: string } } = element?.content
          console.info(contentTemp.data)
          const dataDisplayunits =
                        contentTemp?.data?.displayUnit?.toUpperCase()

          let displayUnitsFinal = dataDisplayunits?.replace('°', '')
          const dataStorageunits =
                        contentTemp?.data?.storageUnit?.toUpperCase()
          let valueFinal
          if ((contentTemp?.data?.value) != null) {
            valueFinal = parseFloat(contentTemp?.data?.value)
            if (dataDisplayunits === '°F' && dataStorageunits === '°C') {
              valueFinal = valueFinal * (9 / 5) + 32
              displayUnitsFinal = 'F'
            }
            if (dataDisplayunits === '°C' && dataStorageunits === '°F') {
              valueFinal = (valueFinal - 32) / 1.8
              displayUnitsFinal = 'C'
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
              console.info({
                temperature_id,
                subject_id: subject.subject_id,
                degree: parseFloat(valueFinal.toFixed(2)),
                units: displayUnitsFinal,
                notes: ((contentTemp?.data?.notes) != null)
                  ? contentTemp?.data?.notes
                  : contentTemp?.description,
                createdAt: epochFinal
              })
              const paramsTemperature = {
                TableName: 'PROJECT_healthtracker_temperature',
                Item: {
                  temperature_id,
                  subject_id: subject.subject_id,
                  degree: parseFloat(valueFinal.toFixed(2)),
                  units: displayUnitsFinal,
                  notes: contentTemp?.data?.notes !== ''
                    ? contentTemp?.data?.notes
                    : contentTemp?.description,
                  createdAt: epochFinal
                }
              }
              console.log('paramsTemp:::::::', JSON.stringify(paramsTemperature))
              try {
                await ddbDocClient.send(new PutCommand(paramsTemperature))
                // console.log("Success - item added::::::", element);
              } catch (err: any) {
                console.error(`scan ERROR::${JSON.stringify(err.stack)}`)
                throw new Error(`scan ERROR::${JSON.stringify(err.stack)}`)
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
  } catch (error: any) {
    console.error(`scan ERROR::${JSON.stringify(error)}`)
    throw new Error(`scan ERROR::${JSON.stringify(error)}`)
  }
}

ddbToddbTemperature().then(
  (result) => {
    console.log('Dynamo RESULT::', result)
  },
  (error) => {
    console.error(`ERROR from function promise::${JSON.stringify(error)}`)
  }
)
