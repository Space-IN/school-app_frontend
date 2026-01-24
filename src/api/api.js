import axios from "axios"
import { BASE_URL } from "@env"
import { setupRequestInterceptor } from "./reqInterceptor"
import { setupResponseInterceptor } from "./resInterceptor"
import { getHandlers } from "./handlers"
console.log(' API FILE LOADED ');
export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
})

setupRequestInterceptor(api, getHandlers)
setupResponseInterceptor(api, getHandlers)