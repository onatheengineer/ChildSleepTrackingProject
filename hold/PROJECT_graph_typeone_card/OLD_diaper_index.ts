// import { injectLambdaContext, Logger } from "@aws-lambda-powertools/logger";
// import { DecryptCommand, KMSClient } from "@aws-sdk/client-kms";
// import middy from "@middy/core";
// import errorLogger from "@middy/error-logger";
// import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context, Handler, } from "aws-lambda";
// import * as mysql from 'mysql';
// import {
//     dbEnd,
//     dbQuery,
//     decodeUINT8Array,
//     DiaperDataPoint,
//     DiaperDBQuery,
//     DiaperGraphReturn,
//     getDateIntervals,
//     GetGraphDataDiaperProps,
//     graphDataPointLabel,
//     IntervalEnum,
//     IntervalLabels,
//     isValidDateISOString,
//     isValidDateObject,
// } from "../../utils";
//
// const logger = new Logger({
//     logLevel: "WARN",
//     serviceName: "PROJECT_diaper",
// });
//
// const encryptedDBUserBI = process.env["dbUserBI"];
// const encryptedDBPassBI = process.env["dbPassBI"];
// const dbHostBI = process.env["dbHostBI"];
//
// let dbUserBI: string | undefined;
// let dbPassBI: string | undefined;
//
// async function PROJECT_diaper({
//                                    subject_id,
//                                    refDate,
//                                    interval,
//                                }: GetGraphDataDiaperProps) {
//     const dbBI = mysql.createConnection({
//         connectTimeout: 4000,
//         host: dbHostBI,
//         user: dbUserBI,
//         password: dbPassBI,
//     });
//
//     const intervalQuery =
//         interval === IntervalEnum.Monthly
//             ? "5 MONTH"
//             : interval === IntervalEnum.Weekly
//                 ? "5 WEEK"
//                 : "1 WEEK";
//
//     try {
//         dbBI.connect();
//
//         const responseBI: DiaperDBQuery[] = await dbQuery<DiaperDBQuery>({
//             connect: dbBI,
//             params: {
//                 sql: `SELECT type, subtype, value, createdAt FROM PROJECTAlgoDB.PROJECT_userContent_healthTrackerDiaper WHERE subject_id = ? AND type = ? AND createdAt <= ? AND createdAt >= DATE_SUB(?, INTERVAL ${intervalQuery}) ORDER BY createdAt DESC`,
//                 values: [
//                     subject_id,
//                     "diaper",
//                     refDate.toISOString().slice(0, 19).replace("T", " "),
//                     refDate.toISOString().slice(0, 19).replace("T", " "),
//                 ],
//             },
//         });
//
//         const graphData: DiaperGraphReturn = {
//             data: [],
//             raw: [],
//             refDate: refDate.toISOString(),
//         };
//
//         const dataPoint: { [label: string]: DiaperDataPoint } = {};
//
//         // Prepopulate the date point labels into the datapoint, all labels for the interval should be in the data points dictionary, values will be aggregated from there
//         //Sun through Sat
//         const getIntervals: IntervalLabels[] = getDateIntervals({
//             interval,
//             refDate,
//         });
//         getIntervals.forEach((item) => {
//             dataPoint[item.label] = {
//                 label: item.label,
//                 labelDate: item.labelDate.toISOString(),
//                 dirtyAmount: 0,
//                 wetAmount: 0,
//                 bothAmount: 0,
//             };
//         });
//
//         responseBI.forEach((item) => {
//             graphData.raw.push(item);
//             const [label, labelDate] = graphDataPointLabel({
//                 date: new Date(item.createdAt),
//                 interval,
//             });
//             if (!Boolean(dataPoint[label])) {
//                 dataPoint[label] = {
//                     label: label,
//                     labelDate: labelDate.toISOString(),
//                     dirtyAmount: 0,
//                     wetAmount: 0,
//                     bothAmount: 0,
//                 };
//             }
//             if (item.subType === "dirty") {
//                 dataPoint[label]!.dirtyAmount += item.value;
//             }
//             if (item.subType === "wet") {
//                 dataPoint[label]!.wetAmount += item.value;
//             }
//             if (item.subType === "both") {
//                 dataPoint[label]!.bothAmount += item.value;
//             }
//         });
//         // Fixed 2 Decimal Place QOL
//         Object.keys(dataPoint).forEach((key) => {
//             dataPoint[key]!.dirtyAmount = parseFloat(
//                 dataPoint[key]!.dirtyAmount.toFixed(0)
//             );
//             dataPoint[key]!.wetAmount = parseFloat(
//                 dataPoint[key]!.wetAmount.toFixed(0)
//             );
//             dataPoint[key]!.bothAmount = parseFloat(
//                 dataPoint[key]!.bothAmount.toFixed(0)
//             );
//
//             graphData.data.push(dataPoint[key]!);
//         });
//         await dbEnd(dbBI);
//         return graphData;
//     } catch (error: unknown) {
//         await dbEnd(dbBI);
//         logger.error("PROJECT_diaper", error as Error);
//         throw error;
//     }
// }
//
// export const lambdaHandler: Handler = async (
//     event: APIGatewayProxyEventV2,
//     context: Context
// ): Promise<APIGatewayProxyResultV2> => {
//     logger.warn("Hello PROJECT_diaper");
//     console.log(`Event: ${JSON.stringify(event, null, 2)}`);
//     console.log(`Context: ${JSON.stringify(context, null, 2)}`);
//
//     const subject_id: string | undefined = event.queryStringParameters?.['subject_id'];
//     const interval: string | undefined = event.queryStringParameters?.['interval'];
//     const refDateQueryString: string | undefined =
//         event.queryStringParameters?.['date'];
//
//     if (!subject_id) {
//         logger.warn("No subject_id");
//         return {
//             statusCode: 400,
//             headers: {"Access-Control-Allow-Origin": "*"},
//             body: JSON.stringify("subject_id Not Provided"),
//         };
//     }
//
//     if (
//         !interval &&
//         interval !== "daily" &&
//         interval !== "weekly" &&
//         interval !== "monthly"
//     ) {
//         logger.warn("No interval given");
//         return {
//             statusCode: 400,
//             headers: {"Access-Control-Allow-Origin": "*"},
//             body: JSON.stringify(
//                 "Interval (daily, weekly, monthly) Not Provided or Incorrect"
//             ),
//         };
//     }
//
//     const intervalAsEnum: IntervalEnum = interval as IntervalEnum;
//
//     if (refDateQueryString) {
//         if (!isValidDateISOString(refDateQueryString)) {
//             return {
//                 statusCode: 400,
//                 headers: {"Access-Control-Allow-Origin": "*"},
//                 body: JSON.stringify("Reference Date not in ISO format."),
//             };
//         }
//     }
//
//     const refDate = refDateQueryString
//         ? new Date(refDateQueryString)
//         : new Date();
//
//     if (!isValidDateObject(refDate)) {
//         return {
//             statusCode: 400,
//             headers: {"Access-Control-Allow-Origin": "*"},
//             body: JSON.stringify("Invalid Reference Date"),
//         };
//     }
//
//     if (!dbUserBI || !dbPassBI) {
//         try {
//             const client = new KMSClient({region: ""});
//             const dbUserBICommand = new DecryptCommand({
//                 CiphertextBlob: Buffer.from(encryptedDBUserBI as string, "base64"),
//             });
//             const dbUserBIData = await client.send(dbUserBICommand);
//
//             if (dbUserBIData.Plaintext) {
//                 dbUserBI = decodeUINT8Array(dbUserBIData.Plaintext);
//             }
//
//             const dbBIPassCommand = new DecryptCommand({
//                 CiphertextBlob: Buffer.from(encryptedDBPassBI as string, "base64"),
//             });
//             const dbPassBIData = await client.send(dbBIPassCommand);
//
//             if (dbPassBIData.Plaintext) {
//                 dbPassBI = decodeUINT8Array(dbPassBIData.Plaintext);
//             }
//         } catch (error: unknown) {
//             return {
//                 statusCode: 500,
//                 headers: {"Access-Control-Allow-Origin": "*"},
//                 body: JSON.stringify({message: `Failed to Connect to Data`, error}),
//             };
//         }
//     }
//
//     // if we still don't have encrypted data, still error? -- would there even be such a cass?
//     if (!dbUserBI || !dbPassBI) {
//         return {
//             statusCode: 500,
//             headers: {"Access-Control-Allow-Origin": "*"},
//             body: JSON.stringify({
//                 message: `Failed to set db information Connect to Data`,
//             }),
//         };
//     }
//
//     const result: DiaperGraphReturn = await PROJECT_diaper({
//         subject_id,
//         refDate,
//         interval: intervalAsEnum,
//     });
//     return {
//         statusCode: 200,
//         headers: {"Access-Control-Allow-Origin": "*"},
//         body: JSON.stringify(result),
//     };
// };
//
// export const handler = middy(lambdaHandler)
//     .use(injectLambdaContext(logger))
//     .use(errorLogger());
