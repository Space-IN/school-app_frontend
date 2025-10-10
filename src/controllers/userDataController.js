import axios from "axios"
import { BASE_URL } from "@env"



export const fetchStudentSchedule = async (userId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/schedule/student/${userId}`)
        const scheduleData = res.data
        return scheduleData
    } catch(err) {
        console.error("failed to fetch student's schedule data: ", err.response?.data)
        throw err.response?.data || { message: "Something went wrong while fetching class schedule..." }
    }
}


export const fetchStudentData = async (userId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/student/info/${userId}`)
        const studentData = res.data
        return studentData
    } catch(err) {
        console.error("failed to fetch student data: ", err.response?.data)
        throw err.response?.data || { message: "Something went wrong while fetching student data" }
    }
}