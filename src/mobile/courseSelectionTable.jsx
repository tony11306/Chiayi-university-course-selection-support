import { useMemo } from "react";
import { useGlobalData, useCourseDatas } from "../hooks/useGlobalData";
import { courseKey } from "../lib/schedule";
import CourseCard from "./courseCard";

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
    const { isSelected, findConflictWith, addCourse, showToast } = useGlobalData();
    const { data, isFetching, error } = useCourseDatas();

    const courseDatas = data?.result ?? [];

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

            <div className="course-list" data-testid="course-list">
                {displayed.map(({ course, conflictWith }) => (
                    <CourseCard
                        key={courseKey(course)}
                        course={course}
                        variant="add"
                        conflictWith={conflictWith}
                        onAction={onSelected}
                    />
                ))}
            </div>
        </div>
    );
}
