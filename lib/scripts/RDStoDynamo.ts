// to run script: npx env-cmd ts-dataSources [file name].ts
import { type AWSError } from 'aws-sdk'
import { type PutItemOutput } from 'aws-sdk/clients/dynamodb'
import * as mysql from 'mysql'
// Load the AWS SDK for Node.js
import { v4 as uuidv4 } from 'uuid'
import { dbEnd, dbQuery } from '../../utils'

const AWS = require('aws-sdk')
// Set the region
AWS.config.update({ region: '' })

const dbBIAlgo = mysql.createConnection({
  connectTimeout: 4000,
  host: process.env.HOSTALGO,
  user: 'ramona',
  password: process.env.dbPassBI
})

const ddb = new AWS.DynamoDB()

async function RDStoDynamo () {
  try {
    dbBIAlgo.connect()
    const responsedb: Array<{
      temperature_id: number | string
      subject_id: string
      type: string
      value: number
      units: string
      notes: string
      createdAt: Date
    }> = await dbQuery<
    Array<{
      temperature_id: number
      subject_id: string
      type: string
      value: number
      units: string
      notes: string
      createdAt: Date
    }>
    >({
      connect: dbBIAlgo,
      params: {
        sql: `SELECT temperature_id, subject_id, type, value, units, notes, createdAt
                      FROM PROJECTAlgoDB.PROJECT_healthTrackerTemperature`,
        values: []
      }
    })
    let c = 0
    for (const item of responsedb) {
      c += 1
      item.temperature_id = uuidv4()

      console.log('ITEM:::', item)

      const params = {
        TableName: 'PROJECT_healthtracker_temperature',
        Item: {
          temperature_id: { S: item.temperature_id },
          subject_id: { S: item.subject_id },
          category: { S: item.type },
          amount: { N: item.value.toString() },
          units: { S: item.units },
          notes: { S: item.notes ? item.notes : '' },
          createdAt: { S: item.createdAt.toISOString() }
        }
      }

      ddb.putItem(params, function (err: AWSError, data: PutItemOutput) {
        if (err) {
          console.log('Error', err)
        } else {
          console.log('Success', data)
        }
      })

      if (c % 500) {
        console.log('C::', c)
      }
    }
    await dbEnd(dbBIAlgo)
  } catch (error: unknown) {
    await dbEnd(dbBIAlgo)
    console.error(
      'backfillTracker-dbPROJECT-responsedbBIAlgo',
      error as Error
    )
    throw error
  }
}

RDStoDynamo().then(() => {
  console.log('RDStoDynamo Executed')
})
