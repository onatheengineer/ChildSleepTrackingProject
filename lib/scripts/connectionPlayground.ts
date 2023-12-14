// npx env-cmd ts-node connectionPlayground.ts

import { type DeviceInfoRDS } from 'schema'
import { dbQuery, getDBConnectionPROJECT } from 'utils'

const getDeviceInfoFrom = async (deviceId: string): Promise<DeviceInfoRDS> => {
  const dbConnection = await getDBConnectionPROJECT()
  console.log('connectionAFTER', dbConnection)
  try {
    const response = await dbQuery<DeviceInfoRDS[]>({
      connect: dbConnection,
      params: {
        sql: `SELECT PROJECT.device.deviceId, subjectName, subscriptionStatusId
              FROM PROJECT.device
                     LEFT JOIN PROJECT.deviceSubscriptions
                               ON PROJECT.deviceSubscriptions.deviceId
                                 = PROJECT.device.deviceId
              WHERE PROJECT.device.deviceId = ?;`,
        values: [
          deviceId
        ]
      }
    })
    console.log('response', response)
    if (dbConnection.state === 'authenticated') {
      dbConnection.end()
    }
    if (response !== undefined && response !== null && response.length > 0) {
      return response[0]
    }
    throw new Error('getDeviceInfoFrom')
  } catch (error: any | unknown) {
    console.log(error)
    if (dbConnection.state === 'authenticated') {
      dbConnection.end()
    }
    throw Error(`Failed getDeviceInfoFrom catch::${JSON.stringify(error.message)}`)
  }
}

void getDeviceInfoFrom('1443211B0B50').then(() => {
  console.log('.then::::')
}).catch((e) => {
  console.log(e)
})
