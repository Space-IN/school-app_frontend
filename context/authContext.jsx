import { createContext, useState, useEffect, useContext } from "react"
import * as SecureStore from "expo-secure-store"
import { loginUser } from "../controllers/authController"
import { jwtDecode } from "jwt-decode"

export const AuthContext = createContext()


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)

    const login = async (userId, password) => {
        setLoading(true)
        try {
            const token = await loginUser(userId, password)
            const decodedToken = jwtDecode(token)
            setUser({ userId: decodedToken.userId, role: decodedToken.role })
        } catch(err) {
            throw err
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        setUser(null)
        await SecureStore.deleteItemAsync("token")
    }

    useEffect(() => {
        const loadUser = async () => {
            setLoading(true)
            try {
                const storedToken = await SecureStore.getItemAsync("token")
                if(storedToken) {
                    const decodedToken = jwtDecode(storedToken)
                    setUser({ userId: decodedToken.userId, role: decodedToken.role })
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
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)