
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'


class SecretsPROJECTInterface:
    def __init__(self, username: str, password: str, host: str ) -> str:
        self.username = username
        self.password = password
        self.host = host
    # def __str__(self):
    #     return username, password, host
    # def username(self) -> str:
    #     pass
    # def password(self) -> int:
    #     pass
    # def host(self) -> int:
    #     pass


class secrets_PROJECT: extends SecretsPROJECTInterface:
    secret_name = 'db-cluster-LambdaAccess'
    client = new SecretsManagerClient({
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
        throw new Error(':::secretsDBRead ERROR:::')
    } catch (error) {
        throw new Error(`secretsDBRead::CATCH:: ${JSON.stringify(error)}`)
    }
}
export { secretsPROJECT }
