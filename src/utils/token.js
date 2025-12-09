import { jwtDecode } from "jwt-decode"

export const decodeToken = (token) => {
    try {
        return jwtDecode(token)
    } catch(err) {
        console.error("invalid token, decoding failed.")
        return null
    }
}