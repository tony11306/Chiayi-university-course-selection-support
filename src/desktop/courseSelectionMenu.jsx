import { useGlobalData, useCourseDatas } from "../hooks/useGlobalData"
import SearchComponent from "./searchComponent"
import CourseSelectionTable from "./courseSelectionTable";
import { useState } from "react";

export default function CourseSelectionMenu() {
    const [displaySettings, setDisplaySettings] = useState({
        isShowedConflictedCourses: true,
        keyword: '',
    });
    const { data } = useCourseDatas();
    const semesterYear = data?.semester ?? '';

    return (
        <div className="rounded course-selection-menu shadow-sm">
            <span className="fs-4">{semesterYear} 課程清單</span>
            <SearchComponent displaySettings={displaySettings} setDisplaySettings={setDisplaySettings} />
            <CourseSelectionTable displaySettings={displaySettings} />
        </div>
    )
}
