import { useState } from "react";
import { TABS, useGlobalData, useCourseDatas } from "../hooks/useGlobalData";
import { useIsMobile } from "../hooks/useIsMobile";
import SearchComponent from "./searchComponent";
import CourseSelectionTable from "./courseSelectionTable";
import MiniTimetable from "./miniTimetable";

export default function CourseSelectionMenu() {
    const [displaySettings, setDisplaySettings] = useState({
        isShowedConflictedCourses: true,
        keyword: '',
    });
    const {
        userSelectedCourses,
        occupancy,
        previewCourse,
        setPreviewCourse,
        setActiveTab,
        toast,
    } = useGlobalData();
    const isMobile = useIsMobile();
    const { data } = useCourseDatas();
    const semesterYear = data?.semester ?? '';

    return (
        <section className="rounded course-selection-menu shadow-sm">
            <h2 className="fs-4 mb-2">{semesterYear} 課程清單</h2>

            {/*
              桌機的課表就在旁邊，勾一門課馬上看得到；手機改成分頁之後這條回饋
              會斷掉，所以在清單上方常駐一張縮圖，加課當下就看到格子亮起來。
            */}
            {isMobile && (
                <MiniTimetable
                    courses={userSelectedCourses}
                    occupancy={occupancy}
                    previewCourse={previewCourse}
                    highlightCourse={toast?.highlightCourse ?? null}
                    onOpenTimetable={() => {
                        setPreviewCourse(null);
                        setActiveTab(TABS.TIMETABLE);
                    }}
                />
            )}

            <SearchComponent displaySettings={displaySettings} setDisplaySettings={setDisplaySettings} />
            <CourseSelectionTable displaySettings={displaySettings} />
        </section>
    );
}
