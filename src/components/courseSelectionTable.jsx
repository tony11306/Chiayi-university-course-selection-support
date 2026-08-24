import { useMemo } from "react";
import { useGlobalData, useCourseDatas } from "../hooks/useGlobalData";
import { useIsMobile } from "../hooks/useIsMobile";
import { courseKey } from "../lib/schedule";
import CampusBadge from "./campusBadge";
import CourseCard from "./courseCard";

const GRADE_TEXT = { '1': '一', '2': '二', '3': '三', '4': '四', '5': '五' };

function matchesKeyword(course, keyword) {
    if (!keyword) return true;
    const haystack = [
        course.課程名稱,
        course.上課系所,
        course.授課老師,
        course.上課學制,
    ].filter(Boolean).join(' ');
    return haystack.includes(keyword);
}

export default function CourseSelectionTable({ displaySettings }) {
    const { isSelected, findConflictWith, addCourse, setPreviewCourse, previewCourse, showToast } = useGlobalData();
    const { data, isFetching, error } = useCourseDatas();
    const isMobile = useIsMobile();

    const courseDatas = data?.result ?? [];

    // 先過關鍵字與已選，再算衝堂；衝堂只查一次 occupancy 表，不再是每列 O(已選數)
    const matched = useMemo(
        () => courseDatas.filter(course =>
            !isSelected(course) && matchesKeyword(course, displaySettings.keyword)
        ),
        [courseDatas, isSelected, displaySettings.keyword]
    );

    const withConflict = useMemo(
        () => matched.map(course => ({ course, conflictWith: findConflictWith(course) })),
        [matched, findConflictWith]
    );

    const displayed = displaySettings.isShowedConflictedCourses
        ? withConflict
        : withConflict.filter(entry => !entry.conflictWith);
    const hiddenCount = withConflict.length - displayed.length;

    function onSelected(course) {
        addCourse(course);
        showToast({
            title: `已加入 ${course.課程名稱}`,
            meta: (course.上課時間 ?? [])
                .map(t => `${t.星期} ${t.開始節次}${t.開始節次 === t.結束節次 ? '' : `~${t.結束節次}`}`)
                .join('、'),
            highlightCourse: course,
            action: { type: 'goToDay', day: course.上課時間?.[0]?.星期 },
        });
    }

    if (isFetching) {
        return (
            <div className="course-results-status">
                <div className="spinner-grow" role="status" aria-hidden="true" />
                <span className="fs-4 ms-3">載入中...</span>
                <p className="text-muted mb-0 mt-2">
                    （若載入時間很長，通常代表後端正在從休眠中起床）
                </p>
            </div>
        );
    }

    if (error) {
        return <div className="course-results-status fs-4">發生錯誤，請稍後再試</div>;
    }

    if (displayed.length === 0) {
        return (
            <div className="course-results-status">
                <span className="fs-4">查無結果</span>
                <p className="text-muted mb-0 mt-2">放寬一點篩選條件試試</p>
            </div>
        );
    }

    return (
        <div className="course-results">
            <p className="course-results-count">
                {displayed.length} 門課
                {hiddenCount > 0 ? `（已隱藏 ${hiddenCount} 門衝堂）` : ''}
            </p>

            {isMobile ? (
                <div className="course-card-list" data-testid="course-card-list">
                    {displayed.map(({ course, conflictWith }) => (
                        <CourseCard
                            key={courseKey(course)}
                            course={course}
                            variant="add"
                            conflictWith={conflictWith}
                            onAction={onSelected}
                            onPreview={picked => setPreviewCourse(
                                previewCourse && courseKey(previewCourse) === courseKey(picked) ? null : picked
                            )}
                            isPreviewing={Boolean(previewCourse) && courseKey(previewCourse) === courseKey(course)}
                        />
                    ))}
                </div>
            ) : (
                <div className="table-wrapper-scroll-y custom-scrollbar">
                    <table className="table table-striped non-border align-middle table-first-row-white">
                        <thead>
                            <tr className="position-sticky top-0 blur-background">
                                <th scope="col">校區</th>
                                <th scope="col">年級</th>
                                <th scope="col">上課系所</th>
                                <th scope="col">課程名稱</th>
                                <th scope="col">老師</th>
                                <th scope="col">學分數</th>
                                <th scope="col">上課時間</th>
                                <th scope="col">選擇</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayed.map(({ course, conflictWith }) => (
                                <CourseSelectionTableRow
                                    key={courseKey(course)}
                                    course={course}
                                    conflictWith={conflictWith}
                                    onSelected={onSelected}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function CourseSelectionTableRow({ course, conflictWith, onSelected }) {
    return (
        <tr className={conflictWith ? 'conflict-warning' : ''}>
            <td><CampusBadge campus={course.校區} /></td>
            <td>{GRADE_TEXT[course.適用年級] ?? course.適用年級}</td>
            <td>{course.上課系所?.length > 1 ? course.上課系所 : '不限'}</td>
            <td>
                {course.教學大綱?.length > 0 ? (
                    <a className="text-decoration-none" href={course.教學大綱} target="_blank" rel="noreferrer">
                        {`【${course.上課學制}】${course.課程名稱}`}
                    </a>
                ) : `【${course.上課學制}】${course.課程名稱}`}
            </td>
            <td>
                <a
                    className="text-decoration-none"
                    href={`https://www.google.com/search?q=${encodeURIComponent(`${course.授課老師} 嘉義大學 dcard | ptt`)}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    {course.授課老師}
                </a>
            </td>
            <td>{course.學分數}</td>
            <td>
                {(course.上課時間 ?? []).map((classTime, index) => (
                    <span key={index} className="course-pill course-pill-time">
                        {classTime.星期} {classTime.開始節次}
                        {classTime.開始節次 === classTime.結束節次 ? '' : `~${classTime.結束節次}`}
                    </span>
                ))}
            </td>
            <td>
                <button
                    type="button"
                    className="course-card-action is-add"
                    aria-label={`加入 ${course.課程名稱}`}
                    disabled={Boolean(conflictWith)}
                    title={conflictWith ? `和「${conflictWith.課程名稱}」衝堂` : undefined}
                    onClick={() => onSelected(course)}
                >
                    <span aria-hidden="true">＋</span>
                </button>
            </td>
        </tr>
    );
}
