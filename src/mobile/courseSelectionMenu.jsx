import { useState } from "react";
import { useCourseDatas } from "../hooks/useGlobalData";
import SearchComponent from "./searchComponent";
import CourseSelectionTable from "./courseSelectionTable";

export default function CourseSelectionMenu() {
    const [displaySettings, setDisplaySettings] = useState({
        isShowedConflictedCourses: true,
        keyword: '',
    });
    const { data } = useCourseDatas();
    const semesterYear = data?.semester ?? '';

    return (
        <section>
            <h2 className="fs-4 mb-2">{semesterYear} 課程清單</h2>

            <SearchComponent displaySettings={displaySettings} setDisplaySettings={setDisplaySettings} />
            <CourseSelectionTable displaySettings={displaySettings} />
        </section>
    );
}
