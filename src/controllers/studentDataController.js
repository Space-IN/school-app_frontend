import { BASE_URL } from "@env"
import { api } from "../api/api"



export const fetchStudentSchedule = async (classAssigned, section) => {
    try {
        const res = await api.get(`${BASE_URL}/api/student/schedule/class/${classAssigned}/section/${section}`)
        const scheduleData = res.data
        return scheduleData
    } catch(err) {
        console.error("failed to fetch student's schedule data: ", err.response?.data)
        throw err.response?.data || { message: "Something went wrong while fetching class schedule." }
    }
}


export const fetchStudentData = async (studentId) => {
    try {
        const res = await api.get(`/api/student/info/${studentId}`)
        const studentData = res.data
        return studentData
    } catch(err) {
        console.error("failed to fetch student data: ", err.response?.data)
        throw err.response?.data || { message: "Something went wrong while fetching student data." }
    }
}


export const fetchOverallCPGA = async (studentId) => {
    try {
        const res = await api.get(`/api/student/info/cgpa/${studentId}`)
        return res.data.data
    } catch(err) {
        console.error("failed to fetch student's overall cgpa: ", err.response?.data)
        throw err.response?.data || { message: "something went wrong while fetching student's overall cgpa." }
    }
}

export const fetchActiveAnnouncements = async (from, to) => {
    try {
        const res = await api.get(`/api/announcement/active/`)
        return res.data
    } catch(err) {
        console.error("failed to fetch student's announcements: ", err.response?.data)
        throw err.response?.data || { message: "something went wrong while fetching announcements." }
    }
}


export const fetchEvents = async (studentId) => {
    try {
        const res = await api.get(`/api/events/student/${studentId}/`)
        return res.data
    } catch(err) {
        console.error("failed to fetch student's events: ", err.response?.data)
        throw err.response?.data || { message: "something went wrong while fetching events." }
    }
}


export const fetchAssessments = async (year, board, studentId) => {
    try {
        const res = await api.get(
            `/api/student/assessment/`,
            { params: { year, board, studentId } }
        )
        return res.data
    } catch(err) {
        console.error(`failed to fetch student's assessment: `, err.response?.data)
        throw err.response?.data || { message: `something went wrong while fetching student's assessments.` }
    }
}


export const fetchAssessmentScore = async (studentId, assessmentId, year) => {
    try {
        const res = await api.get(
            `/api/student/assessment/assessmentScore/${studentId}/${assessmentId}/${year}`
        )
        return res.data
    } catch(err) {
        console.error(`failed to fetch student's ${testName} score: `, err.response?.data)
        throw err.response?.data || { message: `something went wrong while fetching student's ${testName} score.` }
    }
}


export const fetchFeeDetails = async (studentId) => {
    try {
        const res = await api.get(`/api/student/fee/${studentId}`)
        return res.data
    } catch(err) {
        console.error(`failed to fetch student's fee info: `, err.response?.data)
        throw err.response?.data || { message: `something went wrong while fetching student's assessments.` }
    }
}