// to run script: npx env-cmd ts-node ddbToddbHealthIssue.ts
import { PutCommand, ScanCommand, type ScanCommandInput, type ScanCommandOutput } from '@aws-sdk/lib-dynamodb'
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
  FilterExpression: 'contains(epoch_contentId, :h)',
  ExpressionAttributeValues: {
    ':h': 'userContent_healthIssue'
  },
  ScanIndexForward: true,
  ExclusiveStartKey: undefined
}

const DdbToddbHealthIssue = async (): Promise<void> => {
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
        // console.info('LAST KEY:::', lastKey)
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
        console.info('Count:::', data.Count)
        if ((data?.Items) != null) {
          for (const element of data.Items) {
            console.log('deviceId:::::::', JSON.stringify(element?.deviceId))
            // console.log(`elements:: ${element?.deviceId} , ${element?.epoch_contentId}`)
            console.log(JSON.stringify(element?.content))

            const healthissue_id = uuidv4()
            const epochSplit = element?.epoch_contentId?.split('_')[0]
            let epochISO
            let epochFinal
            if (epochSplit != null) {
              epochISO = new Date(parseInt(epochSplit) * 1000)
              isValidDateObject(epochISO)
              epochFinal = epochISO.toISOString()
            }
            // const symptoms: string[] = []
            // if ((element?.content?.symptoms) !== null) {
            //   symptoms.push(element?.content?.symptoms)
            // }
            let elType: string[] = []
            if ((element?.content?.symptoms) !== null) {
              console.log('element.content:::', element.content)

              if (Array.isArray(element.content.symptoms)) {
                elType = element?.content?.symptoms.filter((ele: any) => {
                  return ele !== undefined
                }).map((el: string) => {
                  if (el !== undefined) {
                    return (
                      el.toUpperCase().includes('FEVER')
                        ? 'PROJECT10'
                        : el.toUpperCase().includes('COUGH')
                          ? 'PROJECT20'
                          : el.toUpperCase().includes('SICK')
                            ? 'PROJECT30'
                            : el.toUpperCase().includes('SNEEZE')
                              ? 'PROJECT40'
                              : el.toUpperCase().includes('FEEDING')
                                ? 'PROJECT50'
                                : el.toUpperCase().includes('CONGESTION')
                                  ? 'PROJECT60'
                                  : el.toUpperCase().includes('RESPIRATORY')
                                    ? 'PROJECT70'
                                    : el.toUpperCase().includes('FUSSY')
                                      ? 'PROJECT80'
                                      : el.toUpperCase().includes('OTHER')
                                        ? 'PROJECT9999'
                                        : 'unknown'
                    )
                  } else {
                    return undefined
                  }
                })
              } else {
                if (element !== null && element !== undefined) {
                  if (element.content.symptoms !== null && element.content.symptoms !== null) {
                    elType.push(element.content.symptoms.toUpperCase().includes('FEVER') !== undefined
                      ? 'PROJECT10'
                      : element.content.symptoms.toUpperCase().includes('COUGH') !== undefined
                        ? 'PROJECT20'
                        : element.content.symptoms.toUpperCase().includes('SICK') !== undefined
                          ? 'PROJECT30'
                          : element.content.symptoms.toUpperCase().includes('SNEEZE') !== undefined
                            ? 'PROJECT40'
                            : element.content.symptoms.toUpperCase().includes('FEEDING') !== undefined
                              ? 'PROJECT50'
                              : element.content.symptoms.toUpperCase().includes('CONGESTION') !== undefined
                                ? 'PROJECT60'
                                : element.content.symptoms.toUpperCase().includes('RESPIRATORY') !== undefined
                                  ? 'PROJECT70'
                                  : element.content.symptoms.toUpperCase().includes('FUSSY') !== undefined
                                    ? 'PROJECT80'
                                    : element.content.symptoms.toUpperCase().includes('OTHER') !== undefined
                                      ? 'PROJECT9999'
                                      : 'unknown'
                    )
                  }
                }
              }

              // const elTypeCode: string[] = elType.map((el: string) => {
              //   switch (el) {
              //     case 'Had a fever':
              //       return 'PROJECT10'
              //     case 'Cough':
              //       return 'PROJECT20'
              //     case 'Been sick':
              //       return 'PROJECT30'
              //     case 'Sneeze':
              //       return 'PROJECT40'
              //     case 'Change in feeding habit':
              //       return 'PROJECT50'
              //     case 'Had congestion (runny nose)':
              //       return 'PROJECT60'
              //     case 'Respiratory distress/trouble breathing':
              //       return 'PROJECT70'
              //     case 'Been more fussy than usual':
              //       return 'PROJECT80'
              //     case 'other':
              //       return 'PROJECT9999'
              //     case 'Other':
              //       return 'PROJECT9999'
              //     default:
              //       return 'unknown'
              //   }
              // })

              if (element.deviceId !== null && element.deviceId !== undefined) {
                let subject: GetSubjectIdOrDeviceId
                try {
                  console.info({ element })
                  subject = await getSubjectIdOrDeviceId({ deviceId: element.deviceId })
                } catch (err: any) {
                  console.error(`PARMS ERROR::${JSON.stringify(err.message)}`)
                  console.error(`PARMS ERROR::${JSON.stringify(element)}`)
                  continue
                }
                if (subject.subject_id !== null || validate(subject.subject_id)) {
                  const paramsHealth = {
                    TableName: testDevices.includes(element.deviceId)
                      ? 'PROJECT-test-PROJECT_healthtracker_healthissue'
                      : stageDevices.includes(element.deviceId)
                        ? 'PROJECT-stage-PROJECT_healthtracker_healthissue'
                        : 'PROJECT-prod-PROJECT_healthtracker_healthissue',
                    Item: {
                      healthissue_id,
                      subject_id: subject.subject_id,
                      notes: element.content.description,
                      PROJECTCode: elType,
                      isSurvey: false,
                      initialResponse: 'na',
                      createdAt: epochFinal
                    }
                  }
                  console.log('paramsHealth:::::::', JSON.stringify(paramsHealth))
                  try {
                    await ddbDocClient.send(new PutCommand(paramsHealth))
                    // console.log("Success - item added::::::", element);
                  } catch (err: any) {
                    console.log('Error', err.stack)
                  }
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
  } catch (e: any) {
    console.error('scan ERROR::', e)
  }
}

DdbToddbHealthIssue().then(
  (result) => {
    console.log('Dynamo RESULT::', result)
  },
  (error) => {
    console.error('ERROR:::', error)
  }
)
