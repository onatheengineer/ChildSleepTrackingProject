import type * as mysql from 'mysql'

interface DBQueryProps {
  connect: mysql.Connection
  params: {
    sql: string
    values: any[]
  }
}

const enum MESSAGES {
  RECORDS,
  DUPLICATED,
  WARNINGS,
}

export interface InsertResult {
  fieldCount: number
  affectedRows: number
  insertId: number
  serverStatus: number
  warningCount: number
  message: MESSAGES
  protocol41: boolean
  changedRows: number
}

async function dbQuery<T> ({ connect, params }: DBQueryProps): Promise<T> {
  return await new Promise((resolve, reject) => {
    connect.query(params.sql, params.values, (err: unknown, data: any) => {
      if (err !== null) {
        reject(err)
        return
      }
      resolve(data)
    })
  })
}

export { dbQuery }
