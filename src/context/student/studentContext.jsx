import { createContext, useState, useEffect, useContext } from "react"
import { useAuth } from "../authContext"
import { fetchStudentData, fetchOverallCPGA } from "../../controllers/studentDataController"

export const StudentContext = createContext()


export const StudentProvider = ({ children }) => {
    const { decodedToken } = useAuth()
    const [studentData, setStudentData] = useState(null)
    const [studentLoading, setStudentLoading] = useState(true)
    const [studentErr, setStudentErr] = useState(null)

    useEffect(() => {
        if (!decodedToken?.userId) return

        const loadStudentData = async () => {
            setStudentLoading(true)
            try {
                const studentId = decodedToken?.userId

                const studentRes = await fetchStudentData(studentId)
                let studentObj = studentRes?.data || {}

                const cgpaRes = await fetchOverallCPGA(studentId)
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
        loadStudentData()
    }, [decodedToken])

    return (
        <StudentContext.Provider value={{ studentData, studentLoading, studentErr }}>
            {children}
        </StudentContext.Provider>
    )
}

export const useStudent = () => useContext(StudentContext)