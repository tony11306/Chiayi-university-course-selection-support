import { useGlobalData } from "../hooks/useGlobalData"
import SearchComponent from "./searchComponent"
import CourseSelectionTable from "./courseSelectionTable";
import { useState } from "react";

export default function CourseSelectionMenu() {
    const {semesterYear} = useGlobalData();
    const [displaySettings, setDisplaySettings] = useState({
        isShowedConflictedCourses: false,
        keyword: '',
    });

    console.log(displaySettings.isShowedConflictedCourses)

    return (
        <div className="rounded course-selection-menu shadow-sm">
            <span className="fs-4">{semesterYear} 課程清單</span>
            <SearchComponent displaySettings={displaySettings} setDisplaySettings={setDisplaySettings} />
            <CourseSelectionTable displaySettings={displaySettings} />
        </div>
    )
}