// // this function is used to connect to the Business Insights database
// import { Logger } from '@aws-lambda-powertools/logger'
// import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms'
// import { decodeUINT8Array } from '../dbConnection'
//
// const logger = new Logger({
//   logLevel: 'INFO',
//   serviceName: 'PROJECT_graph_GQL'
// })
//
// interface GetEnvVarsProps {
//   dbUserBI: string
//   dbPassBI: string
//   encryptedDBUserBI: string
//   encryptedDBPassBI: string
// }
//
// interface GetEnvVarsReturn {
//   dbUserBIData: string
// }
//
// export const getEnvVarsBI = async ({
//   dbUserBI,
//   dbPassBI,
//   encryptedDBUserBI,
//   encryptedDBPassBI
// }: GetEnvVarsProps): GetEnvVarsReturn => {
//   if (!dbUserBI || !dbPassBI) {
//     try {
//       const client = new KMSClient({ region: '' })
//       const dbUserBICommand = new DecryptCommand({
//         CiphertextBlob: Buffer.from(encryptedDBUserBI, 'base64')
//       })
//       const dbUserBIData = await client.send(dbUserBICommand)
//       if (dbUserBIData.Plaintext) {
//         dbUserBI = decodeUINT8Array(dbUserBIData.Plaintext)
//       }
//       const dbBIPassCommand = new DecryptCommand({
//         CiphertextBlob: Buffer.from(encryptedDBPassBI, 'base64')
//       })
//       const dbPassBIData = await client.send(dbBIPassCommand)
//       if (dbPassBIData.Plaintext) {
//         dbPassBI = decodeUINT8Array(dbPassBIData.Plaintext)
//       }
//     } catch (error: unknown) {
//       logger.error(
//                 `Failed to Connect to database using Business Insights EnvVars ${error}`
//       )
//     }
//   }
//   if (!dbUserBI || !dbPassBI) {
//     logger.error('Invalid Environment Variables')
//   }
// }
