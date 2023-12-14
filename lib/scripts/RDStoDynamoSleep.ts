// to run script: npx env-cmd ts-node RDStoDynamoSleep.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import * as mysql from 'mysql'
import { dbQuery, getSubjectIdOrDeviceId } from 'utils'

import { v4 as uuidv4, validate } from 'uuid'

// Create an Amazon DynamoDB service client object.
const ddbClient = new DynamoDBClient({ region: '' })
const marshallOptions = {
  convertEmptyValues: false,
  removeUndefinedValues: true,
  convertClassInstanceToMap: false
}
const unmarshallOptions = {
  wrapNumbers: false
}

const translateConfig = { marshallOptions, unmarshallOptions }

const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, translateConfig)

const dbBIAlgo = mysql.createConnection({
  connectTimeout: 4000,
  host: process.env.HOSTALGO,
  user: 'ramona',
  password: process.env.dbPassBI
})

async function RDStoDynamoSleep (): Promise<void> {
  try {
    dbBIAlgo.connect()
    const responsedb: Array<{
      deviceId: string
      sleepScore: number
      sleepDurationPercentile: number
      sleepQualityPercentile: number
      SleepDurationScore: number
      SleepQualityScore: number
      isSleepScoreActive?: boolean
      date: string
    }> = await dbQuery<
    Array<{
      deviceId: string
      sleepScore: number
      sleepDurationPercentile: number
      sleepQualityPercentile: number
      SleepDurationScore: number
      SleepQualityScore: number
      isSleepScoreActive?: boolean
      date: string
    }>
    >({
      connect: dbBIAlgo,
      params: {
        sql: `SELECT deviceId,
                             date,
                             sleepScore,
                             sleepDurationPercentile,
                             sleepQualityPercentile,
                             SleepDurationScore,
                             SleepQualityScore
                      FROM PROJECTAlgoDB.advancedAnalytic_sleepData_nightlySummary`,
        values: []
      }
    })
    let c = 0
    for (const item of responsedb) {
      c += 1
      const sleep_id = uuidv4()
      try {
        const subject = await getSubjectIdOrDeviceId({ deviceId: item.deviceId })
        if (subject.subject_id !== null || validate(subject.subject_id)) {
          const params = {
            TableName: 'PROJECT_sleep',
            Item: {
              sleep_id,
              subject_id: subject.subject_id,
              createdAt: item.date,
              isSleepScoreActive: true,
              sleepScore: item.sleepScore,
              sleepDurationPercentile: item.sleepDurationPercentile,
              sleepQualityPercentile: item.sleepQualityPercentile,
              SleepDurationScore: item.SleepDurationScore,
              SleepQualityScore: item.SleepQualityScore
            }
          }
          await ddbDocClient.send(new PutCommand(params))
        }
      } catch (err: any) {
        console.log('Error', err.stack)
      }

      if (c % 500 === 0) {
        console.log('C::', c)
      }
    }
    if (dbBIAlgo.state === 'authenticated') {
      dbBIAlgo.end()
    }
  } catch (error: unknown) {
    if (dbBIAlgo.state === 'authenticated') {
      dbBIAlgo.end()
    }
    console.error('RDS to DDB', error as Error)
    throw error
  }
}

RDStoDynamoSleep().then(() => {
  console.log('RDStoDynamoSleep Executed, Done')
}).catch((error) => {
  throw new Error(error.message)
})
