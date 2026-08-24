import html2canvas from "html2canvas";
import { useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import { TIMETABLE_VIEW, useGlobalData } from "../hooks/useGlobalData";
import { useIsMobile } from "../hooks/useIsMobile";
import { DAYS, PERIODS, courseSlots } from "../lib/schedule";
import DayAgenda from "./dayAgenda";

export default function TimeTable() {
    const {
        userSelectedCourses,
        occupancy,
        showToast,
        selectedDay,
        setSelectedDay,
        timetableView,
        setTimetableView,
    } = useGlobalData();
    const isMobile = useIsMobile();
    const exportRef = useRef(null);
    const [displaySettings, setDisplaySettings] = useState(() => ({
        isShowTeacherButtonOn: Cookies.get('isShowTeacherButtonOn') === 'true',
        isShowClassroomButtonOn: Cookies.get('isShowClassroomButtonOn') === 'true',
    }));

    useEffect(() => {
        Cookies.set('isShowTeacherButtonOn', displaySettings.isShowTeacherButtonOn);
        Cookies.set('isShowClassroomButtonOn', displaySettings.isShowClassroomButtonOn);
    }, [displaySettings]);

    const coursesPerDay = useMemo(() => {
        const counts = Object.fromEntries(DAYS.map(day => [day, new Set()]));
        for (const course of userSelectedCourses) {
            for (const slot of courseSlots(course)) {
                const day = slot.split('-')[0];
                if (counts[day]) counts[day].add(course.課程名稱);
            }
        }
        return Object.fromEntries(DAYS.map(day => [day, counts[day].size]));
    }, [userSelectedCourses]);

    const isWeekVisible = !isMobile || timetableView === TIMETABLE_VIEW.WEEK;

    function onExportButtonClick() {
        const exportRoot = exportRef.current;
        if (!exportRoot) return;

        const originalStyles = {
            backgroundImage: exportRoot.style.backgroundImage,
            borderRadius: exportRoot.style.borderRadius,
            backgroundColor: exportRoot.style.backgroundColor,
            width: exportRoot.style.width,
            padding: exportRoot.style.padding,
        };

        Object.assign(exportRoot.style, {
            backgroundImage: 'linear-gradient(to right top, rgb(235, 154, 133),rgb(148, 214, 235))',
            backgroundColor: 'rgba(255,255,255, 0.3)',
            borderRadius: '30px',
            width: '800px',
            padding: '20px',
        });

        html2canvas(exportRoot, { backgroundColor: null })
            .then(canvas => {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
                link.download = '選課結果.png';
                link.click();
                showToast({ title: '已下載 選課結果.png' });
            })
            .catch(() => {
                showToast({ title: '圖片產生失敗，請再試一次' });
            })
            // 原本這行寫在 then 外面同步執行，樣式會在截圖完成前就被還原
            .finally(() => {
                Object.assign(exportRoot.style, originalStyles);
            });
    }

    return (
        <section className="timetable-panel rounded shadow-sm">
            <div className="timetable-controls">
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="flexSwitchCheckTeacher"
                        onChange={() => setDisplaySettings(s => ({ ...s, isShowTeacherButtonOn: !s.isShowTeacherButtonOn }))}
                        checked={displaySettings.isShowTeacherButtonOn}
                    />
                    <label className="form-check-label" htmlFor="flexSwitchCheckTeacher">顯示授課老師</label>
                </div>
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="flexSwitchCheckClassroom"
                        onChange={() => setDisplaySettings(s => ({ ...s, isShowClassroomButtonOn: !s.isShowClassroomButtonOn }))}
                        checked={displaySettings.isShowClassroomButtonOn}
                    />
                    <label className="form-check-label" htmlFor="flexSwitchCheckClassroom">顯示課堂教室</label>
                </div>
                <button
                    type="button"
                    className="btn-icon-circle border-0 shadow-none ms-auto"
                    title="下載課表"
                    aria-label="下載課表"
                    disabled={userSelectedCourses.length === 0}
                    onClick={onExportButtonClick}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                        <path fillRule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2v-1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5Z" />
                        <path d="M1.6 11.85h1.2c.9 0 1.4.55 1.4 1.35 0 .8-.5 1.35-1.4 1.35H2.4v1.3H1.6v-4Zm.8.65v1.4h.3c.45 0 .7-.25.7-.7s-.25-.7-.7-.7h-.3Zm2.9-.65h.8l1.5 2.5h.05v-2.5h.75v4h-.7l-1.6-2.6H6.1v2.6H5.3v-4Zm5.6 1.9h1.6v.8c0 .8-.6 1.4-1.6 1.4-1.1 0-1.75-.7-1.75-2.05 0-1.35.65-2.1 1.75-2.1.85 0 1.45.45 1.55 1.2h-.8c-.1-.35-.35-.55-.75-.55-.6 0-.95.45-.95 1.45 0 1 .35 1.4.95 1.4.5 0 .8-.25.8-.7v-.2h-.8v-.65Z" />
                    </svg>
                </button>
            </div>

            {isMobile && (
                <div className="day-tabs" role="tablist" aria-label="星期">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            type="button"
                            role="tab"
                            className="day-tab"
                            aria-selected={timetableView === TIMETABLE_VIEW.DAY && selectedDay === day}
                            aria-label={`星期${day} ${coursesPerDay[day]} 堂`}
                            onClick={() => setSelectedDay(day)}
                        >
                            <span className="day-tab-name">{day}</span>
                            <span className="day-tab-count">{coursesPerDay[day]} 堂</span>
                        </button>
                    ))}
                    <button
                        type="button"
                        role="tab"
                        className="day-tab"
                        aria-selected={timetableView === TIMETABLE_VIEW.WEEK}
                        aria-label="整週"
                        onClick={() => setTimetableView(TIMETABLE_VIEW.WEEK)}
                    >
                        <span className="day-tab-name">週</span>
                        <span className="day-tab-count">全表</span>
                    </button>
                </div>
            )}

            {isMobile && timetableView === TIMETABLE_VIEW.DAY && (
                <DayAgenda
                    courses={userSelectedCourses}
                    day={selectedDay}
                    showTeacher={displaySettings.isShowTeacherButtonOn}
                    showClassroom={displaySettings.isShowClassroomButtonOn}
                />
            )}

            {/*
              週表格永遠掛著，只是在單日檢視時移到畫面外 —— 這樣匯出 PNG
              不必先切檢視，html2canvas 也不能截 display:none 的節點。
            */}
            <div
                ref={exportRef}
                data-testid="timetable-export-root"
                className={isWeekVisible ? 'timetable-week' : 'timetable-week is-offscreen'}
                aria-hidden={isWeekVisible ? undefined : 'true'}
            >
                <WeekGrid
                    occupancy={occupancy}
                    showTeacher={displaySettings.isShowTeacherButtonOn}
                    showClassroom={displaySettings.isShowClassroomButtonOn}
                />
            </div>
        </section>
    );
}

