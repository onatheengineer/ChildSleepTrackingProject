// // to run script: npx env-cmd ts-dataSources [file name].ts
// import * as mysql from "mysql";
// import { dbEnd, dbQuery } from "../utils/query";
//
// const dbBIAlgo = mysql.createConnection({
//     connectTimeout: 4000,
//     host: process.env["HOSTALGO"],
//     user: "ramona",
//     password: process.env["dbPassBI"],
// });
//
// const dbPROJECT = mysql.createConnection({
//     connectTimeout: 4000,
//     host: process.env["HOST"],
//     user: "ramona",
//     password: process.env["dbPass"],
// });
// let bcount = 0;
//
// async function backfillTracker() {
//     try {
//         dbBIAlgo.connect();
//         dbPROJECT.connect();
//         const responsedbBIAlgo: {
//             deviceId: string;
//             createdAtDate: Date;
//             AlgoDate: Date;
//         }[] = await dbQuery<
//             { deviceId: string; createdAtDate: Date; AlgoDate: Date }[]
//         >({
//             connect: dbBIAlgo,
//             params: {
//                 sql: "SELECT subject_id, DATE( FROM_UNIXTIME( unix_timestamp(createdAt))) as createdAtDate, FROM_UNIXTIME( unix_timestamp(createdAt)) as AlgoDate FROM PROJECTAlgoDB.advancedAnalytic_sleepData_nightlySummary",
//                 values: [],
//             },
//         });
//         let batchSize = 100000;
//         let values: any[] = [];
//         for (const item of responsedbBIAlgo) {
//             // console.log("item::", item)
//             // console.log("item.creadatAtDAte::", item.createdAtDate)
//             values.push([
//                 item.subject_id,
//                 item.createdAtDate,
//                 item.AlgoDate,
//                 true,
//                 item.AlgoDate,
//             ]);
//             if (values.length >= batchSize) {
//                 bcount += 1;
//                 console.log("inserting batch::::", bcount);
//                 try {
//                     await dbPROJECT.query(
//                         "INSERT IGNORE into PROJECT.deviceAnalyticsSummaryTracker (subject_id, date, SQSDate, producerStatus, AlgoDate) VALUES ?",
//                         [values]
//                     );
//                 } catch (error: any) {
//                     console.error("item::", item);
//                     console.error("errorMessage::", error.message);
//                 }
//                 values.length = 0;
//             }
//         }
//         try {
//             if (values.length > 0) {
//                 bcount += 1;
//                 console.log("last Batch::", bcount);
//                 await dbQuery<void>({
//                     connect: dbPROJECT,
//                     params: {
//                         sql: "INSERT IGNORE INTO PROJECT.deviceAnalyticsSummaryTracker (subject_id, date, SQSDate, AlgoDate) VALUES ?",
//                         values: values,
//                     },
//                 });
//             }
//         } catch (error: any) {
//             console.error("errorMessage::", error.message);
//         }
//
//         await dbEnd(dbPROJECT);
//         await dbEnd(dbBIAlgo);
//     } catch (error: unknown) {
//         await dbEnd(dbPROJECT);
//         await dbEnd(dbBIAlgo);
//         console.error(
//             "backfillTracker-dbPROJECT-responsedbBIAlgo",
//             error as Error
//         );
//         throw error;
//     }
// }
//
// backfillTracker().then(() => {
//     return console.log("backFillTracker Executed");
// });
