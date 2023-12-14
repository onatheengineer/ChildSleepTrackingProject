// // to run script: npx env-cmd ts-dataSources [file name].ts
// import * as mysql from 'mysql'
// import { dbEnd, dbQuery } from 'utils'
//
// const dbBIAlgo = mysql.createConnection({
//   connectTimeout: 4000,
//   host: process.env.HOSTALGO,
//   user: 'ramona',
//   password: process.env.dbPassBI
// })
//
// const dbPROJECT = mysql.createConnection({
//   connectTimeout: 4000,
//   host: process.env.HOST,
//   user: 'ramona',
//   password: process.env.dbPass
// })
//
// async function backfillTracker (): Promise<void> {
//   try {
//     dbBIAlgo.connect()
//     dbPROJECT.connect()
//     const responsedbBIAlgo: Array<{
//       subject_id: string
//       createdAtDate: Date
//       AlgoDate: Date
//     }> = await dbQuery<{
//       subject_id: string
//       createdAtDate: Date
//       AlgoDate: Date
//     }>({
//       connect: dbBIAlgo,
//       params: {
//         sql:
//                     'SELECT subject_id, DATE( FROM_UNIXTIME( unix_timestamp(createdAt))) as createdAtDate, FROM_UNIXTIME( unix_timestamp(createdAt)) as AlgoDate\n' +
//                     'FROM PROJECTAlgoDB.advancedAnalytic_sleepData_nightlySummary\n' +
//                     'where DATE(advancedAnalytic_sleepData_nightlySummary.createdAt) = Date(NOW())',
//         values: []
//       }
//     })
//     let c = 0
//     for (const item of responsedbBIAlgo) {
//       // console.log("item::", item)
//       // console.log("item.creadatAtDAte::", item.createdAtDate)
//       c += 1
//       await dbPROJECT.query(
//         'UPDATE PROJECT.deviceAnalyticsSummaryTracker SET algoDate=? WHERE subject_id=? AND date=?',
//         [item.AlgoDate, item.subject_id, item.createdAtDate]
//       )
//       if (c % 500) {
//         console.log('C::', c)
//       }
//     }
//
//     await dbEnd(dbPROJECT)
//     await dbEnd(dbBIAlgo)
//   } catch (error: unknown) {
//     await dbEnd(dbPROJECT)
//     await dbEnd(dbBIAlgo)
//     console.error(
//       'backfillTracker-dbPROJECT-responsedbBIAlgo',
//       error as Error
//     )
//     throw error
//   }
// }
//
// void backfillTracker().then(() => {
//   console.log('backFillTracker Executed')
// })
