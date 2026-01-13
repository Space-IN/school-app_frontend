import { createContext, useState, useEffect, useContext } from "react"
import { useAuth } from "./authContext"
import { fetchStudentData, fetchOverallCPGA, fetchFeeDetails } from "../controllers/studentDataController"

export const StudentContext = createContext()



export const StudentProvider = ({ children }) => {
    const [studentData, setStudentData] = useState(null)
    const [studentLoading, setStudentLoading] = useState(true)
    const [studentErr, setStudentErr] = useState(null)
    const { decodedToken } = useAuth()

    
    const loadStudentData = async () => {
        const studentId = decodedToken?.preferred_username
        if(!studentId) return

        setStudentLoading(true)
        try {
            const [studentRes, feeRes, cgpaRes] = await Promise.all([
                fetchStudentData(studentId), fetchFeeDetails(studentId), fetchOverallCPGA(studentId),
            ])
            const mergedData = {
                ...(studentRes?.data ?? {}),
                ...(feeRes ? { feeDetails: feeRes?.data, } : {}),
                ...(cgpaRes ? { grade: cgpaRes, } : {}),
            }
            setStudentData(prev => ({
                ...(prev || {}), ...mergedData,
            }))
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