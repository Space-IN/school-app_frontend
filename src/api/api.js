import axios from "axios"
import { BASE_URL } from "@env"
import { setupRequestInterceptor } from "./reqInterceptor"
import { setupResponseInterceptor } from "./resInterceptor"
import { getHandlers } from "./handlers"

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
})

console.log("🌍 AXIOS BASE URL USED:", api.defaults.baseURL);

setupRequestInterceptor(api, getHandlers)
setupResponseInterceptor(api, getHandlers)