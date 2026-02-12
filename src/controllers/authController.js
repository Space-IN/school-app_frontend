import axios from "axios"
import { KEYCLOAK_SERVER_URL, BASE_URL } from "@env"
import { keycloakConfig } from "../config/keycloak"




export async function loginUser(username, password) {
  try {
    const response = await axios.post(
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
    console.error("error logging in:", err.message);
    throw err;
  }
}


export async function logoutUser(refreshToken) {
    try {
        const response = await axios.post(
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

        const response = await axios.post(
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


export async function getMaskedPhone(userId) {
    try {
        const response = await axios.get(`${BASE_URL}/api/auth/otp/meta/${userId}`)
        return response.data
    } catch(err) {
        console.error("could not get masked phone number: ", err?.response?.data || err.message)
        throw err
    }
}


export async function sendOtp(userId) {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/otp/send`, { userId })
        return response.data
    } catch(err) {
        console.error("could not send otp request: ", err?.response?.data || err.message)
        throw err
    }
}


export async function verifyOtp(userId, otp) {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/otp/verify`, { userId, otp })
        return response.data
    } catch(err) {
        console.error("could not send otp verify request: ", err?.response?.data || err.message)
        throw err
    }
}


export async function resetPassword(newPassword, resetToken) {
    try {
        const response = await axios.post(
            `${BASE_URL}/api/auth/account/set-password`,
            { newPassword, },
            { headers: { Authorization: `Bearer ${resetToken}`} }
        )
        return response.data
    } catch(err) {
        console.error("set-password request failed: ", err?.response?.data || err.message)
        throw err
    }
}