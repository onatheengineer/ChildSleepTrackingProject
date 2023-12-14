import * as mysql from 'mysql'
import { type Connection } from 'mysql'
import { secretsPROJECTAlgo } from './secretsPROJECTAlgo.ts'

const getDBConnectionPROJECTAlgo = async (): Promise<Connection> => {
  try {
    const secretString = await secretsPROJECTAlgo()
    if (secretString !== undefined) {
      if (secretString.username !== undefined && secretString.password !== undefined && secretString.host !== undefined) {
        const dbUser = secretString.username
        const dbPass = secretString.password
        const dbHost = secretString.host
        // if we still don't have encrypted data
        if ((dbUser === null) || (dbPass === null) || (dbHost === null)) {
          throw new Error('Failed to set db information - Connecting to Data.')
        }
        const dbConnection: Connection = mysql.createConnection({
          connectTimeout: 4000,
          host: dbHost,
          user: dbUser,
          password: dbPass
        })
        return dbConnection
      }
    }
  } catch (error: unknown) {
    throw new Error(`Failed getSecrets catch::${JSON.stringify(error)}`)
  }
  throw new Error('Failed getSecrets.')
}

export { getDBConnectionPROJECTAlgo }
