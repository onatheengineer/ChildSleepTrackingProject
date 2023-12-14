// to run script: npx env-cmd ts-node RDStoDynamoFood.ts
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

async function RDStoDynamoFood (): Promise<void> {
  try {
    dbBIAlgo.connect()
    const responsedb: Array<{
      food_id: number | string
      deviceId: string
      delivery: string
      type: string
      value: number
      unit: string
      notes: string
      createdAt: Date
    }> = await dbQuery<
    Array<{
      food_id: number
      deviceId: string
      delivery: string
      type: string
      value: number
      unit: string
      notes: string
      createdAt: Date
    }>
    >({
      connect: dbBIAlgo,
      params: {
        sql: `SELECT food_id,
                             deviceId,
                             delivery,
                             type,
                             value,
                             unit,
                             notes,
                             createdAt
                      FROM PROJECTAlgoDB.PROJECT_healthTrackerFood`,
        values: []
      }
    })
    let c = 0
    for (const item of responsedb) {
      c += 1
      item.food_id = uuidv4()
      try {
        const subject = await getSubjectIdOrDeviceId({ deviceId: item.deviceId })
        if (subject.subject_id !== null || validate(subject.subject_id)) {
          const params = {
            TableName: 'PROJECT_healthtracker_food',
            Item: {
              food_id: item.food_id,
              subject_id: subject.subject_id,
              delivery: item.delivery,
              category: item.type,
              amount: item.value,
              units: item.unit,
              notes: item.notes,
              createdAt: item.createdAt.toISOString()
            }
          }
          await ddbDocClient.send(new PutCommand(params))
        }
        // console.log("Success - item added::::::", element);
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

RDStoDynamoFood().then(() => {
  console.log('RDStoDynamoDiaper Executed, Done')
}).catch((error) => {
  throw new Error(error.message)
})
