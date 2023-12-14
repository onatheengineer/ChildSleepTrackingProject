// import { Logger } from '@aws-lambda-powertools/logger'
// import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms'
//
// import {
//   type APIGatewayProxyEventV2,
//   type APIGatewayProxyResultV2,
//   type Context,
//   type Handler
// } from 'aws-lambda'
// import { type Connection } from 'mysql'
// import * as mysql from 'mysql'
// import {
//   FeatureType,
//   type GraphDataPoint,
//   type GraphProps,
//   type GraphReturn,
//   IntervalEnum,
//   type IntervalLabels
// } from 'schema'
// import { type FeatureQuery } from 'schema/graph'
// import {
//   dbEnd,
//   dbQuery,
//   decodeUINT8Array,
//   getIntervalLabels,
//   graphDataPointLabel,
//   isValidDateISOString,
//   isValidDateObject
// } from 'utils'
// const logger = new Logger({
//   logLevel: 'INFO',
//   serviceName: 'PROJECT_graphType1'
// })
//
// const encryptedDBUserBI = process.env['dbUserBI']
// const encryptedDBPassBI = process.env['dbPassBI']
// const dbHostBI = process.env['dbHostBI']
//
// let dbUserBI: string | undefined
// let dbPassBI: string | undefined
//
// async function PROJECT_graphType1 ({
//   subject_id,
//   featureType,
//   refDate,
//   interval
// }: GraphProps) {
//   const dbBI: Connection = mysql.createConnection({
//     connectTimeout: 4000,
//     host: dbHostBI,
//     user: dbUserBI,
//     password: dbPassBI
//   })
//   const intervalQuery =
//         interval === IntervalEnum.MONTHLY
//           ? '5 MONTH'
//           : interval === IntervalEnum.WEEKLY
//             ? '5 WEEK'
//             : '1 WEEK'
//   dbBI.connect()
//   let responseBI: FeatureQuery[] = []
//   switch (featureType) {
//     case FeatureType.FOOD:
//       logger.error(`case GET featureType---Food:::: ${JSON.stringify(featureType)}`)
//       logger.error(`case GET FeatureType.FOOD:::: ${JSON.stringify(FeatureType.FOOD)}`)
//       responseBI = await dbQuery<FeatureQuery[]>({
//         connect: dbBI,
//         params: {
//           sql: `SELECT type, value, units, createdAt FROM PROJECTAlgoDB.PROJECT_healthTrackerFood WHERE subject_id = ? AND delivery = ? AND createdAt <= ? AND createdAt >= DATE_SUB(?, INTERVAL ${intervalQuery}) ORDER BY createdAt DESC`,
//           values: [
//             subject_id,
//             'BOTTLE',
//             refDate.toISOString().slice(0, 19).replace('T', ' '),
//             refDate.toISOString().slice(0, 19).replace('T', ' ')
//           ]
//         }
//       })
//       break
//     case FeatureType.DIAPER:
//       logger.error(`case CREATE featureType---Diaper:::: ${JSON.stringify(featureType)}`)
//       logger.error(`case CREATE FeatureType.DIAPER:::: ${JSON.stringify(FeatureType.DIAPER)}`)
//       responseBI = await dbQuery<FeatureQuery[]>({
//         connect: dbBI,
//         params: {
//           sql: `SELECT type, value, units, createdAt FROM PROJECTAlgoDB.PROJECT_healthTrackerDiaper WHERE subject_id = ? AND createdAt <= ? AND createdAt >= DATE_SUB(?, INTERVAL ${intervalQuery}) ORDER BY createdAt DESC`,
//           values: [
//             subject_id,
//             refDate.toISOString().slice(0, 19).replace('T', ' '),
//             refDate.toISOString().slice(0, 19).replace('T', ' ')
//           ]
//         }
//       })
//       break
//     default:
//       throw new Error('no FeatureType given to update Heath Item')
//   }
//   try {
//     const graphData: GraphReturn = {
//       data: [],
//       raw: [],
//       dataDate: refDate.toISOString()
//     }
//
//     const dataPoint: { [label: string]: GraphDataPoint } = {}
//
//     // Prepopulate the date point labels into the datapoint, all labels for the interval should be in the data points dictionary, values will be aggregated from there
//     // Sun through Sat
//     const getIntervals: IntervalLabels[] = getIntervalLabels({
//       interval,
//       refDate
//     })
//     logger.error(`responseBI::: ${JSON.stringify(responseBI)}`)
//
//     getIntervals.forEach((item) => {
//       logger.error(`itemIntervalgetIntervals::: ${JSON.stringify(item)}`)
//       logger.error(`itemIntervalLabel::: ${JSON.stringify(item.label)}`)
//       logger.error(`itemIntervalLabelDAte::: ${JSON.stringify(item.labelDate)}`)
//       dataPoint[item.label] = {
//         label: item.label,
//         labelDate: item.labelDate,
//         items: []
//       }
//     })
//
//     responseBI.forEach((item) => {
//       logger.error(`itemIntervalITEM::: ${JSON.stringify(item)}`)
//       graphData.raw.push(item)
//       if (item.createdAt && item.units && item.value && item.type) {
//         const [label, labelDate] = graphDataPointLabel({
//           date: new Date(item.createdAt),
//           interval
//         })
//         logger.error(`ItemLabel:: ${JSON.stringify([label, labelDate])}`)
//         if (!dataPoint[label]) {
//           logger.error(`GETTING IN HERE dataPoint[label]::: ${JSON.stringify(item)}`)
//           dataPoint[label] = {
//             label,
//             labelDate,
//             items: []
//           }
//         }
//         const dpIndex: number | undefined = dataPoint[label]!.items.findIndex((dataItem) => {
//           return dataItem.type === item.type
//         })
//         logger.error(`DPINDEX::${dpIndex}`)
//         if (dpIndex < 0) {
//           logger.error(`PUSH NEW DATA LABEL ITEM::${label} :: ${item.type}`)
//           dataPoint[label]!.items.push({
//             units: item.units,
//             type: item.type,
//             value: item.value
//           })
//         }
//         if (dpIndex >= 0) {
//           logger.error(`SUM EXISTING::${label} :: ${dpIndex} :: ${item.value}`)
//           dataPoint[label]!.items?[dpIndex]!.value += item.value
//           dataPoint[label]!.items?[dpIndex]!.value = parseFloat(dataPoint[label]!.items[dpIndex]!.value.toFixed(2))
//         }
//
//         logger.error('THE END:::')
//       } else {
//         logger.error(`ITEM NOT COMPLETED:: ${JSON.stringify(item)}`)
//       }
//     })
//
//     logger.error('DataPoint::', JSON.stringify(dataPoint))
//     Object.keys(dataPoint).forEach((key) => {
//       graphData.data.push(dataPoint[key]!)
//     })
//     await dbEnd(dbBI)
//     return graphData
//   } catch (error: unknown) {
//     await dbEnd(dbBI)
//     logger.error('PROJECT_graphType1', error as Error)
//     throw error
//   }
// }
//
// export const handler: Handler = async (
//   event: APIGatewayProxyEventV2,
//   context: Context
// ): Promise<APIGatewayProxyResultV2> => {
//   if (!dbUserBI || !dbPassBI) {
//     try {
//       const client = new KMSClient({ region: '' })
//       const dbUserBICommand = new DecryptCommand({
//         CiphertextBlob: Buffer.from(encryptedDBUserBI as string, 'base64')
//       })
//       const dbUserBIData = await client.send(dbUserBICommand)
//       if (dbUserBIData.Plaintext) {
//         dbUserBI = decodeUINT8Array(dbUserBIData.Plaintext)
//       }
//       const dbBIPassCommand = new DecryptCommand({
//         CiphertextBlob: Buffer.from(encryptedDBPassBI as string, 'base64')
//       })
//       const dbPassBIData = await client.send(dbBIPassCommand)
//       if (dbPassBIData.Plaintext) {
//         dbPassBI = decodeUINT8Array(dbPassBIData.Plaintext)
//       }
//     } catch (error: unknown) {
//       return {
//         statusCode: 500,
//         headers: { 'Access-Control-Allow-Origin': '*' },
//         body: JSON.stringify({ message: 'Failed to Connect to Data', error })
//       }
//     }
//   }
//   if ((dbUserBI == null) || (dbPassBI == null)) {
//     return {
//       statusCode: 403,
//       headers: { 'Access-Control-Allow-Origin': '*' },
//       body: JSON.stringify({
//         message: 'Failed to authenticate'
//       })
//     }
//   }
//
//   logger.info('Hello PROJECT_graph_typeone_card')
//   logger.info(`Event: ${JSON.stringify(event, null, 2)}`)
//   logger.info(`Context: ${JSON.stringify(context, null, 2)}`)
//
//   const subject_id: string | undefined = event.queryStringParameters?.['subject_id']
//   const featureType: string | undefined = event.queryStringParameters?.['featureType']
//   const interval: string | undefined = event.queryStringParameters?.['interval']
//   const refDateQueryString: string | undefined =
//         event.queryStringParameters?.['date']
//
//   logger.error(`refDateIncomingType:::${typeof refDateQueryString}`)
//   if (!subject_id) {
//     logger.error('No subject_id')
//     return {
//       statusCode: 400,
//       headers: { 'Access-Control-Allow-Origin': '*' },
//       body: JSON.stringify('subject_id Not Provided')
//     }
//   }
//   if (!featureType) {
//     logger.error(`featureType::: ${JSON.stringify(featureType)}`)
//     return {
//       statusCode: 400,
//       headers: { 'Access-Control-Allow-Origin': '*' },
//       body: JSON.stringify(
//         'Feature Type Not Provided or Incorrect'
//       )
//     }
//   }
//   if (!(featureType in FeatureType)) {
//     logger.error(`featureType::: ${JSON.stringify(featureType)}`)
//     return {
//       statusCode: 400,
//       headers: { 'Access-Control-Allow-Origin': '*' },
//       body: JSON.stringify(
//         'Feature Type provided is not a valid Feature Type'
//       )
//     }
//   }
//   if (
//     !interval &&
//         interval !== 'daily' &&
//         interval !== 'weekly' &&
//         interval !== 'monthly'
//   ) {
//     logger.warn('No interval given')
//     return {
//       statusCode: 400,
//       headers: { 'Access-Control-Allow-Origin': '*' },
//       body: JSON.stringify(
//         'Interval (daily, weekly, monthly) Not Provided or Incorrect'
//       )
//     }
//   }
//
//   if (refDateQueryString) {
//     if (!isValidDateISOString(refDateQueryString)) {
//       return {
//         statusCode: 400,
//         headers: { 'Access-Control-Allow-Origin': '*' },
//         body: JSON.stringify('Reference Date provide is not in ISO format YYYY-MM-DDTHH:mm:ss.sssZ.')
//       }
//     }
//   }
//
//   const refDate = refDateQueryString
//     ? new Date(refDateQueryString)
//     : new Date()
//
//   if (!isValidDateObject(refDate)) {
//     return {
//       statusCode: 400,
//       headers: { 'Access-Control-Allow-Origin': '*' },
//       body: JSON.stringify('Reference Date provide is not in ISO format YYYY-MM-DDTHH:mm:ss.sssZ.')
//     }
//   }
//
//   const intervalAsEnum: IntervalEnum = interval as IntervalEnum
//   const featureTypeEnum: FeatureType = featureType as FeatureType
//
//   const result: GraphReturn = await PROJECT_graphType1({
//     subject_id,
//     featureType: featureTypeEnum,
//     refDate,
//     interval: intervalAsEnum
//   })
//
//   logger.error(`result:::${JSON.stringify(result)}`)
//
//   return {
//     statusCode: 200,
//     headers: { 'Access-Control-Allow-Origin': '*' },
//     body: JSON.stringify(result)
//   }
// }
