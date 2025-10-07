import axios from "axios"
import { BASE_URL } from "@env"



export const fetchSchedule = async (userId) => {
    try {
        const res = await axios.get(`http://10.221.34.139:5000/api/schedule/student/stu040`)
        const scheduleData = res.data
        return scheduleData
    } catch(err) {
        console.error("failed to fetch student's schedule data: ", err.response?.data)
        throw err.response?.data || { message: "Something went wrong while fetching class schedule..." }
    }
}