import { useEffect, useContext, useState } from "react";
import React from "react";
import * as courseApi from "../api/course";

const GlobalDataContext = React.createContext({
    semesterYear: '',
    courseDatas: [],
    userSelectedCourses: [],
    setUserSelectedCourses: null,
    loading: false,
    error: null,
    filters: {
        campus: '大學部',
        day: '不限',
        educationLevel: '大學部',
        startClass: '不限',
        endClass: '不限',
        grade: '不限',
        department: '不限',
        courseType: '不限',
    },
});

export function GlobalDataProvider({ children }) {
    const [courseDatas, setCourseDatas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        campus: '蘭潭校區',
        day: '不限',
        educationLevel: '大學部',
        startClass: '不限',
        endClass: '不限',
        grade: '不限',
        department: '不限',
        courseType: '不限',
        keyword: '',
        isShowConflictedCourses: true,
    });
    const [semesterYear, setSemesterYear] = useState('')
    const [userSelectedCourses, setUserSelectedCourses] = useState(localStorage.getItem('userSelectedCourses') === null ? [] : JSON.parse(localStorage.getItem('userSelectedCourses')))
    
    function toAPIFormat(filters) {
        let apiFormatFilters = {};
        if (filters.campus !== '不限') apiFormatFilters.campus = filters.campus;
        if (filters.day !== '不限') apiFormatFilters.day = filters.day;
        if (filters.educationLevel !== '不限') apiFormatFilters.educationLevel = filters.educationLevel;
        if (filters.startClass !== '不限') apiFormatFilters.startClass = filters.startClass;
        if (filters.endClass !== '不限') apiFormatFilters.endClass = filters.endClass;
        if (filters.grade !== '不限') apiFormatFilters.grade = filters.grade;
        if (filters.department !== '不限') apiFormatFilters.department = filters.department;
        if (filters.courseType !== '不限') apiFormatFilters.courseType = filters.courseType;
        return apiFormatFilters;
    }
    
    useEffect(() => {
        setLoading(true);
        courseApi.getCourseDatas(toAPIFormat(filters))
            .then((courseDatas) => {
                setCourseDatas(courseDatas.data.result);
                setSemesterYear(courseDatas.data.semester)
                setLoading(false);
                setError(null);
            })
            .catch((error) => {
                if (error.response) {
                    setError(error.response.data);
                } else {
                    setError("unknown error");
                }
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setLoading(true);
        courseApi.getCourseDatas(toAPIFormat(filters))
            .then((courseDatas) => {
                console.log(courseDatas)
                setCourseDatas(courseDatas.data.result);
                setSemesterYear(courseDatas.data.semester)
                setLoading(false);
                setError(null);
            })
            .catch((error) => {
                if (error.response) {
                    setError(error.response.data);
                } else {
                    setError("unknown error");
                }
                setLoading(false);
            });
    }, [filters]);


    useEffect(() => {
        localStorage.setItem('userSelectedCourses', JSON.stringify(userSelectedCourses))
      }, [userSelectedCourses])

    return (
        <GlobalDataContext.Provider value={{ semesterYear, courseDatas, loading, error, filters, setFilters, userSelectedCourses, setUserSelectedCourses, }}>
            {children}
        </GlobalDataContext.Provider>
    );
}

export function useGlobalData() {
    return useContext(GlobalDataContext);
}