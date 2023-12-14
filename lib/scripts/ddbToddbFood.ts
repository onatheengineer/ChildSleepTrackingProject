// to run script: npx env-cmd ts-node ddbToddbFood.ts
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { type GetSubjectIdOrDeviceId } from 'schema/subject.js'
import { getDynamoDocClient, getSubjectIdOrDeviceId, isValidDateObject } from 'utils'
import { v4 as uuidv4, validate } from 'uuid'

const ddbDocClient = getDynamoDocClient()
const params: { TableName: string, FilterExpression: string, ExpressionAttributeValues: any, ScanIndexForward: any, ExclusiveStartKey: any } = {
  TableName: 'ContentServer',
  FilterExpression: 'contains(epoch_contentId, :t)',
  ExpressionAttributeValues: {
    ':t': 'healthTrackerFood'
  },
  ScanIndexForward: true,
  ExclusiveStartKey: undefined
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const DynamotoDynamoFood = async () => {
  try {
    let lastKey
    let crank = 0
    let totalScanned = 0
    // eslint-disable-next-line no-constant-condition
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
      if (data?.Items !== null && data?.Items !== undefined) {
        for (const element of data.Items) {
          // console.log("deviceId:::::::",JSONtringify(element?.['deviceId']))
          // console.log(`elements:: ${element?.['deviceId']?} , ${element?.['epoch_contentId']?}`)
          // console.log(JSONtringify(element?.['content']))

          const food_id = uuidv4()
          const epochSplit = element?.epoch_contentId?.split('_')[0]
          let epochISO
          let epochFinal
          if (epochSplit != null) {
            epochISO = new Date(parseInt(epochSplit) * 1000)
            isValidDateObject(epochISO)
            epochFinal = epochISO.toISOString()
          }
          const contentTemp = element?.content
          if (contentTemp.data?.notes === '1 dirty & wet' || contentTemp.data?.type === '["dirty","wet"]' || contentTemp.data?.type === 'dirty,wet' || contentTemp.data?.type === 'wet,dirty' || contentTemp.data?.type === 'dirty,wet') {
            continue
          }
          const dataDisplayUnit =
                        contentTemp?.data?.displayUnit?.toLowerCase()
          const dataStorageUnit =
                        contentTemp?.data?.storageUnit?.toLowerCase()
          let displayUnitFinal: 'oz' | 'ml' | 'min' | 'na' = contentTemp?.data?.displayUnit?.toLowerCase()
          let amountFinal: number | null = parseFloat(contentTemp?.data?.value)
          const origAmount = amountFinal

          let deliveryFinal: 'RIGHTBREAST' | 'LEFTBREAST' | 'BOTTLE' | 'UTENSIL' | undefined
          let categoryFinal: 'BREASTMILK' | 'FORMULA' | 'SOLID' | undefined
          let solidFoodTypeFinal: string | null = contentTemp?.data?.foodText
          if (contentTemp.data?.type !== undefined && contentTemp.data?.type !== null) {
            if (contentTemp.data?.type === 'solidFeed') {
              deliveryFinal = 'UTENSIL'
              categoryFinal = 'SOLID'
              displayUnitFinal = 'na'
              amountFinal = null
              solidFoodTypeFinal = contentTemp?.data?.foodText
            }
          }
          if (contentTemp.data?.type === 'bottleFeed' && contentTemp.data?.subType === 'breastMilk') {
            deliveryFinal = 'BOTTLE'
            categoryFinal = 'BREASTMILK'
          }
          if (contentTemp.data?.subType === 'formula') {
            deliveryFinal = 'BOTTLE'
            categoryFinal = 'FORMULA'
          }
          if (contentTemp?.data?.value !== null && contentTemp?.data?.value !== undefined) {
            // console.log('contentTemp.data?::::', JSON.stringify(contentTemp.data))
            // console.log('contentTemp.data.value::::', contentTemp.data.value)
            // console.log('contentTemp.data?.subTypeCHECK::::', contentTemp.data?.subType)
            // console.log('contentTemp.data?.subType::::', contentTemp.data?.subType)
            if (dataDisplayUnit === 'oz' && dataStorageUnit === 'ml') {
              amountFinal = parseFloat(contentTemp?.data?.value) / 29.5735296875
              displayUnitFinal = 'oz'
            }
            if (dataDisplayUnit === 'ml' && dataStorageUnit === 'oz') {
              amountFinal = parseFloat(contentTemp?.data?.value) * 29.5735296875
              displayUnitFinal = 'ml'
            }
            if (dataDisplayUnit === 'ml' && dataStorageUnit === 'ml') {
              amountFinal = parseFloat(contentTemp?.data?.value)
              displayUnitFinal = 'ml'
            }

            if (dataDisplayUnit === 'oz' && dataStorageUnit === 'oz') {
              amountFinal = parseFloat(contentTemp?.data?.value)
              displayUnitFinal = 'oz'
            }
            if (contentTemp?.data?.subType === 'breastMilk' && contentTemp.data.type !== 'bottleFeed') {
              amountFinal = parseFloat(contentTemp?.data?.value)

              deliveryFinal = 'BOTTLE'
              categoryFinal = 'BREASTMILK'
            }
            if (contentTemp.data.type === 'breastFeed') {
              amountFinal = parseFloat(contentTemp?.data?.value)
              displayUnitFinal = 'min'
              if (contentTemp.data?.subType === 'rightBreast' || contentTemp.data?.subType === '[\'rightBreast\']') {
                deliveryFinal = 'RIGHTBREAST'
              }
              if (contentTemp.data?.subType === 'leftBreast') {
                deliveryFinal = 'LEFTBREAST'
              }
              categoryFinal = 'BREASTMILK'
            }
            console.log({ amountFinal, displayUnitFinal, dataDisplayUnit, dataStorageUnit, origAmount })
          }

          if (element.deviceId !== null && element.deviceId !== undefined) {
            let subject: GetSubjectIdOrDeviceId
            try {
              // console.info({ element })
              subject = await getSubjectIdOrDeviceId({ deviceId: element.deviceId })
            } catch (err: any) {
              console.error(`PARMS ERROR::${JSON.stringify(err.message)}`)
              console.error(`PARMS ERROR::${JSON.stringify(element)}`)
              continue
            }
            if (deliveryFinal === undefined) {
              throw new Error(
                                `deliveryFinal Undefined:::' ${JSON.stringify(contentTemp.data)}`
              )
            }
            if (categoryFinal === undefined) {
              throw new Error(
                                `categoryFinal Undefined:::' ${JSON.stringify(contentTemp.data)}`
              )
            }
            if (subject.subject_id !== null || validate(subject.subject_id)) {
              const paramsFood = {
                TableName: 'PROJECT_healthtracker_food',
                Item: {
                  food_id,
                  subject_id: subject.subject_id,
                  delivery: deliveryFinal.toUpperCase(),
                  category: categoryFinal.toUpperCase(),
                  solidFoodType: solidFoodTypeFinal,
                  amount: amountFinal,
                  units: displayUnitFinal.toLowerCase(),
                  notes: contentTemp.description !== '' ? contentTemp.description : contentTemp.data.notes,
                  createdAt: epochFinal
                }
              }
              // console.log('paramsTemp:::::::', JSON.stringify(paramsFood))
              try {
                await ddbDocClient.send(new PutCommand(paramsFood))
                // console.log("Success - item added::::::", element);
              } catch (err: any) {
                console.log('Error', err.message)
              }
            }
          }
        }
      }

      // console.log(data)
      if (data.ScannedCount !== null && data.ScannedCount !== undefined) {
        totalScanned += data.ScannedCount
      }
      console.log('data.LastEvaluatedKey', data.LastEvaluatedKey)
      if (data.LastEvaluatedKey !== undefined) {
        lastKey = data.LastEvaluatedKey
      } else {
        console.log('LASTKEY::', data.LastEvaluatedKey)
        break
      }
    }
  } catch (e: any) {
    console.error('scan ERROR::', e.message)
  }
}

DynamotoDynamoFood().then(
  (result) => {
    console.log('Dynamo RESULT::', result)
  },
  (error) => {
    console.error(`ERROR from function promise::${JSON.stringify(error)}`)
    throw new Error('ERROR from function promise Err.message', error.message)
  }
)
