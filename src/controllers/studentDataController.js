import axios from "axios"
import { BASE_URL } from "@env"



export const fetchStudentSchedule = async (studentId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/schedule/student/${studentId}`)
        const scheduleData = res.data
        return scheduleData
    } catch(err) {
        console.error("failed to fetch student's schedule data: ", err.response?.data)
        throw err.response?.data || { message: "Something went wrong while fetching class schedule." }
    }
}


export const fetchStudentData = async (studentId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/student/info/${studentId}`)
        const studentData = res.data
        return studentData
    } catch(err) {
        console.error("failed to fetch student data: ", err.response?.data)
        throw err.response?.data || { message: "Something went wrong while fetching student data." }
    }
}


export const fetchOverallCPGA = async (studentId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/student/info/cgpa/${studentId}`)
        return res.data.data
    } catch(err) {
        console.error("failed to fetch student's overall cgpa: ", err.response?.data)
        throw err.response?.data || { message: "something went wrong while fetching student's overall cgpa." }
    }
}

export const fetchAnnouncements = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/api/notices/`)
        return res.data
    } catch(err) {
        console.error("failed to fetch student's announcements: ", err.response?.data)
        throw err.response?.data || { message: "something went wrong while fetching announcements." }
    }
}


export const fetchEvents = async (studentId) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/events/student/${studentId}/`)
        return res.data
    } catch(err) {
        console.error("failed to fetch student's events: ", err.response?.data)
        throw err.response?.data || { message: "something went wrong while fetching events." }
    }
}