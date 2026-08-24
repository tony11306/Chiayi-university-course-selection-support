import { useEffect, useState } from 'react';
import './mobile.css';
import Announcement from "./announcement";
import CourseSelectionMenu from "./courseSelectionMenu";
import TimeTable from "./timeTable";
import SelectedCoursesList from './selectedCoursesList';
import Toast from '../shared/toast';
import { TABS, useGlobalData } from '../hooks/useGlobalData';

const TAB_ORDER = [TABS.TIMETABLE, TABS.SEARCH, TABS.SELECTED];

export default function MobileApp() {
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

    const [slide, setSlide] = useState({ tab: activeTab, dir: '' });
    const [visitedTabs, setVisitedTabs] = useState(() => new Set([activeTab]));

    if (slide.tab !== activeTab) {
        setSlide({
            tab: activeTab,
            dir: TAB_ORDER.indexOf(activeTab) > TAB_ORDER.indexOf(slide.tab) ? 'forward' : 'back',
        });
    }
    if (!visitedTabs.has(activeTab)) {
        const next = new Set(visitedTabs);
        next.add(activeTab);
        setVisitedTabs(next);
    }

    // 上方的 navbar 是 sticky 的，量出實際高度讓分頁外殼剛好接在它下面
    useEffect(() => {
        const root = document.documentElement;
        const navbar = document.querySelector('.navbar');
        if (!navbar) return undefined;

        const update = () => root.style.setProperty('--navbar-height', `${navbar.offsetHeight}px`);
        update();

        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', update);
            return () => window.removeEventListener('resize', update);
        }

        const observer = new ResizeObserver(update);
        observer.observe(navbar);
        return () => observer.disconnect();
    }, []);

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
        <div className="view-mobile">
            <main className="app-main" id="app-tab-panel" role="tabpanel">
                {TAB_ORDER.map(tab => {
                    const isActive = tab === activeTab;
                    if (!visitedTabs.has(tab)) return null;
                    const classes = [
                        'tab-panel',
                        isActive ? '' : 'tab-panel-hidden',
                        // 剛變成分頁才掛上動畫 class，重新套上的瞬間動畫就會重播
                        isActive && slide.dir ? `tab-slide tab-slide-${slide.dir}` : '',
                    ].filter(Boolean).join(' ');
                    return (
                        <div key={tab} className={classes} inert={isActive ? undefined : true}>
                            {tab === TABS.TIMETABLE && (
                                <>
                                    <TimeTable />
                                    <Announcement />
                                </>
                            )}
                            {tab === TABS.SEARCH && <CourseSelectionMenu />}
                            {tab === TABS.SELECTED && (
                                <section aria-label="已選擇的課程">
                                    <h2 className="fs-4 mb-2">已選擇的課程</h2>
                                    <SelectedCoursesList />
                                </section>
                            )}
                        </div>
                    );
                })}
            </main>

            <Toast toast={toast} onDismiss={dismissToast} onAction={onToastAction} />

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
        </div>
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
