import { createContext, useState, useEffect, useContext } from "react"
import { useAuth } from "../authContext"
import { fetchStudentData } from "../../controllers/userDataController"

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
                const response = await fetchStudentData(studentId)
                if(response) {
                    console.log("student data: ", response)
                    setStudentData(response.data)
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