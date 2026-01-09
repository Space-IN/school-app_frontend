import { createContext, useState, useEffect, useContext } from "react"
import { useAuth } from "./authContext"
import { fetchStudentData, fetchOverallCPGA } from "../controllers/studentDataController"

export const StudentContext = createContext()



export const StudentProvider = ({ children }) => {
    const [studentData, setStudentData] = useState(null)
    const [studentLoading, setStudentLoading] = useState(true)
    const [studentErr, setStudentErr] = useState(null)
    const { decodedToken } = useAuth()
    
    const loadStudentData = async () => {
        const studentId = decodedToken?.preferred_username
        if(!studentId) {
            setStudentLoading(false)
            return
        }

        setStudentLoading(true)
        try {
            const studentRes = await fetchStudentData(studentId)
            const cgpaRes = await fetchOverallCPGA(studentId)

            let studentObj = studentRes?.data || {}
            const overall = { grade: cgpaRes }

            studentObj = { ...studentObj, ...overall }
            if(studentObj) {
                setStudentData(studentObj)
            }
        } catch(err) {
            console.error("error setting student data: ", err)
            setStudentErr(err)
        } finally {
            setStudentLoading(false)
        }
    }

    
    useEffect(() => {
        loadStudentData()
    }, [decodedToken])

    return (
        <StudentContext.Provider value={{ studentData, studentLoading, studentErr, loadStudentData }}>
            {children}
        </StudentContext.Provider>
    )
}

export const useStudent = () => useContext(StudentContext)