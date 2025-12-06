import { KEYCLOAK_SERVER_URL } from '@env'

export const keycloakConfig = {
    url: KEYCLOAK_SERVER_URL,
    realm: 'vishwachetana-vidyaniketana',
    clientId: 'vishwachetanaClient-mobile',
    redirectUri: 'vv.mobile://redirect',
}