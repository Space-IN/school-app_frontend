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
    try {
        const res = await api.get(
            `/api/admin/assessment`,
            { params: { year, board, grade, section, }, },
        )
        const assessments = res.data.exams
        return assessments
    } catch(err) {
        console.error("failed to fetch assessments: ", err.response?.data)
        throw err.response?.data || { message: "Something went wrong while fetching class schedule." }
    }
}