import axios from "axios"
import { KEYCLOAK_SERVER_URL } from "@env"
import { keycloakConfig } from "../config/keycloak"
import { api } from "../api/api"



export async function loginUser(username, password) {
  console.log("🔐 loginUser called");
  console.log("🌐 KEYCLOAK_SERVER_URL:", KEYCLOAK_SERVER_URL);
  console.log(
    "➡️ FULL URL:",
    `${KEYCLOAK_SERVER_URL}/realms/vishwachetana-vidyaniketana/protocol/openid-connect/token`
  );

  try {
    const response = await api.post(
      `${KEYCLOAK_SERVER_URL}/realms/vishwachetana-vidyaniketana/protocol/openid-connect/token`,
      new URLSearchParams({
        client_id: keycloakConfig.clientId,
        grant_type: "password",
        username,
        password,
        scope: "offline_access",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error("❌ error logging in:", err.message);
    throw err;
  }
}



export async function logoutUser(refreshToken) {
    try {
        const response = await api.post(
            `${KEYCLOAK_SERVER_URL}/realms/vishwachetana-vidyaniketana/protocol/openid-connect/logout`,
            new URLSearchParams({
                client_id: keycloakConfig.clientId,
                refresh_token: refreshToken
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            },
        )
        return response.data
    } catch(err) {
        console.error("error logging out: ", err.response?.data || err.message)
        throw err
    }
}


export async function refreshUser(refreshToken) {
    try {
        const params = new URLSearchParams()
        params.append("grant_type", "refresh_token")
        params.append("client_id", keycloakConfig.clientId)
        params.append("refresh_token", refreshToken)

        const response = await api.post(
            `${KEYCLOAK_SERVER_URL}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`,
            params,
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )

        return response.data
    } catch(err) {
        console.error("refresh token failed: ", err?.response?.data || err.message)
        throw err
    }
}