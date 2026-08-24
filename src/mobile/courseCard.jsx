import CampusBadge from "./campusBadge";

const GRADE_TEXT = { '1': '一', '2': '二', '3': '三', '4': '四', '5': '五' };

function classTimeLabel(classTime) {
    const range = classTime.開始節次 === classTime.結束節次
        ? classTime.開始節次
        : `${classTime.開始節次}~${classTime.結束節次}`;
    return `${classTime.星期} ${range}`;
}

function teacherSearchUrl(teacher) {
    return `https://www.google.com/search?q=${encodeURIComponent(`${teacher} 嘉義大學 dcard | ptt`)}`;
}

export default function CourseCard({
    course,
    variant,
    conflictWith = null,
    onAction,
    showClassroom = false,
}) {
    const isAdd = variant === 'add';
    const isDisabled = isAdd && Boolean(conflictWith);
    const actionLabel = `${isAdd ? '加入' : '移除'} ${course.課程名稱}`;

    return (
        <div
            className="course-card"
            data-conflict={conflictWith ? 'true' : undefined}
        >
            <div className="course-card-body">
                <div className="course-card-title">
                    {course.教學大綱?.length > 0 ? (
                        <a
                            className="text-decoration-none"
                            href={course.教學大綱}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {course.課程名稱}
                        </a>
                    ) : course.課程名稱}
                    {course.上課學制 ? (
                        <span className="course-card-level">【{course.上課學制}】</span>
                    ) : null}
                </div>

                <div className="course-card-meta">
                    <a
                        className="course-card-teacher"
                        href={teacherSearchUrl(course.授課老師)}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {course.授課老師}
                    </a>
                    {' · '}
                    {[
                        showClassroom ? course.上課教室 : null,
                        course.上課系所?.length > 1 ? course.上課系所 : '不限',
                        GRADE_TEXT[course.適用年級] ? `${GRADE_TEXT[course.適用年級]}年級` : null,
                    ].filter(Boolean).join(' · ')}
                </div>

                <div className="course-pills">
                    <CampusBadge campus={course.校區} />
                    <span className="course-pill course-pill-credit">{course.學分數} 學分</span>
                    {(course.上課時間 ?? []).map((classTime, index) => (
                        <span key={index} className="course-pill course-pill-time">
                            {classTimeLabel(classTime)}
                        </span>
                    ))}
                    {conflictWith ? (
                        <span className="course-pill course-pill-conflict">
                            和「{conflictWith.課程名稱}」衝堂
                        </span>
                    ) : null}
                </div>
            </div>

            <button
                type="button"
                className={`course-card-action ${isAdd ? 'is-add' : 'is-remove'}`}
                aria-label={actionLabel}
                disabled={isDisabled}
                onClick={() => onAction(course)}
            >
                <span aria-hidden="true">{isAdd ? '＋' : '−'}</span>
            </button>
        </div>
    );
}
