import { api } from "../api/api"


export const fetchSubjects = async (grade, section, board, academicYear) => {
    try {
        const res = await api.get(
            `/api/admin/subject/class/${grade}/section/${section}`,
            { params: { board, academicYear } },
        )
        const subjectData = res.data.subjects
        return subjectData
    } catch(err) {
        console.error("failed to fetch student's schedule data: ", err.response?.data)
        throw err.response?.data || { message: "Something went wrong while fetching class schedule." }
    }
}


export const fetchAssessments = async (year, board, grade, section,) => {
    let assessments
    try {
        const res = await api.get(
            `/api/admin/assessment`,
            { params: { year, board, grade, section, }, },
        )
        if(res.data) assessments = res.data.exams
        return assessments
    } catch(err) {
        console.error("failed to fetch assessments: ", err.response?.data)
        throw err.response?.data || { message: "Something went wrong while fetching class schedule." }
    }
}


export const fetchAssessmentSubjects = async (assessmentTemplateId) => {
    let subjects
    try {
        const res = await api.get(
            `/api/admin/assessment/assessment-template/${assessmentTemplateId}`
        )
        if(res.data.success) subjects = res.data.data.subjects
        return subjects
    } catch(err) {
        console.error("error fetching assessment subjects: ", err.response?.data)
        throw err.response?.data || { message: "Something went wrong while fetching subjects for this assessment." }
    }
}


export const fetchFaculties = async (grade, section, board, subjectMasterId,) => {
    let faculties
    try {
        const res = await api.get(
            '/api/admin/subject/faculty/',
            { params: { grade, section, subjectMasterId, board, } }
        )
        if(res.data.success) faculties = res.data.faculties
        return faculties
    } catch(err) {
        console.error("error fetching subject's faculties: ", err.response?.data)
        throw err.response?.data || { message: "Something went wrong while fetching subject's faculties." }
    }
}


export const fetchStudents = async (grade, section, board) => {
    try {
        const res = await api.get(
            `/api/admin/students/grade/${grade}/section/${section}?board=${board}`
        )
        const fetchedStudents = Array.isArray(res.data) ? res.data : []
        return fetchedStudents
    } catch(err) {
        console.error("error fetching students: ", err.response?.data)
        throw err.response?.data || { message: "Something went wrong while fetching students." }
    }
}