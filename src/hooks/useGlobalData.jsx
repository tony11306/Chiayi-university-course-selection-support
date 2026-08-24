import { useEffect, useContext, useState, useMemo, createContext } from "react";
import { useQuery } from "@tanstack/react-query";
import * as courseApi from "../api/course";

const GlobalDataContext = createContext(null);

const INITIAL_FILTERS = {
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
};

const FILTER_KEYS = ['campus', 'day', 'educationLevel', 'startClass', 'endClass', 'grade', 'department', 'courseType'];

function toAPIFormat(filters) {
    const apiFormatFilters = {};
    for (const key of FILTER_KEYS) {
        if (filters[key] !== '不限') apiFormatFilters[key] = filters[key];
    }
    return apiFormatFilters;
}

export function GlobalDataProvider({ children }) {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [userSelectedCourses, setUserSelectedCourses] = useState(() => {
        try {
            const saved = localStorage.getItem('userSelectedCourses');
            return saved === null ? [] : JSON.parse(saved);
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('userSelectedCourses', JSON.stringify(userSelectedCourses));
    }, [userSelectedCourses]);

    const value = useMemo(() => ({
        filters,
        setFilters,
        userSelectedCourses,
        setUserSelectedCourses,
    }), [filters, userSelectedCourses]);

    return (
        <GlobalDataContext.Provider value={value}>
            {children}
        </GlobalDataContext.Provider>
    );
}

export function useGlobalData() {
    const context = useContext(GlobalDataContext);
    if (!context) {
        throw new Error('useGlobalData 必須在 GlobalDataProvider 內使用');
    }
    return context;
}

export function useCourseDatas() {
    const { filters } = useGlobalData();
    const apiFilters = toAPIFormat(filters);
    return useQuery({
        queryKey: ['courseDatas', apiFilters],
        queryFn: ({ signal }) => courseApi.getCourseDatas(apiFilters, signal),
        select: (response) => response.data,
    });
}
