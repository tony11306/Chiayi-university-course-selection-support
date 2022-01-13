import React, { useState, useEffect } from "react"
import CurriculumTableRow from "./curriculumTableRow"
import SearchComponent from "./searchComponent"
import SelectedCoursesPanel from "./selectedCoursesPanel"

function CourseSelectionMenu({ setCourseSelected, userSelectedCourses }) {


    const [currentCourses, setCurrentCourses] = useState([]) // 當前篩選器的結果
    const [showedCourses, setShowedCourses] = useState([]) // 顯示被 keyword 和 用戶選擇過的 過濾掉的結果
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)
    const [queryString, setQueryString] = useState('?校區=蘭潭校區&課程修別=必修')
    const [keyword, setKeyword] = useState('')
    const [isShowedConflictedCourse, setIsShowedConflictedCourse] = useState('true')
    const [semesterYear, setSemesterYear] = useState('')

    const COURSE_SELECTION_API = 'https://chayi-university-system-api.herokuapp.com/course_selection'

    const toCourseKeywords = (course) => {
        return course['上課學制'] + course['課程名稱'] + course['上課系所'] + course['授課老師'] + course['選課類別']
    }

    const creditTotal = userSelectedCourses.reduce((prev, current) => prev + parseInt(current['學分數'], 10), 0)
    const toCourseId = (course) => {
        return course['開課系號'] + course['開課序號'] + course['永久課號']
    }
    
    useEffect(() => {
        let userSelectCourseIds = userSelectedCourses.map(course => toCourseId(course))
        let newShowedCourses = currentCourses.filter(course => !userSelectCourseIds.includes(toCourseId(course)))
        newShowedCourses = newShowedCourses.filter(course => toCourseKeywords(course).toLowerCase().includes(keyword.toLowerCase()))
        if (!isShowedConflictedCourse) {
            newShowedCourses = newShowedCourses.filter(course => !isOverlapWithUserSelectedCourses(course))
        }
        setShowedCourses(newShowedCourses)

    }, [currentCourses, keyword, userSelectedCourses, isShowedConflictedCourse])

    useEffect(() => {
        setCurrentCourses([])
        setIsLoading(true)
        fetch(COURSE_SELECTION_API + queryString, { method: 'GET' }).then(
            response => response.json()
        ).then(
            data => {
                setCurrentCourses(data['result'])
                setSemesterYear(data['semester'])
                setIsLoading(false)
                setIsError(false)
            }
        ).catch(
            e => {
                setIsLoading(false)
                setIsError(true)
            }
        )
    }, [queryString])

    const isOverlap = (course1, course2) => {

        const CLASS_MAP = {
            '1': 1,
            '2': 2,
            '3': 3,
            '4': 4,
            'F': 5,
            '5': 6,
            '6': 7,
            '7': 8,
            '8': 9,
            '9': 10,
            'A': 11,
            'B': 12,
            'C': 13,
            'D': 14
        }
        for (let i = 0; i < course1['上課時間'].length; ++i) {
            for (let j = 0; j < course2['上課時間'].length; ++j) {
                if (course1['上課時間'][i]['星期'] === course2['上課時間'][j]['星期']) {
                    if (CLASS_MAP[course1['上課時間'][i]['開始節次']] <= CLASS_MAP[course2['上課時間'][j]['結束節次']] && CLASS_MAP[course2['上課時間'][j]['開始節次']] <= CLASS_MAP[course1['上課時間'][i]['結束節次']]) {
                        return true
                    }
                }
            }
        }

        return false;
    }

    const isOverlapWithUserSelectedCourses = (course) => {
        for (let i = 0; i < userSelectedCourses.length; ++i) {
            if (isOverlap(course, userSelectedCourses[i])) {
                return true
            }
        }
        return false
    }

    const handleAddSelectedCourse = (newCourse) => {
        const newSelectedCourses = [...userSelectedCourses]
        newSelectedCourses.push(newCourse)
        setCourseSelected(newSelectedCourses)
    }

    return (
        <div className="border rounded">
            <button className="btn btn-secondary float-end" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasWithBothOptions" aria-controls="offcanvasWithBothOptions">
                查看已選課程
                <span className="badge bg-primary">{userSelectedCourses.length}</span>
                <br />
                總學分
                <span className="badge bg-primary">{creditTotal}</span>
            </button>
            <SelectedCoursesPanel userSelectedCourses={userSelectedCourses} onDeleteCourse={setCourseSelected} />
            <SearchComponent onFilterChange={setQueryString} onKeywordChange={setKeyword} setShowConflitedCheckValue={setIsShowedConflictedCourse} semesterYear={semesterYear} />
            <div className=" table-wrapper-scroll-y custom-scrollbar">
                <table className="table table-striped">
                    <tbody>
                        <tr>
                            <th>校區</th>
                            <th>上課系所</th>
                            <th>課程名稱</th>
                            <th>老師</th>
                            <th>學分數</th>
                            <th>上課時間</th>
                            <th>選擇</th>
                        </tr>
                        {
                            showedCourses.map((course) =>
                                    <CurriculumTableRow key={course['開課系號'] + course['開課序號'] + course['永久課號']} course={course} onUserSelect={handleAddSelectedCourse} isDisabled={isOverlapWithUserSelectedCourses(course)} />
                            )
                        }

                    </tbody>
                </table>
                {isLoading ?
                    <div>
                        <div className="spinner-grow" role="status">
                            <span className="visually-hidden">正在載入資料...</span>
                        </div>
                        <span className="fs-3 ms-3">載入中...</span>
                        <br />
                        <span className="text-muted">(若載入時間很長，通常代表後端在從休眠到起床)</span>
                    </div>
                    : ""}
                {isError ? <span className="fs-3">發生錯誤</span> : ""}
                {!isError && !isLoading && showedCourses.length === 0 ? <span className="fs-3">查無結果</span> : ""}
            </div>

        </div>
    )
}

export default CourseSelectionMenu