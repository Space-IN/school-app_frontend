import { createContext, useState, useEffect, useContext } from "react"
import * as SecureStore from "expo-secure-store"
import { loginUser, logoutUser } from "../controllers/authController"
import { jwtDecode } from "jwt-decode"

export const AuthContext = createContext()



export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [accessToken, setAccessToken] = useState(null)
    const [decodedToken, setDecodedToken] = useState(null)
    const [loading, setLoading] = useState(true)

    const decode = (token) => {
        try {
            return jwtDecode(token)
        } catch(err) {
            console.error("invalid token, decoding failed.")
            return null
        }
    }

    const login = async (userId, password) => {
        setLoading(true)
        try {
            const data = await loginUser(userId, password)
            if(data) {
                await SecureStore.setItemAsync("auth", JSON.stringify(data))

                setAccessToken(data.access_token)

                const decoded = decode(data.access_token)
                setDecodedToken(decoded)
                
                setIsAuthenticated(true)
            }
        } catch(err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        const stored = await SecureStore.getItemAsync("auth")
        try {
            if(stored) {
                const refreshToken = JSON.parse(stored)?.refresh_token
                await logoutUser(refreshToken)
            }
        } catch(err) {
            console.error("logout notify failed(safe to ignore): ", err)
        } finally {
            await SecureStore.deleteItemAsync("auth")
            setAccessToken(null)
            setDecodedToken(null)
            setIsAuthenticated(false)
        }
    }

    const loadUser = async () => {
        setLoading(true)
        try {
            const stored = await SecureStore.getItemAsync("auth")
            if(stored) {
                const parsed = JSON.parse(stored)
                const decoded = decode(parsed.access_token)
                if(decoded) {
                    setAccessToken(parsed.access_token)
                    setDecodedToken(decoded)
                    setIsAuthenticated(true)
                } else {
                    await SecureStore.deleteItemAsync("auth")
                }
            }
        } catch(err) {
            console.log("error loading user: ", err)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        loadUser()
    }, [])

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, accessToken, decodedToken, loading, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)