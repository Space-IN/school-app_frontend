import { useEffect, useMemo, useState } from "react"
import { LayoutAnimation } from "react-native"
import { fetchSubjects } from "../../controllers/adminDataController"

const getYearRange = () => {
    const year = new Date().getFullYear()
    return `${year}-${year+1}`
}

export default function MarksEntryScreen({ route }) {
    const { board } = route.params
    const academicYear = getYearRange()

    const [subjects, setSubjects] = useState(null)

    const [gradeGroup, setGradeGroup] = useState('school')
    const [selectedClass, setSelectedClass] = useState('')
    const [selectedSection, setSelectedSection] = useState('')
    const [examType, setExamType] = useState('')
    const [examName, setExamName] = useState('')
    const [subjectName, setSubjectName] = useState('')

    const schoolExamTypes = [
        { id: 'formative', label: 'Formative Assessment (20)' },
        { id: 'midterm', label: 'Mid-Term Examination (80+20)' },
        { id: 'annual', label: 'Annual Examination (80+20)' },
    ]


    const loadSubjects = async () => {
        try {
            const fetchedSubjects = await fetchSubjects(selectedClass, selectedSection, board, academicYear)
            if(subjects) setSubjects(fetchedSubjects)
        } catch(err) {
            console.log("error fetching subjects: ", err)
        }
    }


    useEffect(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    }, [gradeGroup])

    useEffect(() => { setExamType('') }, [subjectName])

    useEffect(() => { loadSubjects() }, [selectedClass, selectedSection])
}