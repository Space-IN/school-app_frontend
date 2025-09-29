import axios from "axios"
import * as SecureStore from "expo-secure-store"



export const loginUser = async (userId, password) => {
    
    try {
        const response = await axios.post(`http://10.221.34.139:5000/api/auth/login`, {
            userId,
            password
        })

        const { token } = response.data
        await SecureStore.setItemAsync("token", token)

        return token
    } catch(err) {
        console.error("Login error: ", err.response?.data)
        throw err.response?.data || { message: "Something went wrong" }
    }
}