import { useEffect, useContext, useState, useMemo, useCallback, useRef, createContext } from "react";
import { useQuery } from "@tanstack/react-query";
import * as courseApi from "../api/course";
import { buildOccupancy, findConflict, totalCredits as sumCredits, courseKey, DAYS } from "../lib/schedule";

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
};

const FILTER_KEYS = ['campus', 'day', 'educationLevel', 'startClass', 'endClass', 'grade', 'department', 'courseType'];

export const TABS = { TIMETABLE: 'timetable', SEARCH: 'search', SELECTED: 'selected' };
export const TIMETABLE_VIEW = { DAY: 'day', WEEK: 'week' };

function today() {
    const weekday = new Date().getDay();
    return weekday >= 1 && weekday <= 6 ? DAYS[weekday - 1] : DAYS[0];
}

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
    const [activeTab, setActiveTab] = useState(TABS.TIMETABLE);

    const [selectedDay, setSelectedDayState] = useState(today);
    const [timetableView, setTimetableView] = useState(TIMETABLE_VIEW.DAY);
    const [previewCourse, setPreviewCourse] = useState(null);
    const [toast, setToast] = useState(null);
    const toastId = useRef(0);

    useEffect(() => {
        localStorage.setItem('userSelectedCourses', JSON.stringify(userSelectedCourses));
    }, [userSelectedCourses]);

    const occupancy = useMemo(() => buildOccupancy(userSelectedCourses), [userSelectedCourses]);
    const totalCredits = useMemo(() => sumCredits(userSelectedCourses), [userSelectedCourses]);
    const selectedKeys = useMemo(
        () => new Set(userSelectedCourses.map(courseKey)),
        [userSelectedCourses]
    );

    const isSelected = useCallback(course => selectedKeys.has(courseKey(course)), [selectedKeys]);

    const findConflictWith = useCallback(
        course => findConflict(course, occupancy),
        [occupancy]
    );

    const addCourse = useCallback(course => {
        setPreviewCourse(null);
        setUserSelectedCourses(courses =>
            courses.some(selected => courseKey(selected) === courseKey(course))
                ? courses
                : [...courses, course]
        );
    }, []);

    const removeCourse = useCallback(course => {
        setUserSelectedCourses(courses =>
            courses.filter(selected => courseKey(selected) !== courseKey(course))
        );
    }, []);

    const clearCourses = useCallback(() => {
        const cleared = userSelectedCourses;
        setUserSelectedCourses([]);
        return cleared;
    }, [userSelectedCourses]);

    const restoreCourses = useCallback(courses => {
        setUserSelectedCourses(courses ?? []);
    }, []);

    const setSelectedDay = useCallback(day => {
        setSelectedDayState(day);
        setTimetableView(TIMETABLE_VIEW.DAY);
    }, []);

    const showToast = useCallback(toastData => {
        toastId.current += 1;
        setToast({ id: toastId.current, ...toastData });
    }, []);

    const dismissToast = useCallback(() => setToast(null), []);

    const value = useMemo(() => ({
        filters,
        setFilters,
        userSelectedCourses,
        setUserSelectedCourses,
        occupancy,
        totalCredits,
        isSelected,
        findConflictWith,
        addCourse,
        removeCourse,
        clearCourses,
        restoreCourses,
        activeTab,
        setActiveTab,
        selectedDay,
        setSelectedDay,
        timetableView,
        setTimetableView,
        previewCourse,
        setPreviewCourse,
        toast,
        showToast,
        dismissToast,
    }), [
        filters, userSelectedCourses, occupancy, totalCredits, isSelected, findConflictWith,
        addCourse, removeCourse, clearCourses, restoreCourses, activeTab, previewCourse,
        selectedDay, setSelectedDay, timetableView, toast, showToast, dismissToast,
    ]);

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
