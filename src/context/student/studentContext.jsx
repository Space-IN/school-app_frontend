import { createContext, useState, useEffect, useContext } from "react"
import { useAuth } from "../authContext"
import { fetchStudentData, fetchOverallCPGA } from "../../controllers/studentDataController"

export const StudentContext = createContext()


export const StudentProvider = ({ children }) => {
    const { decodedToken } = useAuth()
    const [studentData, setStudentData] = useState(null)
    const [studentLoading, setStudentLoading] = useState(false)

    useEffect(() => {
        if (!decodedToken?.userId) return

        const loadStudentData = async () => {
            setStudentLoading(true)
            try {
                const studentId = decodedToken?.userId

                const studentRes = await fetchStudentData(studentId)
                let studentObj = studentRes?.data || {}

                const cgpaRes = await fetchOverallCPGA(studentId)
                const cgpaData = { cgpa: cgpaRes?.data }

                studentObj = { ...studentObj, ...cgpaData }
                if(studentObj) {
                    setStudentData(studentObj)
                }
            } catch(err) {
                console.error("error setting student data: ", err)
            } finally {
                setStudentLoading(false)
            }
        }
        loadStudentData()
    }, [decodedToken])

    return (
        <StudentContext.Provider value={{ studentData, studentLoading }}>
            {children}
        </StudentContext.Provider>
    )
}

export const useStudent = () => useContext(StudentContext)