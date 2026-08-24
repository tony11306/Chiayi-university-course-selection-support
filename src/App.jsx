import Announcement from "./components/announcement";
import CourseSelectionMenu from "./components/courseSelectionMenu";
import TimeTable from "./components/timeTable";
import SelectedCoursesPanel from './components/selectedCoursesPanel';
import SelectedCoursesList from './components/selectedCoursesList';
import Toast from './components/toast';
import { GlobalDataProvider, TABS, useGlobalData } from './hooks/useGlobalData';
import { useIsMobile } from './hooks/useIsMobile';

export default function App() {
    return (
        <div className="App">
            <GlobalDataProvider>
                <AppShell />
            </GlobalDataProvider>
        </div>
    );
}

function AppShell() {
    const {
        activeTab,
        setActiveTab,
        userSelectedCourses,
        toast,
        dismissToast,
        setSelectedDay,
        addCourse,
        restoreCourses,
    } = useGlobalData();
    const isMobile = useIsMobile();

    function onToastAction(action) {
        if (action.type === 'goToDay' && action.day) {
            setSelectedDay(action.day);
            setActiveTab(TABS.TIMETABLE);
        } else if (action.type === 'undo') {
            addCourse(action.course);
        } else if (action.type === 'undoClear') {
            restoreCourses(action.courses);
        }
    }

    return (
        <>
            {isMobile ? (
                <main className="app-main" id="app-tab-panel" role="tabpanel">
                    {activeTab === TABS.TIMETABLE && (
                        <>
                            <TimeTable />
                            <Announcement />
                        </>
                    )}
                    {activeTab === TABS.SEARCH && <CourseSelectionMenu />}
                    {activeTab === TABS.SELECTED && (
                        <section className="selected-panel">
                            <h2 className="fs-4 mb-2">已選擇的課程</h2>
                            <SelectedCoursesList />
                        </section>
                    )}
                </main>
            ) : (
                <>
                    <Announcement />
                    {/* 原本是沒有斷點的 col，手機上兩張表各只拿到一半螢幕 */}
                    <div className="row mt-4">
                        <div className="col-12 col-lg-6 mb-3">
                            <TimeTable />
                        </div>
                        <div className="col-12 col-lg-6">
                            <CourseSelectionMenu />
                        </div>
                    </div>
                </>
            )}

            <SelectedCoursesPanel />
            <Toast toast={toast} onDismiss={dismissToast} onAction={onToastAction} />

            {isMobile && (
                <nav className="tab-bar" role="tablist" aria-label="主要分頁">
                    <TabButton
                        tab={TABS.TIMETABLE}
                        label="課表"
                        activeTab={activeTab}
                        onSelect={setActiveTab}
                        path="M3 4h18v16H3z M3 9h18 M9 9v11 M15 9v11"
                    />
                    <TabButton
                        tab={TABS.SEARCH}
                        label="找課"
                        activeTab={activeTab}
                        onSelect={setActiveTab}
                        path="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M16.5 16.5 21 21"
                    />
                    <TabButton
                        tab={TABS.SELECTED}
                        label="已選"
                        activeTab={activeTab}
                        onSelect={setActiveTab}
                        badge={userSelectedCourses.length}
                        path="M6 2h12v20l-6-4.5L6 22z"
                    />
                </nav>
            )}
        </>
    );
}

function TabButton({ tab, label, activeTab, onSelect, path, badge }) {
    const isActive = activeTab === tab;
    return (
        <button
            type="button"
            role="tab"
            className="tab-bar-button"
            aria-selected={isActive}
            aria-controls="app-tab-panel"
            aria-label={badge ? `${label} ${badge}` : label}
            onClick={() => onSelect(tab)}
        >
            <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={isActive ? 2 : 1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d={path} />
            </svg>
            <span className="tab-bar-label">{label}</span>
            {badge ? <span className="tab-bar-badge">{badge}</span> : null}
        </button>
    );
}
