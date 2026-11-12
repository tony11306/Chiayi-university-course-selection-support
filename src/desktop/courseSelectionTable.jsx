import { useGlobalData, useCourseDatas } from "../hooks/useGlobalData";
import { courseKey } from "../lib/schedule";
import { teacherReviewUrl } from "../lib/searchLinks";
import { CampusBadge, ClassTimeBadges, departmentText, gradeText } from "./courseCells";

export default function CourseSelectionTable({ displaySettings }) {
    const { isSelected, findConflictWith, addCourse } = useGlobalData();
    const { data, isFetching, error } = useCourseDatas();
    const courseDatas = data?.result ?? [];
    const displayedCourses = courseDatas.filter(course => {
        if (isSelected(course)) {
            return false
        }
        if (!displaySettings.isShowedConflictedCourses && findConflictWith(course)) {
            return false
        }
        if (displaySettings.keyword !== '' && course.課程名稱.indexOf(displaySettings.keyword) === -1) {
            return false
        }

        return true
    });

    return (
        <div className="table-wrapper-scroll-y custom-scrollbar">
            <table className="table table-striped non-border align-middle table-first-row-white">
                <tbody>
                    <tr className="position-sticky top-0 blur-background">
                        <th>校區</th>
                        <th>年級</th>
                        <th>上課系所</th>
                        <th>課程名稱</th>
                        <th>老師</th>
                        <th>學分數</th>
                        <th>上課時間</th>
                        <th>選擇</th>
                    </tr>
                    {
                        !error && displayedCourses.map(courseData => {
                            return (
                                <CourseSelectionTableRow key={courseKey(courseData)} courseData={courseData} conflictWith={findConflictWith(courseData)} onSelected={addCourse}  />
                            )
                        })
                    }
                </tbody>
            </table>
            {isFetching && !data ?
                <div>
                    <div className="spinner-grow" role="status">
                        <span className="visually-hidden">正在載入資料...</span>
                    </div>
                    <span className="fs-3 ms-3">載入中...</span>
                    <br />
                    <span className="text-muted">(若載入時間很長，通常代表後端在從休眠到起床)</span>
                </div>
                : ""}
            {error ? <span className="fs-3">發生錯誤</span> : ""}
            {!error && data !== undefined && !isFetching && displayedCourses.length === 0 ? <span className="fs-3">查無結果</span> : ""}
        </div>
    )
}

function CourseSelectionTableRow({ courseData, conflictWith, onSelected }) {
    const isDisabled = Boolean(conflictWith);
    return (
        <tr className={isDisabled ? "conflict-warning" : ""}>
            <td>
                <CampusBadge campus={courseData.校區} />
            </td>
            <td>{gradeText(courseData.適用年級)}</td>
            <td>{departmentText(courseData.上課系所)}</td>
            <td>
                {courseData.教學大綱.length !== 0 ? <a className="text-decoration-none" href={courseData.教學大綱} target="_blank" rel="noreferrer">{"【" + courseData.上課學制 + "】" + courseData.課程名稱}</a> : "【" + courseData.上課學制 + "】" + courseData.課程名稱}
                {conflictWith ? (
                    <div className="small text-danger fw-semibold">和「{conflictWith.課程名稱}」衝堂</div>
                ) : null}
            </td>
            <td>
                <a className="text-decoration-none" href={teacherReviewUrl(courseData.授課老師)} target="_blank" rel="noreferrer">
                    {courseData.授課老師}
                </a>
            </td>
            <td>{courseData.學分數}</td>
            <td><ClassTimeBadges classTimes={courseData.上課時間} /></td>
            <td>
                <input className="form-check-input" type="checkbox" value="" checked={false} onChange={() => onSelected(courseData)} disabled={isDisabled} />
            </td>
        </tr>
    )
}