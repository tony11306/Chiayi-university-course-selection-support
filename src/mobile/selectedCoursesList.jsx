import { useGlobalData } from "../hooks/useGlobalData";
import { courseKey } from "../lib/schedule";
import CourseCard from "./courseCard";

export default function SelectedCoursesList() {
    const {
        userSelectedCourses,
        totalCredits,
        removeCourse,
        clearCourses,
        showToast,
    } = useGlobalData();

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

            <div className="course-list" data-testid="selected-course-list">
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
        </div>
    );
}
