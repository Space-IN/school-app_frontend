import { createContext, useState, useEffect, useContext } from "react"
import { useAuth } from "./authContext"
import { fetchStudentData, fetchOverallCPGA } from "../controllers/studentDataController"

export const StudentContext = createContext()



export const StudentProvider = ({ children }) => {
    const [studentData, setStudentData] = useState(null)
    const [studentLoading, setStudentLoading] = useState(true)
    const [studentErr, setStudentErr] = useState(null)
    const { decodedToken } = useAuth()

    const loadStudentData = async (decodedToken) => {
        if(!decodedToken) {
            setStudentLoading(false)
            return
        }

        setStudentLoading(true)
        try {
            const studentId = decodedToken?.preferred_username

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
        loadStudentData(decodedToken)
    }, [decodedToken])

    return (
        <StudentContext.Provider value={{ studentData, studentLoading, studentErr }}>
            {children}
        </StudentContext.Provider>
    )
}

export const useStudent = () => useContext(StudentContext)