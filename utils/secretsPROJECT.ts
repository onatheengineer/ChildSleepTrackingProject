// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html
// https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

interface SecretsPROJECT {
    username: string
    password: string
    host: string
}

const secretsPROJECT = async (): Promise<SecretsPROJECT> => {
    const secretName = 'db-01-2-cluster-LambdaAccess'
    const client = new SecretsManagerClient({
        region: ''
    })

    try {
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: 'AWSCURRENT' // VersionStage defaults to AWSCURRENT if unspecified
            })
        )
        if (response !== undefined) {
            if (response.SecretString !== undefined) {
                return JSON.parse(response.SecretString)
            }
        }
        throw new Error(':::secretsDB012Read ERROR:::')
    } catch (error) {
        throw new Error(`secretsDB012Read::CATCH:: ${JSON.stringify(error)}`)
    }
}
export { secretsPROJECT }
