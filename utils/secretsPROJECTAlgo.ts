// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html
// https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

interface SecretsPROJECTAlgo {
  username: string
  password: string
  host: string
}

const secretsPROJECTAlgo = async (): Promise<SecretsPROJECTAlgo> => {
  const secretName = 'PROJECTAlgodbLambdaAccess'
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
    throw new Error(':::secretsPROJECTAlgoDB ERROR:::')
  } catch (error) {
    throw new Error(`secretsPROJECTAlgoDB::CATCH:: ${JSON.stringify(error)}`)
  }
}
export { secretsPROJECTAlgo }
