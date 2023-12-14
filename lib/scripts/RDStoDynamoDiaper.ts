// to run script: npx env-cmd ts-node RDStoDynamoDiaper.ts
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

async function RDStoDynamoDiaper (): Promise<void> {
  try {
    dbBIAlgo.connect()
    const responsedb: Array<{
      diaper_id: number | string
      deviceId: string
      type: string
      value: number
      unit: string
      notes: string
      createdAt: Date
    }> = await dbQuery<
    Array<{
      diaper_id: number
      deviceId: string
      type: string
      value: number
      unit: string
      notes: string
      createdAt: Date
    }>
    >({
      connect: dbBIAlgo,
      params: {
        sql: `SELECT diaper_id, deviceId, type, value, unit, notes, createdAt
                      FROM PROJECTAlgoDB.PROJECT_healthTrackerDiaper`,
        values: []
      }
    })
    let c = 0
    for (const item of responsedb) {
      c += 1
      item.diaper_id = uuidv4()
      try {
        const subject = await getSubjectIdOrDeviceId({ deviceId: item.deviceId })
        if (subject.subject_id !== null || validate(subject.subject_id)) {
          const params = {
            TableName: 'PROJECT_healthtracker_diaper',
            Item: {
              diaper_id: item.diaper_id,
              subject_id: subject.subject_id,
              category: item.type,
              amount: item.value,
              notes: item.notes,
              createdAt: item.createdAt.toISOString()
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

RDStoDynamoDiaper().then(() => {
  console.log('RDStoDynamoDiaper Executed, Done')
}).catch((error) => {
  throw new Error(error.message)
})