function WeekGrid({ occupancy, showTeacher, showClassroom }) {
    return (
        <div className="week-grid-scroll">
            {/*
              刻意不掛 Bootstrap 的 .table：.table>:not(caption)>*>* 的特異度是 (0,1,3)，
              會蓋掉格子的 padding 和背景色 —— 原本得靠 !important 才壓得過它。
            */}
            <table className="week-grid">
                <thead>
                    <tr>
                        <th scope="col">節次</th>
                        {DAYS.map(day => <th key={day} scope="col">星期{day}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {PERIODS.map((period, index) => (
                        <tr key={period.code}>
                            <th scope="row" className="week-grid-period">
                                第 {period.code} 節<br />{period.start} ~ {period.end}
                            </th>
                            {DAYS.map(day => {
                                const course = occupancy[`${day}-${index}`];
                                return (
                                    <td
                                        key={day}
                                        data-testid={`week-slot-${day}-${index}`}
                                        data-state={course ? 'occupied' : 'free'}
                                    >
                                        {course ? (
                                            <>
                                                <span className="week-grid-course">{`【${course.課程名稱}】`}</span>
                                                {showTeacher ? <><br />{course.授課老師}</> : null}
                                                {showClassroom ? <><br />{course.上課教室}</> : null}
                                            </>
                                        ) : null}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
