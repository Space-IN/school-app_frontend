import { createContext, useState, useEffect, useContext } from "react"
import * as SecureStore from "expo-secure-store"
import { loginUser } from "../controllers/authController"
import { jwtDecode } from "jwt-decode"

export const AuthContext = createContext()


export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [token, setToken] = useState(null)
    const [decodedToken, setDecodedToken] = useState(null)
    const [loading, setLoading] = useState(false)

    const login = async (userId, password) => {
        setLoading(true)
        try {
            const token = await loginUser(userId, password)
            setToken(token)
            const decodedToken = jwtDecode(token)
            setDecodedToken(decodedToken)
            setIsAuthenticated(true)
        } catch(err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        setIsAuthenticated(false)
        setToken(null)
        setDecodedToken(null)
        await SecureStore.deleteItemAsync("token")
    }

    useEffect(() => {
        const loadUser = async () => {
            setLoading(true)
            try {
                const storedToken = await SecureStore.getItemAsync("token")
                if(storedToken) {
                    setToken(storedToken)
                    const decodedToken = jwtDecode(storedToken)
                    setDecodedToken(decodedToken)
                    setIsAuthenticated(true)
                }
            } catch(err) {
                console.log("error loading user: ", err)
            } finally {
                setLoading(false)
            }
        }
        loadUser()
    }, [])

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, decodedToken, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)