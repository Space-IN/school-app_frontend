import { createContext, useState, useEffect, useContext, useCallback } from "react"
import * as SecureStore from "expo-secure-store"
import { decodeToken } from "../utils/token"
import { loginUser, logoutUser, refreshUser } from "../controllers/authController"
import { attachAuthHandlers } from "../api/handlers"

export const AuthContext = createContext()



export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [accessToken, setAccessToken] = useState(null)
    const [decodedToken, setDecodedToken] = useState(null)
    const [loading, setLoading] = useState(true)

    const login = async (userId, password) => {
        setLoading(true)
        try {
            const data = await loginUser(userId, password)
            if(data) {
                await SecureStore.setItemAsync("auth", JSON.stringify(data))
                setAccessToken(data.access_token)
                const decoded = decodeToken(data.access_token)
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

    const loadUser = useCallback(async () => {
        setLoading(true)
        try {
            const stored = await SecureStore.getItemAsync("auth")
            if(stored) {
                const parsed = JSON.parse(stored)
                const decoded = decodeToken(parsed.access_token)
                if(decoded?.exp*1000 > Date.now()) {
                    setAccessToken(parsed.access_token)
                    setDecodedToken(decoded)
                    setIsAuthenticated(true)
                } else {
                    await refreshTokens()
                    setIsAuthenticated(true)
                }
            }
        } catch(err) {
            console.log("error loading user: ", err)
        } finally {
            setLoading(false)
        }
    }, [])

    const refreshTokens = useCallback(async () => {
        try {
            const stored = await SecureStore.getItemAsync("auth")
            if(!stored) throw new Error("no refresh tokens stored.")
            
            const parsed = JSON.parse(stored)
            const refreshToken = parsed.refresh_token

            const data = await refreshUser(refreshToken)
            await SecureStore.setItemAsync("auth", JSON.stringify(data))

            setAccessToken(data.access_token)
            setDecodedToken(decodeToken(data.access_token))
            return data.access_token
        } catch(err) {
            console.error("refresh failed: ", err)
            logout()
            throw err
        }
    }, [logoutUser])

    const attachHandlers = useCallback(() => {
        attachAuthHandlers({
            getAccessToken: async () => accessToken,
            refreshTokens: async () => refreshTokens(),
            onLogout: async () => logout()
        })
    }, [accessToken, refreshTokens, logout])



    useEffect(() => {
        loadUser()
    }, [])

    useEffect(() => {
        attachHandlers()
    }, [attachHandlers])

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, accessToken, decodedToken, loading, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)