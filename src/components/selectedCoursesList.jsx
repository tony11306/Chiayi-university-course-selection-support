import { useGlobalData } from "../hooks/useGlobalData";
import { useIsMobile } from "../hooks/useIsMobile";
import { courseKey } from "../lib/schedule";
import CampusBadge from "./campusBadge";
import CourseCard from "./courseCard";

const GRADE_TEXT = { '1': '一', '2': '二', '3': '三', '4': '四', '5': '五' };

export default function SelectedCoursesList() {
    const {
        userSelectedCourses,
        totalCredits,
        removeCourse,
        clearCourses,
        showToast,
    } = useGlobalData();
    const isMobile = useIsMobile();

    function onRemove(course) {
        removeCourse(course);
        showToast({
            title: `已移除 ${course.課程名稱}`,
            action: { type: 'undo', course },
        });
    }

    // 原本是 window.confirm，手機上那個原生對話框會打斷操作；
    // 改成先清掉、再給一個可以復原的提示。
    function onClearAll() {
        const cleared = clearCourses();
        showToast({
            title: `已清空 ${cleared.length} 門課`,
            action: { type: 'undoClear', courses: cleared },
        });
    }

    if (userSelectedCourses.length === 0) {
        return (
            <div className="agenda-empty">
                <span className="agenda-empty-title">還沒選課</span>
                <span className="text-muted">到「找課」加幾門進來</span>
            </div>
        );
    }

    return (
        <div className="selected-courses">
            <div className="selected-courses-summary">
                <span>已選 {userSelectedCourses.length} 門 · {totalCredits} 學分</span>
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={onClearAll}>
                    清空
                </button>
            </div>

            {isMobile ? (
                <div className="course-card-list" data-testid="selected-card-list">
                    {userSelectedCourses.map(course => (
                        <CourseCard
                            key={courseKey(course)}
                            course={course}
                            variant="remove"
                            onAction={onRemove}
                            showClassroom
                        />
                    ))}
                </div>
            ) : (
                <div className="selected-courses-table">
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
                                <th scope="col">移除</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userSelectedCourses.map(course => (
                                <tr key={courseKey(course)}>
                                    <td><CampusBadge campus={course.校區} /></td>
                                    <td>{GRADE_TEXT[course.適用年級] ?? course.適用年級}</td>
                                    <td>{course.上課系所?.length > 1 ? course.上課系所 : '不限'}</td>
                                    <td>
                                        {course.教學大綱?.length > 0 ? (
                                            <a className="text-decoration-none" href={course.教學大綱} target="_blank" rel="noreferrer">
                                                {course.課程名稱}
                                            </a>
                                        ) : course.課程名稱}
                                    </td>
                                    <td>{course.授課老師}</td>
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
                                            className="course-card-action is-remove"
                                            aria-label={`移除 ${course.課程名稱}`}
                                            onClick={() => onRemove(course)}
                                        >
                                            <span aria-hidden="true">−</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
