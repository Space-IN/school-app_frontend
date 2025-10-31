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

export const fetchActiveAnnouncements = async (from, to) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/announcements/active/`)
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


export const fetchAssessments = async (grade, section, year) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/assessment/assessmentName?grade=${grade}&section=${section}&year=${year}`)
        return res.data
    } catch(err) {
        console.error(`failed to fetch student's assessment: `, err.response?.data)
        throw err.response?.data || { message: `something went wrong while fetching student's assessments.` }
    }
}

export const fetchAssessmentScore = async (studentId, grade, section, testName, year) => {
    try {
        const res = await axios.get(`${BASE_URL}/api/assessment/student/assessmentScore?studentId=${studentId}&grade=${grade}&section=${section}&test_name=${testName}&year=${year}`)
        return res.data
    } catch(err) {
        console.error(`failed to fetch student's ${testName} score: `, err.response?.data)
        throw err.response?.data || { message: `something went wrong while fetching student's ${testName} score.` }
    }
}

